# Zynth Tracker

This file is the running log for the project.

When starting a new chat, read this file first.

## Daily Template

- Date:
- Plan:
- Achieved:
- Changes:
- Blockers:
- Next:

## Entry - 2026-03-31

### Plan

- Finish Zynth Scan v1
- Stabilize the codebase
- Fix the current deployment path
- Set up a simple memory file for future chats

### Achieved

- Hardened admin access
- Centralized the scan engine
- Cleaned lint issues
- Fixed the technical brief print button build issue
- Fixed the scan report type mismatch
- Updated the Git remote to the new repo
- Pushed the current work to GitHub
- Added `PROJECT_CONTEXT.md`
- Replaced the default README with a Zynth-specific guide
- Added `ZYNTH_TRACKER.md` as the daily work log
- Added evidence/source metadata to scan findings
- Displayed finding source and evidence in the report UI
- Upgraded the remediation flow to return specific fix payloads
- Added a shared remediation helper for better fix summaries
- Reworked the public product surface into a cleaner marketing shell
- Added dedicated `Pricing` and `Security` pages
- Rewrote the homepage to feel more product-focused and professional
- Verified the new public UI with lint and typecheck
- Polished the dashboard shell to match the stronger public product UI
- Reworked the dashboard sidebar, overview, scan history, and scan setup flow
- Cleaned report wording to be more professional and less over-claimed
- Fixed lingering text/encoding artifacts in the scan pages and technical brief

### Changes

- Added `components/PrintTechnicalBriefButton.tsx`
- Updated `app/dashboard/scan/[id]/technical/page.tsx`
- Updated `app/dashboard/scan/[id]/page.tsx`
- Added `utils/scan/report.ts`
- Added `utils/scan/remediation.ts`
- Updated `app/api/scan/website/route.ts`
- Updated `app/api/scan/ai/route.ts`
- Updated `app/api/remediate/route.ts`
- Updated `components/RemediationButton.tsx`
- Added `PROJECT_CONTEXT.md`
- Updated `README.md`
- Added `components/marketing/BrandMark.tsx`
- Added `components/marketing/PublicNav.tsx`
- Added `components/marketing/PublicFooter.tsx`
- Added `components/marketing/MarketingScanForm.tsx`
- Updated `app/globals.css`
- Updated `app/page.tsx`
- Added `app/pricing/page.tsx`
- Added `app/security/page.tsx`
- Updated `app/dashboard/layout.tsx`
- Updated `components/dashboard/Sidebar.tsx`
- Updated `app/dashboard/page.tsx`
- Updated `app/dashboard/history/page.tsx`
- Updated `app/dashboard/scan/page.tsx`
- Updated `app/dashboard/settings/page.tsx`
- Updated `app/dashboard/scan/[id]/page.tsx`
- Updated `app/dashboard/scan/[id]/technical/page.tsx`

### Blockers

- Vercel deployments were still failing while we were fixing the report page types
- Local `next build` on this Windows machine still hits an SWC / `.next` environment issue

### Next

- Polish the dashboard and scan flow to match the stronger public UI
- Add more launch-ready product pages and messaging where needed
- Keep improving remediation and reporting clarity
- Continue toward monitoring polish, then `Zynth AI Guard`

## Entry - 2026-04-01

### Plan

- Upgrade the inside of the product after the public UI refresh
- Make the dashboard and scan flow feel more professional
- Remove over-the-top wording that hurts trust

### Achieved

- Refreshed the dashboard shell and background treatment
- Simplified the sidebar into a cleaner product workspace
- Improved dashboard overview copy and stats presentation
- Polished scan history and settings headers
- Reworked the scan setup page to feel like a real product flow
- Cleaned report wording and removed stronger compliance claims
- Fixed text artifacts in report links, separators, and the technical brief footer
- Fixed the PDF upgrade route bug
- Toned down the report verification badge so it matches what the product actually proves
- Polished the billing page to match the new dashboard style
- Polished the scan report flow with calmer language and cleaner action sections
- Improved the technical brief wording and report naming
- Improved remediation feedback and added clearer failure messaging
- Softened the report assistant wording so it feels more like product help than a demo
- Verified the work with `npm run lint` and `npx tsc --noEmit`

### Changes

- Updated `app/dashboard/layout.tsx`
- Updated `components/dashboard/Sidebar.tsx`
- Updated `app/dashboard/page.tsx`
- Updated `app/dashboard/history/page.tsx`
- Updated `app/dashboard/scan/page.tsx`
- Updated `app/dashboard/settings/page.tsx`
- Updated `app/dashboard/settings/billing/page.tsx`
- Updated `app/dashboard/scan/[id]/page.tsx`
- Updated `app/dashboard/scan/[id]/technical/page.tsx`
- Updated `components/DownloadPdfButton.tsx`
- Updated `components/VerifiedReportBadge.tsx`
- Updated `components/RemediationButton.tsx`
- Updated `components/SecurityTutor.tsx`
- Updated `components/ExpertRequestModal.tsx`

### Blockers

- No major code blockers right now
- Local production build still needs separate verification because of the Windows SWC / `.next` environment issue seen earlier

### Next

- Polish remaining detail/settings pages and empty states
- Improve onboarding and signup-to-scan handoff
- Improve onboarding and launch-readiness flows
- Continue toward final Zynth Scan v1 completion
