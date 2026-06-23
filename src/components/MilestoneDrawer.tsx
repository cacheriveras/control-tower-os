import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMilestones, useDependencies, useComments, useEvidence, useActivityLog } from "@/hooks/useData";
import { fmtDate, fmtRelative, STATUS_LABEL, PRIORITY_LABEL } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Link2, Trash2 } from "lucide-react";

export function MilestoneDrawer({ milestoneId, onClose }: { milestoneId: string | null; onClose: () => void }) {
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: milestones = [] } = useMilestones(workspace?.id);
  const { data: deps = [] } = useDependencies(workspace?.id);
  const { data: comments = [] } = useComments(workspace?.id, milestoneId ?? undefined);
  const { data: evidence = [] } = useEvidence(workspace?.id, milestoneId ?? undefined);
  const { data: activity = [] } = useActivityLog(workspace?.id, 100);

  const milestone = useMemo(() => milestones.find((m) => m.id === milestoneId), [milestones, milestoneId]);
  const [draft, setDraft] = useState<any>(null);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [completeNote, setCompleteNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [newComment, setNewComment] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);

  useEffect(() => {
    if (milestone) setDraft({ ...milestone });
  }, [milestone?.id]);

  if (!milestoneId || !milestone || !draft) {
    return (
      <Sheet open={!!milestoneId} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl" />
      </Sheet>
    );
  }

  const myDeps = deps.filter((d) => d.milestone_id === milestone.id).map((d) => milestones.find((m) => m.id === d.depends_on_milestone_id)).filter(Boolean);
  const dependents = deps.filter((d) => d.depends_on_milestone_id === milestone.id).map((d) => milestones.find((m) => m.id === d.milestone_id)).filter(Boolean);
  const myActivity = activity.filter((a) => a.entity_id === milestone.id);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["milestones"] });
    qc.invalidateQueries({ queryKey: ["activity_log"] });
    qc.invalidateQueries({ queryKey: ["comments"] });
    qc.invalidateQueries({ queryKey: ["evidence"] });
  };

  const save = async () => {
    const { id, code, workstream_id, workspace_id, created_at, updated_at, completed_at, ...patch } = draft;
    const { error } = await supabase.from("milestones").update(patch).eq("id", id);
    if (error) return toast.error("No pudimos guardar", { description: error.message });
    toast.success("Cambios guardados");
    invalidate();
  };

  const setStatus = async (status: string) => {
    if (status === "completed") return setConfirmComplete(true);
    if (status === "blocked") return setBlockOpen(true);
    const { error } = await supabase.from("milestones").update({ status }).eq("id", milestone.id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  const completeNow = async () => {
    const { error } = await supabase.from("milestones").update({ status: "completed" }).eq("id", milestone.id);
    if (error) return toast.error(error.message);
    if (completeNote.trim() && user) {
      await supabase.from("comments").insert({
        workspace_id: workspace!.id, milestone_id: milestone.id, author_id: user.id, body: completeNote.trim(),
      });
    }
    toast.success("Milestone completado 🎉");
    setConfirmComplete(false);
    setCompleteNote("");
    invalidate();
  };

  const blockNow = async () => {
    if (!blockReason.trim()) return toast.error("Necesitas indicar una razón");
    const { error } = await supabase.from("milestones").update({ status: "blocked", blocked_reason: blockReason.trim() }).eq("id", milestone.id);
    if (error) return toast.error(error.message);
    setBlockOpen(false); setBlockReason("");
    invalidate();
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    const { error } = await supabase.from("comments").insert({
      workspace_id: workspace!.id, milestone_id: milestone.id, author_id: user.id, body: newComment.trim(),
    });
    if (error) return toast.error(error.message);
    setNewComment("");
    invalidate();
  };

  const addEvidence = async () => {
    if (!evidenceUrl.trim() || !evidenceLabel.trim() || !user) return;
    const { error } = await supabase.from("evidence_links").insert({
      workspace_id: workspace!.id, milestone_id: milestone.id, label: evidenceLabel, url: evidenceUrl, created_by: user.id,
    });
    if (error) return toast.error(error.message);
    setEvidenceUrl(""); setEvidenceLabel("");
    invalidate();
  };

  const dod: string[] = Array.isArray(milestone.definition_of_done) ? (milestone.definition_of_done as any) : [];

  return (
    <Sheet open={!!milestoneId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{milestone.code}</Badge>
            <Badge variant="outline">Semana {milestone.week_target}</Badge>
            {milestone.is_launch_gate && <Badge className="bg-gold text-gold-foreground">Launch Gate</Badge>}
            <Badge variant="outline">{PRIORITY_LABEL[milestone.priority]}</Badge>
          </div>
          <SheetTitle className="font-display text-2xl">{milestone.title}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dod">DoD</TabsTrigger>
            <TabsTrigger value="deps">Dependencias</TabsTrigger>
            <TabsTrigger value="evidence">Evidencia</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={draft.status} onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Semana objetivo</Label>
                <Select value={String(draft.week_target)} onValueChange={(v) => setDraft({ ...draft, week_target: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((w) => <SelectItem key={w} value={String(w)}>Semana {w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P0">P0 · Crítico</SelectItem>
                    <SelectItem value="P1">P1 · Alta</SelectItem>
                    <SelectItem value="P2">P2 · Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha objetivo</Label>
                <Input type="date" value={draft.due_date ?? ""} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Progreso</span><span className="text-muted-foreground">{draft.progress}%</span></div>
              <Slider value={[draft.progress]} max={100} step={5} onValueChange={(v) => setDraft({ ...draft, progress: v[0] })} />
            </div>

            <div className="space-y-1.5">
              <Label>Por qué importa</Label>
              <Textarea value={draft.why_it_matters ?? ""} onChange={(e) => setDraft({ ...draft, why_it_matters: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Próxima acción concreta (opcional)</Label>
              <Input value={draft.next_action ?? ""} onChange={(e) => setDraft({ ...draft, next_action: e.target.value })} placeholder="Una sola línea de apoyo" />
            </div>

            {milestone.status === "blocked" && (
              <div className="p-3 rounded-md border border-destructive/30 bg-destructive/5 text-sm">
                <strong>Bloqueado:</strong> {milestone.blocked_reason || "sin razón"}
                <span className="text-muted-foreground"> · {fmtRelative(milestone.blocked_at)}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 flex-wrap">
              <Button onClick={save}>Guardar cambios</Button>
              <Button variant="outline" onClick={() => setConfirmComplete(true)}>Marcar completado</Button>
              <Button variant="outline" onClick={() => setBlockOpen(true)}>Bloquear</Button>
              <Button variant="ghost" onClick={() => setStatus("parked")}>Aparcar</Button>
            </div>
          </TabsContent>

          <TabsContent value="dod" className="space-y-2 mt-4">
            <p className="text-sm text-muted-foreground">Criterios de alto nivel que definen "terminado".</p>
            <ul className="space-y-2">
              {dod.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm p-3 border rounded-md bg-muted/30">
                  <span className="text-primary">·</span><span>{d}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="deps" className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Depende de</h4>
              {myDeps.length === 0 ? <p className="text-sm text-muted-foreground">Sin dependencias</p> : (
                <ul className="space-y-1">
                  {myDeps.map((d: any) => (
                    <li key={d.id} className="flex items-center justify-between text-sm p-2 border rounded">
                      <span>{d.code} · {d.title}</span>
                      <Badge variant="outline">{STATUS_LABEL[d.status]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Después de esto</h4>
              {dependents.length === 0 ? <p className="text-sm text-muted-foreground">Ningún milestone depende de éste</p> : (
                <ul className="space-y-1">
                  {dependents.map((d: any) => (
                    <li key={d.id} className="flex items-center justify-between text-sm p-2 border rounded">
                      <span>{d.code} · {d.title}</span>
                      <Badge variant="outline">{STATUS_LABEL[d.status]}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-3 mt-4">
            <div className="space-y-2 p-3 border rounded-md">
              <Input placeholder="Etiqueta (ej: doc de scope firmado)" value={evidenceLabel} onChange={(e) => setEvidenceLabel(e.target.value)} />
              <Input placeholder="https://..." value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
              <Button size="sm" onClick={addEvidence} className="gap-1"><Link2 className="h-3.5 w-3.5" /> Agregar evidencia</Button>
            </div>
            {evidence.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay evidencia.</p> : (
              <ul className="space-y-2">
                {evidence.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 p-2 border rounded text-sm">
                    <a href={e.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 truncate">
                      {e.label} <ExternalLink className="h-3 w-3" />
                    </a>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={async () => {
                      await supabase.from("evidence_links").delete().eq("id", e.id); invalidate();
                    }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-3 mt-4">
            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." rows={3} />
            <Button size="sm" onClick={addComment}>Publicar</Button>
            {comments.length === 0 ? <p className="text-sm text-muted-foreground">Sin comentarios.</p> : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="p-3 border rounded-md bg-muted/30">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>{c.author_id === user?.id ? "Tú" : "Miembro"}</span>
                      <span>{fmtRelative(c.created_at)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                    {c.author_id === user?.id && (
                      <Button size="sm" variant="ghost" className="mt-1" onClick={async () => {
                        await supabase.from("comments").delete().eq("id", c.id); invalidate();
                      }}>Eliminar</Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-2 mt-4">
            {myActivity.length === 0 ? <p className="text-sm text-muted-foreground">Sin historial aún.</p> : (
              <ul className="space-y-2">
                {myActivity.map((a) => (
                  <li key={a.id} className="text-sm p-2 border rounded flex justify-between">
                    <span>{Object.keys((a.after_data as any) || {}).join(", ") || a.action}</span>
                    <span className="text-xs text-muted-foreground">{fmtRelative(a.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirm complete dialog */}
        <Dialog open={confirmComplete} onOpenChange={setConfirmComplete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como completado</DialogTitle>
              <DialogDescription>Confirma que se cumple la Definition of Done:</DialogDescription>
            </DialogHeader>
            <ul className="text-sm space-y-2 bg-muted/30 p-3 rounded">
              {dod.map((d, i) => <li key={i}>· {d}</li>)}
            </ul>
            <Textarea value={completeNote} onChange={(e) => setCompleteNote(e.target.value)} placeholder="Comentario o evidencia adicional (opcional)" rows={3} />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmComplete(false)}>Cancelar</Button>
              <Button onClick={completeNow}>Confirmar completado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bloquear milestone</DialogTitle>
              <DialogDescription>Necesitamos una razón para el bloqueo.</DialogDescription>
            </DialogHeader>
            <Textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="¿Qué está bloqueando este milestone?" rows={3} />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancelar</Button>
              <Button onClick={blockNow}>Bloquear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
