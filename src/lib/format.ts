import { format, formatDistanceToNow, parseISO, differenceInDays, addDays } from "date-fns";
import { es } from "date-fns/locale";

export const fmtDate = (d?: string | Date | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "dd/MM/yyyy", { locale: es });
};

export const fmtDateLong = (d?: string | Date | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "d 'de' MMMM, yyyy", { locale: es });
};

export const fmtRelative = (d?: string | Date | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
};

export const daysBetween = (a: Date | string, b: Date | string) => {
  const da = typeof a === "string" ? parseISO(a) : a;
  const db = typeof b === "string" ? parseISO(b) : b;
  return differenceInDays(db, da);
};

export const addDaysISO = (d: string | Date, days: number) => {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(addDays(date, days), "yyyy-MM-dd");
};

export const STATUS_LABEL: Record<string, string> = {
  not_started: "No iniciado",
  in_progress: "En curso",
  blocked: "Bloqueado",
  in_validation: "En validación",
  completed: "Completado",
  parked: "Aparcado",
};

export const STATUS_CLASS: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  blocked: "bg-destructive/10 text-destructive border-destructive/30",
  in_validation: "bg-gold/15 text-gold border-gold/40",
  completed: "bg-success/15 text-success border-success/40",
  parked: "bg-muted text-muted-foreground border-border italic",
};

export const PRIORITY_CLASS: Record<string, string> = {
  P0: "bg-destructive text-destructive-foreground",
  P1: "bg-gold text-gold-foreground",
  P2: "bg-secondary text-secondary-foreground",
};

export const PRIORITY_LABEL: Record<string, string> = {
  P0: "P0 · Crítico",
  P1: "P1 · Alta",
  P2: "P2 · Media",
};
