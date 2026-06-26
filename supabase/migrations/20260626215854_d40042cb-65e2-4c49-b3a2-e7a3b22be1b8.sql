ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS human_title text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS simple_explanation text,
  ADD COLUMN IF NOT EXISTS expected_output text,
  ADD COLUMN IF NOT EXISTS unlocks_decision text,
  ADD COLUMN IF NOT EXISTS examples text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS success_criteria text[] NOT NULL DEFAULT '{}';