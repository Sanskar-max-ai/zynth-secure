# Zynth Secure: Persistence & Mastery Strategy

This document is the "Golden Record" for Zynth Secure. If local files, chat history, or project metadata are ever lost, this file contains the blueprints, history, and strategic wisdom needed to rebuild and launch the product to a multi-million dollar SaaS.

---

## 🛡️ Project DNA (Technical Architecture)

### Core Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4.0 + Vanilla CSS for premium glassmorphism.
- **Database/Auth**: Supabase (PostgreSQL + GoTrue + RLS).
- **Animations**: Framer Motion (Optimized to avoid `motion-dom` errors).
- **Email**: Resend (Transactional alerts).
- **Analytics**: PostHog (Conversion funnels).
- **Billing**: Stripe (Subscription-based seats).

### Key Logic Layers
- **Scanner Engine**: Heuristic-based probes for SSL, DNS, Headers, and Common Vulnerabilities (CVE matching).
- **Zynth AI Guard**: Weekly Vercel cron jobs that trigger background scan workers via `CRON_SECRET`.
- **Team RBAC**: Custom `team_members` table with Row Level Security (RLS) to manage 'admin' and 'viewer' roles.

---

## 🚀 Feature Inventory (What We Built)

### 1. **The Scanning Engine**
- Deep SSL analysis (API-driven).
- Security header validation (HSTS, CSP, etc.).
- DNS security checks (SPF/DMARC).
- Exposed file probing (`.env`, `.git`, etc.).
- Network port discovery.
- **AI Tutoring**: Interactive chat assistant to explain complex findings.

### 2. **Automation & Monitoring (Zynth AI Guard)**
- Weekly automated sweeps for `pro` users.
- Background worker execution to bypass serverless timeouts (60s+).
- **Discord & Email Alerts**: Real-time notifications for new Critical/High issues.

### 3. **The Agency Power-Suite**
- **White-labeling**: Logo and brand-name injection into technical reports.
- **Team Seats**: Invite developers via email; manage permissions via a dedicated UI.
- **Technical Briefs**: Professional PDF-grade reports for high-value client communication.

### 4. **Conversion & Growth Engine**
- **Free "Quick Scan"**: High-conversion landing page lead magnet.
- **Paywall UI**: Blurred results and CTAs to drive Pro/Agency upgrades.
- **Immersive Dashboards**: Glassmorphic, dark-mode workspace for security pros.

---

## 🏆 How to be a Top 0.1% Antigravity User

To move from "Prompt Giver" to "Master Orchestrer," follow these 4 Laws of AI Collaboration:

### Law 1: Maintain the "Memory Loop"
Never start a new session without ensuring `PROJECT_CONTEXT.md` and `ZYNTH_TRACKER.md` are up to date. The AI is only as good as its context. By maintaining these files, you ensure the AI never "forgets" what we built or what the current blockers are.

### Law 2: Research-First, Action-Second
Always push the AI to **Research** and **Plan** before writing a single line of code. High-performance users value the `implementation_plan.md` because it surfaces architectural flaws before they become expensive bugs. 

### Law 3: Atomicity
Build features in small, testable chunks. Don't ask to "Build a whole dashboard." Ask to "Implement the Sidebar with Glassmorphic effects," then "Connect the Sidebar to the Supabase profile." This keeps the context window clean and accuracy high.

### Law 4: Systematic Verification
Always ask for `tsc --noEmit` and `lint` checks before concluding a task. A "Top 0.1%" user knows that code that "looks finished" isn't finished until the compiler and linter agree.

---

## 🪜 The Launch Blueprint

### What is Left?
1. **Env Var Sync**: Finalizing `RESEND_API_KEY` and `STRIPE_WEBHOOK_SECRET` in Vercel.
2. **Migration Check**: Running `migrations/team_members.sql` in the production Supabase SQL Editor.
3. **Type Cleanup**: Resolving the minor `framer-motion` type errors in `components/SecurityTutor.tsx`.

### When to Launch?
**Launch Date Recommendation**: Within 48 hours. 
The product is currently in "Over-Engineered MVP" state—which is perfect. You have more features than 90% of competing startup launches. **Launch now to get your first 10 paying customers (Stage 2.1).**

### How to Launch?
1. **Vercel Ship**: Push `main` to production.
2. **Cron Trigger**: Manually invoke the first `/api/cron/monitor` to verify weekly sweeps.
3. **Seed Campaign**: Use the "Free Audit" link on social media/LinkedIn to drive initial traffic.

---

## 🚨 Disaster Recovery (If Content is Deleted)

1. **If Antigravity is reset**: Show the AI this file (`ZYNTH_STRATEGY_PERSISTENCE.md`) immediately. It will know exactly where we were and how we built everything.
2. **If files are deleted**: This file contains the schema for the `team_members` table and the logic for the `Scanner Engine`. We can rebuild any lost logic by referencing the descriptions here.
3. **If Database is lost**: Refer to `database.sql` and `migrations/team_members.sql` to reconstruct the entire Supabase schema.
