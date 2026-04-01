import Link from 'next/link'
import { FileCheck2, Lock, Radar, ShieldCheck } from 'lucide-react'
import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'

const coverageAreas = [
  {
    icon: Radar,
    title: 'Current scan coverage',
    description: 'Headers, TLS, exposed files, DNS and related domain signals, risky port surface, and stored issue reporting.',
  },
  {
    icon: FileCheck2,
    title: 'Evidence and reporting',
    description: 'Findings can carry source and evidence metadata so teams can understand why a risk was raised.',
  },
  {
    icon: Lock,
    title: 'Remediation workflow',
    description: 'The product turns issues into suggested actions and patch summaries rather than leaving users with raw findings alone.',
  },
  {
    icon: ShieldCheck,
    title: 'Future direction',
    description: 'The next layer is AI-enabled SaaS security, including prompt abuse, data leakage, and agent behavior testing.',
  },
]

export default function SecurityPage() {
  return (
    <div className="marketing-shell min-h-screen text-white">
      <PublicNav />

      <main className="page-container py-16 md:py-24">
        <section className="space-y-6">
          <div className="section-kicker">
            <span>Security</span>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.05em] md:text-6xl">
            Zynth is being built to be clear about what it scans, how it reports, and where it is headed.
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
            We are finishing Zynth Scan v1 first: a professional website security product with trustworthy reporting,
            remediation guidance, and a cleaner customer experience. That foundation comes before the later AI and SaaS
            security layers.
          </p>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {coverageAreas.map((area) => {
            const Icon = area.icon
            return (
              <article key={area.title} className="marketing-card p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--zynthsecure-green)]/20 bg-[var(--zynthsecure-green)]/10">
                  <Icon size={24} className="text-[var(--zynthsecure-green)]" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-white">{area.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
                  {area.description}
                </p>
              </article>
            )
          })}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="marketing-panel p-8">
            <h2 className="text-2xl font-semibold text-white">What the product is today</h2>
            <div className="mt-6 space-y-4">
              {[
                'A website scanner with dashboard, scan history, printable technical brief, and remediation support',
                'A product surface that now prioritizes credibility over flashy claims',
                'A cleaner codebase prepared for deeper scan and report improvements',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--zynthsecure-green)]" />
                  <p className="text-sm leading-7 text-[var(--zynthsecure-text)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-panel p-8">
            <h2 className="text-2xl font-semibold text-white">What comes after v1</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--zynthsecure-text)]">
              After the scanner product is stable and launchable, Zynth expands into AI security for SaaS teams:
              prompt injection, system prompt leakage, PII exposure, tool abuse, and business-logic testing for modern
              software products.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/pricing" className="btn-primary px-6 py-4 text-sm uppercase tracking-[0.16em]">
                View Plans
              </Link>
              <Link href="/auth/signup" className="btn-secondary px-6 py-4 text-sm uppercase tracking-[0.16em]">
                Start Free Audit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
