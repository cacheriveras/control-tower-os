
DROP POLICY IF EXISTS "ws_select_members" ON public.workspaces;
CREATE POLICY "ws_select_members_or_owner" ON public.workspaces FOR SELECT TO authenticated
  USING (public.is_workspace_member(id, auth.uid()) OR owner_id = auth.uid());
