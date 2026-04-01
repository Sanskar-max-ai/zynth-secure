'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CreditCard, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type BillingProfile = {
  plan: string | null
}

export default function BillingPage() {
  const [profile, setProfile] = useState<BillingProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  if (loading) return <div className="animate-pulse p-20 text-center text-[var(--zynth-text)]">Finding billing info...</div>

  const plans = [
    { name: 'Starter', price: '$19', features: ['25 scans/mo', '3 domains', 'PDF reports', 'Weekly emails'] },
    { name: 'Professional', price: '$49', features: ['Unlimited scans', '25 domains', 'AI Assistant', 'API Access'], highlight: true },
    { name: 'Agency', price: '$149', features: ['Unlimited everything', 'White-label PDF', 'Team accounts', 'Priority support'] },
  ]

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-[var(--zynth-text)] hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      <div className="mb-12 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker">
          <span>Billing</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] mb-2 flex items-center gap-3">
          <CreditCard className="text-[var(--zynth-green)]" />
          Billing & Plans
        </h1>
        <p className="text-sm leading-7 text-[var(--zynth-text)]">You are currently on the {profile?.plan || 'Free'} plan.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.name} className={`marketing-card p-8 flex flex-col ${plan.highlight ? 'border-[var(--zynth-green)] shadow-[0_18px_40px_rgba(0,255,136,0.08)]' : 'border-white/5'}`}
            style={plan.highlight ? { borderColor: 'rgba(0,255,136,0.3)' } : {}}>
            {plan.highlight && (
              <div className="text-[10px] uppercase font-black bg-[var(--zynth-green)] text-[var(--zynth-dark)] px-2 py-0.5 rounded-full w-fit mb-4">
                Recommended
              </div>
            )}
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-sm opacity-50">/month</span>
            </div>
            <ul className="space-y-3 mb-10 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm opacity-80">
                  <CheckCircle size={14} className="text-[var(--zynth-green)] mt-1 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`${plan.highlight ? 'btn-primary' : 'btn-secondary'} w-full py-3 text-sm font-bold`}>
              {profile?.plan === plan.name.toLowerCase() ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 marketing-panel p-8 border-dashed border-white/10 text-center">
        <Shield size={32} className="mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-bold mb-2">Secure Billing</h3>
        <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--zynth-text)' }}>
          All payments are processed securely via Stripe. We do not store your credit card information on our servers.
        </p>
      </div>
    </div>
  )
}
