-- ============================================================
-- Stage 4.2: Team Seats / RBAC
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3. Owner can see and manage their team
CREATE POLICY "Owner manages their team" ON public.team_members
  FOR ALL USING (owner_id = auth.uid());

-- 4. Active team members can see the team they belong to
CREATE POLICY "Member sees their membership" ON public.team_members
  FOR SELECT USING (user_id = auth.uid() AND status = 'active');

-- 5. Allow team members to read the owner's scans (viewer + admin)
CREATE POLICY "Team members can view owner scans" ON public.scans
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.owner_id = scans.user_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- 6. Allow team admins to insert scans on behalf of the owner's workspace
CREATE POLICY "Team admins can create scans" ON public.scan_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scans s
      LEFT JOIN public.team_members tm ON tm.owner_id = s.user_id
      WHERE s.id = scan_issues.scan_id
        AND (s.user_id = auth.uid() OR (tm.user_id = auth.uid() AND tm.status = 'active'))
    )
  );
