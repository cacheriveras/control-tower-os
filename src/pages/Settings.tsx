import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaceMembers } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DAYS = [
  { v: 1, l: "Lunes" }, { v: 2, l: "Martes" }, { v: 3, l: "Miércoles" },
  { v: 4, l: "Jueves" }, { v: 5, l: "Viernes" }, { v: 6, l: "Sábado" }, { v: 0, l: "Domingo" },
];

export default function Settings() {
  const { workspace, role, refresh } = useWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: members = [] } = useWorkspaceMembers(workspace?.id);
  const isOwner = role === "owner";

  const [draft, setDraft] = useState<any>(null);
  useEffect(() => { if (workspace) setDraft({ ...workspace }); }, [workspace?.id]);

  if (!workspace || !draft) return <div className="p-8 text-sm text-muted-foreground">Cargando...</div>;

  const save = async () => {
    const { error } = await supabase.from("workspaces").update({
      name: draft.name, jurisdiction: draft.jurisdiction,
      launch_markets: typeof draft.launch_markets === "string" ? draft.launch_markets.split(",").map((s: string) => s.trim()).filter(Boolean) : draft.launch_markets,
      weekly_review_day: draft.weekly_review_day, wip_limit: draft.wip_limit,
      timezone: draft.timezone, start_date: draft.start_date, target_date: draft.target_date,
    }).eq("id", workspace.id);
    if (error) return toast.error(error.message);
    toast.success("Workspace actualizado");
    refresh();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto fade-in space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Settings</p>
        <h1 className="font-display text-3xl mt-1">Configuración del workspace</h1>
      </header>

      <section className="surface-card p-6 space-y-4">
        <h2 className="font-display text-xl">Workspace</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nombre</Label><Input value={draft.name} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Jurisdicción</Label><Input value={draft.jurisdiction} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, jurisdiction: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Fecha de inicio</Label><Input type="date" value={draft.start_date} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Fecha objetivo</Label><Input type="date" value={draft.target_date} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, target_date: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Mercados (separados por coma)</Label><Input value={Array.isArray(draft.launch_markets) ? draft.launch_markets.join(", ") : draft.launch_markets} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, launch_markets: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Timezone</Label><Input value={draft.timezone} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, timezone: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Día de revisión semanal</Label>
            <Select value={String(draft.weekly_review_day)} onValueChange={(v) => setDraft({ ...draft, weekly_review_day: Number(v) })} disabled={!isOwner}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DAYS.map((d) => <SelectItem key={d.v} value={String(d.v)}>{d.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Límite WIP</Label><Input type="number" min={1} max={10} value={draft.wip_limit} disabled={!isOwner} onChange={(e) => setDraft({ ...draft, wip_limit: Number(e.target.value) })} /></div>
        </div>
        {isOwner && <Button onClick={save}>Guardar</Button>}
        {!isOwner && <p className="text-xs text-muted-foreground">Solo el Owner puede editar la configuración.</p>}
      </section>

      <section className="surface-card p-6 space-y-4">
        <div className="flex justify-between items-baseline">
          <h2 className="font-display text-xl">Miembros</h2>
          <Badge variant="outline">{members.length}</Badge>
        </div>
        <ul className="space-y-2">
          {members.map((m: any) => (
            <li key={m.user_id} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="text-sm font-medium">{m.profile?.full_name || m.user_id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{m.user_id === user?.id ? "Tú" : "Colaborador"}</p>
              </div>
              <Badge className={m.role === "owner" ? "bg-gold text-gold-foreground" : ""}>{m.role}</Badge>
            </li>
          ))}
        </ul>
        {isOwner && (
          <p className="text-xs text-muted-foreground">
            Para invitar a un colaborador, pídele que cree una cuenta con su correo y comparte aquí su user id para añadirlo.
            (La invitación por email se conectará en una próxima iteración.)
          </p>
        )}
      </section>

      <p className="text-xs text-muted-foreground text-center">
        Workspace privado · No almacenar datos de pacientes ni información clínica.
      </p>
    </div>
  );
}
