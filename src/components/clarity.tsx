// Piezas de UI compartidas para "claridad operativa":
// - InfoHint / GlossaryHint: tooltips para términos confusos (Launch Gate, WIP, etc.).
// - ExpandableText: descripción con truncado + "ver más" para no agrandar tarjetas.
// - MilestoneMeta: subtítulo discreto con code · workstream · semana · prioridad/gate.
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { GLOSSARY, workstreamLabel } from "@/lib/milestoneContent";
import { cn } from "@/lib/utils";

/** Icono "?" con tooltip de texto libre. */
export function InfoHint({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Más información"
          className={cn("inline-flex text-muted-foreground/70 hover:text-foreground transition", className)}
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

/** Término del glosario: muestra el texto y, si existe definición, un tooltip. */
export function GlossaryHint({ term, label, className }: { term: keyof typeof GLOSSARY | string; label?: string; className?: string }) {
  const def = GLOSSARY[term as string];
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {label ?? (term as string)}
      {def && <InfoHint text={def} />}
    </span>
  );
}

/** Descripción truncada con opción de expandir (evita tarjetas gigantes). */
export function ExpandableText({
  text,
  className,
  clampClass = "line-clamp-2",
  threshold = 120,
}: {
  text?: string | null;
  className?: string;
  clampClass?: string;
  threshold?: number;
}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > threshold;
  return (
    <div className={className}>
      <p className={open || !long ? "" : clampClass}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="mt-0.5 text-xs text-primary/80 hover:text-primary"
        >
          {open ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

/** Subtítulo discreto: code · workstream · Semana N · prioridad · Gate. */
export function MilestoneMeta({
  code,
  workstream,
  week,
  priority,
  isGate,
  className,
}: {
  code?: string | null;
  workstream?: { code?: string | null; name?: string | null } | null;
  week?: number | null;
  priority?: string | null;
  isGate?: boolean | null;
  className?: string;
}) {
  const wsLabel = workstreamLabel(workstream);
  const parts = [code, wsLabel || undefined, week != null ? `Semana ${week}` : undefined, priority || undefined].filter(
    Boolean,
  );
  return (
    <div className={cn("flex items-center flex-wrap gap-x-1.5 gap-y-1 text-xs text-muted-foreground", className)}>
      <span className="truncate">{parts.join(" · ")}</span>
      {isGate && (
        <span className="inline-flex items-center gap-1">
          <Badge className="bg-gold text-gold-foreground text-[10px] py-0">Gate</Badge>
          <InfoHint text={GLOSSARY["Launch Gate"]} />
        </span>
      )}
    </div>
  );
}
