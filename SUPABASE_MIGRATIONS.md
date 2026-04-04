# SQL Migrations (PENDING EXECUTION)

> [!IMPORTANT]
> **Action Required**: Run these queries in your Supabase SQL Editor once you are back home on a personal network.

## Stage 5: The Autonomous Fixer

```sql
-- 1. Add patching support to scan_issues
ALTER TABLE public.scan_issues 
ADD COLUMN IF NOT EXISTS patch JSONB;

COMMENT ON COLUMN public.scan_issues.patch IS 'AI-generated code patch for autonomous remediation';

-- 2. Stage 4.2 Support: Teams & RBAC (Verification check)
-- Just in case migrations/team_members.sql hasn't been run yet:
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT CHECK (role IN ('owner', 'admin', 'viewer')) DEFAULT 'viewer',
    status TEXT CHECK (status IN ('pending', 'active')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Checklist for Home

- [ ] Run the `patch` column migration.
- [ ] Verify `team_members` table existence.
- [ ] Run `migrations/add_patch_to_issues.sql` if not already covered.
- [ ] Check if `RESEND_API_KEY` is added to Vercel environment variables for Stage 3 email support.
