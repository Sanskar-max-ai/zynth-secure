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
    <div className="marketing-shell min-h-screen text-white selection:bg-[var(--zynthsecure-green)] selection:text-[#030712]">
      <CyberBackground />
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-20" />
      <div className="scanline-overlay opacity-10" />
      <PublicNav />

      <main className="relative">
        <section className="page-container grid gap-12 px-0 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
          <div className="space-y-8">
            <div className="section-kicker">
              <span>Zynth.os // Secure Command v1</span>
            </div>

            <div className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white md:text-7xl">
                Security auditing that feels like a <span className="text-[var(--zynthsecure-green)]">product</span>.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-white/50 md:text-lg">
                Zynth helps modern teams audit their public web surface, understand what was actually
                found, and move into remediation with technical reports they can trust.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/pricing" className="btn-primary px-8 py-3.5 text-[11px] uppercase tracking-[0.2em]">
                View Pricing <ArrowRight size={14} />
              </Link>
              <Link href="/security" className="btn-secondary px-8 py-3.5 text-[11px] uppercase tracking-[0.2em] border-white/10 hover:border-white/30">
                Security Docs
              </Link>
            </div>

            <div className="marketing-panel max-w-3xl !p-6 md:!p-8 hud-corner hud-corner-tl hud-corner-br">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Initiate Protocol</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/50">
                    Enter a domain to begin the tactical auditing sequence.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--zynthsecure-green)]/20 bg-[var(--zynthsecure-green)]/5 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--zynthsecure-green)]">
                  Fast Baseline
                </div>
              </div>

              <MarketingScanForm />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="font-mono text-2xl font-black text-white">01. EVIDENCE</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Signal Accuracy</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-white">02. REPORTS</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Team Ready</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black text-white">03. SCALE</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">AI Native</p>
              </div>
            </div>
          </div>

          <div className="marketing-panel hud-corner hud-corner-tr hud-corner-bl overflow-hidden !p-8 md:!p-10 border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Module // Capabilities</p>
                <p className="mt-2 max-w-sm text-sm font-medium text-white/50">
                  A high-fidelity security starting point for growth-stage engineering teams.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/3 p-3.5">
                <Shield size={20} className="text-[var(--zynthsecure-green)]" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {[
                ['Tactical Web Posture Scans', 'Headers, TLS, exposed records, and domain security signals.'],
                ['Signal Origin Attribution', 'Clear proof showing how every vulnerability was identified.'],
                ['Remediation Pathing', 'Direct fixes and patches without the tool-fatigue.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
                  <p className="text-[15px] font-bold text-white mb-1.5">{title}</p>
                  <p className="text-[12px] leading-relaxed text-white/40 font-medium">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <ChartColumn size={18} className="text-[var(--zynthsecure-green)]/60 mb-4" />
                <p className="text-[14px] font-bold text-white">Unified Dashboards</p>
                <p className="mt-2 text-[11px] leading-relaxed text-white/40 font-medium">
                  Centralized history and remediation status tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <Sparkles size={18} className="text-blue-400/60 mb-4" />
                <p className="text-[14px] font-bold text-white">AI-Infused Analysis</p>
                <p className="mt-2 text-[11px] leading-relaxed text-white/40 font-medium">
                  Moving beyond raw tools into intelligent security logic.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-container py-12 md:py-20">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="section-kicker">
                <span>Core Engine</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-black tracking-tighter text-white md:text-5xl">
                Precision auditing for the modern web surface.
              </h2>
            </div>
            <p className="max-w-md text-[13px] font-medium leading-relaxed text-white/40">
              The Zynth engine is built for clarity and speed. Get a read on your security posture in minutes, not days.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.title} className="marketing-card !p-8 hud-corner hud-corner-tl !bg-white/[0.02]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/3">
                    <Icon size={20} className="text-[var(--zynthsecure-green)]" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white tracking-tight">{card.title}</h3>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-white/40">
                    {card.description}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="page-container py-16">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="space-y-6">
              <div className="section-kicker">
                <span>Operational Flow</span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white md:text-5xl">
                Audit to Action.
              </h2>
              <p className="max-w-lg text-[14px] font-medium leading-relaxed text-white/50">
                Complexity is the enemy of security. Zynth simplifies the cycle from initial scan to verified fix.
              </p>
            </div>

            <div className="space-y-4">
              {productSteps.map((step) => (
                <div key={step.label} className="marketing-panel !p-6 md:!p-8 !bg-white/[0.01] border-white/5">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="font-mono text-xs font-black uppercase tracking-[0.3em] text-[var(--zynthsecure-green)]">
                      [{step.label}]
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                      <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/40">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container py-24">
          <div className="marketing-panel !p-12 text-center md:!p-20 hud-corner hud-corner-tl hud-corner-tr hud-corner-bl hud-corner-br !bg-white/[0.02]">
            <div className="section-kicker mx-auto">
              <span>Next Phase</span>
            </div>
            <h2 className="mx-auto mt-8 max-w-4xl text-4xl font-black tracking-tighter text-white md:text-6xl">
              Start your first tactical audit <span className="text-[var(--zynthsecure-green)]">today</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] font-medium leading-relaxed text-white/40">
              Join the future of automated security auditing. Professional-grade findings for teams that value speed and precision.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/quick-scan" className="btn-primary px-10 py-4 text-[11px] uppercase tracking-[0.2em]">
                Init Scan Pattern
              </Link>
              <Link href="/pricing" className="btn-secondary px-10 py-4 text-[11px] uppercase tracking-[0.2em] border-white/10 hover:border-white/30">
                View Access Plans
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

