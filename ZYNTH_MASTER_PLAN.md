# Zynth Secure Master Plan (0 to Multi-Million SaaS)

This document tracks the massive, long-term stages of Zynth Secure. If you are an AI assistant in a new chat, you must read this file along with `PROJECT_CONTEXT.md` and `ZYNTH_TRACKER.md` to know exactly where we are on the timeline.

## How to execute:
The user will provide exact prompts listed below to initiate each stage. Mark stages with `[x]` as they complete.

---

### [ ] Stage 1: The V1 Launch Foundation
*Goal: A bulletproof, deployment-ready product that looks like a $5,000 agency tool.*

- **[x] Stage 1.1: Build Stability & Deployment**
  - **Prompt:** *"Execute Stage 1.1: Fix the Vercel branch. Downgrade framer-motion to resolve the motion-dom error, confirm there are no disabled Print buttons in the Technical Brief, run a local webpack build check, and push it to production."*
  - **Action Items:** Modify package.json, verify local build, push to main, test live URL.
  
- **[x] Stage 1.2: Evidence & Remediation Engine**
  - **Prompt:** *"Execute Stage 1.2: Polish the scan finding outputs. Ensure every vulnerability card cleanly displays 'Evidence' and exact file/source location. Tighten the AI remediation route so the output provides highly concrete code fixes."*
  - **Action Items:** Update scan report UI, adjust AI remediation prompt/logic, refine technical brief.

- **[x] Stage 1.3: Trust Flow, Onboarding, & Billing**
  - **Prompt:** *"Execute Stage 1.3: Finalize the trust flow. Perfect the Dashboard empty states, ensure the 'Security' and 'Pricing' pages are flawless for enterprise trust, and finalize Stripe billing webhooks so we can accept payments."*
  - **Action Items:** Empty state components, Stripe checkout session/webhook integration, UI polish.

---

### [ ] Stage 2: The "0 to 10" Alpha Hustle
*Goal: Hand-to-hand combat to get 10 paying customers.*

- **[x] Stage 2.1: Free Audit Lead Magnet**
  - **Prompt:** *"Execute Stage 2.1: Build a dedicated 'Free Quick-Scan' Landing page. It should allow an unauthenticated user to get a highly limited 1-page summary of their site that prompts them to pay/subscribe to see the hidden vulnerabilities and the full 'Technical Brief'."*
  - **Action Items (Execution Plan):**
    - [x] 1. **Route `MarketingScanForm.tsx`**: Modify the homepage scanner input to redirect to `/free-scan?url=...` instead of directly to `/auth/signup`.
    - [x] 2. **Build `/api/scan/free`**: Create an unauthenticated, rate-limited (2 per IP/day) backend scan engine that returns a fast, limited JSON preview.
    - [x] 3. **Build `app/free-scan/page.tsx`**: Create the Unauthenticated Landing Page UI that simulates the scan and presents the partial results.
    - [x] 4. **Build `PaywallUI` Component**: Add a blurred, glassmorphic CTA at the bottom of the free scan report that locks critical results and drives them directly to Stripe/Signup.
  
- **[x] Stage 2.2: Track Events & Analytics**
  - **Prompt:** *"Execute Stage 2.2: Integrate PostHog or Google Analytics so we can track exactly where users drop off during the signup-to-scan funnel."*
  - **Action Items (Execution Plan):**
    - [x] 1. **Install PostHog**: Run `npm install posthog-js`.
    - [x] 2. **Build PostHogProvider**: Create a wrapper around `posthog-js/react` and initialize it with env variables.
    - [x] 3. **Wrap App**: Inject the provider into `app/layout.tsx`.
    - [x] 4. **Inject Telemetry**: Fire `free_scan_started` in `app/free-scan/page.tsx`, and `signup_viewed` / `signup_completed` in `app/auth/signup/page.tsx`.

---

### [ ] Stage 3: Zynth AI Guard (Monthly Recurring Engine)
*Goal: Trap users ethically so they never cancel their subscription.*

- **[x] Stage 3.1: Active Monitoring Foundation**
  - **Prompt:** *"Execute Stage 3.1: Build the backend queue and cron jobs for Zynth AI Guard. Sites should automatically rescan themselves weekly if the user is on a paid tier."*
  - **Action Items (Execution Plan):**
    - [x] 1. **Cron Setup**: Create `vercel.json` with a weekly cron schedule invoking `/api/cron/monitor`.
    - [x] 2. **Monitor Dispatcher (`/api/cron/monitor/route.ts`)**: Build a protected route that finds all `pro` users, extracts their unique scanned URLs, and asynchronously dispatches tasks to bypass serverless timeouts.
    - [x] 3. **Scan Worker (`/api/cron/run-scan/route.ts`)**: Build the background worker that actually executes `runFullScan`, saves the record, and links it to the user.

- **[x] Stage 3.2: Direct Alerts**
  - **Prompt:** *"Execute Stage 3.2: Build the notification engine. If Zynth AI Guard finds a new vulnerability on a weekly scan, it must immediately send an email and a Discord/Slack alert to the user."*
  - **Action Items (Execution Plan):**
    - [x] 1. **Install Resend**: Run `npm install resend` for transactional email.
    - [x] 2. **Build Email utility (`utils/email.ts`)**: Create a typed `sendAlertEmail()` function wrapping the Resend SDK with a premium HTML template.
    - [x] 3. **Wire into CRON worker**: After `/api/cron/run-scan` saves results, fetch user email + Discord webhook URL, then call `sendAlertEmail()` and fire the Discord webhook if new critical/high issues are found.
    - [x] 4. **Build Notifications settings UI (`app/dashboard/settings/notifications/page.tsx`)**: Add a UI for users to enter and save their Discord webhook URL and toggle email alerts.
  - **⏳ PENDING ENV VAR:** `RESEND_API_KEY` — must be added to Vercel before email alerts go live. Get from resend.com (free tier: 3,000 emails/month).

---

### [ ] Stage 4: The 100 to 1,000 Agency Scale
*Goal: Bulk volume through B2B partnerships.*

- **[x] Stage 4.1: Agency White-Label**
  - **Prompt:** *"Execute Stage 4.1: Build the Agency tier. Allow users to upload their own company logo and replace the Zynth branding on the PDF Technical Briefs so they can resell our reports to their clients."*
  - **Action Items (Execution Plan):**
    - [x] 1. **Branding Settings UI (`app/dashboard/settings/branding/page.tsx`)**: Build a page where Agency users can upload a logo (URL) and set a custom brand name/accent color.
    - [x] 2. **Save to DB**: Persist `brand_name`, `brand_logo_url`, `brand_color` to the `profiles` table.
    - [x] 3. **Inject into Technical Brief**: Modify `app/dashboard/scan/[id]/technical/page.tsx` to read the user's branding fields and render their logo/name instead of the Zynth logo.
    - [x] 4. **Gate behind Agency plan**: Show a locked/upgrade prompt to non-Agency users.

- **[x] Stage 4.2: Team Seats / RBAC**
  - **Prompt:** *"Execute Stage 4.2: Build Team management. Allow a primary account owner to invite multiple developers with read-only or admin access to the dashboard."*
  - **Action Items (Execution Plan):**
    - [x] 1. **DB Schema**: Add a `team_members` table (`team_id`, `user_id`, `role: owner|admin|viewer`, `invited_email`, `status: pending|active`).
    - [x] 2. **Invite API (`/api/team/invite/route.ts`)**: Send invite emails via Resend, create pending team membership rows.
    - [x] 3. **Team Settings UI (`app/dashboard/settings/team/page.tsx`)**: Show current members, invite new ones by email, change roles.
    - [x] 4. **RLS Policies**: Update Supabase Row Level Security so team members can read (viewers) or write (admins) the owner's scans.
  - **⏳ PENDING DB MIGRATION:** Run `migrations/team_members.sql` in your Supabase SQL Editor to create the `team_members` table and RLS policies before this feature goes live.

---

### [ ] Stage 5: The Autonomous Fixer (The "Winner")
*Goal: Move from "finding" to "fixing" with AI-powered patches.*

- **Stage 5.1: AI Patching Engine (`utils/scan/patcher.ts`)**
  - **Prompt:** *"Execute Stage 5.1: Build the AI Patcher. Create a module that uses an LLM to generate high-precision code patches for identified vulnerabilities, starting with security headers and misconfigurations."*
  - **Action Items:** LLM prompting for code generation, patch verification logic.

- **Stage 5.2: UI Actionability**
  - **Prompt:** *"Execute Stage 5.2: Update the remediation UI to show the 'Safe Patch' code block and add a 'Copy Patch' button to create a production-ready fix experience."*

---

### [ ] Stage 6: The AI & Logic Guard (Logic-First Red Teaming)
*Goal: Audit non-obvious business logic and protect external AI agents.*

- **Stage 6.1: AI Red Team (`utils/scan/aiRedTeam.ts`)**
  - **Prompt:** *"Execute Stage 6.1: Build the AI Red Team engine. Implement the 15 AI security tests (Prompt Injection, Jailbreak, PII leaks) using adversarial LLM simulations."*
  - **Action Items:** Adversary-Grader LLM logic, test report generation.

- **Stage 6.2: Logic Audit (`utils/scan/logicAudit.ts`)**
  - **Prompt:** *"Execute Stage 6.2: Build the Logic Guard. Implement the 20 business logic tests (Race conditions, Auth escalation) by simulating semantic attacks on the platform."*

---

### [ ] Stage 7: The Unified Ecosystem (CISO Replacement)
*Goal: One platform to connect and protect everything.*

- **Stage 7.1: GitHub App Integration**
  - **Prompt:** *"Execute Stage 7.1: Build the Zynth GitHub App. Allow users to install Zynth on their repos to automatically receive Security PRs for identified vulnerabilities."*

- **Stage 7.2: MCP Server (`utils/mcpServer.ts`)**
  - **Prompt:** *"Execute Stage 7.2: Implement the Model Context Protocol (MCP) server. Allow other AI coding assistants (Cursor, Cody, etc.) to pull security context directly from Zynth."*

---

**Current Status:** Stage 4 complete. ⏳ Moving to Stage 5 (Autonomous Fixer) tomorrow.
