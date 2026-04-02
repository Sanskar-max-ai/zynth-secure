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

- **[ ] Stage 3.1: Active Monitoring Foundation**
  - **Prompt:** *"Execute Stage 3.1: Build the backend queue and cron jobs for Zynth AI Guard. Sites should automatically rescan themselves weekly if the user is on a paid tier."*
  - **Action Items:** Background workers, task queues (e.g. Inngest / Supabase Edge Functions), scheduled database triggers.

- **[ ] Stage 3.2: Direct Alerts**
  - **Prompt:** *"Execute Stage 3.2: Build the notification engine. If Zynth AI Guard finds a new vulnerability on a weekly scan, it must immediately send an email and a Discord/Slack alert to the user."*
  - **Action Items:** Email provider integration (Resend/SendGrid), Discord/Slack webhook builder in UI.

---

### [ ] Stage 4: The 100 to 1,000 Agency Scale
*Goal: Bulk volume through B2B partnerships.*

- **[ ] Stage 4.1: Agency White-Label**
  - **Prompt:** *"Execute Stage 4.1: Build the Agency tier. Allow users to upload their own company logo and replace the Zynth branding on the PDF Technical Briefs so they can resell our reports to their clients."*
  - **Action Items:** Add branding fields to settings/DB, modify PDF generator to accept dynamic logos and colors.

- **[ ] Stage 4.2: Team Seats / RBAC**
  - **Prompt:** *"Execute Stage 4.2: Build Team management. Allow a primary account owner to invite multiple developers with read-only or admin access to the dashboard."*
  - **Action Items:** Supabase RLS policies for multi-tenant teams, invite email system, UI for team members.

---
**Current Status:** At the very beginning! We need the user to paste the **Stage 1.1** prompt.
