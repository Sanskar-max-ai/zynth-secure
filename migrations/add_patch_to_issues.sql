-- ============================================================
-- Stage 5.1: AI Patching Engine
-- Add 'patch' column to scan_issues table
-- ============================================================

ALTER TABLE public.scan_issues 
ADD COLUMN IF NOT EXISTS patch JSONB;

-- Update RLS if needed (usually not needed if existing policies cover the table)
-- But we ensure the column is accessible.
COMMENT ON COLUMN public.scan_issues.patch IS 'AI-generated code patch for autonomous remediation';
