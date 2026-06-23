import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWorkstreams(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["workstreams", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workstreams")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useMilestones(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["milestones", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("week_target")
        .order("priority");
      if (error) throw error;
      return data;
    },
  });
}

export function useDependencies(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["dependencies", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data: ms } = await supabase
        .from("milestones")
        .select("id")
        .eq("workspace_id", workspaceId!);
      const ids = (ms || []).map((m) => m.id);
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("milestone_dependencies")
        .select("*")
        .in("milestone_id", ids);
      if (error) throw error;
      return data;
    },
  });
}

export function useComplianceMetrics(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["compliance_metrics", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_metrics")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useActivityLog(workspaceId: string | undefined, limit = 30) {
  return useQuery({
    queryKey: ["activity_log", workspaceId, limit],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useComments(workspaceId: string | undefined, milestoneId?: string) {
  return useQuery({
    queryKey: ["comments", workspaceId, milestoneId],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase.from("comments").select("*").eq("workspace_id", workspaceId!).order("created_at", { ascending: false });
      if (milestoneId) q = q.eq("milestone_id", milestoneId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useEvidence(workspaceId: string | undefined, milestoneId?: string) {
  return useQuery({
    queryKey: ["evidence", workspaceId, milestoneId],
    enabled: !!workspaceId,
    queryFn: async () => {
      let q = supabase.from("evidence_links").select("*").eq("workspace_id", workspaceId!).order("created_at", { ascending: false });
      if (milestoneId) q = q.eq("milestone_id", milestoneId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useWeeklyReviews(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["weekly_reviews", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("week_number");
      if (error) throw error;
      return data;
    },
  });
}

export function useDecisions(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["decisions", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["members", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      const { data: members } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId!);
      const ids = (members || []).map((m) => m.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("*").in("id", ids)
        : { data: [] };
      return (members || []).map((m) => ({
        ...m,
        profile: (profs || []).find((p) => p.id === m.user_id),
      }));
    },
  });
}
