import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useDependencies, useEvidence, useWorkstreams } from "@/hooks/useData";
import { resolveMilestoneContent, workstreamLabel } from "@/lib/milestoneContent";
import { pickNextAction } from "@/lib/calculations";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, CheckCircle2, ShieldAlert, Link2, MessageSquarePlus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { STATUS_LABEL } from "@/lib/format";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";

export default function FocusMode() {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const { data: deps = [] } = useDependencies(workspace?.id);
  const [draftProgress, setDraftProgress] = useState<number | null>(null);
  const [nextAction, setNextAction] = useState("");
  const [comment, setComment] = useState("");
  const [evUrl, setEvUrl] = useState("");
  const [evLabel, setEvLabel] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const todayISO = format(new Date(), "yyyy-MM-dd");

  const depsByMs = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const d of deps) (m[d.milestone_id] ||= []).push(d.depends_on_milestone_id);
    return m;
  }, [deps]);

  const pinned = milestones.find((m) => m.focus_pinned);
  const focus: any = pinned ?? (pickNextAction(milestones as any, depsByMs, todayISO)
    ? milestones.find((m) => m.id === (pickNextAction(milestones as any, depsByMs, todayISO) as any).id)
    : null);
  const { data: evidence = [] } = useEvidence(workspace?.id, focus?.id);

  const myDeps = focus ? (depsByMs[focus.id] || []).map((id) => milestones.find((m) => m.id === id)).filter(Boolean) : [];
  const dependents = focus ? deps.filter((d) => d.depends_on_milestone_id === focus.id).map((d) => milestones.find((m) => m.id === d.milestone_id)).filter(Boolean) : [];

  const dod: string[] = focus && Array.isArray(focus.definition_of_done) ? (focus.definition_of_done as any) : [];

  if (!focus) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <p>Sin foco activo. Revisa los bloqueos y dependencias.</p>
      </div>
    );
  }

  const fc = resolveMilestoneContent(focus);
  const fws = workstreams.find((w) => w.id === focus.workstream_id);

  const inv = () => {
    qc.invalidateQueries({ queryKey: ["milestones"] });
    qc.invalidateQueries({ queryKey: ["activity_log"] });
    qc.invalidateQueries({ queryKey: ["evidence"] });
    qc.invalidateQueries({ queryKey: ["comments"] });
  };

  const saveProgress = async () => {
    const patch: any = {};
    if (draftProgress !== null) patch.progress = draftProgress;
    if (nextAction.trim()) patch.next_action = nextAction.trim();
    if (!Object.keys(patch).length) return;
    const { error } = await supabase.from("milestones").update(patch).eq("id", focus.id);
    if (error) return toast.error(error.message);
    toast.success("Progreso guardado");
    setDraftProgress(null); setNextAction("");
    inv();
  };

  const complete = async () => {
    const { error } = await supabase.from("milestones").update({ status: "completed" }).eq("id", focus.id);
    if (error) return toast.error(error.message);
    toast.success("Milestone completado 🎉");
    inv();
  };

  const blockMs = async () => {
    const reason = prompt("¿Por qué se bloquea?");
    if (!reason) return;
    const { error } = await supabase.from("milestones").update({ status: "blocked", blocked_reason: reason }).eq("id", focus.id);
    if (error) return toast.error(error.message);
    inv();
  };

  const addEv = async () => {
    if (!evUrl.trim() || !evLabel.trim() || !user) return;
    await supabase.from("evidence_links").insert({
      workspace_id: workspace!.id, milestone_id: focus.id, url: evUrl, label: evLabel, created_by: user.id,
    });
    setEvUrl(""); setEvLabel("");
    inv();
  };

  const addComment = async () => {
    if (!comment.trim() || !user) return;
    await supabase.from("comments").insert({
      workspace_id: workspace!.id, milestone_id: focus.id, author_id: user.id, body: comment.trim(),
    });
    setComment("");
    toast.success("Comentario añadido");
    inv();
  };

  const after = milestones
    .filter((m) => dependents.some((d: any) => d?.id === m.id))
    .slice(0, 5);

  const noNow = milestones.filter((m) => m.status === "parked").slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8 fade-in">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">{focus.code}</Badge>
        <Badge variant="outline">Semana {focus.week_target}</Badge>
        {focus.is_launch_gate && <Badge className="bg-gold text-gold-foreground">Launch Gate</Badge>}
        <Badge variant="outline">{focus.priority}</Badge>
        {pinned && <Badge className="bg-primary/15 text-primary border-primary/30">Foco fijado</Badge>}
      </div>

      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Foco actual</p>
        <h1 className="font-display text-4xl mt-2 leading-tight">{fc.humanTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{focus.code} · {workstreamLabel(fws)}</p>
        {fc.shortDescription && <p className="text-base mt-3">{fc.shortDescription}</p>}
      </header>

      <section className="space-y-2">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Por qué importa</h3>
        <p className="text-base">{focus.why_it_matters}</p>
      </section>

      {fc.expectedOutput && (
        <section className="space-y-2">
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Resultado esperado</h3>
          <p className="text-base">{fc.expectedOutput}</p>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Cómo se ve terminado</h3>
        <ul className="space-y-2">
          {dod.slice(0, 3).map((d, i) => (
            <li key={i} className="flex gap-3 text-base">
              <span className="text-primary mt-1">·</span><span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Dependencias</h4>
          {myDeps.length === 0 ? <p className="text-sm">Sin dependencias</p> : (
            <ul className="text-sm space-y-1">
              {myDeps.map((d: any) => (
                <li key={d.id} className="flex justify-between gap-2"><span>{d.code} · {resolveMilestoneContent(d).humanTitle}</span><span className="text-muted-foreground shrink-0">{STATUS_LABEL[d.status]}</span></li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Bloqueo</h4>
          {focus.status === "blocked"
            ? <p className="text-sm text-destructive">{focus.blocked_reason}</p>
            : <p className="text-sm text-muted-foreground">Sin bloqueos</p>}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso</span>
          <span className="text-muted-foreground">{draftProgress ?? focus.progress}%</span>
        </div>
        <Slider value={[draftProgress ?? focus.progress]} max={100} step={5} onValueChange={(v) => setDraftProgress(v[0])} />
      </section>

      <section className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Próxima acción que yo decido ejecutar</h4>
        <Input placeholder={focus.next_action || "Una línea de apoyo, no una nueva tarea"} value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
      </section>

      <section className="flex flex-wrap gap-2">
        <Button onClick={saveProgress} className="gap-2"><Save className="h-4 w-4" /> Guardar progreso</Button>
        <Button variant="outline" onClick={complete} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Completar</Button>
        <Button variant="outline" onClick={blockMs} className="gap-2"><ShieldAlert className="h-4 w-4" /> Bloquear</Button>
        <Button variant="ghost" onClick={() => setDrawerId(focus.id)}>Ver detalle completo</Button>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2 surface-card p-4">
          <h4 className="text-sm font-medium flex items-center gap-2"><Link2 className="h-4 w-4" /> Evidencia rápida</h4>
          <Input placeholder="Etiqueta" value={evLabel} onChange={(e) => setEvLabel(e.target.value)} />
          <Input placeholder="https://..." value={evUrl} onChange={(e) => setEvUrl(e.target.value)} />
          <Button size="sm" onClick={addEv}>Agregar</Button>
          {evidence.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              {evidence.slice(0, 3).map((e) => (
                <li key={e.id}><a href={e.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{e.label}</a></li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2 surface-card p-4">
          <h4 className="text-sm font-medium flex items-center gap-2"><MessageSquarePlus className="h-4 w-4" /> Comentario rápido</h4>
          <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notas, contexto, decisiones..." />
          <Button size="sm" onClick={addComment}>Publicar</Button>
        </div>
      </section>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronDown className="h-4 w-4" /> Después de esto ({after.length})
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <ul className="text-sm space-y-1">
            {after.map((m: any) => <li key={m.id}>{resolveMilestoneContent(m).humanTitle}</li>)}
          </ul>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronDown className="h-4 w-4" /> No ahora ({noNow.length})
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <ul className="text-sm space-y-1">
            {noNow.map((m: any) => <li key={m.id}>{resolveMilestoneContent(m).humanTitle}</li>)}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <MilestoneDrawer milestoneId={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}
