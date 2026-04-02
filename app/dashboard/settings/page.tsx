'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Mail, Shield, CreditCard, Bell, Lock, Save } from 'lucide-react'
import Link from 'next/link'

type Profile = {
  id: string
  email: string | null
  full_name: string | null
  agency_name: string | null
  plan: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const supabase = createClient()
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        agency_name: profile.agency_name,
      })
      .eq('id', profile.id)

    if (error) {
      setMessage('❌ Failed to update profile.')
    } else {
      setMessage('✅ Profile updated successfully!')
    }
    setSaving(false)
  }

  if (loading) return <div className="animate-pulse flex items-center justify-center p-20 text-[var(--zynth-text)]">Loading settings...</div>
  if (!profile) return <div className="p-20 text-center text-[var(--zynth-text)]">We couldn&apos;t load your profile yet.</div>

  return (
    <div className="max-w-4xl animate-fade-up">
      <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker">
          <span>Settings</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">Workspace settings</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--zynth-text)]">Manage your profile, plan, and account preferences.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="md:col-span-1 space-y-1">
          {([
            { label: 'General', icon: User, href: null, active: true },
            { label: 'Billing & Plan', icon: CreditCard, href: '/dashboard/settings/billing', active: false },
            { label: 'Notifications', icon: Bell, href: '/dashboard/settings/notifications', active: false },
            { label: 'Security', icon: Lock, href: null, active: false },
          ] as const).map((item) => item.href ? (
            <Link key={item.label} href={item.href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-white/5 text-white border-l-2 border-[var(--zynth-green)]' : 'text-[var(--zynth-text)] hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ) : (
            <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-white/5 text-white border-l-2 border-[var(--zynth-green)]' : 'text-[var(--zynth-text)] hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="marketing-panel p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <User size={20} className="text-[var(--zynth-green)]" />
              Profile Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>Full Name</label>
                <input type="text" value={profile?.full_name || ''} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid var(--zynth-border)', color: 'white' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>Email Address</label>
                <div className="w-full px-4 py-3 rounded-xl text-sm flex items-center gap-2 opacity-60 cursor-not-allowed"
                  style={{ background: 'rgba(6,11,20,0.4)', border: '1px solid var(--zynth-border)', color: 'var(--zynth-text)' }}>
                  <Mail size={14} />
                  {profile?.email}
                </div>
                <p className="text-[10px] mt-2 italic opacity-50">Email changes must be verified via your registered address.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>Agency Name (Optional)</label>
                <input type="text" value={profile?.agency_name || ''} 
                  onChange={e => setProfile({...profile, agency_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid var(--zynth-border)', color: 'white' }}
                  placeholder="e.g. Acme Security Solutions"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {message && <span className="text-sm font-medium">{message}</span>}
              <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm">
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Plan Summary */}
          <div className="marketing-panel p-8 border-l-4 border-l-[var(--zynth-green)]">
             <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="text-lg font-bold mb-1">Current Plan: {profile?.plan?.toUpperCase() || 'FREE'}</h3>
                 <p className="text-sm" style={{ color: 'var(--zynth-text)' }}>You are currently on the free tier of Zynth.</p>
               </div>
               <Shield size={32} className="text-[var(--zynth-green)] opacity-50" />
             </div>
             <div className="flex gap-4">
               <button className="btn-secondary px-5 py-2 text-sm">Manage Billing</button>
               <button className="btn-primary px-5 py-2 text-sm">Upgrade to Pro</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
