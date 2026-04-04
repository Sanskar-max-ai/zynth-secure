-- consolidated_home_tasks.sql
-- RUN THESE IN SUPABASE SQL EDITOR WHEN YOU GET HOME

-- 1. Enable Patch Persistence (Stage 5)
ALTER TABLE public.scan_issues 
ADD COLUMN IF NOT EXISTS patch JSONB;
COMMENT ON COLUMN public.scan_issues.patch IS 'AI-generated code patch for autonomous remediation';

-- 2. Create Chat Messages Table (Stage 4 Chatbot)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history" 
ON public.chat_messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Create Scan Monitors Table (Stage 3)
CREATE TABLE IF NOT EXISTS public.scan_monitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT,
    findings_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
