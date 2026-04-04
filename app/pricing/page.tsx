import Link from 'next/link'
import { Check, Shield, Sparkles } from 'lucide-react'
import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'
import CyberBackground from '@/components/ui/CyberBackground'

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
    <div className="marketing-shell min-h-screen text-white selection:bg-[var(--zynthsecure-green)] selection:text-[#030712]">
      <CyberBackground />
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-20" />
      <div className="scanline-overlay opacity-10" />
      <PublicNav />

      <main className="page-container py-20 md:py-32">
        <section className="space-y-6 text-center">
          <div className="section-kicker mx-auto">
            <span>Operational Tiers</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tighter md:text-7xl">
            Scale your <span className="text-[var(--zynthsecure-green)]">security command</span>.
          </h1>
          <p className="mx-auto max-w-2xl text-[15px] font-medium leading-relaxed text-white/50">
            Professional plans for engineering teams transitioning from manual tools to automated security pattern observation.
          </p>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`marketing-card !p-10 hud-corner ${plan.featured ? 'hud-corner-tl hud-corner-br border-[var(--zynthsecure-green)]/30 !bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.4)]' : 'hud-corner-tl !bg-white/[0.01] border-white/5'}`}
            >
              {plan.featured ? (
                <div className="mb-8 inline-flex rounded-md border border-[var(--zynthsecure-green)]/20 bg-[var(--zynthsecure-green)]/5 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--zynthsecure-green)]">
                  Tactical Pick
                </div>
              ) : null}

              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  {plan.featured ? (
                    <Sparkles size={18} className="text-[var(--zynthsecure-green)]" />
                  ) : (
                    <Shield size={18} className="text-[var(--zynthsecure-green)]/60" />
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">{plan.name}</h2>
              </div>

              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-mono text-5xl font-black tracking-tighter text-white">{plan.price.split('/')[0]}</span>
                {plan.price.includes('/') && <span className="font-mono text-xs font-bold text-white/20">/{plan.price.split('/')[1]}</span>}
              </div>
              <p className="mt-4 text-[13px] font-medium leading-relaxed text-white/40">{plan.description}</p>

              <div className="mt-10 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-4">
                    <Check size={14} className="mt-1.5 text-[var(--zynthsecure-green)]" />
                    <p className="text-[13px] font-medium text-white/50">{feature}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className={`mt-10 inline-flex w-full items-center justify-center rounded-xl px-4 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${
                  plan.featured ? 'btn-primary' : 'btn-secondary border-white/10 hover:border-white/30'
                }`}
              >
                DEPLOY {plan.name.toUpperCase()}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-32 grid gap-6 md:grid-cols-2">
          <div className="marketing-panel !p-10 hud-corner hud-corner-tl border-white/5 !bg-white/[0.02]">
            <h2 className="text-2xl font-black tracking-tight text-white">Full Stack Core</h2>
            <div className="mt-8 space-y-5">
              {[
                'Product-native audit UI (No raw terminal noise)',
                'Visual evidence-path for every security finding',
                'Operational remediation paths for engineering teams',
              ].map((item) => (
                <div key={item} className="flex items-start gap-4">
                  <div className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[var(--zynthsecure-green)] shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                  <p className="text-[13px] font-medium text-white/50">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-panel !p-10 hud-corner hud-corner-tr border-white/5 !bg-white/[0.02]">
            <h2 className="text-2xl font-black tracking-tight text-white">Future Roadmap</h2>
            <p className="mt-6 text-[13px] font-medium leading-relaxed text-white/50">
              Your subscription today powers the development of Zynth Scan. As we scale, your account will gain access to AI-native modules for SaaS security and automated red-teaming.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href="/security" className="btn-secondary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-white/5">
                Security Docs
              </Link>
              <Link href="/" className="btn-secondary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border-white/5">
                Back To Base
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

