import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useWorkstreams } from "@/hooks/useData";
import { workstreamProgress } from "@/lib/calculations";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { STATUS_LABEL } from "@/lib/format";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";

export default function Workstreams() {
  const { workspace } = useWorkspace();
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const [openWsId, setOpenWsId] = useState<string | null>(null);
  const [openMsId, setOpenMsId] = useState<string | null>(null);

  const byWs = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const ms of milestones) (m[ms.workstream_id] ||= []).push(ms);
    return m;
  }, [milestones]);

  const openWs = workstreams.find((w) => w.id === openWsId);
  const openMs = openWsId ? (byWs[openWsId] || []).slice().sort((a, b) => a.week_target - b.week_target || a.priority.localeCompare(b.priority)) : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto fade-in">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workstreams</p>
        <h1 className="font-display text-3xl mt-1">9 flujos de trabajo</h1>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workstreams.map((ws) => {
          const ms = byWs[ws.id] || [];
          const p = workstreamProgress(ms as any);
          const gatesDone = ms.filter((m) => m.is_launch_gate && m.status === "completed").length;
          const gatesTotal = ms.filter((m) => m.is_launch_gate).length;
          const blocked = ms.filter((m) => m.status === "blocked").length;
          return (
            <button key={ws.id} onClick={() => setOpenWsId(ws.id)} className="surface-card p-5 text-left hover:border-primary/40 hover:shadow-elegant transition">
              <div className="flex items-baseline gap-2 mb-1">
                <Badge variant="outline" className="text-xs">{ws.code}</Badge>
                <span className="text-xs text-muted-foreground">peso {Number(ws.weight).toFixed(1)}</span>
              </div>
              <h3 className="font-display text-lg leading-tight mb-2">{ws.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-3">{ws.description}</p>
              <div className="flex justify-between text-xs mb-1.5"><span>Progreso</span><span className="text-muted-foreground">{p}%</span></div>
              <Progress value={p} />
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>Gates {gatesDone}/{gatesTotal}</span>
                <span>{ms.length} milestones</span>
                {blocked > 0 && <span className="text-destructive">{blocked} bloq.</span>}
              </div>
            </button>
          );
        })}
      </div>

      <Sheet open={!!openWsId} onOpenChange={(o) => !o && setOpenWsId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {openWs && (
            <>
              <SheetHeader>
                <Badge variant="outline" className="w-fit">{openWs.code}</Badge>
                <SheetTitle className="font-display text-2xl">{openWs.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{openWs.description}</p>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {openMs.map((m) => (
                  <button key={m.id} onClick={() => setOpenMsId(m.id)} className="w-full text-left p-3 border rounded-lg hover:border-primary/40">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-medium">{m.code} · {m.title}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>
                        {m.is_launch_gate && <Badge className="bg-gold text-gold-foreground text-[10px]">Gate</Badge>}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Semana {m.week_target} · {STATUS_LABEL[m.status]}</span>
                      <span>{m.progress}%</span>
                    </div>
                    <Progress value={m.progress} className="mt-2 h-1.5" />
                  </button>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <MilestoneDrawer milestoneId={openMsId} onClose={() => setOpenMsId(null)} />
    </div>
  );
}
