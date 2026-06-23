// Contenido humano de los milestones — fuente única de copy claro y accionable.
//
// Por qué existe este archivo:
// - El seed (seedWorkspace) lo usa para PERSISTIR los campos nuevos en workspaces nuevos.
// - El UI lo usa como FALLBACK: si un workspace existente tiene las columnas nuevas en null,
//   igual mostramos copy rico resolviendo por `code`. Así nadie queda con tarjetas vacías
//   y no hace falta un backfill frágil.
//
// Resolución de cada campo: valor en DB (milestone.*) ?? mapa por code ?? fallback razonable.

export type MilestoneContent = {
  human_title: string;
  short_description: string;
  simple_explanation: string;
  expected_output: string;
  unlocks_decision: string;
  examples?: string[];
  success_criteria?: string[];
};

// Labels humanos de workstreams (se muestran antes que el código).
export const WORKSTREAM_LABEL: Record<string, string> = {
  STR: "Qué vendo y qué NO vendo",
  BRN: "Reglas comerciales de la clínica",
  PLT: "Stack técnico y automatizaciones",
  CAP: "Captura, agenda y rescate",
  MON: "Convertir citas en dinero",
  CTL: "Dashboard, operación y entrega",
  CMP: "Privacidad y seguridad operativa",
  LEG: "Empresa, contratos e impuestos",
  PIL: "Prueba real y salida al mercado",
};

// Explicación breve por fase (rango de semanas) para el Roadmap.
export const PHASE_BLURB: Record<string, string> = {
  "1-2": "Aclarar qué se está construyendo y poner límites.",
  "3-4": "Construir lo que captura, agenda y protege revenue.",
  "5-6": "Convertir oportunidades en dinero, recuperar fugas y cerrar compliance/legal.",
  "7-8": "Probar con piloto real, estabilizar y decidir v2.",
};

export function phaseBlurb(weeks: readonly number[]): string {
  return PHASE_BLURB[`${weeks[0]}-${weeks[weeks.length - 1]}`] ?? "";
}

// Glosario de términos que pueden confundir (para tooltips/helper text).
export const GLOSSARY: Record<string, string> = {
  "Launch Gate": "Un requisito crítico para poder lanzar sin romper el producto, la operación o compliance.",
  "WIP Limit": "Límite de trabajo en curso. Si tienes demasiados milestones abiertos, vuelves a caer en parálisis.",
  "En validación": "Ya existe una versión, pero falta revisarla, probarla o aprobarla antes de declararla terminada.",
  Evidencia: "Prueba de que el milestone está hecho: documento, link, screenshot, contrato, decisión, test o configuración.",
  Dependencia: "Algo que debe estar terminado antes de que este milestone tenga sentido.",
  "Métrica de compliance": "Número manual que revisas cada semana para probar que el sistema sigue operando dentro de límites seguros.",
};

// Mapa de contenido por código de milestone. Voz: guía interna para el fundador,
// directa y práctica; milestones de negocio/producto, no microtareas técnicas.
export const MILESTONE_CONTENT: Record<string, MilestoneContent> = {
  // ===== STR — Qué vendo y qué NO vendo =====
  S1: {
    human_title: "Definir exactamente qué hace y qué NO hace el RevenueOS",
    short_description: "Congela el alcance del v1 para no terminar construyendo un CRM médico, un chatbot genérico o un sistema clínico.",
    simple_explanation: "Este milestone define los bordes del producto. El RevenueOS debe captar, dar seguimiento, agendar, recuperar oportunidades y mostrar KPIs. No debe diagnosticar, pedir información clínica, manejar expedientes ni entrar a HIPAA/USA en esta versión.",
    expected_output: "Un documento corto de alcance v1 con secciones claras: incluido, excluido, límites clínicos, límites de datos, mercados iniciales y criterios para rechazar features.",
    unlocks_decision: "Permite decidir qué se construye ahora y qué se manda al parking lot.",
    examples: ["Incluye: follow-up, booking, rescate de cancelaciones, dashboard.", "Excluye: diagnóstico, RX, fotos clínicas, expediente, HIPAA/USA."],
    success_criteria: ["El v1 está definido en una página entendible.", "Las exclusiones clínicas y de datos están explícitas.", "Cualquier feature nueva se puede evaluar contra este alcance."],
  },
  S2: {
    human_title: "Elegir a qué clínicas les vendo primero",
    short_description: "Define el cliente ideal y los mercados iniciales para concentrar mensaje, evidencia y referencias.",
    simple_explanation: "Define el perfil de clínica objetivo (tratamientos, tamaño, geografía, idiomas), las señales de que es buen cliente y a quién NO venderle todavía.",
    expected_output: "Un perfil de cliente ideal escrito, con mercados iniciales priorizados y su racional.",
    unlocks_decision: "Permite enfocar la oferta, el piloto y el discurso comercial.",
    success_criteria: ["Perfil de clínica, tratamientos y geografía documentados.", "Señales de compra y criterios de exclusión escritos.", "Mercados iniciales priorizados."],
  },
  S3: {
    human_title: "Empaquetar la oferta y ponerle precio",
    short_description: "Convierte el discurso en un producto vendible con alcance, precio y promesa de resultado.",
    simple_explanation: "Define qué incluye el producto, qué hace la clínica y cómo cobras: setup, mensualidad y/o performance. Deja clara la promesa de resultado y sus exclusiones.",
    expected_output: "Una oferta insignia con componentes incluidos, modelo de pricing y promesa de resultado documentada.",
    unlocks_decision: "Permite cotizar y cerrar el piloto sin improvisar.",
    success_criteria: ["Producto claro con componentes y responsabilidades.", "Lógica de setup/recurring/performance definida.", "Promesa y exclusiones documentadas."],
  },
  S4: {
    human_title: "Definir las métricas que prueban que el sistema genera dinero",
    short_description: "Acuerda las definiciones del embudo (Lead→Booked→…→Collected) para poder demostrar ROI.",
    simple_explanation: "Sin definiciones compartidas no hay Control Tower. Este milestone fija qué significa cada etapa del embudo y de dónde sale cada número.",
    expected_output: "Un diccionario de métricas: cada etapa definida y mapeada a su fuente de datos.",
    unlocks_decision: "Permite construir el dashboard y medir el piloto con números acordados.",
    success_criteria: ["Definiciones Lead→Booked→Attended→Presented→Accepted→Started→Collected acordadas.", "Métricas de producción, cobrado, recuperado y forecast definidas.", "Cada métrica mapeada a su fuente."],
  },
  S5: {
    human_title: "Fijar el orden de construcción y qué hace exitoso al piloto",
    short_description: "Asegura construir en el orden que protege dinero antes de buscar inteligencia avanzada.",
    simple_explanation: "Define la secuencia proteger → monetizar → multiplicar → inteligencia, la fecha objetivo del piloto y los umbrales de éxito y de stop.",
    expected_output: "Un roadmap v1 priorizado, con fecha de piloto y criterios stop/continue.",
    unlocks_decision: "Permite planear las 8 semanas sin reordenar a mitad de camino.",
    success_criteria: ["Roadmap prioriza proteger → monetizar → multiplicar → inteligencia.", "Fecha y umbrales de éxito del piloto acordados.", "Criterios stop/continue definidos."],
  },

  // ===== BRN — Reglas comerciales de la clínica =====
  B1: {
    human_title: "Crear el diagnóstico que muestra dónde pierde dinero la clínica",
    short_description: "Convierte el discurso en una auditoría de fugas que cuantifica el dinero en riesgo.",
    simple_explanation: "Define cómo medir las fugas típicas: llamadas perdidas, no-contacto, no-shows, cancelaciones, planes sin agendar, financiación abandonada, tratamientos incompletos, recall vencido y saldos.",
    expected_output: "Un framework de Revenue Leak Audit que entrega valor en riesgo y top 3 oportunidades por clínica.",
    unlocks_decision: "Permite abrir puertas con un diagnóstico y priorizar qué fuga atacar primero.",
    success_criteria: ["Auditoría cubre todas las fugas clave.", "Entrega valor en riesgo cuantificado.", "Define top 3 oportunidades por clínica."],
  },
  B2: {
    human_title: "Estandarizar cómo se configura cada clínica nueva",
    short_description: "Una plantilla de onboarding clínico para configurar el sistema rápido y sin errores.",
    simple_explanation: "Captura todo lo necesario para operar: tratamientos, valor, duración, doctores, capacidad, sedes, horarios, financiación, depósitos, políticas, contenido aprobado e idiomas.",
    expected_output: "Un blueprint de discovery y configuración reutilizable, con reglas de escalamiento por tipo de caso.",
    unlocks_decision: "Permite pasar una clínica a producción en días, no semanas.",
    success_criteria: ["Plantilla cubre operación, financiación y políticas.", "Incluye reglas de escalamiento.", "Es reutilizable entre clínicas."],
  },
  B3: {
    human_title: "Crear playbooks comerciales por tratamiento",
    short_description: "Plantillas reutilizables (carillas, implantes, alineadores) para no empezar de cero por clínica.",
    simple_explanation: "Cada playbook define las etapas comerciales, el seguimiento, el manejo de objeciones y los handoffs clínicos con su próxima acción.",
    expected_output: "Un sistema de playbooks por tratamiento con etapas, seguimiento y handoffs definidos.",
    unlocks_decision: "Permite que el asistente conduzca conversaciones consistentes.",
    success_criteria: ["Plantilla para carillas, implantes y alineadores.", "Incluye objeciones y seguimiento.", "Define handoffs y próxima acción por estado."],
  },
  B4: {
    human_title: "Cargar el conocimiento, tono y políticas aprobadas por la clínica",
    short_description: "El asistente solo es confiable si responde con claims, tono y políticas que la clínica aprobó.",
    simple_explanation: "Versiona FAQs, objeciones, tono e idiomas; documenta qué claims están permitidos y cuáles prohibidos; deja aprobables las políticas de financiación y contenido.",
    expected_output: "Una base de conocimiento versionada con claims aprobados/prohibidos y políticas por clínica.",
    unlocks_decision: "Permite activar el asistente sin riesgo de decir algo no aprobado.",
    success_criteria: ["FAQs, objeciones y tono versionados.", "Claims aprobados y prohibidos documentados.", "Políticas aprobables por clínica."],
  },
  B5: {
    human_title: "Diseñar la máquina de estados que convierte conversaciones en acciones",
    short_description: "Cada conversación pasa por estados con próxima acción, dueño y razón de pérdida — y escala a humano cuando toca.",
    simple_explanation: "Define para cada estado: siguiente acción, timeout, owner y outcome/loss reason. Los casos clínicos, sensibles o urgentes generan handoff humano con contexto.",
    expected_output: "Una state machine con next actions, SLAs de handoff y razones de pérdida.",
    unlocks_decision: "Permite medir fugas y evitar que se pierdan oportunidades en silencio.",
    success_criteria: ["Cada estado tiene acción, timeout, owner y outcome.", "Triggers generan handoff con contexto.", "SLA por tipo de handoff definido."],
  },

  // ===== PLT — Stack técnico y automatizaciones =====
  P1: {
    human_title: "Dibujar la arquitectura, el flujo de datos y los entornos",
    short_description: "Un mapa explícito de cómo viaja el dato para poder operar, auditar y cumplir compliance.",
    simple_explanation: "Mapea Vapi/Twilio → n8n → OpenAI → Supabase → calendar/dashboard, con propósito, owner y retención por cada paso. Define dev, staging y prod, y el rollback.",
    expected_output: "Un diagrama de arquitectura con flujo de datos, entornos y plan de rollback.",
    unlocks_decision: "Permite construir sobre una base auditable en lugar de improvisar integraciones.",
    success_criteria: ["Mapa de flujo con propósito, owner y retención.", "Entornos dev/staging/prod definidos.", "Plan de rollback documentado."],
  },
  P2: {
    human_title: "Montar la base de datos, auth y permisos en Supabase",
    short_description: "El fundamento de toda la persistencia y los permisos, con los leads nunca expuestos.",
    simple_explanation: "Configura schema mínimo, Auth, roles, RLS y storage privado; agrega audit fields, migrations y backups. Ninguna tabla de leads queda pública.",
    expected_output: "Un proyecto Supabase con schema, RLS, storage privado, migrations y backups operativos.",
    unlocks_decision: "Permite empezar a guardar oportunidades de forma segura.",
    success_criteria: ["Schema, Auth, roles, RLS y storage privado listos.", "Audit fields, migrations y backups operativos.", "Cero tablas de leads públicas."],
  },
  P3: {
    human_title: "Crear los patrones base de automatización en n8n",
    short_description: "Flujos reutilizables con reintentos y manejo de errores, para que no se vuelvan inmantenibles.",
    simple_explanation: "Define patrones con idempotency, retries y error queue; protege credenciales y define qué se redacta en logs. Publica un runbook operativo.",
    expected_output: "Una librería de patrones n8n con idempotency, retries, error queue y runbook.",
    unlocks_decision: "Permite construir cada flujo nuevo rápido y auditable.",
    success_criteria: ["Patrones con idempotency, retries y error queue.", "Credenciales protegidas y redaction definida.", "Runbook publicado."],
  },
  P4: {
    human_title: "Conectar los canales de SMS, WhatsApp y voz",
    short_description: "Sin canales confiables no hay captura ni recovery posibles.",
    simple_explanation: "Pon a funcionar inbound/outbound de SMS, WhatsApp y voz, con webhooks y status callbacks; guarda disclosures, templates y resultado de llamada. El audio no se persiste por defecto.",
    expected_output: "Canales operativos (SMS/WhatsApp/voz) con webhooks, templates y resultados almacenados.",
    unlocks_decision: "Permite capturar y recuperar oportunidades por los canales reales del paciente.",
    success_criteria: ["Inbound/outbound de SMS, WhatsApp y voz operativos.", "Webhooks y status callbacks integrados.", "Disclosures/templates guardados; audio no persistente."],
  },
  P5: {
    human_title: "Montar el asistente de IA con guardrails (sin diagnóstico)",
    short_description: "Los modelos sin límites arriesgan dar diagnóstico clínico y dañar la reputación.",
    simple_explanation: "Versiona prompts con structured outputs; configura permisos de tools, la regla de no-diagnóstico y el handoff clínico; define un eval dataset y un fallback seguro.",
    expected_output: "Una capa de asistente con prompts versionados, guardrails y fallback seguro.",
    unlocks_decision: "Permite automatizar conversaciones sin cruzar la línea clínica.",
    success_criteria: ["Prompts versionados con structured outputs.", "No-diagnóstico y handoff clínico configurados.", "Eval dataset y fallback definidos."],
  },
  P6: {
    human_title: "Poner observabilidad, alertas y proceso de release",
    short_description: "Sin observabilidad un piloto se vuelve invisible y los problemas escalan.",
    simple_explanation: "Activa monitoreo de salud, errores y costo con alertas; deja un audit trail demostrable end-to-end; documenta deploy/rollback y runbook.",
    expected_output: "Monitoreo + alertas + audit trail + runbook de deploy/rollback operativos.",
    unlocks_decision: "Permite operar el piloto con visibilidad y respuesta rápida.",
    success_criteria: ["Health, error y cost monitoring con alertas.", "Audit trail end-to-end.", "Deploy/rollback y runbook documentados."],
  },

  // ===== CAP — Captura, agenda y rescate =====
  C1: {
    human_title: "Construir el motor que captura oportunidades comerciales",
    short_description: "Centraliza leads desde web, WhatsApp, SMS o voz sin convertirlos en registros clínicos.",
    simple_explanation: "Asegura que cada oportunidad entre con datos mínimos, source, consentimiento, estado inicial y siguiente acción, sin duplicados.",
    expected_output: "Un flujo donde un lead nuevo queda registrado, deduplicado y listo para agenda, seguimiento o handoff humano.",
    unlocks_decision: "Permite empezar a medir cuántas oportunidades entran y dónde se pierden.",
    success_criteria: ["Captura los canales acordados sin duplicar.", "Guarda datos mínimos, source y consent.", "Asigna owner y siguiente acción."],
  },
  C2: {
    human_title: "Construir el motor de conversación y cualificación",
    short_description: "Una conversación bien cualificada multiplica la conversión sin contratar más gente.",
    simple_explanation: "Responde FAQs aprobadas sin alucinar, identifica intención, tratamiento, idioma, timing y objeción, y escala cuando aplica. Nunca diagnostica.",
    expected_output: "Un asistente que cualifica oportunidades y entrega contexto para agendar o escalar.",
    unlocks_decision: "Permite atender volumen sin perder calidad ni cruzar la línea clínica.",
    success_criteria: ["Responde FAQs aprobadas sin alucinaciones.", "Detecta intención, tratamiento, idioma y objeción.", "No diagnostica y escala bien."],
  },
  C3: {
    human_title: "Construir el agendamiento inteligente",
    short_description: "Sin agendar confiable, la conversación no se convierte en producción.",
    simple_explanation: "Agenda y reagenda con el doctor, sede y slot correctos según reglas; sincroniza con el calendar y confirma al paciente; maneja fallos y conflictos de forma segura.",
    expected_output: "Un motor de scheduling que agenda/reagenda según reglas y sincroniza con el calendario.",
    unlocks_decision: "Permite convertir interés en citas reales.",
    success_criteria: ["Agenda/reagenda con doctor, sede y slot correctos.", "Sincroniza con calendar y confirma.", "Maneja fallos y conflictos."],
  },
  C4: {
    human_title: "Blindar la asistencia y rescatar cancelaciones",
    short_description: "El no-show y la cancelación son las fugas más caras de cualquier clínica.",
    simple_explanation: "Activa confirmaciones, instrucciones y reminders con recuperación si no responden; cuando hay cancelación, rellena el hueco desde waitlist, leads, planes sin agendar o recall.",
    expected_output: "Un sistema de recordatorios + rescate que repuebla huecos y deja trazabilidad.",
    unlocks_decision: "Permite proteger la agenda y el ingreso ya comprometido.",
    success_criteria: ["Confirmación, instrucciones y reminders con non-response recovery.", "Cancelación dispara refill.", "Rescate trazable por oportunidad."],
  },
  C5: {
    human_title: "Montar la cola humana y el QA de crear/proteger",
    short_description: "Sin una cola humana confiable, los casos sensibles se pierden y el sistema parece fallar.",
    simple_explanation: "Crea una cola de excepciones con resumen, valor aproximado, razón, acción y SLA; corre un test pack sintético end-to-end de escenarios normales y de fallo.",
    expected_output: "Una bandeja de excepciones operativa + un test pack E2E que pasa, con métricas de QA visibles.",
    unlocks_decision: "Permite lanzar sabiendo que lo sensible llega a un humano.",
    success_criteria: ["Cola muestra resumen, valor, razón, acción y SLA.", "Test pack E2E pasa normales y fallos.", "Métricas de QA visibles."],
  },

  // ===== MON — Convertir citas en dinero =====
  M1: {
    human_title: "Preparar la consulta con contexto comercial (Mi Plan de Sonrisa)",
    short_description: "Llegar al consultorio con contexto sube la aceptación sin tocar lo clínico.",
    simple_explanation: "Un intake comercial captura objetivo, objeción y financiación, y arma un brief para el doctor antes de la cita. El siguiente paso es privado y sin claims clínicos.",
    expected_output: "Un brief de consulta + flujo 'Mi Plan de Sonrisa' disponible antes de la cita.",
    unlocks_decision: "Permite que el doctor entre a la consulta listo para cerrar.",
    success_criteria: ["Intake captura objetivo, objeción y financiación.", "Brief disponible antes de la cita.", "Siguiente paso sin claims clínicos."],
  },
  M2: {
    human_title: "Construir el motor de decisión post-consulta",
    short_description: "La decisión después de la consulta es donde más dinero se pierde en silencio.",
    simple_explanation: "Modela los estados presented → considering → needs financing → accepted → scheduled → started → completed/rejected, cada uno con owner y siguiente acción.",
    expected_output: "Un engine con estados de decisión, owners y métricas de conversión por estado.",
    unlocks_decision: "Permite ver y atacar dónde se cae la aceptación.",
    success_criteria: ["Estados de decisión definidos.", "Cada estado con owner y siguiente acción.", "Conversión por estado disponible."],
  },
  M3: {
    human_title: "Activar financiación, pagos y recuperación de tratamientos",
    short_description: "El dinero solo cuenta cuando se cobra; recovery convierte intención en cash.",
    simple_explanation: "Pon a funcionar depósitos, financiación y payment links, con reminders y recuperación por fase. Los casos detenidos entran solos a recovery.",
    expected_output: "Un flujo de pago + recuperación con next action por fase.",
    unlocks_decision: "Permite cobrar lo aceptado y recuperar lo detenido.",
    success_criteria: ["Depósitos, financiación y payment links operativos.", "Reminders y recovery por fase.", "Casos detenidos entran a recuperación."],
  },
  M4: {
    human_title: "Crear el Revenue Vault que rescata lo que se enfría",
    short_description: "Asegura que ninguna oportunidad recuperable se enfríe en silencio.",
    simple_explanation: "Organiza cohortes (missed, no-contact, no-show, plan abierto, financiación abandonada, incompleto, recall vencido, saldo pendiente) con reglas de lifecycle y recall activas.",
    expected_output: "Un vault con cohortes, reglas de recall y reportes de recuperación.",
    unlocks_decision: "Permite multiplicar ingreso del pipeline que ya existe.",
    success_criteria: ["Cohortes recuperables definidas.", "Reglas de lifecycle y recall activas.", "Reportes de recuperación por cohorte."],
  },
  M5: {
    human_title: "Activar reseñas, referidos y biblioteca de casos",
    short_description: "Reseñas, referidos y casos son el motor barato de demanda futura.",
    simple_explanation: "Dispara pedidos de review y referral por triggers aprobados, con un workflow consentido de casos y testimonios y una biblioteca de assets aprobados.",
    expected_output: "Flujos de review/referral + biblioteca de casos consentidos.",
    unlocks_decision: "Permite generar demanda sin subir el gasto de adquisición.",
    success_criteria: ["Review y referral por triggers aprobados.", "Workflow consentido de casos.", "Biblioteca de assets aprobados."],
  },
  M6: {
    human_title: "Cerrar la atribución y ajustar marketing a la capacidad",
    short_description: "Evita quemar presupuesto cuando no hay agenda disponible.",
    simple_explanation: "Devuelve el revenue cobrado a su source y campaign, reduce adquisición cuando no hay capacidad y reactiva demanda cuando hay huecos.",
    expected_output: "Atribución closed-loop + reglas de marketing conscientes de capacidad.",
    unlocks_decision: "Permite invertir en marketing solo donde sí hay retorno.",
    success_criteria: ["Revenue cobrado vuelve a source/campaign.", "Reduce adquisición sin capacidad.", "Reactiva demanda con huecos."],
  },

  // ===== CTL — Dashboard, operación y entrega =====
  O1: {
    human_title: "Crear el dashboard de KPIs que muestra si el RevenueOS funciona",
    short_description: "Muestra producción agendada, revenue recuperado, oportunidades en riesgo y conversión por etapa.",
    simple_explanation: "Este milestone convierte el sistema en una torre de control. No se trata de gráficos bonitos, sino de saber si el RevenueOS está creando dinero o solo conversaciones.",
    expected_output: "Un dashboard con métricas claras de booked, attended, accepted, started, collected, recovered, at-risk y forecast.",
    unlocks_decision: "Permite decidir qué optimizar cada semana basado en fugas reales.",
    success_criteria: ["Muestra producción, cobrado, recuperado, en riesgo y forecast.", "Conversión por etapa, source y tratamiento.", "Refresca con frecuencia útil para operar."],
  },
  O2: {
    human_title: "Ordenar las fugas por valor para saber qué atacar",
    short_description: "Evita perseguir lo urgente en vez de lo importante.",
    simple_explanation: "Ordena las fugas por valor estimado, edad, razón, owner y acción; ninguna excepción crítica queda sin dueño y todas son rastreables hasta resolverse.",
    expected_output: "Un radar de leakage priorizado por valor, con owner y acción por caso.",
    unlocks_decision: "Permite que el equipo trabaje primero el dinero más recuperable.",
    success_criteria: ["Fugas ordenadas por valor, edad, razón, owner y acción.", "Cero excepciones críticas sin owner.", "Acciones rastreables."],
  },
  O3: {
    human_title: "Crear el pulso semanal de revenue",
    short_description: "El ritual semanal que hace que la clínica adopte el sistema.",
    simple_explanation: "Resume cada semana oportunidades, reservas, asistencias, aceptados, cobrado y recuperado, con una decisión recomendada y distribución automática al equipo.",
    expected_output: "Un resumen semanal automático con una recomendación accionable.",
    unlocks_decision: "Permite convertir datos en una decisión por semana.",
    success_criteria: ["Resumen semanal de las métricas clave.", "Incluye una decisión recomendada.", "Se distribuye automáticamente."],
  },
  O4: {
    human_title: "Documentar el onboarding, soporte y entrega del cliente",
    short_description: "Sin un playbook repetible, cada implementación se vuelve consultoría a medida.",
    simple_explanation: "Define un onboarding repetible con configuración, training y canal de soporte, con SLA, change control y proceso de offboarding.",
    expected_output: "Un delivery playbook con onboarding, SLA, soporte y offboarding.",
    unlocks_decision: "Permite escalar a más clínicas sin reinventar el proceso.",
    success_criteria: ["Onboarding repetible con training y soporte.", "SLA y change control definidos.", "Offboarding documentado."],
  },
  O5: {
    human_title: "Definir el gate de producción y el ciclo de mejora continua",
    short_description: "Evita lanzar antes de tiempo y crea ritmo de mejora.",
    simple_explanation: "Un checklist técnico, operativo, compliance, legal y UAT en verde habilita producción; el backlog semanal se prioriza por impacto en revenue, riesgo y evidencia.",
    expected_output: "Un production gate (checklist) + un loop de optimización con decisiones registradas.",
    unlocks_decision: "Permite declarar 'listo para producción' con criterios, no con fe.",
    success_criteria: ["Checklist técnico/operativo/compliance/legal/UAT en verde.", "Backlog priorizado por impacto.", "Decisiones del loop registradas."],
  },

  // ===== CMP — Privacidad y seguridad operativa =====
  G1: {
    human_title: "Definir qué datos puede y no puede guardar el sistema",
    short_description: "Establece la frontera de datos mínimos para que el RevenueOS no se convierta en expediente médico.",
    simple_explanation: "Este milestone define los campos permitidos: nombre, teléfono, país, idioma, tratamiento de interés, estado del lead, estado de cita, consentimiento y opt-out. También bloquea diagnóstico, síntomas, medicamentos, alergias, RX, fotos clínicas e historia médica.",
    expected_output: "Una regla de data scope que se pueda convertir en schema, prompts, validaciones y auditoría.",
    unlocks_decision: "Permite construir Supabase, prompts e integraciones sin miedo a guardar información clínica.",
    examples: ["Permitido: nombre, teléfono, país, idioma, tratamiento de interés, estado, consentimiento.", "Bloqueado: diagnóstico, síntomas, medicamentos, alergias, RX, fotos, historia médica."],
    success_criteria: ["Solo campos permitidos almacenados, cero columnas clínicas.", "Salud accidental se escala, no se explota.", "Política de retención/borrado definida."],
  },
  G2: {
    human_title: "Informar el uso de IA y registrar el consentimiento",
    short_description: "Sin consentimiento auditable se compromete el derecho del usuario y se expone la operación.",
    simple_explanation: "Los avisos en web, chat, SMS y voz informan que hay IA y para qué; se guarda versión, timestamp y canal del consentimiento; el follow-up va separado del marketing (opt-in aparte).",
    expected_output: "Avisos de transparencia + registro de consentimiento versionado por canal.",
    unlocks_decision: "Permite contactar con base legal sólida.",
    success_criteria: ["Avisos en todos los canales.", "Versión, timestamp y canal guardados.", "Marketing opt-in separado del follow-up."],
  },
  G3: {
    human_title: "Crear un opt-out real que apague todas las automatizaciones",
    short_description: "Si alguien escribe STOP, CANCELAR, BAJA o 'no me escriban', el sistema debe dejar de contactarlo automáticamente.",
    simple_explanation: "Este milestone asegura que la baja no sea decorativa. El opt-out se centraliza y detiene SMS, WhatsApp, llamadas automáticas y follow-ups, con confirmación de baja.",
    expected_output: "Una política y configuración donde cualquier palabra de baja actualiza suppression y bloquea nuevos mensajes automáticos.",
    unlocks_decision: "Permite activar follow-up sin riesgo de seguir contactando a quien pidió salir.",
    success_criteria: ["STOP/CANCELAR/BAJA centraliza suppression y detiene todo.", "Confirmación de baja enviada.", "Proceso access/correct/delete/object operativo."],
  },
  G4: {
    human_title: "Dejar listo el DPA y el registro de proveedores",
    short_description: "Sin DPA ni vendor register, las clínicas serias no firman.",
    simple_explanation: "Prepara el marco de DPA con la clínica y el register/data terms de Supabase, Twilio, Vapi, OpenAI, n8n/hosting y calendar, con mecanismos de transferencia y retención/borrado.",
    expected_output: "Un DPA listo + vendor register con data terms, transferencias y retención.",
    unlocks_decision: "Permite cerrar clínicas que exigen garantías de datos.",
    success_criteria: ["Marco de DPA con clínica listo.", "Register y data terms de cada vendor.", "Transferencia y retención definidas."],
  },
  G5: {
    human_title: "Establecer la base de seguridad y la respuesta a incidentes",
    short_description: "Un incidente sin playbook destruye la confianza ganada con todo el trabajo previo.",
    simple_explanation: "Pon MFA, least privilege, RLS, secrets, logs, encryption y backups; ejecuta un playbook y tabletop de incidentes; activa KPIs y un trigger register (cookies, audio, minors, EU-UK, USA-PHI).",
    expected_output: "Un baseline de seguridad + plan de incidentes + Compliance Control Tower operativos.",
    unlocks_decision: "Permite ir a producción sin un riesgo reputacional inaceptable.",
    success_criteria: ["MFA, RLS, secrets, encryption y backups operativos.", "Playbook y tabletop ejecutados.", "KPIs y trigger register activos."],
  },

  // ===== LEG — Empresa, contratos e impuestos =====
  L1: {
    human_title: "Elegir jurisdicción y constituir la empresa",
    short_description: "Sin entidad limpia no se pueden firmar contratos con clínicas.",
    simple_explanation: "Con asesoría, elige jurisdicción e incorpora/registra la empresa con ownership claro, IDs, licencias, domicilio y beneficial owner según aplique.",
    expected_output: "Una empresa constituida con ownership y registros en regla.",
    unlocks_decision: "Permite firmar contratos y abrir banca.",
    success_criteria: ["Jurisdicción elegida con asesoría.", "Empresa incorporada con ownership claro.", "IDs/licencias/domicilio según aplique."],
  },
  L2: {
    human_title: "Montar banca, contabilidad e impuestos para cobrar",
    short_description: "Sin operaciones financieras limpias, el piloto no puede cobrar.",
    simple_explanation: "Abre cuenta y processor empresarial, define bookkeeping, flujo de facturas y calendario fiscal, y controla los gastos operativos.",
    expected_output: "Operación financiera lista: cuenta, processor, invoicing y calendario fiscal.",
    unlocks_decision: "Permite facturar y cobrar el piloto formalmente.",
    success_criteria: ["Cuenta y processor operativos.", "Bookkeeping, invoicing y tax calendar definidos.", "Control de gastos en marcha."],
  },
  L3: {
    human_title: "Asegurar que la propiedad intelectual sea de la empresa",
    short_description: "Si la IP no es de la compañía, una venta o ronda futura se cae.",
    simple_explanation: "La compañía debe poseer código, prompts, playbooks, marca, dominios y assets; founders, contractors y employees firman confidencialidad e IP assignment.",
    expected_output: "Acuerdos de IP firmados + inventario de IP documentado.",
    unlocks_decision: "Permite vender, levantar capital o licenciar sin riesgo.",
    success_criteria: ["Compañía posee código, prompts, marca y dominios.", "IP assignment firmado por todos.", "Inventario de IP documentado."],
  },
  L4: {
    human_title: "Preparar el contrato comercial y DPA para vender sin improvisar",
    short_description: "Define el acuerdo con la clínica: alcance, datos, responsabilidades, pagos, límites clínicos, soporte y privacidad.",
    simple_explanation: "Este milestone evita vender con acuerdos improvisados. El contrato deja claro que el RevenueOS es de seguimiento, agenda y operación comercial, no diagnóstico ni sistema clínico.",
    expected_output: "Un stack contractual con MSA, SOW/order form, DPA, SLA, límites de uso, pagos, terminación, responsabilidad y subprocesadores.",
    unlocks_decision: "Permite pasar de piloto informal a cliente real pagado.",
    success_criteria: ["MSA, SOW, DPA y SLA listos.", "Acceptable use con frontera no-clínica, pago y terminación.", "Lista de subprocessors mantenida."],
  },
  L5: {
    human_title: "Publicar los documentos legales y obtener el visto bueno de counsel",
    short_description: "Sin docs públicos coherentes y sign-off de counsel, el go-live es riesgo personal.",
    simple_explanation: "Publica privacy notice, terms, decisión de cookies, página de subprocessors y contacto de derechos; evalúa seguro para los mercados activos y deja que counsel revise los mercados iniciales.",
    expected_output: "Docs legales públicos + seguro evaluado + sign-off de counsel con calendario de renovación.",
    unlocks_decision: "Permite lanzar al público con respaldo legal.",
    success_criteria: ["Privacy/terms/cookies/subprocessors/derechos publicados.", "Seguro evaluado para mercados activos.", "Counsel revisó y existe renewal calendar."],
  },

  // ===== PIL — Prueba real y salida al mercado =====
  I1: {
    human_title: "Elegir la clínica piloto y medir su baseline",
    short_description: "Sin baseline acordada, el ROI del piloto será debatible.",
    simple_explanation: "Identifica una clínica fit con champion, firma el pilot intent y access plan, y acuerda la baseline de fugas/revenue y los criterios de éxito.",
    expected_output: "Un piloto seleccionado con baseline y success criteria firmados.",
    unlocks_decision: "Permite empezar el piloto con una vara clara de éxito.",
    success_criteria: ["Clínica fit con champion identificado.", "Pilot intent y access plan firmados.", "Baseline y success criteria acordados."],
  },
  I2: {
    human_title: "Onboarding y configuración de la clínica piloto",
    short_description: "El onboarding define la calidad del primer mes de datos.",
    simple_explanation: "Configura y aprueba el Revenue Brain, playbooks y canales, define calendar, usuarios y permisos, e instrumenta las métricas.",
    expected_output: "Una clínica piloto configurada, aprobada e instrumentada.",
    unlocks_decision: "Permite arrancar el piloto con datos confiables.",
    success_criteria: ["Revenue Brain, playbooks y canales aprobados.", "Calendar, users y permisos definidos.", "Métricas instrumentadas."],
  },
  I3: {
    human_title: "Probar todo con datos sintéticos antes del go-live",
    short_description: "Pruebas reales antes del go-live previenen daño con pacientes reales.",
    simple_explanation: "Corre los escenarios core y de fallo, valida consent, STOP, handoff y deletion, y verifica dashboard y rollback sin usar datos reales de pacientes.",
    expected_output: "Un UAT completo con escenarios, consent/STOP/handoff/deletion y rollback verificados.",
    unlocks_decision: "Permite aprobar el paso a piloto en vivo.",
    success_criteria: ["Core scenarios y fallos probados.", "Consent, STOP, handoff y deletion validados.", "Dashboard y rollback verificados sin PHI."],
  },
  I4: {
    human_title: "Salir a piloto en vivo de forma controlada",
    short_description: "Salir controlado evita un incidente público que mate la oportunidad.",
    simple_explanation: "Arranca con un cohort o canal limitado, con monitoreo diario y cobertura humana; cero defecto crítico de compliance o seguridad; cumple los SLAs de respuesta e incidente.",
    expected_output: "Un piloto en vivo estable, monitoreado y sin defectos críticos.",
    unlocks_decision: "Permite escalar el piloto o decidir ajustes.",
    success_criteria: ["Cohort/canal limitado con monitoreo diario.", "Cero defecto crítico de compliance/seguridad.", "SLAs cumplidos."],
  },
  I5: {
    human_title: "Probar el ROI, armar el caso de éxito y decidir el v2",
    short_description: "El cierre del piloto convierte 8 semanas de build en pipeline comercial real.",
    simple_explanation: "Documenta baseline vs resultados con revenue cobrado y recuperado, consigue feedback y permiso de testimonial, y decide el roadmap keep/kill/improve.",
    expected_output: "Un caso de éxito con ROI documentado y una decisión de v2.",
    unlocks_decision: "Permite vender el producto con evidencia y planear el v2.",
    success_criteria: ["Baseline vs resultados documentado.", "Feedback y testimonial obtenidos.", "Roadmap keep/kill/improve decidido."],
  },
};

// ---- Resolver: combina lo que haya en DB con el mapa y un fallback razonable ----

type MilestoneRowish = {
  code?: string | null;
  title?: string | null;
  why_it_matters?: string | null;
  definition_of_done?: unknown;
  human_title?: string | null;
  short_description?: string | null;
  simple_explanation?: string | null;
  expected_output?: string | null;
  unlocks_decision?: string | null;
  examples?: unknown;
  success_criteria?: unknown;
};

export type ResolvedMilestoneContent = {
  humanTitle: string;
  shortDescription: string;
  simpleExplanation: string;
  expectedOutput: string;
  unlocksDecision: string;
  examples: string[];
  successCriteria: string[];
};

const asStringArray = (v: unknown): string[] | null =>
  Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string") ? (v as string[]) : null;

/** Resuelve el contenido humano de un milestone: DB ?? mapa por code ?? fallback. */
export function resolveMilestoneContent(m: MilestoneRowish): ResolvedMilestoneContent {
  const c = (m.code && MILESTONE_CONTENT[m.code]) || undefined;
  const dod = asStringArray(m.definition_of_done) ?? [];
  return {
    humanTitle: m.human_title || c?.human_title || m.title || m.code || "Milestone",
    shortDescription: m.short_description || c?.short_description || m.why_it_matters || "",
    simpleExplanation: m.simple_explanation || c?.simple_explanation || m.why_it_matters || "",
    expectedOutput: m.expected_output || c?.expected_output || "",
    unlocksDecision: m.unlocks_decision || c?.unlocks_decision || "",
    examples: asStringArray(m.examples) ?? c?.examples ?? [],
    successCriteria: asStringArray(m.success_criteria) ?? c?.success_criteria ?? dod.slice(0, 3),
  };
}

/** Label humano de un workstream: DB name si no hay mapa, mapa por code si existe. */
export function workstreamLabel(ws: { code?: string | null; name?: string | null } | undefined | null): string {
  if (!ws) return "";
  return (ws.code && WORKSTREAM_LABEL[ws.code]) || ws.name || ws.code || "";
}
