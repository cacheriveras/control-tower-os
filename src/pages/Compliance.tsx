import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useWorkstreams, useComplianceMetrics } from "@/hooks/useData";
import { workstreamProgress, milestoneRisk } from "@/lib/calculations";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Scale, ScrollText, Gavel, Calculator, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { fmtDate, STATUS_LABEL } from "@/lib/format";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";
import { toast } from "sonner";

export default function Compliance() {
  const { workspace } = useWorkspace();
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: metrics = [] } = useComplianceMetrics(workspace?.id);
  const [openId, setOpenId] = useState<string | null>(null);

  const cmpWs = workstreams.find((w) => w.code === "CMP");
  const legWs = workstreams.find((w) => w.code === "LEG");
  const cmpMs = useMemo(() => milestones.filter((m) => m.workstream_id === cmpWs?.id), [milestones, cmpWs]);
  const legMs = useMemo(() => milestones.filter((m) => m.workstream_id === legWs?.id), [milestones, legWs]);

  const profMs = milestones.filter((m) => m.requires_professional && m.requires_professional !== "none");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto fade-in space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compliance & Legal</p>
        <h1 className="font-display text-3xl mt-1">Readiness y métricas operativas</h1>
        <p className="text-sm text-muted-foreground mt-2 italic">
          Herramienta de ejecución; la validación final debe hacerla counsel/contador local para los mercados activos.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel
          title="Compliance Readiness"
          icon={ShieldCheck}
          accent="primary"
          milestones={cmpMs}
          onOpen={setOpenId}
        />
        <Panel
          title="Company Legal Readiness"
          icon={Scale}
          accent="gold"
          milestones={legMs}
          onOpen={setOpenId}
        />
      </div>

      {profMs.length > 0 && (
        <section className="surface-card p-5">
          <h3 className="font-display text-lg mb-3 flex items-center gap-2"><Gavel className="h-4 w-4 text-gold" /> Requieren profesional externo</h3>
          <div className="space-y-2">
            {profMs.map((m) => (
              <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-3 border rounded-md hover:border-primary/40 flex items-center justify-between gap-2">
                <span className="text-sm">{m.code} · {m.title}</span>
                <Badge variant="outline" className="text-xs capitalize">{m.requires_professional}</Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="surface-card p-5">
        <h3 className="font-display text-lg mb-1">Indicadores de compliance</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Esta app no se conecta a producción. Cada métrica se actualiza manualmente con valor, objetivo, fecha y comentario.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
        </div>
      </section>

      <MilestoneDrawer milestoneId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function Panel({ title, icon: Icon, accent, milestones, onOpen }: any) {
  const p = workstreamProgress(milestones);
  const gates = milestones.filter((m: any) => m.is_launch_gate);
  const done = gates.filter((m: any) => m.status === "completed").length;

  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-5 w-5 ${accent === "primary" ? "text-primary" : "text-gold"}`} />
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2 mb-1"><span>Progreso</span><span>{p}%</span></div>
      <Progress value={p} />
      <p className="text-xs text-muted-foreground mt-2">{done} de {gates.length} gates críticos completados</p>
      <div className="mt-4 space-y-2">
        {milestones.map((m: any) => {
          const risk = milestoneRisk(m);
          return (
            <button key={m.id} onClick={() => onOpen(m.id)} className="w-full text-left p-3 rounded-md border hover:border-primary/40 transition">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.code} · {m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Semana {m.week_target} · {STATUS_LABEL[m.status]} · {fmtDate(m.due_date)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`h-2 w-2 rounded-full ${risk === "red" ? "bg-destructive" : risk === "amber" ? "bg-gold" : "bg-success"}`} />
                  {m.is_launch_gate && <Badge className="bg-gold text-gold-foreground text-[10px]">Gate</Badge>}
                </div>
              </div>
              <Progress value={m.progress} className="mt-2 h-1.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: any }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({
    current_value: metric.current_value ?? "",
    measured_at: metric.measured_at ?? "",
    comment: metric.comment ?? "",
  });

  const save = async () => {
    const { error } = await supabase.from("compliance_metrics").update({
      current_value: draft.current_value === "" ? null : Number(draft.current_value),
      measured_at: draft.measured_at || null,
      comment: draft.comment || null,
    }).eq("id", metric.id);
    if (error) return toast.error(error.message);
    toast.success("Métrica actualizada");
    qc.invalidateQueries({ queryKey: ["compliance_metrics"] });
  };

  const onTarget = draft.current_value !== "" && Number(draft.current_value) === Number(metric.target_value);

  return (
    <div className="border rounded-md p-3 bg-card">
      <div className="flex justify-between items-start mb-2 gap-2">
        <p className="text-sm font-medium">{metric.name}</p>
        <Badge variant="outline" className={`text-xs ${onTarget ? "border-success text-success" : ""}`}>
          objetivo {metric.target_value}{metric.unit && ` ${metric.unit}`}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Valor actual</Label><Input value={draft.current_value} onChange={(e) => setDraft({ ...draft, current_value: e.target.value })} /></div>
        <div><Label className="text-xs">Medido el</Label><Input type="date" value={draft.measured_at} onChange={(e) => setDraft({ ...draft, measured_at: e.target.value })} /></div>
      </div>
      <Textarea className="mt-2" rows={2} placeholder="Comentario" value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
      <Button size="sm" className="mt-2" onClick={save}>Guardar</Button>
    </div>
  );
}
