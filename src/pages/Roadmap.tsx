import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useWorkstreams } from "@/hooks/useData";
import { PHASES } from "@/lib/seedData";
import { phaseBlurb, resolveMilestoneContent } from "@/lib/milestoneContent";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { STATUS_LABEL } from "@/lib/format";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";

export default function Roadmap() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const [openId, setOpenId] = useState<string | null>(null);

  const wsById = useMemo(() => Object.fromEntries(workstreams.map((w) => [w.id, w])), [workstreams]);

  const moveWeek = async (id: string, week: number) => {
    await supabase.from("milestones").update({ week_target: week }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["milestones"] });
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto fade-in">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Roadmap</p>
        <h1 className="font-display text-3xl mt-1">8 semanas, 4 fases</h1>
        <p className="text-sm text-muted-foreground mt-1">Proteger dinero hoy → monetizar → multiplicar → inteligencia.</p>
      </header>

      <div className="space-y-6">
        {PHASES.map((phase) => (
          <section key={phase.name}>
            <div className="mb-3">
              <h2 className="font-display text-xl">{phase.name} <span className="text-muted-foreground text-sm font-sans ml-2">Semanas {phase.weeks.join("–")}</span></h2>
              <p className="text-sm text-muted-foreground mt-0.5">{phaseBlurb(phase.weeks)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {phase.weeks.map((w) => {
                const ms = milestones.filter((m) => m.week_target === w);
                return (
                  <div key={w} className="surface-card p-4">
                    <div className="flex justify-between items-baseline mb-3">
                      <h3 className="font-medium">Semana {w}</h3>
                      <span className="text-xs text-muted-foreground">{ms.length} milestones</span>
                    </div>
                    <div className="space-y-2">
                      {ms.length === 0 && <p className="text-xs text-muted-foreground">Sin milestones</p>}
                      {ms.map((m) => {
                        const ws = wsById[m.workstream_id];
                        return (
                          <div key={m.id} className="rounded-md border p-3 hover:border-primary/40 transition group bg-card">
                            <div className="flex justify-between gap-2 items-start">
                              <button onClick={() => setOpenId(m.id)} className="text-left flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{resolveMilestoneContent(m).humanTitle}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.code} · {ws?.code} · {STATUS_LABEL[m.status]}</p>
                              </button>
                              <div className="flex flex-col gap-1 items-end">
                                <div className="flex gap-1">
                                  {m.is_launch_gate && <Badge className="bg-gold text-gold-foreground text-[10px] py-0">Gate</Badge>}
                                  <Badge variant="outline" className="text-[10px] py-0">{m.priority}</Badge>
                                </div>
                                <Select value={String(m.week_target)} onValueChange={(v) => moveWeek(m.id, Number(v))}>
                                  <SelectTrigger className="h-6 w-16 text-[10px] px-2"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {[1,2,3,4,5,6,7,8].map((wn) => <SelectItem key={wn} value={String(wn)}>S{wn}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Progress value={m.progress} className="mt-2 h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <MilestoneDrawer milestoneId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
