// Crea el workspace con todos los milestones, dependencias y métricas iniciales.
import { supabase } from "@/integrations/supabase/client";
import {
  SEED_WORKSTREAMS,
  SEED_MILESTONES,
  SEED_COMPLIANCE_METRICS,
  SEED_INITIAL_PROGRESS,
} from "@/lib/seedData";
import { MILESTONE_CONTENT } from "@/lib/milestoneContent";
import { addDays, format } from "date-fns";

export type SeedOptions = {
  name: string;
  startDate: string;
  targetDate: string;
  jurisdiction: string;
  launchMarkets: string[];
  weeklyReviewDay: number;
  applyInitialProgress: boolean;
  ownerId: string;
};

function dueForWeek(startISO: string, week: number) {
  return format(addDays(new Date(startISO), week * 7), "yyyy-MM-dd");
}

export async function seedWorkspace(opts: SeedOptions) {
  // 1) workspace
  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .insert({
      name: opts.name,
      owner_id: opts.ownerId,
      start_date: opts.startDate,
      target_date: opts.targetDate,
      jurisdiction: opts.jurisdiction,
      launch_markets: opts.launchMarkets,
      weekly_review_day: opts.weeklyReviewDay,
    })
    .select()
    .single();
  if (wsErr || !ws) throw wsErr;
  const workspaceId = ws.id;

  // 2) membership (owner)
  const { error: memErr } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspaceId, user_id: opts.ownerId, role: "owner" });
  if (memErr) throw memErr;

  // 3) workstreams
  const { data: wstreams, error: wsrErr } = await supabase
    .from("workstreams")
    .insert(
      SEED_WORKSTREAMS.map((w) => ({
        workspace_id: workspaceId,
        code: w.code,
        name: w.name,
        description: w.description,
        sort_order: w.sort_order,
        weight: w.weight,
        icon: w.icon,
      })),
    )
    .select();
  if (wsrErr || !wstreams) throw wsrErr;
  const wsCodeToId = new Map<string, string>(wstreams.map((w) => [w.code, w.id]));

  // 4) milestones
  const progressMap = new Map(SEED_INITIAL_PROGRESS.map((p) => [p.code, p]));
  const milestoneRows = SEED_MILESTONES.map((m) => {
    const initial = opts.applyInitialProgress ? progressMap.get(m.code) : undefined;
    const content = MILESTONE_CONTENT[m.code];
    return {
      workspace_id: workspaceId,
      workstream_id: wsCodeToId.get(m.workstream)!,
      code: m.code,
      title: m.title,
      why_it_matters: m.why_it_matters,
      definition_of_done: m.definition_of_done,
      week_target: m.week_target,
      priority: m.priority,
      is_launch_gate: m.is_launch_gate,
      requires_professional: m.requires_professional ?? "none",
      due_date: dueForWeek(opts.startDate, m.week_target),
      progress: initial?.progress ?? 0,
      status: (initial?.status ?? "not_started") as
        | "not_started"
        | "in_progress"
        | "in_validation",
      source_document: initial?.source_document ?? m.source_document ?? null,
      // Copy humano (claridad operativa). Si falta en el mapa, el UI cae al fallback por code.
      human_title: content?.human_title ?? null,
      short_description: content?.short_description ?? null,
      simple_explanation: content?.simple_explanation ?? null,
      expected_output: content?.expected_output ?? null,
      unlocks_decision: content?.unlocks_decision ?? null,
      examples: content?.examples ?? [],
      success_criteria: content?.success_criteria ?? [],
    };
  });

  const { data: insertedMs, error: msErr } = await supabase
    .from("milestones")
    .insert(milestoneRows)
    .select();
  if (msErr || !insertedMs) throw msErr;
  const codeToMsId = new Map<string, string>(insertedMs.map((m) => [m.code, m.id]));

  // 5) dependencies
  const depRows: { milestone_id: string; depends_on_milestone_id: string }[] = [];
  for (const m of SEED_MILESTONES) {
    for (const d of m.depends_on) {
      const msId = codeToMsId.get(m.code);
      const depId = codeToMsId.get(d);
      if (msId && depId) depRows.push({ milestone_id: msId, depends_on_milestone_id: depId });
    }
  }
  if (depRows.length) {
    const { error: depErr } = await supabase.from("milestone_dependencies").insert(depRows);
    if (depErr) throw depErr;
  }

  // 6) compliance metrics
  await supabase.from("compliance_metrics").insert(
    SEED_COMPLIANCE_METRICS.map((c) => ({
      workspace_id: workspaceId,
      name: c.name,
      target_value: c.target_value,
      unit: c.unit,
      sort_order: c.sort_order,
    })),
  );

  return workspaceId;
}
