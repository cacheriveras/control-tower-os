// Datos semilla para Aesthetic Dental RevenueOS — Build Control Tower.
// Workstreams, milestones (con códigos exactos para dependencias),
// dependencias y métricas de compliance iniciales.

export type SeedWorkstream = {
  code: string;
  name: string;
  description: string;
  sort_order: number;
  weight: number;
  icon: string;
};

export type SeedMilestone = {
  code: string;
  workstream: string;
  title: string;
  week_target: number;
  priority: "P0" | "P1" | "P2";
  is_launch_gate: boolean;
  why_it_matters: string;
  definition_of_done: string[];
  depends_on: string[];
  requires_professional?: "none" | "lawyer" | "accountant" | "insurance" | "multiple";
  source_document?: string;
};

export type SeedComplianceMetric = {
  name: string;
  target_value: number;
  unit: string;
  sort_order: number;
};

export type SeedInitialProgress = {
  code: string;
  progress: number;
  status: "in_progress" | "in_validation";
  source_document: string;
};

export const SEED_WORKSTREAMS: SeedWorkstream[] = [
  { code: "STR", name: "Estrategia y Oferta", description: "Define qué se vende, para quién, cómo se mide y qué entra en el v1.", sort_order: 1, weight: 1.2, icon: "Compass" },
  { code: "BRN", name: "Revenue Brain & Blueprint", description: "Convierte el conocimiento de la clínica en reglas, playbooks y siguientes acciones.", sort_order: 2, weight: 1.2, icon: "Brain" },
  { code: "PLT", name: "Plataforma e Integraciones", description: "Arquitectura sobre Vapi, n8n, Supabase, Twilio, OpenAI y workflow de desarrollo con Claude Code.", sort_order: 3, weight: 1.1, icon: "Layers" },
  { code: "CAP", name: "Crear y Proteger Revenue", description: "Captura, conversación, booking, asistencia y rescate de cancelaciones.", sort_order: 4, weight: 1.3, icon: "Shield" },
  { code: "MON", name: "Monetizar, Recuperar y Multiplicar", description: "Decisión, pago, completion, recovery y lifetime value.", sort_order: 5, weight: 1.2, icon: "TrendingUp" },
  { code: "CTL", name: "Control Tower y Delivery Ops", description: "KPIs, leakage, weekly pulse, onboarding y optimización.", sort_order: 6, weight: 1.1, icon: "Activity" },
  { code: "CMP", name: "Compliance, Privacidad y Seguridad", description: "Privacidad por diseño, evidencia, vendors, seguridad e incidentes.", sort_order: 7, weight: 1.2, icon: "Lock" },
  { code: "LEG", name: "Empresa Legal y Contratos", description: "Entidad, impuestos, IP, contratos y cobertura legal.", sort_order: 8, weight: 1.1, icon: "Scale" },
  { code: "PIL", name: "Piloto y Lanzamiento", description: "Selección, onboarding, UAT, salida controlada y prueba de ROI.", sort_order: 9, weight: 1.3, icon: "Rocket" },
];

export const SEED_MILESTONES: SeedMilestone[] = [
  // STR
  { code: "S1", workstream: "STR", title: "Scope lock y non-goals", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Sin alcance acordado, todo el resto del build sufre scope creep y se diluye el valor entregable en 8 semanas.", definition_of_done: ["Alcance escrito cubre follow-up, cualificación comercial, agenda, recuperación y Control Tower.", "Excluye explícitamente diagnóstico, recomendación clínica, RX, fotos, historial y expediente.", "USA/PHI permanece fuera del scope hasta un track separado y documentado."], depends_on: [], source_document: "RevenueOS Deck" },
  { code: "S2", workstream: "STR", title: "ICP y mercados iniciales", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Define a quién venderle primero para concentrar mensajes, evidencia y referencias.", definition_of_done: ["Perfil de clínica objetivo, tratamientos prioritarios, geografía e idiomas documentados.", "Señales de compra y criterios de exclusión escritos.", "Mercados iniciales priorizados con racional."], depends_on: ["S1"] },
  { code: "S3", workstream: "STR", title: "Oferta insignia, paquete y pricing", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Convierte el discurso en un producto vendible con precio, alcance y promesa de resultado.", definition_of_done: ["Un producto claro con componentes incluidos y responsabilidades de la clínica.", "Lógica de setup, recurring y performance pricing definida.", "Promesa de resultado y exclusiones documentadas."], depends_on: ["S1", "S2"], source_document: "RevenueOS Deck" },
  { code: "S4", workstream: "STR", title: "Funnel económico y métricas de éxito", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Sin definiciones compartidas no hay forma de demostrar ROI ni operar el Control Tower.", definition_of_done: ["Definiciones de Lead→Booked→Attended→Presented→Accepted→Started→Collected acordadas.", "Métricas de producción agendada, cobrado, recuperado, en riesgo y forecast definidas.", "Mapping de cada métrica a la fuente de datos prevista."], depends_on: ["S1"] },
  { code: "S5", workstream: "STR", title: "Orden de construcción y éxito del piloto", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Asegura que el equipo construya en el orden que protege dinero antes de buscar inteligencia avanzada.", definition_of_done: ["Roadmap v1 prioriza proteger → monetizar → multiplicar → inteligencia.", "Fecha objetivo del piloto y umbrales de éxito acordados.", "Criterios de stop/continue para el piloto definidos."], depends_on: ["S1", "S4"] },

  // BRN
  { code: "B1", workstream: "BRN", title: "Revenue Leak Audit framework", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "El leak audit convierte el discurso de RevenueOS en un diagnóstico ganador que abre puertas.", definition_of_done: ["Auditoría cubre missed calls, no contact, no-shows, cancelaciones, planes sin agendar, financiación abandonada, tratamientos incompletos, recall vencido y saldos.", "Entrega valor en riesgo cuantificado.", "Define top 3 oportunidades por clínica."], depends_on: ["S2", "S4"], source_document: "RevenueOS Deck" },
  { code: "B2", workstream: "BRN", title: "Clinic Discovery & Configuration Blueprint", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Estandariza el onboarding clínico para que el sistema se configure rápido y sin errores.", definition_of_done: ["Plantilla cubre tratamientos, valor, duración, doctores, capacidad, sedes y horarios.", "Captura financiación, depósitos, políticas, contenido aprobado e idiomas.", "Incluye reglas de escalamiento por tipo de caso."], depends_on: ["B1"] },
  { code: "B3", workstream: "BRN", title: "Sistema de playbooks por tratamiento", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Sin playbook reutilizable cada clínica tarda semanas en pasar a producción.", definition_of_done: ["Plantilla reutilizable para carillas, implantes y alineadores.", "Cada playbook incluye etapas comerciales, seguimiento y manejo de objeciones.", "Define handoffs clínicos y próxima acción por estado."], depends_on: ["B2"] },
  { code: "B4", workstream: "BRN", title: "Knowledge base, objeciones, tono y políticas", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "El asistente solo es confiable si responde con tono, claims y políticas aprobadas por cada clínica.", definition_of_done: ["FAQs, objeciones, tono e idiomas versionados.", "Claims aprobados y prohibidos documentados.", "Políticas de financiación y contenido aprobables por clínica."], depends_on: ["B2"] },
  { code: "B5", workstream: "BRN", title: "State machine, next actions y human handoff", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "La máquina de estados convierte conversaciones en acciones medibles y previene fugas silenciosas.", definition_of_done: ["Cada estado tiene siguiente acción, timeout, owner y outcome/loss reason.", "Triggers clínicos, sensibles o urgentes generan handoff con contexto.", "SLA por tipo de handoff definido."], depends_on: ["B2", "B3", "B4"] },

  // PLT
  { code: "P1", workstream: "PLT", title: "Arquitectura, flujo de datos y entornos", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Sin un mapa explícito no se puede operar, auditar ni cumplir compliance.", definition_of_done: ["Mapa Vapi/Twilio → n8n → OpenAI → Supabase → calendar/dashboard con propósito, owner y retención.", "Entornos dev, staging y prod definidos.", "Plan de rollback documentado."], depends_on: ["S1", "G1"] },
  { code: "P2", workstream: "PLT", title: "Supabase foundation", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Fundamento técnico de toda la persistencia y los permisos.", definition_of_done: ["Schema mínimo, Auth, roles, RLS y storage privado configurados.", "Audit fields, migrations y backups operativos.", "Ninguna tabla de leads expuesta públicamente."], depends_on: ["P1", "G1"] },
  { code: "P3", workstream: "PLT", title: "n8n orchestration foundation", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Los flujos sin patrón reutilizable se vuelven imposibles de mantener y auditar.", definition_of_done: ["Patrones reutilizables con idempotency, retries y error queue.", "Credenciales protegidas y política de redaction definida.", "Runbook operativo publicado."], depends_on: ["P1", "P2"] },
  { code: "P4", workstream: "PLT", title: "Twilio + Vapi channel foundation", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Sin canales confiables no hay captura ni recovery posibles.", definition_of_done: ["Inbound y outbound SMS, WhatsApp y voz operativos.", "Webhooks y status callbacks integrados.", "Disclosures, templates y call result almacenados; audio no persistente por defecto."], depends_on: ["P1", "G2"] },
  { code: "P5", workstream: "PLT", title: "OpenAI assistant layer y guardrails", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Los modelos sin guardrails arriesgan diagnóstico clínico y daño reputacional.", definition_of_done: ["Prompts versionados con structured outputs.", "Permisos de tools, no diagnóstico y handoff clínico configurados.", "Eval dataset y fallback seguro definidos."], depends_on: ["B4", "B5", "P1"] },
  { code: "P6", workstream: "PLT", title: "Observability, release y run operations", week_target: 4, priority: "P0", is_launch_gate: true, why_it_matters: "Sin observabilidad un piloto se vuelve invisible y los problemas escalan.", definition_of_done: ["Health, error y cost monitoring activos con alertas.", "Audit trail demostrable end-to-end.", "Deploy/rollback y runbook operativo documentados."], depends_on: ["P2", "P3", "P4", "P5"] },

  // CAP
  { code: "C1", workstream: "CAP", title: "Opportunity Capture Engine MVP", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Capturar bien la oportunidad es el primer paso para proteger dinero hoy.", definition_of_done: ["Captura los canales acordados sin duplicar oportunidades.", "Guarda datos mínimos, source y consent.", "Asigna owner y siguiente acción automáticamente."], depends_on: ["P2", "P3", "P4", "B5", "G1", "G2", "G3"] },
  { code: "C2", workstream: "CAP", title: "Conversation & Qualification Engine MVP", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Una conversación bien cualificada multiplica la conversión sin contratar más humanos.", definition_of_done: ["Responde FAQs aprobadas sin alucinaciones.", "Identifica intención, tratamiento, idioma, timing y objeción.", "No diagnostica y escala correctamente cuando aplica."], depends_on: ["C1", "P5", "B4", "B5"] },
  { code: "C3", workstream: "CAP", title: "Smart Scheduling Engine MVP", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Sin agendamiento confiable la conversación no se convierte en producción.", definition_of_done: ["Agenda y reagenda con doctor, sede y slot correctos según reglas.", "Sincroniza con calendar y confirma al paciente.", "Maneja fallos y conflictos de manera segura."], depends_on: ["C1", "B2", "P4"] },
  { code: "C4", workstream: "CAP", title: "Attendance Shield + Cancellation Rescue MVP", week_target: 4, priority: "P0", is_launch_gate: true, why_it_matters: "El no-show y la cancelación son las fugas más caras de cualquier clínica.", definition_of_done: ["Confirmación, instrucciones y reminders activos con non-response recovery.", "Cancelación activa refill desde waitlist, leads, planes sin agendar o recall.", "Trazabilidad del rescate por oportunidad."], depends_on: ["C3", "P4", "G3"] },
  { code: "C5", workstream: "CAP", title: "Human Moments Desk + QA crear/proteger", week_target: 4, priority: "P0", is_launch_gate: true, why_it_matters: "Sin cola humana confiable los casos sensibles se pierden y el sistema parece fallar.", definition_of_done: ["Cola de excepciones muestra resumen, valor aproximado, razón, acción y SLA.", "Test pack sintético E2E pasa escenarios normales y de fallo.", "Métricas de QA visibles para el equipo."], depends_on: ["C1", "C2", "C3", "C4", "P6"] },

  // MON
  { code: "M1", workstream: "MON", title: "Consult Preparation + Mi Plan de Sonrisa MVP", week_target: 4, priority: "P1", is_launch_gate: false, why_it_matters: "Llegar al consultorio con contexto comercial sube la aceptación sin tocar la clínica.", definition_of_done: ["Intake comercial captura objetivo, objeción y financiación.", "Brief para el doctor disponible antes de la cita.", "Siguiente paso privado sin claims clínicos."], depends_on: ["C3", "B3", "B4"] },
  { code: "M2", workstream: "MON", title: "Treatment Decision Engine MVP", week_target: 5, priority: "P0", is_launch_gate: true, why_it_matters: "La decisión post-consulta es donde la mayoría del dinero se pierde silenciosamente.", definition_of_done: ["Estados presented, considering, needs financing, accepted, scheduled, started, completed y rejected definidos.", "Cada estado tiene owner y siguiente acción.", "Métricas de conversión por estado disponibles."], depends_on: ["M1", "B5", "P2"] },
  { code: "M3", workstream: "MON", title: "Financing, Payment & Treatment Completion MVP", week_target: 5, priority: "P0", is_launch_gate: true, why_it_matters: "El dinero solo cuenta cuando se cobra; recovery convierte intención en cash.", definition_of_done: ["Depósitos, financiación y payment links operativos.", "Reminders y recovery con siguiente acción por fase.", "Casos detenidos entran automáticamente a recuperación."], depends_on: ["M2"] },
  { code: "M4", workstream: "MON", title: "Revenue Vault + Patient Lifecycle MVP", week_target: 6, priority: "P0", is_launch_gate: true, why_it_matters: "El vault asegura que ninguna oportunidad recuperable se enfríe en silencio.", definition_of_done: ["Cohortes para missed, no contact, no-show, open plan, abandoned finance, incomplete, overdue recall y pending balance.", "Reglas de lifecycle y recall activas.", "Reportes de recuperación por cohorte disponibles."], depends_on: ["C4", "M2", "M3"] },
  { code: "M5", workstream: "MON", title: "Reputation, Referral & Case Library MVP", week_target: 6, priority: "P2", is_launch_gate: false, why_it_matters: "Reseñas, referidos y casos son el motor barato de demanda futura.", definition_of_done: ["Review y referral asks por triggers aprobados.", "Workflow consentido de casos y testimonios.", "Biblioteca de assets aprobados disponible."], depends_on: ["M4"] },
  { code: "M6", workstream: "MON", title: "Closed-loop attribution + capacity-aware marketing", week_target: 6, priority: "P1", is_launch_gate: false, why_it_matters: "Atribución cerrada y conciencia de capacidad evitan quemar presupuesto cuando no hay agenda.", definition_of_done: ["Revenue cobrado vuelve a source y campaign.", "Reglas reducen adquisición sin capacidad.", "Reglas reactivan demanda cuando hay huecos."], depends_on: ["M4", "O1"] },

  // CTL
  { code: "O1", workstream: "CTL", title: "Revenue Control Tower KPI Dashboard", week_target: 4, priority: "P0", is_launch_gate: true, why_it_matters: "El Control Tower es la entrega visible del producto; sin él no hay venta.", definition_of_done: ["Muestra producción agendada, revenue cobrado, recuperado, en riesgo y forecast 30 días.", "Conversión por etapa, source y tratamiento visible.", "Refresca con frecuencia útil para operación."], depends_on: ["S4", "P2", "C1"] },
  { code: "O2", workstream: "CTL", title: "Leakage Radar y prioridades humanas", week_target: 5, priority: "P0", is_launch_gate: true, why_it_matters: "Ordenar las fugas por valor evita que el equipo persiga lo urgente y no lo importante.", definition_of_done: ["Fugas ordenadas por valor estimado, edad, razón, owner y acción.", "Ninguna excepción crítica queda sin owner.", "Acciones rastreables hasta resolución."], depends_on: ["O1", "M2", "M4"] },
  { code: "O3", workstream: "CTL", title: "Weekly Revenue Pulse", week_target: 5, priority: "P0", is_launch_gate: true, why_it_matters: "El pulse semanal es el ritual que hace adoptable el sistema en la clínica.", definition_of_done: ["Resumen semanal de oportunidades, reservas, asistencias, aceptados, cobrado y recuperado.", "Incluye una decisión recomendada.", "Distribución automática al equipo."], depends_on: ["O1", "O2"] },
  { code: "O4", workstream: "CTL", title: "Client onboarding, support y delivery playbook", week_target: 6, priority: "P0", is_launch_gate: true, why_it_matters: "Sin un playbook repetible la implementación se vuelve consultoría a medida.", definition_of_done: ["Onboarding repetible con configuración, training y support channel.", "SLA y change control definidos.", "Proceso de offboarding documentado."], depends_on: ["B2", "C5", "G4", "L4"] },
  { code: "O5", workstream: "CTL", title: "Production Gate + Continuous Optimization Loop", week_target: 7, priority: "P0", is_launch_gate: true, why_it_matters: "El production gate evita lanzar antes de tiempo y crea ritmo de mejora.", definition_of_done: ["Checklist técnico, operativo, compliance, legal y UAT en verde.", "Backlog semanal priorizado por revenue impact, riesgo y evidencia.", "Decisiones del loop registradas."], depends_on: ["O2", "O3", "G5", "I3"] },

  // CMP
  { code: "G1", workstream: "CMP", title: "Data scope lock y minimización", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "El alcance de datos es la primera línea de defensa frente a riesgo regulatorio.", definition_of_done: ["Solo campos permitidos almacenados, cero columnas clínicas.", "Información de salud accidental se escala y no se explota.", "Política de delete_after y retention definida."], depends_on: ["S1"], source_document: "ComplianceOS Blueprint" },
  { code: "G2", workstream: "CMP", title: "Transparencia, consentimiento y límites de mensajería", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Sin consentimiento auditable se compromete el derecho del usuario y se expone la operación.", definition_of_done: ["Avisos web, chat, SMS y voz informan IA y propósito.", "Versión, timestamp y canal de consentimiento almacenados.", "Follow-up separado de promociones; marketing opt-in aparte."], depends_on: ["G1", "S1"], source_document: "ComplianceOS Blueprint", requires_professional: "lawyer" },
  { code: "G3", workstream: "CMP", title: "STOP, suppression y derechos del usuario", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Un STOP ignorado bloquea operaciones y dispara denuncias regulatorias.", definition_of_done: ["STOP/CANCELAR/BAJA/REMOVE centraliza suppression y detiene todas las automatizaciones.", "Confirmación de baja enviada.", "Proceso access/correct/delete/object operativo."], depends_on: ["G2", "P4"], source_document: "ComplianceOS Blueprint" },
  { code: "G4", workstream: "CMP", title: "DPA, vendor register, transfers y retention", week_target: 4, priority: "P0", is_launch_gate: true, why_it_matters: "Sin DPA y vendor register las clínicas serias no firman.", definition_of_done: ["Marco de DPA con clínica listo.", "Register y data terms para Supabase, Twilio, Vapi, OpenAI, n8n/hosting y calendar.", "Mecanismos de transferencia y retention/borrado definidos."], depends_on: ["G1", "P1"], requires_professional: "lawyer" },
  { code: "G5", workstream: "CMP", title: "Security baseline, incident response y Compliance Control Tower", week_target: 6, priority: "P0", is_launch_gate: true, why_it_matters: "Un incidente sin playbook destruye la confianza ganada con todo el trabajo previo.", definition_of_done: ["MFA, least privilege, RLS, secrets, logs, encryption y backups operativos.", "Playbook y tabletop de incidentes ejecutados.", "KPIs y trigger register para cookies, audio, minors, EU-UK y USA-PHI activos."], depends_on: ["G1", "G2", "G3", "G4", "P2", "P3", "P4", "P5", "P6"] },

  // LEG
  { code: "L1", workstream: "LEG", title: "Jurisdicción, entidad y registros", week_target: 1, priority: "P0", is_launch_gate: true, why_it_matters: "Sin entidad limpia los contratos clínicos no se pueden firmar.", definition_of_done: ["Jurisdicción elegida con asesoría.", "Empresa incorporada/registrada con ownership claro.", "IDs, licencias, domicilio y beneficial owner records según aplique."], depends_on: [], requires_professional: "lawyer" },
  { code: "L2", workstream: "LEG", title: "Banking, accounting, tax e invoicing operations", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Sin operaciones financieras limpias el piloto no puede cobrar.", definition_of_done: ["Cuenta y processor empresarial operativos.", "Bookkeeping, invoice flow y tax calendar definidos.", "Control de gastos operativos en marcha."], depends_on: ["L1"], requires_professional: "accountant" },
  { code: "L3", workstream: "LEG", title: "IP ownership y workforce agreements", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Si la IP no es de la compañía, una venta o ronda futura se cae.", definition_of_done: ["Compañía posee código, prompts, playbooks, marca, dominios y assets.", "Confidencialidad e IP assignment firmados por founders, contractors y employees.", "Inventario de IP documentado."], depends_on: ["L1"], requires_professional: "lawyer" },
  { code: "L4", workstream: "LEG", title: "Client commercial contract stack", week_target: 3, priority: "P0", is_launch_gate: true, why_it_matters: "Sin contract stack consistente cada deal se renegocia desde cero.", definition_of_done: ["MSA, SOW/order form, DPA y SLA/support listos.", "Acceptable use con non-clinical boundary, payment, termination y liability coherentes.", "Lista de subprocessors mantenida."], depends_on: ["L1", "S1", "G1"], requires_professional: "lawyer" },
  { code: "L5", workstream: "LEG", title: "Public legal docs, insurance y counsel sign-off", week_target: 6, priority: "P0", is_launch_gate: true, why_it_matters: "Sin docs públicos coherentes y sign-off de counsel el go-live se vuelve riesgo personal.", definition_of_done: ["Privacy notice, terms, decisión cookies/essential-only, subprocessor page y rights contact publicados.", "Seguro evaluado para los mercados activos.", "Counsel local revisa mercados iniciales y existe renewal calendar."], depends_on: ["L1", "L4", "G2", "G4", "G5"], requires_professional: "multiple" },

  // PIL
  { code: "I1", workstream: "PIL", title: "Selección del piloto y baseline", week_target: 2, priority: "P0", is_launch_gate: true, why_it_matters: "Sin baseline acordada el ROI del piloto será debatible.", definition_of_done: ["Clínica fit con champion identificado.", "Pilot intent y access plan firmados.", "Baseline de fugas/revenue y success criteria acordados."], depends_on: ["S2", "S3", "S4"] },
  { code: "I2", workstream: "PIL", title: "Onboarding y configuración del piloto", week_target: 5, priority: "P0", is_launch_gate: true, why_it_matters: "El onboarding define la calidad del primer mes de datos.", definition_of_done: ["Revenue Brain, playbooks y canales configurados y aprobados.", "Calendar, users y permissions definidos.", "Métricas instrumentadas."], depends_on: ["I1", "B2", "B5", "C5", "L4"] },
  { code: "I3", workstream: "PIL", title: "UAT con datos sintéticos", week_target: 6, priority: "P0", is_launch_gate: true, why_it_matters: "Pruebas reales antes del go-live previenen daño con pacientes reales.", definition_of_done: ["Core scenarios y failures probados.", "Consent, STOP, handoff y deletion validados.", "Dashboard y rollback verificados sin datos reales de pacientes."], depends_on: ["I2", "M3", "O1", "G5", "L4"] },
  { code: "I4", workstream: "PIL", title: "Controlled live pilot y estabilización", week_target: 7, priority: "P0", is_launch_gate: true, why_it_matters: "Salir controlado evita un incidente público que mate la oportunidad.", definition_of_done: ["Cohort o canal limitado con daily monitoring y human coverage.", "Cero defecto crítico de compliance o security.", "SLAs de respuesta e incidente cumplidos."], depends_on: ["I3", "O4", "L5", "G5"] },
  { code: "I5", workstream: "PIL", title: "ROI proof, case study y decisión v2", week_target: 8, priority: "P0", is_launch_gate: false, why_it_matters: "El cierre del piloto es lo que convierte 8 semanas de build en pipeline comercial real.", definition_of_done: ["Baseline vs resultados con revenue cobrado y recuperado documentado.", "Feedback y permiso de testimonial obtenidos.", "Roadmap keep/kill/improve decidido."], depends_on: ["I4", "O3", "O5", "M6"] },
];

export const SEED_COMPLIANCE_METRICS: SeedComplianceMetric[] = [
  { name: "Leads con aviso/permiso registrado", target_value: 100, unit: "%", sort_order: 1 },
  { name: "Mensajes enviados después de STOP", target_value: 0, unit: "msgs", sort_order: 2 },
  { name: "Vendors con DPA/data terms archivado", target_value: 100, unit: "%", sort_order: 3 },
  { name: "Transcripts crudos vencidos", target_value: 0, unit: "items", sort_order: 4 },
  { name: "Diagnósticos/recomendaciones clínicas emitidos por IA", target_value: 0, unit: "items", sort_order: 5 },
  { name: "Admins con MFA activado", target_value: 100, unit: "%", sort_order: 6 },
];

export const SEED_INITIAL_PROGRESS: SeedInitialProgress[] = [
  { code: "S1", progress: 70, status: "in_validation", source_document: "RevenueOS Deck" },
  { code: "S3", progress: 60, status: "in_validation", source_document: "RevenueOS Deck" },
  { code: "S4", progress: 55, status: "in_validation", source_document: "RevenueOS Deck" },
  { code: "S5", progress: 65, status: "in_validation", source_document: "RevenueOS Deck" },
  { code: "B1", progress: 20, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "B2", progress: 25, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "B3", progress: 25, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "B4", progress: 30, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "B5", progress: 35, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "P1", progress: 20, status: "in_progress", source_document: "Founder Requirement" },
  { code: "O1", progress: 35, status: "in_progress", source_document: "RevenueOS Deck" },
  { code: "G1", progress: 75, status: "in_validation", source_document: "ComplianceOS Blueprint" },
  { code: "G2", progress: 65, status: "in_validation", source_document: "ComplianceOS Blueprint" },
  { code: "G3", progress: 65, status: "in_validation", source_document: "ComplianceOS Blueprint" },
  { code: "G4", progress: 45, status: "in_progress", source_document: "ComplianceOS Blueprint" },
  { code: "G5", progress: 30, status: "in_progress", source_document: "ComplianceOS Blueprint" },
  { code: "L4", progress: 10, status: "in_progress", source_document: "Founder Requirement" },
];

export const PHASES = [
  { name: "Fundamentos y Blueprint", weeks: [1, 2], short: "Fundamentos" },
  { name: "Crear y proteger revenue", weeks: [3, 4], short: "Crear & Proteger" },
  { name: "Monetizar, recuperar y compliance", weeks: [5, 6], short: "Monetizar" },
  { name: "Piloto y lanzamiento", weeks: [7, 8], short: "Piloto & Lanzamiento" },
] as const;

export function phaseForWeek(week: number) {
  return PHASES.find((p) => p.weeks.includes(week)) ?? PHASES[0];
}
