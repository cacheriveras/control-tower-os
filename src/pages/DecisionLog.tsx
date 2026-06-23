import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useDecisions } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";

export default function DecisionLog() {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const { data: decisions = [] } = useDecisions(workspace?.id);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);

  const active = decisions.filter((d) => !d.is_parking_lot);
  const parking = decisions.filter((d) => d.is_parking_lot);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta entrada?")) return;
    await supabase.from("decisions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["decisions"] });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto fade-in space-y-6">
      <header className="flex justify-between items-end flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Decision Log</p>
          <h1 className="font-display text-3xl mt-1">Decisiones y parking lot</h1>
        </div>
        <Button className="gap-2" onClick={() => { setEdit(null); setOpen(true); }}><Plus className="h-4 w-4" /> Nueva entrada</Button>
      </header>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Decisiones ({active.length})</TabsTrigger>
          <TabsTrigger value="parking">Parking lot / No ahora ({parking.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0 && <p className="text-sm text-muted-foreground">Aún no registras decisiones.</p>}
          {active.map((d) => (
            <Item key={d.id} d={d} onEdit={() => { setEdit(d); setOpen(true); }} onRemove={() => remove(d.id)} />
          ))}
        </TabsContent>
        <TabsContent value="parking" className="mt-4 space-y-3">
          {parking.length === 0 && <p className="text-sm text-muted-foreground">Sin ideas aparcadas.</p>}
          {parking.map((d) => (
            <Item key={d.id} d={d} onEdit={() => { setEdit(d); setOpen(true); }} onRemove={() => remove(d.id)} />
          ))}
        </TabsContent>
      </Tabs>

      <EditDialog open={open} onClose={() => setOpen(false)} record={edit} />
    </div>
  );
}

function Item({ d, onEdit, onRemove }: any) {
  return (
    <button onClick={onEdit} className="surface-card p-4 text-left w-full hover:border-primary/40 transition">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{d.title}</h3>
          {d.decision && <p className="text-sm text-muted-foreground mt-1 line-clamp-2"><span className="font-medium text-foreground">Decisión:</span> {d.decision}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {d.decided_at && <span>Decidida el {fmtDate(d.decided_at)}</span>}
            {d.review_at && <span>Revisión {fmtDate(d.review_at)}</span>}
            {d.is_parking_lot && <Badge variant="outline" className="text-[10px]">Parking lot</Badge>}
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </button>
  );
}

function EditDialog({ open, onClose, record }: any) {
  const { workspace } = useWorkspace();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any>({});
  const isNew = !record;

  // reset when opening
  if (open && Object.keys(draft).length === 0) {
    setDraft(record ?? { title: "", context: "", options_considered: "", decision: "", rationale: "", decided_at: "", review_at: "", is_parking_lot: false });
  }

  const close = () => { setDraft({}); onClose(); };

  const submit = async () => {
    if (!draft.title) return toast.error("Falta el título");
    const payload: any = {
      title: draft.title, context: draft.context || null, options_considered: draft.options_considered || null,
      decision: draft.decision || null, rationale: draft.rationale || null,
      decided_at: draft.decided_at || null, review_at: draft.review_at || null,
      is_parking_lot: !!draft.is_parking_lot,
    };
    if (isNew) {
      payload.workspace_id = workspace!.id;
      const { error } = await supabase.from("decisions").insert(payload);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("decisions").update(payload).eq("id", record.id);
      if (error) return toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["decisions"] });
    toast.success(isNew ? "Decisión registrada" : "Actualizada");
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{isNew ? "Nueva decisión" : "Editar decisión"}</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div><Label>Título</Label><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
          <div><Label>Contexto</Label><Textarea rows={3} value={draft.context || ""} onChange={(e) => setDraft({ ...draft, context: e.target.value })} /></div>
          <div><Label>Opciones consideradas</Label><Textarea rows={3} value={draft.options_considered || ""} onChange={(e) => setDraft({ ...draft, options_considered: e.target.value })} /></div>
          <div><Label>Decisión final</Label><Textarea rows={2} value={draft.decision || ""} onChange={(e) => setDraft({ ...draft, decision: e.target.value })} /></div>
          <div><Label>Por qué</Label><Textarea rows={2} value={draft.rationale || ""} onChange={(e) => setDraft({ ...draft, rationale: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fecha de decisión</Label><Input type="date" value={draft.decided_at || ""} onChange={(e) => setDraft({ ...draft, decided_at: e.target.value })} /></div>
            <div><Label>Fecha de revisión</Label><Input type="date" value={draft.review_at || ""} onChange={(e) => setDraft({ ...draft, review_at: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={!!draft.is_parking_lot} onCheckedChange={(v) => setDraft({ ...draft, is_parking_lot: v })} />
            <Label>Es parking lot (idea que no debe interrumpir el roadmap)</Label>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={close}>Cancelar</Button><Button onClick={submit}>Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
