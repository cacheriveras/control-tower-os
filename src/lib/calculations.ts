// Cálculos de progreso, launch readiness, riesgo y scoring de siguiente paso.
import { differenceInDays, parseISO } from "date-fns";

export type MilestoneLike = {
  id: string;
  code: string;
  title: string;
  workstream_id: string;
  status: string;
  progress: number;
  priority: "P0" | "P1" | "P2";
  is_launch_gate: boolean;
  due_date: string | null;
  week_target: number;
  blocked_at: string | null;
  focus_pinned: boolean;
  snoozed_until: string | null;
};

export function milestoneWeight(m: { priority: string; is_launch_gate: boolean }) {
  if (m.is_launch_gate && m.priority === "P0") return 3;
  if (m.priority === "P0") return 2;
  if (m.priority === "P1") return 1.5;
  return 1;
}

export function workstreamProgress(milestones: MilestoneLike[]) {
  if (!milestones.length) return 0;
  let weighted = 0;
  let total = 0;
  for (const m of milestones) {
    const w = milestoneWeight(m);
    weighted += (m.progress || 0) * w;
    total += 100 * w;
  }
  return total === 0 ? 0 : Math.round((weighted / total) * 100);
}

export function globalProgress(
  workstreams: { id: string; weight: number }[],
  milestonesByWs: Record<string, MilestoneLike[]>,
) {
  let weighted = 0;
  let total = 0;
  for (const ws of workstreams) {
    const ms = milestonesByWs[ws.id] || [];
    if (!ms.length) continue;
    const p = workstreamProgress(ms);
    weighted += p * ws.weight;
    total += 100 * ws.weight;
  }
  return total === 0 ? 0 : Math.round((weighted / total) * 100);
}

export function launchReadiness(milestones: MilestoneLike[]) {
  const gates = milestones.filter((m) => m.is_launch_gate && m.priority === "P0");
  if (!gates.length) return { pct: 0, done: 0, total: 0 };
  const done = gates.filter((m) => m.status === "completed").length;
  return { pct: Math.round((done / gates.length) * 100), done, total: gates.length };
}

export type RiskColor = "red" | "amber" | "green";

export function milestoneRisk(m: MilestoneLike): RiskColor {
  if (m.status === "completed" || m.status === "parked") return "green";
  const today = new Date();
  const due = m.due_date ? parseISO(m.due_date) : null;
  if (m.is_launch_gate && m.priority === "P0") {
    if (due && differenceInDays(due, today) < 0) return "red";
    if (m.status === "blocked" && m.blocked_at) {
      const days = differenceInDays(today, parseISO(m.blocked_at));
      if (days > 3) return "red";
    }
  }
  if (due && differenceInDays(due, today) <= 7 && (m.progress || 0) < 50) return "amber";
  if (m.status === "blocked") return "amber";
  return "green";
}

export function isEligibleForNext(
  m: MilestoneLike,
  depsMet: boolean,
  todayISO: string,
) {
  if (m.status === "completed" || m.status === "parked" || m.status === "blocked") return false;
  if (m.snoozed_until && m.snoozed_until > todayISO) return false;
  return depsMet;
}

export function nextActionScore(m: MilestoneLike, todayISO: string) {
  let s = 0;
  if (m.focus_pinned) s += 1000;
  if (m.priority === "P0") s += 60;
  else if (m.priority === "P1") s += 30;
  else s += 10;
  if (m.is_launch_gate) s += 40;
  if (m.status === "in_progress") s += 25;
  if (m.due_date) {
    const days = differenceInDays(parseISO(m.due_date), parseISO(todayISO));
    if (days <= 0) s += 50;
    else if (days <= 3) s += 35;
    else if (days <= 7) s += 20;
    else if (days <= 14) s += 10;
  }
  s += (m.progress || 0) / 10;
  return s;
}

export function pickNextAction(
  milestones: MilestoneLike[],
  depsByMilestone: Record<string, string[]>,
  todayISO: string,
) {
  const completedSet = new Set(milestones.filter((m) => m.status === "completed").map((m) => m.id));
  const eligible = milestones.filter((m) => {
    const deps = depsByMilestone[m.id] || [];
    const depsMet = deps.every((d) => completedSet.has(d));
    return isEligibleForNext(m, depsMet, todayISO);
  });
  if (!eligible.length) return null;
  return eligible.sort((a, b) => nextActionScore(b, todayISO) - nextActionScore(a, todayISO))[0];
}
