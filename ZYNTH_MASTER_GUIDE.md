# Zynth Master Strategy & Persistence Guide

This is the **"Golden Record"** for Zynth Secure. This document consolidates the history, technical architecture, mastery strategies, and future evolution of the product. If all other context is lost, this file contains the blueprints to rebuild and scale Zynth into a multi-million-dollar AI Cybersecurity Agent.

---

## 🏗️ 1. Technical Architecture (The Foundation)
Zynth is built as a high-performance, AI-driven security platform for SaaS startups.

- **Frontend**: Next.js 15+ (App Router), Tailwind CSS 4.0, Framer Motion (Optimized for glassmorphism).
- **Backend/API**: Next.js Route Handlers (Edge/Serverless compatible).
- **Database/Auth**: Supabase (PostgreSQL, GoTrue for Auth, RLS Policies for multi-tenancy).
- **Security Engine**: Custom TypeScript probes for SSL, DNS, Ports, and File Exposure.
- **AI Integration**: OpenAI/Anthropic via Vercel AI SDK for findings explanation and remediation generation.
- **Monitoring**: Vercel Cron Jobs + Node.js Background Workers (`maxDuration: 60`).
- **Infrastructure**: Vercel (Deployment), Resend (Email Alerts), PostHog (Telemetry).

---

## 🛠️ 2. Feature Inventory (What We Have Built)

### **V1: The Security Scanner**
- **SSL/TLS Diagnostics**: Grade-based certificate analysis (via SSL Labs API).
- **Header Audits**: Validation of HSTS, CSP, and X-Headers.
- **Exposure Detection**: Probing for `.env`, `.git`, and backup archives.
- **Network Probing**: Automatic scanning of common ports (80, 443, 8080, etc.).
- **CVE Matching**: Mapping server versions to known vulnerability databases.

### **Zynth AI Guard: Automated Monitoring**
- **Weekly Sweeps**: Automated, recurring scans for paid subscribers.
- **Discord & Email Alerts**: Real-time incident notification when new Critical/High risks are found.
- **Agentic Dashboards**: Real-time score tracking and historical trends.

### **Agency & Enterprise Tier**
- **White-Label Branding**: Injecting custom logos/names into reports and PDF Technical Briefs.
- **Team Management**: RBAC (Admin/Viewer) with secure invitation flows and Supabase RLS.

---

## 🚀 3. The Future: "Fixing Wins the Race" (Evolution)

The market for "scanning" is a commodity. The market for **"Autonomous Remediation"** is a gold mine.

### **Phase 1: The Autonomous Fixer**
- **Next.js Integration**: Automatically creating GitHub PRs that fix identified config issues (e.g., adding a CSP header to `next.config.ts`).
- **One-Click Patching**: Providing exact code blocks that users can copy/paste directly into their IDE.

### **Phase 2: Agentic Red Teaming & Logic Guard**
- **The Hacker Loop**: An AI agent that "thinks" about the scan results and generates complex attack paths to prove the vulnerabilities are real.
- **SaaS Business Logic Audit**: Probing for semantic flaws like race conditions, authorization escalation, and workflow bypasses.
- **AI Agent Security**: Dedicated test suite for LLM-based agents (Prompt Injection, PII leakage, Jailbreaking).

### **Phase 3: The Unified Ecosystem (CISO Replacement)**
- **GitHub & MCP Integration**: Connecting Zynth directly to the development workflow via Model Context Protocol (MCP) and GitHub Apps to provide real-time, autonomous protection.
- **Goal**: One platform to replace the need for dedicated cybersecurity engineers for startups.

---

## 📑 4. Advanced Test Suites (The "Zynth Brain")

### **AI Agent Security Tests (15 Core Tests)**
1.  **Direct Prompt Injection**: Malicious instructions in user input overriding system prompts.
2.  **Indirect Prompt Injection**: Malicious instructions in external content (sites/emails) read by AI.
3.  **System Prompt Leakage**: Exposing proprietary instructions/logic.
4.  **PII Leakage**: Personal information from training data/context appearing in responses.
5.  **Jailbreak (Role-Play)**: Using "pretend you are X" to bypass safety guardrails.
6.  **Sensitive Data Exposure**: API keys/credentials leaked in AI responses.
7.  **Excessive Agency**: AI performing unauthorized actions (sending emails, deleting files).
8.  **AI Rate Limiting**: Preventing cost-running or systematic extraction attacks.
9.  **Token Limit Bypass**: Crafting prompts to bypass usage/cost limits.
10. **Logic Confusion**: Using conflicting instructions to cause unpredictable behavior.
11. **Verbose Error Messages**: Revealing internal architecture via AI errors.
12. **Version Leakage**: Revealing model name/version/fine-tuning details.
13. **Timing Attacks**: Using response times to infer internal system state.
14. **Hallucination Exploitation**: Forcing AI to provide confident false info.
15. **Tool/Function Abuse**: Tricking AI into calling unintended functions or malicious parameters.

### **Business Logic Vulnerability Tests (20 Core Tests)**
1.  **Insufficient Balance Validation**: Stealing from other users or creating negative balances.
2.  **Race Condition**: Simultaneous requests succeeding when only one should.
3.  **Auth Escalation**: Regular users accessing admin endpoints or changing roles.
4.  **Transaction Reversal Bypass**: Duplicate refunds or bypassing payment confirmation.
5.  **Workflow State Bypass**: Skipping required steps (e.g., checkout without payment).
6.  **Negative Value Acceptance**: Inventory or price fields accepting negative numbers.
7.  **Integer Overflow/Underflow**: Field values wrapping to negative or unintended states.
8.  **Cross-Tenant Access**: Accessing User B data by modifying URL tenant IDs.
9.  **Privilege Escalation**: Parameter tampering (JWT/Body) to change roles.
10. **Coupon Stacking**: Applying same coupon multiple times or combining for >100% discount.
11. **Time-Based Logic Flaws**: Bypassing time-window checks (e.g., early-bird pricing).
12. **Idempotency Violation**: Retry causing multiple charges/actions instead of one.
13. **Soft Delete Exposure**: Direct API access to marked-as-deleted data.
14. **Account Enumeration (Timing)**: Using response times to find valid user accounts.
15. **Subscription Abuse**: Downgrading mid-cycle while keeping features.
16. **Pagination Off-by-One**: Duplicate or skipped records in result sets.
17. **Default Value Exploitation**: Admin/Permission fields defaulting to "Allow" or "True".
18. **Cascading Delete Inconsistency**: Orphaned records causing reporting/system errors.
19. **Inventory Double-Count**: Items counted in multiple warehouses simultaneously.
20. **Logic-Driven Data Leakage**: Extracting data through complex, non-obvious query patterns.

---

## 🏆 4. How to be a Top 0.1% Antigravity User

To master AI-driven development with Antigravity, you must move from "User" to "Architect."

### **The "Research-First" Mandate**
Never let the AI write code before it has researched the **Market Gap** and **Technical Implications**. The `implementation_plan.md` is the most important file in the project. If the plan is solid, the code will be perfect.

### **The Persistence Loop**
Always maintain `PROJECT_CONTEXT.md` and `ZYNTH_TRACKER.md`. These files are the AI's memory. When you start a session, tell the AI: *"Read the context and tracker first."* This prevents 99% of context loss.

### **Incremental Mastery**
Build features atomically. Don't build "a dashboard"—build "a glassmorphic sidebar component with Supabase auth integration." Small, testable units ensure 100% bug-free code.

---

## 🏁 5. The Launch Roadmap (7-Day Plan)

### **Checklist for Launch**
- **Day 1: Cleanup**: Resolve `framer-motion` type errors and run `npm run lint`.
- **Day 2: Infrastructure**: Sync `RESEND_API_KEY` and `STRIPE_SECRET` to Vercel production.
- **Day 3: Database**: Run `migrations/team_members.sql` on the live Supabase instance.
- **Day 4: Content**: Finalize the "About" and "Contact" pages (currently untracked).
- **Day 5: Verification**: Run a full production-mode scan on a test domain.
- **Day 6: Lead Magnet**: Launch the "Free Quick Scan" landing page to LinkedIn/Social.
- **Day 7: Launch**: Go live and monitor the first 10 paying customers.

---

## 🚨 6. Emergency Recovery File
If local files are deleted:
- Use **`database.sql`** to rebuild the schema.
- Use **`ZYNTH_MASTER_PLAN.md`** to recover the roadmap.
- Use **`ZYNTH_MASTER_GUIDE.md`** (this file) to re-instantiate the AI's understanding of the project.
