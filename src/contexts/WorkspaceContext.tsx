import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  start_date: string;
  target_date: string;
  jurisdiction: string;
  launch_markets: string[];
  weekly_review_day: number;
  wip_limit: number;
  timezone: string;
  focus_milestone_id: string | null;
};

type Ctx = {
  workspace: Workspace | null;
  loading: boolean;
  role: "owner" | "collaborator" | null;
  refresh: () => Promise<void>;
};

const WorkspaceCtx = createContext<Ctx | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<"owner" | "collaborator" | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspace(null);
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: memberships } = await supabase
      .from("workspace_members")
      .select("workspace_id, role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1);
    if (!memberships || memberships.length === 0) {
      setWorkspace(null);
      setRole(null);
      setLoading(false);
      return;
    }
    const wsId = memberships[0].workspace_id;
    setRole(memberships[0].role as "owner" | "collaborator");
    const { data: ws } = await supabase.from("workspaces").select("*").eq("id", wsId).maybeSingle();
    setWorkspace(ws as Workspace | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <WorkspaceCtx.Provider value={{ workspace, role, loading, refresh }}>{children}</WorkspaceCtx.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
