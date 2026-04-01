import Link from 'next/link'
import { Check, Shield, Sparkles } from 'lucide-react'
import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For founders who need a baseline scan and a clean first report.',
    features: ['Single website audit', 'Dashboard summary', 'Core findings and severity', 'Basic remediation guidance'],
  },
  {
    name: 'Pro',
    price: '$49/mo',
    description: 'For teams who want recurring scans, history, and reports they can share internally.',
    features: ['Recurring scans', 'Downloadable report views', 'Issue history and tracking', 'Priority remediation workflow'],
    featured: true,
  },
  {
    name: 'Growth',
    price: 'Custom',
    description: 'For teams preparing for regular monitoring and future AI security coverage.',
    features: ['Custom onboarding', 'Monitoring workflows', 'White-glove support', 'Early access to future AI security modules'],
  },
]

export default function PricingPage() {
  return (
    <div className="marketing-shell min-h-screen text-white">
      <PublicNav />

      <main className="page-container py-16 md:py-24">
        <section className="space-y-6 text-center">
          <div className="section-kicker mx-auto">
            <span>Pricing</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-[-0.05em] md:text-6xl">
            Simple plans for teams getting serious about security posture.
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
            Zynth Scan v1 is about clear security baselines, trustworthy findings, and a path into remediation.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`marketing-card p-8 ${plan.featured ? 'relative border-[var(--zynthsecure-green)]/35 shadow-[0_18px_60px_rgba(0,255,136,0.12)]' : ''}`}
            >
              {plan.featured ? (
                <div className="absolute right-6 top-6 rounded-full border border-[var(--zynthsecure-green)]/35 bg-[var(--zynthsecure-green)]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--zynthsecure-green)]">
                  Recommended
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                  {plan.featured ? (
                    <Sparkles size={20} className="text-[var(--zynthsecure-green)]" />
                  ) : (
                    <Shield size={20} className="text-[var(--zynthsecure-green)]" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              </div>

              <p className="mt-6 text-4xl font-bold tracking-[-0.05em] text-white">{plan.price}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--zynthsecure-text)]">{plan.description}</p>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check size={18} className="mt-1 text-[var(--zynthsecure-green)]" />
                    <p className="text-sm leading-7 text-[var(--zynthsecure-text)]">{feature}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] ${
                  plan.featured ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Start With {plan.name}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="marketing-panel p-8">
            <h2 className="text-2xl font-semibold text-white">What every plan includes</h2>
            <div className="mt-6 space-y-4">
              {[
                'A product-first scan experience instead of raw scanner output',
                'Evidence-aware findings and remediation summaries',
                'A clean foundation for future monitoring and AI security modules',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--zynthsecure-green)]" />
                  <p className="text-sm leading-7 text-[var(--zynthsecure-text)]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-panel p-8">
            <h2 className="text-2xl font-semibold text-white">Where Zynth goes next</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--zynthsecure-text)]">
              Pricing today is for the website security product. Over time, the same platform will expand into AI app,
              chatbot, and SaaS security testing for higher-trust teams.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/security" className="pill-link text-sm font-semibold uppercase tracking-[0.14em]">
                Review Security
              </Link>
              <Link href="/" className="pill-link text-sm font-semibold uppercase tracking-[0.14em]">
                Back To Product
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
