import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { seedWorkspace } from "@/lib/seedWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { Sparkles, Check } from "lucide-react";

const today = () => format(new Date(), "yyyy-MM-dd");
const plus56 = () => format(addDays(new Date(), 56), "yyyy-MM-dd");

const DAYS = [
  { v: 1, l: "Lunes" },
  { v: 2, l: "Martes" },
  { v: 3, l: "Miércoles" },
  { v: 4, l: "Jueves" },
  { v: 5, l: "Viernes" },
  { v: 6, l: "Sábado" },
  { v: 0, l: "Domingo" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { refresh } = useWorkspace();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("RevenueOS — Dental Aesthetic");
  const [startDate, setStartDate] = useState(today());
  const [targetDate, setTargetDate] = useState(plus56());
  const [jurisdiction, setJurisdiction] = useState("Por definir");
  const [markets, setMarkets] = useState("Costa Rica, México");
  const [reviewDay, setReviewDay] = useState(5);
  const [applyInitial, setApplyInitial] = useState(true);

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await seedWorkspace({
        ownerId: user.id,
        name,
        startDate,
        targetDate,
        jurisdiction,
        launchMarkets: markets.split(",").map((s) => s.trim()).filter(Boolean),
        weeklyReviewDay: reviewDay,
        applyInitialProgress: applyInitial,
      });
      toast.success("Workspace creado");
      await refresh();
    } catch (e: any) {
      toast.error("No pudimos crear el workspace", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-10 w-10 rounded-lg gradient-navy grid place-content-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl">Configura tu Control Tower</span>
        </div>

        <div className="surface-elevated p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Paso {step} de 5</p>
              <h2 className="font-display text-2xl mt-1">
                {step === 1 && "Nombra tu workspace"}
                {step === 2 && "Define tus fechas"}
                {step === 3 && "Jurisdicción y mercados"}
                {step === 4 && "Ritmo semanal"}
                {step === 5 && "Avance inicial"}
              </h2>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <Label>Nombre del workspace</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <p className="text-sm text-muted-foreground">
                Usaremos este nombre en el header del Control Tower.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de inicio</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fecha objetivo</Label>
                <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
              <p className="col-span-2 text-sm text-muted-foreground">
                Sugerimos +56 días para mantener la cadencia de 8 semanas.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jurisdicción de la empresa</Label>
                <Input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Por definir" />
              </div>
              <div className="space-y-2">
                <Label>Mercados iniciales</Label>
                <Input value={markets} onChange={(e) => setMarkets(e.target.value)} placeholder="Costa Rica, México" />
                <p className="text-xs text-muted-foreground">Separados por coma.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Label>Día de revisión semanal</Label>
              <Select value={String(reviewDay)} onValueChange={(v) => setReviewDay(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d.v} value={String(d.v)}>{d.l}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Usaremos este día para abrir la nueva Weekly Review.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between rounded-lg border p-4 bg-muted/30">
                <div className="space-y-1 pr-4">
                  <Label className="text-base">Usar avance inicial estimado</Label>
                  <p className="text-sm text-muted-foreground">
                    Aplicamos progreso aproximado en milestones que ya están avanzados gracias a tus blueprints
                    (RevenueOS Deck y ComplianceOS Blueprint). Podrás revisarlo antes de usarlo como fuente de verdad.
                  </p>
                </div>
                <Switch checked={applyInitial} onCheckedChange={setApplyInitial} />
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Sembraremos 9 workstreams y todos los milestones del programa.</li>
                <li>Crearemos las 6 métricas manuales de compliance.</li>
                <li>Tu rol será Owner del workspace.</li>
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="ghost" onClick={back} disabled={step === 1 || loading}>Atrás</Button>
            {step < 5 ? (
              <Button onClick={next}>Continuar</Button>
            ) : (
              <Button onClick={submit} disabled={loading} className="gap-2">
                {loading ? "Creando..." : (<>Crear workspace <Check className="h-4 w-4" /></>)}
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Este workspace gestiona ejecución del producto. No almacenar datos de pacientes ni información clínica.
        </p>
      </div>
    </div>
  );
}
