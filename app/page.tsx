import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  ChartColumn,
  FileCheck2,
  Radar,
  Shield,
  Sparkles,
} from 'lucide-react'
import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'
import MarketingScanForm from '@/components/marketing/MarketingScanForm'
import CyberBackground from '@/components/ui/CyberBackground'

const featureCards = [
  {
    icon: Radar,
    title: 'Website Security Scans',
    description:
      'Run focused checks for headers, certificates, exposed files, risky ports, and common web security gaps without asking teams to set up complex tooling first.',
  },
  {
    icon: FileCheck2,
    title: 'Evidence-Based Findings',
    description:
      'Every finding is tied to the signal that produced it, so teams can see what was directly observed, what came from external lookups, and what needs confirmation.',
  },
  {
    icon: Bot,
    title: 'Actionable Remediation',
    description:
      'Turn raw security output into a practical next step with plain-English fixes, dashboard summaries, and printable technical briefs for engineering teams.',
  },
]

const productSteps = [
  {
    label: '01',
    title: 'Start with a URL',
    description:
      'A founder or operator can kick off a scan in minutes. No onboarding maze, no security specialist required just to get a first read.',
  },
  {
    label: '02',
    title: 'Review risk with context',
    description:
      'Zynth turns scan output into severity, evidence, and business-friendly explanations so teams know what matters first.',
  },
  {
    label: '03',
    title: 'Move into remediation',
    description:
      'Reports, patch summaries, and historical tracking give teams a path from "we found something" to "we fixed it."',
  },
]

const trustItems = [
  'Source-aware findings that show how an issue was detected',
  'Printable technical reports for engineering follow-up',
  'Dashboard history that makes posture changes easier to track',
  'A clean foundation for recurring monitoring and future AI security coverage',
]

export default function HomePage() {
  return (
    <div className="marketing-shell min-h-screen text-white">
      <CyberBackground />
      <div className="marketing-grid pointer-events-none fixed inset-0 opacity-40" />
      <PublicNav />

      <main className="relative">
        <section className="page-container grid gap-16 px-0 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
          <div className="space-y-8">
            <div className="section-kicker">
              <span>Launch Zynth Scan v1</span>
            </div>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl">
                Security scanning that feels like a product, not a raw tool.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--zynthsecure-text)] md:text-xl">
                Zynth helps modern teams audit their public web surface, understand what was actually
                found, and move into remediation with reports they can trust.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/pricing" className="pill-link text-sm font-semibold uppercase tracking-[0.14em]">
                See Pricing <ArrowRight size={16} />
              </Link>
              <Link href="/security" className="pill-link text-sm font-semibold uppercase tracking-[0.14em]">
                Review Security
              </Link>
            </div>

            <div className="marketing-panel max-w-3xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/55">Start With A Scan</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--zynthsecure-text)]">
                    Enter a site you own and we&apos;ll route you into the onboarding flow with the target prefilled.
                  </p>
                </div>
                <div className="rounded-full border border-[var(--zynthsecure-green)]/30 bg-[var(--zynthsecure-green)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--zynthsecure-green)]">
                  Fast Baseline
                </div>
              </div>

              <MarketingScanForm />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-bold text-white">Evidence</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">Not guesswork</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Reports</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">Built for teams</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Foundation</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">For AI security next</p>
              </div>
            </div>
          </div>

          <div className="marketing-panel overflow-hidden p-8 md:p-10">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/55">What Zynth Gives You</p>
                <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--zynthsecure-text)]">
                  A more useful security starting point for founders, operators, and lean engineering teams.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                <Shield size={24} className="text-[var(--zynthsecure-green)]" />
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {[
                ['Scan public web posture', 'Headers, TLS, exposed files, domain signals, and basic footprint checks'],
                ['Explain the finding source', 'Show whether a result came from direct observation, enrichment, or lookup data'],
                ['Prepare the next action', 'Deliver remediation guidance without forcing users through raw scanner output'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-white/7 bg-white/[0.03] p-5">
                  <p className="text-lg font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--zynthsecure-text)]">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/7 bg-white/[0.03] p-5">
                <ChartColumn size={20} className="text-[var(--zynthsecure-green)]" />
                <p className="mt-4 text-lg font-semibold text-white">Readable dashboards</p>
                <p className="mt-2 text-sm leading-7 text-[var(--zynthsecure-text)]">
                  Teams can review history, severity, and remediation status in one place.
                </p>
              </div>
              <div className="rounded-3xl border border-white/7 bg-white/[0.03] p-5">
                <Sparkles size={20} className="text-[var(--zynthsecure-green)]" />
                <p className="mt-4 text-lg font-semibold text-white">A path to AI security</p>
                <p className="mt-2 text-sm leading-7 text-[var(--zynthsecure-text)]">
                  Zynth Scan is the first layer. The next layer is AI and SaaS security testing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-container py-8 md:py-14">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="section-kicker">
                <span>Core Product</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white md:text-5xl">
                Built to make security findings easier to believe, share, and act on.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
              The product surface now centers on clarity: what was scanned, what was found, how it was found, and
              what your team should do next.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.title} className="marketing-card p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--zynthsecure-green)]/20 bg-[var(--zynthsecure-green)]/10">
                    <Icon size={24} className="text-[var(--zynthsecure-green)]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
                    {card.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="page-container py-16">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-5">
              <div className="section-kicker">
                <span>How It Works</span>
              </div>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-white md:text-5xl">
                A simpler flow from first scan to next action.
              </h2>
              <p className="max-w-lg text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
                Zynth Scan is being shaped as a practical operating layer for small teams. Less noise, more signal,
                and better follow-through after the scan finishes.
              </p>
            </div>

            <div className="space-y-5">
              {productSteps.map((step) => (
                <div key={step.label} className="marketing-panel p-6 md:p-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--zynthsecure-green)]">
                      {step.label}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container py-16">
          <div className="marketing-panel grid gap-8 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="space-y-4">
              <div className="section-kicker">
                <span>Trust Layer</span>
              </div>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">
                The product should feel credible before it feels ambitious.
              </h2>
              <p className="text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
                We are tightening the scan engine, report design, and remediation output now so that future AI and SaaS
                security modules rest on something trustworthy.
              </p>
            </div>

            <div className="grid gap-4">
              {trustItems.map((item) => (
                <div key={item} className="flex items-start gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--zynthsecure-green)] shadow-[0_0_14px_rgba(0,255,136,0.55)]" />
                  <p className="text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container pt-18 pb-24">
          <div className="marketing-panel p-8 text-center md:p-12">
            <div className="section-kicker mx-auto">
              <span>Get Started</span>
            </div>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white md:text-5xl">
              Start with Zynth Scan now, then grow into deeper security coverage later.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
              The immediate goal is a professional, launchable scanner product. The long-term direction is security
              for AI-enabled SaaS teams.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup" className="btn-primary px-7 py-4 text-sm uppercase tracking-[0.16em]">
                Start Free Audit
              </Link>
              <Link href="/pricing" className="btn-secondary px-7 py-4 text-sm uppercase tracking-[0.16em]">
                Compare Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
