-- ==============================================================================
-- ZYNTH — Supabase Database Schema
-- Paste this entire file into the Supabase SQL Editor and click "Run"
-- ==============================================================================

-- 1. Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'starter', 'professional', 'agency', 'agency-annual', 'enterprise');
CREATE TYPE scan_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE severity_level AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- 2. Profiles Table (extends Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  agency_name TEXT,
  logo_url TEXT,
  plan plan_type DEFAULT 'free'::plan_type,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Domains Table (for verified domains)
CREATE TABLE public.domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verification_token TEXT DEFAULT md5(random()::text),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, domain)
);

-- 4. Scans Table
CREATE TABLE public.scans (
  id TEXT PRIMARY KEY, -- We use string IDs for scans like in the API map
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  status scan_status DEFAULT 'pending'::scan_status,
  score INTEGER DEFAULT 0,
  executive_summary TEXT,
  ai_priority TEXT,
  ai_model TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Scan Issues Table
CREATE TABLE public.scan_issues (
  id TEXT PRIMARY KEY,
  scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  severity severity_level NOT NULL,
  description TEXT NOT NULL,
  ai_explanation TEXT,
  ai_fix_steps JSONB, -- Array of strings
  is_fixed BOOLEAN DEFAULT false,
  auto_remediable BOOLEAN DEFAULT false,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Set up Security (Row Level Security)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_issues ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Domains: Users can view and manage their own domains
CREATE POLICY "Users can view own domains" ON public.domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own domains" ON public.domains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains" ON public.domains FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own domains" ON public.domains FOR DELETE USING (auth.uid() = user_id);

-- Scans: Users can view their own scans
CREATE POLICY "Users can view own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scan Issues: Users can view issues for their own scans
CREATE POLICY "Users can view own scan issues" ON public.scan_issues FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_issues.scan_id AND scans.user_id = auth.uid())
);
CREATE POLICY "Users can update own scan issues (to mark fixed)" ON public.scan_issues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_issues.scan_id AND scans.user_id = auth.uid())
);

-- 7. Trigger to automatically create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Expert Requests Table (Resolution Center)
CREATE TABLE public.expert_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scan_id TEXT REFERENCES public.scans(id) ON DELETE SET NULL,
  expert_type TEXT NOT NULL, -- e.g., 'remediation', 'consulting', 'compliance'
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expert Requests RLS
ALTER TABLE public.expert_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own expert requests" ON public.expert_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own expert requests" ON public.expert_requests 
  FOR SELECT USING (auth.uid() = user_id);

-- 9. Domain Monitoring Upgrades
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS monitoring_frequency TEXT DEFAULT 'weekly'; 
ALTER TABLE public.domains ADD COLUMN IF NOT EXISTS last_monitored_at TIMESTAMP WITH TIME ZONE;

-- 10. Chat Messages (AI Security Tutor)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own chat messages') THEN
    CREATE POLICY "Users can view own chat messages" ON public.chat_messages 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own chat messages') THEN
    CREATE POLICY "Users can insert own chat messages" ON public.chat_messages 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 11. Security Alerts (Zynth Guard)
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE NOT NULL,
  old_score INTEGER,
  new_score INTEGER,
  change_type TEXT, -- 'drop' or 'improvement'
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own security alerts') THEN
    CREATE POLICY "Users can view own security alerts" ON public.security_alerts 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
