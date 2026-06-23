import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useWeeklyReviews, useMilestones, useWorkstreams } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format, parseISO } from "date-fns";
import { globalProgress, launchReadiness, workstreamProgress } from "@/lib/calculations";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function WeeklyReview() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: reviews = [] } = useWeeklyReviews(workspace?.id);
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);

  const currentWeek = useMemo(() => {
    const open = reviews.find((r) => !r.closed_at);
    if (open) return open.week_number;
    if (reviews.length === 0) return 1;
    return Math.min(8, Math.max(...reviews.map((r) => r.week_number)) + 1);
  }, [reviews]);

  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const review = reviews.find((r) => r.week_number === selectedWeek);

  const ensureReview = async (week: number) => {
    if (!workspace) return null;
    const existing = reviews.find((r) => r.week_number === week);
    if (existing) return existing;
    const start = format(addDays(parseISO(workspace.start_date), (week - 1) * 7), "yyyy-MM-dd");
    const end = format(addDays(parseISO(workspace.start_date), week * 7 - 1), "yyyy-MM-dd");
    const { data, error } = await supabase.from("weekly_reviews").insert({
      workspace_id: workspace.id, week_number: week, start_date: start, end_date: end, next_top_three: [],
    }).select().single();
    if (error) { toast.error(error.message); return null; }
    qc.invalidateQueries({ queryKey: ["weekly_reviews"] });
    return data;
  };

  const handleSelect = async (week: number) => {
    setSelectedWeek(week);
    if (!reviews.find((r) => r.week_number === week)) await ensureReview(week);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto fade-in space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weekly Review</p>
          <h1 className="font-display text-3xl mt-1">Cadencia semanal</h1>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Semana</Label>
          <Select value={String(selectedWeek)} onValueChange={(v) => handleSelect(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6,7,8].map((w) => <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </header>

      {review ? (
        <ReviewForm key={review.id} review={review} milestones={milestones} workstreams={workstreams} />
      ) : (
        <div className="surface-card p-6 text-sm">
          <p className="mb-3">Aún no abriste la revisión de la semana {selectedWeek}.</p>
          <Button onClick={() => ensureReview(selectedWeek)}>Abrir revisión</Button>
        </div>
      )}

      <section>
        <h2 className="font-display text-xl mb-3">Historial</h2>
        {reviews.length === 0 ? <p className="text-sm text-muted-foreground">Sin revisiones aún.</p> : (
          <div className="grid md:grid-cols-2 gap-3">
            {[...reviews].sort((a, b) => a.week_number - b.week_number).map((r) => {
              const snap = (r.progress_snapshot as any) || {};
              return (
                <div key={r.id} className="surface-card p-4">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium">Semana {r.week_number}</h4>
                    {r.closed_at ? (
                      <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Cerrada</Badge>
                    ) : <Badge variant="outline">Abierta</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmtDate(r.start_date)} → {fmtDate(r.end_date)}</p>
                  {r.closed_at && (
                    <div className="mt-2 text-xs">
                      Progreso global al cierre: <span className="font-medium">{snap.global ?? 0}%</span> · Readiness {snap.ready ?? 0}%
                    </div>
                  )}
                  {r.wins && <p className="text-xs mt-2 line-clamp-3"><span className="font-medium">Logros:</span> {r.wins}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewForm({ review, milestones, workstreams }: any) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({
    wins: review.wins ?? "",
    evidence_learned: review.evidence_learned ?? "",
    blockers: review.blockers ?? "",
    decisions: review.decisions ?? "",
    stop_doing: review.stop_doing ?? "",
    main_risk: review.main_risk ?? "",
    confidence_score: review.confidence_score ?? 3,
    next_top_three: (review.next_top_three as string[]) ?? ["", "", ""],
  });

  const save = async (close = false) => {
    const milestonesByWs: Record<string, any[]> = {};
    for (const m of milestones) (milestonesByWs[m.workstream_id] ||= []).push(m);
    const snap = close ? {
      global: globalProgress(workstreams as any, milestonesByWs as any),
      ready: launchReadiness(milestones as any).pct,
      perWs: Object.fromEntries(workstreams.map((w: any) => [w.code, workstreamProgress(milestonesByWs[w.id] || [])])),
      at: new Date().toISOString(),
    } : (review.progress_snapshot ?? null);
    const patch: any = { ...draft, next_top_three: draft.next_top_three.filter(Boolean) };
    if (close) { patch.closed_at = new Date().toISOString(); patch.progress_snapshot = snap; }
    const { error } = await supabase.from("weekly_reviews").update(patch).eq("id", review.id);
    if (error) return toast.error(error.message);
    toast.success(close ? "Semana cerrada" : "Guardado");
    qc.invalidateQueries({ queryKey: ["weekly_reviews"] });
  };

  return (
    <div className="surface-elevated p-6 space-y-4">
      <div className="flex justify-between items-baseline">
        <h2 className="font-display text-2xl">Semana {review.week_number}</h2>
        <p className="text-xs text-muted-foreground">{fmtDate(review.start_date)} → {fmtDate(review.end_date)}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Logros" value={draft.wins} onChange={(v) => setDraft({ ...draft, wins: v })} />
        <Field label="Revenue/product evidence aprendida" value={draft.evidence_learned} onChange={(v) => setDraft({ ...draft, evidence_learned: v })} />
        <Field label="Bloqueos" value={draft.blockers} onChange={(v) => setDraft({ ...draft, blockers: v })} />
        <Field label="Decisiones tomadas" value={draft.decisions} onChange={(v) => setDraft({ ...draft, decisions: v })} />
        <Field label="Qué dejar de hacer" value={draft.stop_doing} onChange={(v) => setDraft({ ...draft, stop_doing: v })} />
        <Field label="Riesgo principal" value={draft.main_risk} onChange={(v) => setDraft({ ...draft, main_risk: v })} />
      </div>
      <div className="space-y-2">
        <Label>Top 3 de la próxima semana</Label>
        {[0,1,2].map((i) => (
          <Input key={i} value={draft.next_top_three[i] || ""} onChange={(e) => {
            const arr = [...draft.next_top_three]; arr[i] = e.target.value; setDraft({ ...draft, next_top_three: arr });
          }} placeholder={`Prioridad ${i + 1}`} />
        ))}
      </div>
      <div className="space-y-2">
        <Label>Confidence score (1–5)</Label>
        <Select value={String(draft.confidence_score)} onValueChange={(v) => setDraft({ ...draft, confidence_score: Number(v) })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => save(false)} disabled={!!review.closed_at}>Guardar</Button>
        <Button variant="outline" onClick={() => save(true)} disabled={!!review.closed_at}>Cerrar semana</Button>
        {review.closed_at && <Badge className="bg-success text-success-foreground">Cerrada el {fmtDate(review.closed_at)}</Badge>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
