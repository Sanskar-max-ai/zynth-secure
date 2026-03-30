import Link from 'next/link'
import { CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 animate-fade-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">Upgrade to Zynth Pro</h1>
        <p className="text-[var(--zynth-text)] max-w-2xl mx-auto">
          You've seen the power of the Zynth Security Engine. Now, unlock continuous monitoring, the AI Security Tutor, and automated compliance reports.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Pro Plan */}
        <div className="card p-8 border-[#00ff88]/30 shadow-[0_0_50px_rgba(0,255,136,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-[#00ff88] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
            Most Popular
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Shield className="text-[#00ff88]" /> Pro Security
            </h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black">$99</span>
              <span className="text-[var(--zynth-text)]">/mo</span>
            </div>
            <p className="text-sm mt-2 text-[var(--zynth-text)]">For startups and businesses that cannot afford to be hacked.</p>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              'Unlimited WebGuard Scans',
              'Unlimited AIGuard Scans',
              'Zynth Guard (Continuous Weekly Monitoring)',
              'AI Security Tutor (Unlimited Explanations)',
              'Slack & Email Vulnerability Alerts',
              'Export PDF Walkthroughs'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 size={18} className="text-[#00ff88] shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full btn-primary py-4 font-black text-lg flex items-center justify-center gap-2">
             <Zap size={20} /> Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="card p-8 border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="text-blue-500" /> Agency
            </h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black">$499</span>
              <span className="text-[var(--zynth-text)]">/mo</span>
            </div>
            <p className="text-sm mt-2 text-[var(--zynth-text)]">For agencies managing client infrastructure.</p>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              'Everything in Pro',
              'White-labeled PDF Agency Reports',
              'SOC2 & ISO 27001 Mapping Exports',
              'API Access for CI/CD pipelines',
              'Guaranteed Expert Resolution within 24h',
              'Dedicated Account Manager'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-4 font-black text-lg rounded-xl border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-2">
            Contact Sales
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-center text-[10px] text-[var(--zynth-text)] opacity-50 uppercase tracking-widest font-black">
        <p>Payments securely processed by Stripe. Cancel anytime.</p>
      </div>
    </div>
  )
}
