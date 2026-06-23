import { useMemo, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useMilestones, useWorkstreams } from "@/hooks/useData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { STATUS_LABEL } from "@/lib/format";
import { milestoneRisk } from "@/lib/calculations";
import { resolveMilestoneContent } from "@/lib/milestoneContent";
import { ExpandableText, MilestoneMeta } from "@/components/clarity";
import { MilestoneDrawer } from "@/components/MilestoneDrawer";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const STATUSES: { v: string; l: string }[] = Object.entries(STATUS_LABEL).map(([v, l]) => ({ v, l }));

export default function Milestones() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fWs, setFWs] = useState("all");
  const [fWeek, setFWeek] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fGate, setFGate] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [view, setView] = useState<"explica" | "compacta">("explica"); // explicativa por defecto

  const wsById = useMemo(() => Object.fromEntries(workstreams.map((w) => [w.id, w])), [workstreams]);

  const filtered = useMemo(() => milestones.filter((m) => {
    if (search) {
      const c = resolveMilestoneContent(m);
      const hay = `${m.code} ${m.title} ${c.humanTitle} ${c.shortDescription}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    if (fStatus !== "all" && m.status !== fStatus) return false;
    if (fWs !== "all" && m.workstream_id !== fWs) return false;
    if (fWeek !== "all" && m.week_target !== Number(fWeek)) return false;
    if (fPriority !== "all" && m.priority !== fPriority) return false;
    if (fGate === "gates" && !m.is_launch_gate) return false;
    if (fGate === "nogates" && m.is_launch_gate) return false;
    return true;
  }), [milestones, search, fStatus, fWs, fWeek, fPriority, fGate]);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto fade-in">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Milestones</p>
          <h1 className="font-display text-3xl mt-1">{filtered.length} de {milestones.length}</h1>
        </div>
        <Button onClick={() => setNewOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Nuevo milestone</Button>
      </header>

      <div className="surface-card p-4 mb-4 grid md:grid-cols-6 gap-2">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por código o título..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={fWs} onValueChange={setFWs}>
          <SelectTrigger><SelectValue placeholder="Workstream" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los workstreams</SelectItem>
            {workstreams.map((w) => <SelectItem key={w.id} value={w.id}>{w.code} · {w.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fWeek} onValueChange={setFWeek}>
          <SelectTrigger><SelectValue placeholder="Semana" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las semanas</SelectItem>
            {[1,2,3,4,5,6,7,8].map((w) => <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fPriority} onValueChange={setFPriority}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda prioridad</SelectItem>
            <SelectItem value="P0">P0</SelectItem><SelectItem value="P1">P1</SelectItem><SelectItem value="P2">P2</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo estado</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fGate} onValueChange={setFGate}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="gates">Solo gates</SelectItem>
            <SelectItem value="nogates">Sin gate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
          <div className="inline-flex rounded-lg border p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView("explica")}
              className={`px-3 py-1 rounded-md transition ${view === "explica" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Vista explicativa
            </button>
            <button
              type="button"
              onClick={() => setView("compacta")}
              className={`px-3 py-1 rounded-md transition ${view === "compacta" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Vista compacta
            </button>
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          <div className={view === "explica" ? "grid gap-3 md:grid-cols-2" : "surface-card divide-y"}>
            {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Sin resultados con esos filtros.</div>}
            {filtered.map((m) => {
              const risk = milestoneRisk(m as any);
              const c = resolveMilestoneContent(m);
              const dot = `h-2.5 w-2.5 rounded-full shrink-0 ${risk === "red" ? "bg-destructive" : risk === "amber" ? "bg-gold" : "bg-success"}`;

              if (view === "compacta") {
                return (
                  <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-4 hover:bg-muted/40 transition flex items-center gap-4">
                    <span className={dot} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{c.humanTitle}</span>
                        {m.is_launch_gate && <Badge className="bg-gold text-gold-foreground text-[10px]">Gate</Badge>}
                        <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {m.code} · {wsById[m.workstream_id]?.code} · Semana {m.week_target} · {STATUS_LABEL[m.status]}
                      </div>
                    </div>
                    <div className="w-28 shrink-0">
                      <Progress value={m.progress} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground text-right mt-0.5">{m.progress}%</p>
                    </div>
                  </button>
                );
              }

              // Vista explicativa (default)
              return (
                <button key={m.id} onClick={() => setOpenId(m.id)} className="surface-card text-left p-4 hover:border-primary/40 transition flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <span className={`${dot} mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium leading-snug">{c.humanTitle}</h3>
                        <div className="flex gap-1 shrink-0">
                          {m.is_launch_gate && <Badge className="bg-gold text-gold-foreground text-[10px]">Gate</Badge>}
                          <Badge variant="outline" className="text-[10px]">{m.priority}</Badge>
                        </div>
                      </div>
                      <MilestoneMeta className="mt-1" code={m.code} workstream={wsById[m.workstream_id]} week={m.week_target} isGate={false} />
                    </div>
                  </div>
                  <ExpandableText text={c.shortDescription} className="text-sm text-muted-foreground" />
                  {c.expectedOutput && (
                    <p className="text-xs"><span className="text-muted-foreground">Resultado esperado: </span>{c.expectedOutput}</p>
                  )}
                  {c.unlocksDecision && (
                    <p className="text-xs"><span className="text-muted-foreground">Desbloquea: </span>{c.unlocksDecision}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] shrink-0">{STATUS_LABEL[m.status]}</Badge>
                    <Progress value={m.progress} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground shrink-0">{m.progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATUSES.map((s) => (
              <div key={s.v} className="surface-card p-3">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{s.l} ({filtered.filter((m) => m.status === s.v).length})</h4>
                <div className="space-y-2">
                  {filtered.filter((m) => m.status === s.v).map((m) => {
                    const c = resolveMilestoneContent(m);
                    return (
                      <button key={m.id} onClick={() => setOpenId(m.id)} className="w-full text-left p-2 rounded border bg-card hover:border-primary/40">
                        <p className="text-xs font-medium leading-snug line-clamp-2">{c.humanTitle}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.code} · S{m.week_target}</p>
                        {view === "explica" && c.shortDescription && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{c.shortDescription}</p>
                        )}
                        <Progress value={m.progress} className="mt-1 h-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <MilestoneDrawer milestoneId={openId} onClose={() => setOpenId(null)} />
      <NewMilestoneDialog open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function NewMilestoneDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: workstreams = [] } = useWorkstreams(workspace?.id);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [wsId, setWsId] = useState("");
  const [week, setWeek] = useState(1);
  const [priority, setPriority] = useState<"P0" | "P1" | "P2">("P1");

  const submit = async () => {
    if (!title || !code || !wsId) return toast.error("Completa código, título y workstream");
    const { error } = await supabase.from("milestones").insert({
      workspace_id: workspace!.id, workstream_id: wsId, code, title, week_target: week, priority, definition_of_done: [],
    });
    if (error) return toast.error(error.message);
    toast.success("Milestone creado");
    qc.invalidateQueries({ queryKey: ["milestones"] });
    setTitle(""); setCode(""); setWsId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo milestone</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Código</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="X1" /></div>
            <div className="space-y-1.5">
              <Label>Workstream</Label>
              <Select value={wsId} onValueChange={setWsId}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>{workstreams.map((w) => <SelectItem key={w.id} value={w.id}>{w.code} · {w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Semana</Label>
              <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6,7,8].map((w) => <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="P0">P0</SelectItem><SelectItem value="P1">P1</SelectItem><SelectItem value="P2">P2</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit}>Crear</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
