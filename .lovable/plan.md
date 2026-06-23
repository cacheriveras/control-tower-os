# Plan: Aesthetic Dental RevenueOS — Build Control Tower

App privada de ejecución (no CRM de pacientes) para gestionar el build de 8 semanas. Dado el tamaño, propongo construirla en **3 entregas iterativas** dentro de esta misma conversación, validando avance entre cada una.

## Supuestos clave (corrígeme si difieren)
- **Lovable Cloud** como backend (Supabase gestionado, sin cuenta externa). Lo habilitaré en el primer paso.
- **Auth**: email + contraseña (sin Google por ahora; puedo añadirlo después).
- **Idioma**: español latinoamericano, fecha dd/mm/yyyy, tz default America/Costa_Rica.
- **Sin datos de pacientes** en ningún flujo; banner persistente.
- Estética: ivory #F7F4EE, navy #061B33, teal #0FA9A8, gold #C8962E, Playfair + Inter.

## Entrega 1 — Fundación (backend + auth + onboarding + Command Center + Focus Mode)
1. Habilitar Lovable Cloud.
2. Migración Supabase con TODAS las tablas del spec (profiles, workspaces, workspace_members, workstreams, milestones, milestone_dependencies, comments, evidence_links, weekly_reviews, decisions, decision_milestones, compliance_metrics, activity_log) con enums, constraints (progress 0–100, week 1–8), GRANTS y RLS por membresía vía función security definer `is_workspace_member`.
3. Seed: edge function `seed-workspace` que inserta los 9 workstreams, los ~40 milestones con sus códigos, dependencias y métricas de compliance. Opción de aplicar avance inicial estimado.
4. Diseño system completo en `index.css` + `tailwind.config.ts` (tokens semánticos, gradientes, sombras suaves, tipografías). Variants para Button y Card.
5. Auth pages (login/signup/reset-password).
6. Wizard de onboarding (5 pasos).
7. Layout con sidebar navy + 9 entradas + banner "no datos de pacientes".
8. **Command Center**: header, tarjeta dominante "Siguiente paso" (algoritmo de scoring), progreso global ponderado, launch readiness, barras por workstream, barras por semana, esta semana, bloqueados, próximos gates, WIP.
9. **Focus Mode**: minimalista con slider progreso, próxima acción, botones acción, secciones colapsadas.

## Entrega 2 — Gestión de milestones (Roadmap, Workstreams, Milestones CRUD)
10. **Roadmap 8 semanas**: timeline horizontal agrupado por 4 fases, drag-and-drop de week_target, vista de dependencias.
11. **Workstreams**: 9 tarjetas + detalle.
12. **Milestones**: toggle Lista/Kanban, filtros, búsqueda, CRUD, duplicar, reabrir, aparcar; drawer con tabs Overview/DoD/Dependencies/Evidence/Comments/Activity; activity_log automático vía triggers.
13. Confirmación al completar con criterios Done + evidence/comment; razón obligatoria al bloquear.

## Entrega 3 — Compliance, Weekly Review, Decision Log, Settings, pulido
14. **Compliance & Legal**: dos paneles (Compliance Readiness, Company Legal Readiness), gates críticos, riesgos, métricas manuales editables.
15. **Weekly Review**: formulario persistente, "Cerrar semana" genera snapshot y crea siguiente, historial comparativo.
16. **Decision Log**: CRUD con vinculación a milestones, sección "Parking lot".
17. **Settings**: workspace, miembros (invitar por email vía edge function), timezone, WIP limit, weekly review day.
18. Animaciones sutiles, prefers-reduced-motion, estados vacíos, responsive móvil para Focus Mode.
19. Validación final contra los 9 criterios de aceptación.

## Detalles técnicos
- **RLS**: función `public.is_workspace_member(ws uuid, uid uuid)` security definer; toda policy usa `is_workspace_member(workspace_id, auth.uid())`. Roles vía columna `role` en `workspace_members` con check Owner/Collaborator y función `is_workspace_owner`.
- **Cálculos** (progreso ponderado, launch readiness, riesgo, scoring de siguiente paso) en hooks/utilidades del cliente para reactividad inmediata; misma lógica reusable en edge functions si fuera necesario.
- **Activity log** vía triggers SQL `AFTER UPDATE` en milestones.
- **Drag-and-drop**: `@dnd-kit/core`.
- **Fechas**: `date-fns` con locale `es`.
- **Estado servidor**: TanStack Query + Supabase realtime para refresco inmediato tras mutaciones.

## Lo que NO incluiré (a menos que me lo pidas)
- Integraciones reales con Vapi, n8n, Twilio, OpenAI (son contenido de milestones, no features).
- Notificaciones por email más allá de invitaciones.
- Exportes PDF de weekly review.
- Modo oscuro (mantengo solo el tema ivory premium).

```text
Semana 1-2          Semana 3-4          Semana 5-6          Semana 7-8
Fundamentos         Crear & Proteger    Monetizar           Piloto & Launch
[STR][BRN][PLT]     [CAP][CMP][LEG]     [MON][CTL]          [PIL][CTL]
[G1][L1][L3]        [G2][G3][G4][L2]    [G5][L5][O1-O3]     [O5][I3-I5]
```

¿Apruebas para empezar con la **Entrega 1**? Si quieres ajustar auth (añadir Google), idioma de algún campo, o el alcance de cada entrega, dímelo y reviso antes de tocar código.
