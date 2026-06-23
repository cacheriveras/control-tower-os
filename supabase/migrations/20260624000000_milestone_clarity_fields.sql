-- Campos de claridad operativa para milestones (aditivo, no destructivo).
-- Permiten mostrar un título humano + explicaciones autoexplicativas sin perder los códigos.
-- No se tocan RLS ni grants existentes (las policies por workspace ya cubren estas columnas).
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS human_title       text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS simple_explanation text,
  ADD COLUMN IF NOT EXISTS expected_output   text,
  ADD COLUMN IF NOT EXISTS unlocks_decision  text,
  ADD COLUMN IF NOT EXISTS examples          jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS success_criteria  jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.milestones.human_title IS 'Título en lenguaje humano (acción real), mostrado antes que el código.';
COMMENT ON COLUMN public.milestones.short_description IS 'Descripción de 1-2 líneas visible en tarjetas.';
COMMENT ON COLUMN public.milestones.simple_explanation IS 'Qué estoy definiendo/construyendo, en palabras simples.';
COMMENT ON COLUMN public.milestones.expected_output IS 'Resultado esperado / entregable concreto (sin microtareas).';
COMMENT ON COLUMN public.milestones.unlocks_decision IS 'Qué decisión o siguiente paso desbloquea este milestone.';
COMMENT ON COLUMN public.milestones.examples IS 'Ejemplos (array de strings) para ilustrar el milestone.';
COMMENT ON COLUMN public.milestones.success_criteria IS 'Cómo se ve terminado (array de strings, máx ~3).';
