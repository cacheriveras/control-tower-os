
-- ============= ENUMS =============
CREATE TYPE public.app_role AS ENUM ('owner', 'collaborator');
CREATE TYPE public.milestone_priority AS ENUM ('P0', 'P1', 'P2');
CREATE TYPE public.milestone_status AS ENUM ('not_started','in_progress','blocked','in_validation','completed','parked');
CREATE TYPE public.effort_size AS ENUM ('S','M','L');
CREATE TYPE public.risk_level AS ENUM ('low','medium','high');
CREATE TYPE public.requires_professional AS ENUM ('none','lawyer','accountant','insurance','multiple');

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Costa_Rica',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============= WORKSPACES =============
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '56 days'),
  jurisdiction TEXT NOT NULL DEFAULT 'Por definir',
  launch_markets TEXT[] NOT NULL DEFAULT '{}',
  weekly_review_day SMALLINT NOT NULL DEFAULT 5,
  wip_limit SMALLINT NOT NULL DEFAULT 3,
  timezone TEXT NOT NULL DEFAULT 'America/Costa_Rica',
  focus_milestone_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ============= WORKSPACE_MEMBERS =============
CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'collaborator',
  invited_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- ============= SECURITY DEFINER FUNCTIONS =============
CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _uid);
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_ws UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _uid AND role = 'owner');
$$;

-- workspaces policies
CREATE POLICY "ws_select_members" ON public.workspaces FOR SELECT TO authenticated USING (public.is_workspace_member(id, auth.uid()));
CREATE POLICY "ws_insert_self_owner" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ws_update_owner" ON public.workspaces FOR UPDATE TO authenticated USING (public.is_workspace_owner(id, auth.uid()));
CREATE POLICY "ws_delete_owner" ON public.workspaces FOR DELETE TO authenticated USING (public.is_workspace_owner(id, auth.uid()));

-- workspace_members policies
CREATE POLICY "wm_select_members" ON public.workspace_members FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "wm_insert_owner_or_self_first" ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_workspace_owner(workspace_id, auth.uid()));
CREATE POLICY "wm_update_owner" ON public.workspace_members FOR UPDATE TO authenticated USING (public.is_workspace_owner(workspace_id, auth.uid()));
CREATE POLICY "wm_delete_owner_or_self" ON public.workspace_members FOR DELETE TO authenticated
  USING (public.is_workspace_owner(workspace_id, auth.uid()) OR user_id = auth.uid());

-- ============= WORKSTREAMS =============
CREATE TABLE public.workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 1,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workstreams TO authenticated;
GRANT ALL ON public.workstreams TO service_role;
ALTER TABLE public.workstreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wsr_select" ON public.workstreams FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "wsr_modify" ON public.workstreams FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============= MILESTONES =============
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workstream_id UUID NOT NULL REFERENCES public.workstreams(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  why_it_matters TEXT,
  definition_of_done JSONB NOT NULL DEFAULT '[]'::jsonb,
  week_target INT NOT NULL DEFAULT 1 CHECK (week_target BETWEEN 1 AND 8),
  priority public.milestone_priority NOT NULL DEFAULT 'P1',
  status public.milestone_status NOT NULL DEFAULT 'not_started',
  progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  due_date DATE,
  effort public.effort_size DEFAULT 'M',
  is_launch_gate BOOLEAN NOT NULL DEFAULT false,
  risk_level public.risk_level NOT NULL DEFAULT 'low',
  requires_professional public.requires_professional NOT NULL DEFAULT 'none',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  focus_pinned BOOLEAN NOT NULL DEFAULT false,
  snoozed_until DATE,
  source_document TEXT,
  source_reference TEXT,
  next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (workspace_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ms_select" ON public.milestones FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "ms_modify" ON public.milestones FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE INDEX milestones_workspace_idx ON public.milestones(workspace_id);
CREATE INDEX milestones_workstream_idx ON public.milestones(workstream_id);
CREATE INDEX milestones_status_idx ON public.milestones(status);

-- ============= MILESTONE_DEPENDENCIES =============
CREATE TABLE public.milestone_dependencies (
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  depends_on_milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  PRIMARY KEY (milestone_id, depends_on_milestone_id),
  CHECK (milestone_id <> depends_on_milestone_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestone_dependencies TO authenticated;
GRANT ALL ON public.milestone_dependencies TO service_role;
ALTER TABLE public.milestone_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "md_select" ON public.milestone_dependencies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.milestones m WHERE m.id = milestone_id AND public.is_workspace_member(m.workspace_id, auth.uid())));
CREATE POLICY "md_modify" ON public.milestone_dependencies FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.milestones m WHERE m.id = milestone_id AND public.is_workspace_member(m.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.milestones m WHERE m.id = milestone_id AND public.is_workspace_member(m.workspace_id, auth.uid())));

-- ============= COMMENTS =============
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "c_select" ON public.comments FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "c_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()) AND author_id = auth.uid());
CREATE POLICY "c_update_author" ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.is_workspace_owner(workspace_id, auth.uid()));
CREATE POLICY "c_delete_author" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_workspace_owner(workspace_id, auth.uid()));

-- ============= EVIDENCE LINKS =============
CREATE TABLE public.evidence_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_links TO authenticated;
GRANT ALL ON public.evidence_links TO service_role;
ALTER TABLE public.evidence_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "el_select" ON public.evidence_links FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "el_modify" ON public.evidence_links FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()) AND created_by = auth.uid());

-- ============= WEEKLY REVIEWS =============
CREATE TABLE public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  wins TEXT,
  evidence_learned TEXT,
  blockers TEXT,
  decisions TEXT,
  stop_doing TEXT,
  next_top_three JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_risk TEXT,
  confidence_score INT CHECK (confidence_score BETWEEN 1 AND 5),
  progress_snapshot JSONB,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, week_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_reviews TO authenticated;
GRANT ALL ON public.weekly_reviews TO service_role;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wr_select" ON public.weekly_reviews FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "wr_modify" ON public.weekly_reviews FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============= DECISIONS =============
CREATE TABLE public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  options_considered TEXT,
  decision TEXT,
  rationale TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at DATE,
  review_at DATE,
  status TEXT NOT NULL DEFAULT 'active',
  is_parking_lot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT ALL ON public.decisions TO service_role;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "d_select" ON public.decisions FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "d_modify" ON public.decisions FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

CREATE TABLE public.decision_milestones (
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  PRIMARY KEY (decision_id, milestone_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_milestones TO authenticated;
GRANT ALL ON public.decision_milestones TO service_role;
ALTER TABLE public.decision_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dm_select" ON public.decision_milestones FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND public.is_workspace_member(d.workspace_id, auth.uid())));
CREATE POLICY "dm_modify" ON public.decision_milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND public.is_workspace_member(d.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.decisions d WHERE d.id = decision_id AND public.is_workspace_member(d.workspace_id, auth.uid())));

-- ============= COMPLIANCE METRICS =============
CREATE TABLE public.compliance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  unit TEXT,
  status TEXT,
  measured_at DATE,
  comment TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_metrics TO authenticated;
GRANT ALL ON public.compliance_metrics TO service_role;
ALTER TABLE public.compliance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm_select" ON public.compliance_metrics FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "cm_modify" ON public.compliance_metrics FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============= ACTIVITY LOG =============
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al_select" ON public.activity_log FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "al_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ============= UPDATED_AT TRIGGERS =============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_uat BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_workspaces_uat BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_milestones_uat BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_comments_uat BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_weekly_uat BEFORE UPDATE ON public.weekly_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_decisions_uat BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cm_uat BEFORE UPDATE ON public.compliance_metrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= MILESTONE STATUS/COMPLETED MANAGEMENT =============
CREATE OR REPLACE FUNCTION public.handle_milestone_change()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.progress = 100;
    NEW.completed_at = now();
    NEW.blocked_reason = NULL;
    NEW.blocked_at = NULL;
  ELSIF NEW.status = 'blocked' AND OLD.status IS DISTINCT FROM 'blocked' THEN
    NEW.blocked_at = now();
  ELSIF NEW.status <> 'blocked' AND OLD.status = 'blocked' THEN
    NEW.blocked_reason = NULL;
    NEW.blocked_at = NULL;
  END IF;

  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    NEW.completed_at = NULL;
    IF NEW.progress = 100 THEN NEW.progress = 90; END IF;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER trg_ms_change BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.handle_milestone_change();

-- ============= ACTIVITY LOG TRIGGER ON MILESTONES =============
CREATE OR REPLACE FUNCTION public.log_milestone_activity()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  changed JSONB := '{}'::jsonb;
  before_d JSONB := '{}'::jsonb;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    changed := changed || jsonb_build_object('status', NEW.status);
    before_d := before_d || jsonb_build_object('status', OLD.status);
  END IF;
  IF OLD.progress IS DISTINCT FROM NEW.progress THEN
    changed := changed || jsonb_build_object('progress', NEW.progress);
    before_d := before_d || jsonb_build_object('progress', OLD.progress);
  END IF;
  IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
    changed := changed || jsonb_build_object('due_date', NEW.due_date);
    before_d := before_d || jsonb_build_object('due_date', OLD.due_date);
  END IF;
  IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
    changed := changed || jsonb_build_object('owner_id', NEW.owner_id);
    before_d := before_d || jsonb_build_object('owner_id', OLD.owner_id);
  END IF;
  IF OLD.blocked_reason IS DISTINCT FROM NEW.blocked_reason THEN
    changed := changed || jsonb_build_object('blocked_reason', NEW.blocked_reason);
    before_d := before_d || jsonb_build_object('blocked_reason', OLD.blocked_reason);
  END IF;
  IF OLD.week_target IS DISTINCT FROM NEW.week_target THEN
    changed := changed || jsonb_build_object('week_target', NEW.week_target);
    before_d := before_d || jsonb_build_object('week_target', OLD.week_target);
  END IF;
  IF changed <> '{}'::jsonb THEN
    INSERT INTO public.activity_log (workspace_id, actor_id, entity_type, entity_id, action, before_data, after_data)
    VALUES (NEW.workspace_id, auth.uid(), 'milestone', NEW.id, 'updated', before_d, changed);
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_ms_activity AFTER UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.log_milestone_activity();

-- ============= PROFILE BOOTSTRAP =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
