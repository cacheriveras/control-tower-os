import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useWorkstreams, useDependencies, useActivityLog } from "@/hooks/useData";
import {
  globalProgress,
  launchReadiness,
  milestoneRisk,
  pickNextAction,
  workstreamProgress,
} from "@/lib/calculations";
import { fmtDate, fmtRelative, STATUS_LABEL, PRIORITY_LABEL } from "@/lib/format";
import { resolveMilestoneContent, workstreamLabel, GLOSSARY } from "@/lib/milestoneContent";
import { InfoHint } from "@/components/clarity";
import { differenceInDays, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Flag,
  PauseCircle, Pin, ShieldAlert, Sparkles, TrendingUp,
} from "lucide-react";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CommandCenter() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const wsId = workspace?.id;
  const { data: workstreams = [] } = useWorkstreams(wsId);
  const { data: milestones = [] } = useMilestones(wsId);
  const { data: deps = [] } = useDependencies(wsId);
  const { data: activity = [] } = useActivityLog(wsId, 6);
  const [openId, setOpenId] = useState<string | null>(null);

  const todayISO = format(new Date(), "yyyy-MM-dd");

  const depsByMilestone = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const d of deps) {
      (m[d.milestone_id] ||= []).push(d.depends_on_milestone_id);
    }
    return m;
  }, [deps]);

  const milestonesByWs = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const ms of milestones) (m[ms.workstream_id] ||= []).push(ms);
    return m;
  }, [milestones]);

  const next = useMemo(
    () => pickNextAction(milestones as any, depsByMilestone, todayISO),
    [milestones, depsByMilestone, todayISO],
  );
  const nextContent = next ? resolveMilestoneContent(next) : null;
  const ht = (m: Parameters<typeof resolveMilestoneContent>[0]) => resolveMilestoneContent(m).humanTitle;

  // Explica en lenguaje normal por qué este paso va primero.
  const nextReason = useMemo(() => {
    if (!next) return "";
    if (next.focus_pinned) return "Lo fijaste como foco principal.";
    const bits: string[] = [];
    if (next.is_launch_gate) bits.push("es un Launch Gate");
    if (next.priority === "P0") bits.push("es prioridad P0");
    if (next.status === "in_progress") bits.push("ya está en curso");
    if (next.due_date) {
      const d = differenceInDays(parseISO(next.due_date), new Date());
      if (d < 0) bits.push("está vencido");
      else if (d <= 7) bits.push("vence esta semana");
    }
    return bits.length
      ? `Va primero porque ${bits.join(", ")}, y no tiene dependencias pendientes.`
      : "Va primero porque no tiene dependencias pendientes y es el de mayor prioridad disponible.";
  }, [next]);

  const global = globalProgress(workstreams as any, milestonesByWs as any);
  const ready = launchReadiness(milestones as any);
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length;
  const blocked = milestones.filter((m) => m.status === "blocked");
  const upcomingGates = milestones
    .filter((m) => m.is_launch_gate && m.status !== "completed")
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 5);

  const thisWeekNum = workspace
    ? Math.min(8, Math.max(1, Math.ceil(differenceInDays(new Date(), parseISO(workspace.start_date)) / 7) + 1))
    : 1;
  const thisWeek = milestones
    .filter((m) => m.week_target === thisWeekNum && m.status !== "completed" && m.status !== "parked")
    .slice(0, 3);

  const daysLeft = workspace ? differenceInDays(parseISO(workspace.target_date), new Date()) : 0;

  const updateMilestone = async (id: string, patch: any, msg?: string) => {
    const { error } = await supabase.from("milestones").update(patch).eq("id", id);
    if (error) return toast.error("No pudimos actualizar", { description: error.message });
    if (msg) toast.success(msg);
    qc.invalidateQueries({ queryKey: ["milestones"] });
    qc.invalidateQueries({ queryKey: ["activity_log"] });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto fade-in space-y-6">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Command Center</p>
          <h1 className="font-display text-3xl mt-1">{workspace?.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Semana {thisWeekNum} de 8 · {daysLeft} días restantes hasta {fmtDate(workspace?.target_date)}
          </p>
        </div>
        <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
          WIP {inProgressCount} / {workspace?.wip_limit ?? 3}
          <InfoHint text={GLOSSARY["WIP Limit"]} />
          {inProgressCount > (workspace?.wip_limit ?? 3) && <span className="ml-1 text-destructive">excedido</span>}
        </Badge>
      </header>

      {/* Next action */}
      {next ? (
        <section className="surface-elevated overflow-hidden">
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Siguiente paso recomendado
              </div>
              <h2 className="font-display text-2xl mb-1 leading-tight">{nextContent?.humanTitle}</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {next.code} · {workstreamLabel(workstreams.find((w) => w.id === next.workstream_id))}
              </p>
              {nextContent?.shortDescription && <p className="text-sm mb-3">{nextContent.shortDescription}</p>}
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">Por qué va primero: </span>
                {nextReason}
              </p>
              {nextContent?.expectedOutput && (
                <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Resultado esperado</p>
                  <p className="text-sm">{nextContent.expectedOutput}</p>
                </div>
              )}
              {nextContent && nextContent.successCriteria.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Cómo se ve terminado</p>
                  {nextContent.successCriteria.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">·</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {next.status !== "in_progress" && (
                  <Button onClick={() => updateMilestone(next.id, { status: "in_progress" }, "Milestone iniciado")} className="gap-2">
                    <ArrowRight className="h-4 w-4" /> Empezar
                  </Button>
                )}
                <Button variant="outline" onClick={() => setOpenId(next.id)}>Abrir detalle</Button>
                <Button variant="outline" className="gap-2" onClick={() => {
                  const reason = prompt("¿Por qué se bloquea?");
                  if (reason) updateMilestone(next.id, { status: "blocked", blocked_reason: reason }, "Milestone bloqueado");
                }}>
                  <ShieldAlert className="h-4 w-4" /> Bloquear
                </Button>
                <Button variant="secondary" className="gap-2" onClick={() => {
                  const d = prompt("Posponer hasta (yyyy-mm-dd):");
                  if (d) updateMilestone(next.id, { snoozed_until: d }, "Pospuesto");
                }}>
                  <PauseCircle className="h-4 w-4" /> Posponer
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setOpenId(next.id)}>
                  <CheckCircle2 className="h-4 w-4" /> Marcar completado
                </Button>
                {!next.focus_pinned && (
                  <Button variant="ghost" className="gap-2" onClick={async () => {
                    await supabase.from("milestones").update({ focus_pinned: false }).eq("workspace_id", wsId!).eq("focus_pinned", true);
                    updateMilestone(next.id, { focus_pinned: true }, "Foco principal fijado");
                  }}><Pin className="h-4 w-4" /> Fijar como foco</Button>
                )}
              </div>
            </div>
            <aside className="bg-muted/40 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Prioridad / Estado</p>
                <p className="text-sm font-medium">{PRIORITY_LABEL[next.priority]} · {STATUS_LABEL[next.status]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Semana objetivo</p>
                <p className="text-sm">Semana {next.week_target} {next.is_launch_gate && <Badge className="ml-2 bg-gold text-gold-foreground">Gate</Badge>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha objetivo</p>
                <p className="text-sm">{fmtDate(next.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dependencias</p>
                {(depsByMilestone[next.id] || []).length === 0 ? (
                  <p className="text-sm">Ninguna — puedes empezar ya</p>
                ) : (
                  <ul className="text-sm space-y-1 mt-0.5">
                    {(depsByMilestone[next.id] || []).map((id) => {
                      const dm = milestones.find((m) => m.id === id);
                      return dm ? <li key={id}>{ht(dm)}</li> : null;
                    })}
                  </ul>
                )}
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progreso</span><span>{next.progress}%</span>
                </div>
                <Progress value={next.progress} />
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <div className="surface-card p-6 text-sm text-muted-foreground">
          No hay siguiente paso elegible. Revisa los bloqueos y dependencias.
        </div>
      )}

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Progreso global" value={`${global}%`} icon={TrendingUp} accent="primary">
          <Progress value={global} className="mt-3" />
        </StatCard>
        <StatCard label="Launch Readiness" value={`${ready.pct}%`} icon={Flag} accent="gold">
          <p className="text-xs text-muted-foreground mt-2">{ready.done} de {ready.total} gates P0 completados</p>
        </StatCard>
        <StatCard label="Bloqueados" value={String(blocked.length)} icon={AlertTriangle} accent={blocked.length > 0 ? "destructive" : "muted"}>
          <p className="text-xs text-muted-foreground mt-2">{blocked.length === 0 ? "Sin bloqueos activos" : "Requieren acción"}</p>
        </StatCard>
      </section>

      {/* Workstreams + weeks */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="surface-card p-5">
          <h3 className="font-display text-lg mb-4">Progreso por workstream</h3>
          <div className="space-y-3">
            {workstreams.map((ws) => {
              const p = workstreamProgress((milestonesByWs[ws.id] || []) as any);
              return (
                <div key={ws.id}>
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="font-medium truncate" title={`${ws.code} · ${ws.name}`}>{workstreamLabel(ws)}</span>
                    <span className="text-muted-foreground shrink-0">{p}%</span>
                  </div>
                  <Progress value={p} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="surface-card p-5">
          <h3 className="font-display text-lg mb-4">Progreso por semana</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
              const ms = milestones.filter((m) => m.week_target === w);
              const done = ms.filter((m) => m.status === "completed").length;
              const p = ms.length ? Math.round((done / ms.length) * 100) : 0;
              return (
                <div key={w}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Semana {w}</span>
                    <span className="text-muted-foreground">{done}/{ms.length}</span>
                  </div>
                  <Progress value={p} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* This week + blocked + gates */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="surface-card p-5">
          <h3 className="font-display text-lg mb-3">Esta semana</h3>
          {thisWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin compromisos abiertos para esta semana.</p>
          ) : (
            <div className="space-y-2">
              {thisWeek.map((m) => (
                <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-3 rounded-lg border hover:border-primary/40 hover:bg-muted/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{ht(m)}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{STATUS_LABEL[m.status]}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.code} · Semana {m.week_target}</p>
                  <Progress value={m.progress} className="mt-2 h-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-lg mb-3">Bloqueados</h3>
          {blocked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin bloqueos. ✨</p>
          ) : (
            <div className="space-y-2">
              {blocked.slice(0, 5).map((m) => (
                <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10">
                  <div className="text-sm font-medium">{ht(m)}</div>
                  <div className="text-[11px] text-muted-foreground">{m.code}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.blocked_reason || "Sin razón registrada"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{fmtRelative(m.blocked_at)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="font-display text-lg mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-gold" /> Próximos gates
          </h3>
          {upcomingGates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quedan gates abiertos.</p>
          ) : (
            <div className="space-y-2">
              {upcomingGates.map((m) => {
                const risk = milestoneRisk(m as any);
                return (
                  <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-3 rounded-lg border hover:border-primary/40 hover:bg-muted/40">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-medium">{ht(m)}</span>
                      <span className={`h-2 w-2 rounded-full shrink-0 mt-1 ${risk === "red" ? "bg-destructive" : risk === "amber" ? "bg-gold" : "bg-success"}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.code} · {fmtDate(m.due_date)} · Semana {m.week_target}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="surface-card p-5">
        <h3 className="font-display text-lg mb-3">Actividad reciente</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay actividad registrada.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((a) => {
              const ms = milestones.find((m) => m.id === a.entity_id);
              return (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b last:border-0 py-1.5">
                  <span>
                    <span className="font-medium">{ms?.code || a.entity_type}</span>{" "}
                    {Object.keys((a.after_data as any) || {}).join(", ") || "actualizado"}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{fmtRelative(a.created_at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <MilestoneDrawer milestoneId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, children }: any) {
  const map: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    gold: "text-gold bg-gold/15",
    destructive: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-muted",
  };
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-3xl mt-1">{value}</p>
        </div>
        <div className={`h-9 w-9 rounded-lg grid place-content-center ${map[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {children}
    </div>
  );
}
