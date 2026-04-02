'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, BellOff, ArrowLeft, MessageSquare, Mail, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type NotificationProfile = {
  email_alerts_enabled: boolean | null
  discord_webhook_url: string | null
}

export default function NotificationsPage() {
  const [profile, setProfile] = useState<NotificationProfile>({ email_alerts_enabled: true, discord_webhook_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('email_alerts_enabled, discord_webhook_url')
          .eq('id', user.id)
          .single()
        if (data) setProfile({
          email_alerts_enabled: data.email_alerts_enabled ?? true,
          discord_webhook_url: data.discord_webhook_url || '',
        })
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        email_alerts_enabled: profile.email_alerts_enabled,
        discord_webhook_url: profile.discord_webhook_url || null,
      })
      .eq('id', user.id)

    setMessage(error
      ? { type: 'error', text: 'Failed to save. Please try again.' }
      : { type: 'success', text: 'Notification preferences saved.' }
    )
    setSaving(false)
  }

  async function handleTestDiscord() {
    if (!profile.discord_webhook_url) return
    setTesting(true)
    setMessage(null)
    try {
      const res = await fetch(profile.discord_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Zynth AI Guard',
          embeds: [{
            title: '✅ Zynth AI Guard — Test Notification',
            description: 'Your Discord webhook is connected successfully! You will receive security alerts in this channel whenever AI Guard detects new vulnerabilities on your monitored domains.',
            color: 0x00ff88,
            footer: { text: 'Zynth AI Guard — Automated Security Monitor' },
            timestamp: new Date().toISOString(),
          }]
        }),
      })
      setMessage(res.ok
        ? { type: 'success', text: '✅ Test message sent to Discord!' }
        : { type: 'error', text: '❌ Discord returned an error. Check your webhook URL.' }
      )
    } catch {
      setMessage({ type: 'error', text: '❌ Could not reach Discord. Check the URL and try again.' })
    }
    setTesting(false)
  }

  if (loading) return <div className="animate-pulse p-20 text-center text-[var(--zynthsecure-text)]">Loading notification settings...</div>

  return (
    <div className="max-w-3xl animate-fade-up">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-[var(--zynthsecure-text)] hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker">
          <span>Notifications</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white">Alert settings</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--zynthsecure-text)]">
          Choose how Zynth AI Guard notifies you when new vulnerabilities are detected on your monitored domains.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Email Alerts */}
        <div className="marketing-panel p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Email Alerts</h3>
                <p className="text-sm text-[var(--zynthsecure-text)] leading-relaxed">
                  Receive a rich HTML report email every time AI Guard completes a weekly scan and finds new critical or high-severity vulnerabilities.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfile(p => ({ ...p, email_alerts_enabled: !p.email_alerts_enabled }))}
              className={`flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${profile.email_alerts_enabled ? 'bg-[var(--zynthsecure-green)]' : 'bg-white/10'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${profile.email_alerts_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {profile.email_alerts_enabled && (
            <div className="mt-4 ml-16 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--zynthsecure-green)] bg-[var(--zynthsecure-green)]/10 px-3 py-1.5 rounded-lg border border-[var(--zynthsecure-green)]/20 w-fit">
              <CheckCircle size={12} /> Email alerts active — sent to your account email
            </div>
          )}
        </div>

        {/* Discord Alerts */}
        <div className="marketing-panel p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Discord Webhook</h3>
              <p className="text-sm text-[var(--zynthsecure-text)] leading-relaxed">
                Paste a Discord Incoming Webhook URL to receive real-time alerts directly in your security channel. 
                <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 ml-1 underline underline-offset-2">How to create one →</a>
              </p>
            </div>
          </div>
          <div className="ml-16 space-y-3">
            <input
              type="url"
              value={profile.discord_webhook_url || ''}
              onChange={(e) => setProfile(p => ({ ...p, discord_webhook_url: e.target.value }))}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-[#060b14] border border-white/10 text-white focus:border-indigo-500/50 placeholder:text-white/20"
            />
            <button
              type="button"
              onClick={handleTestDiscord}
              disabled={!profile.discord_webhook_url || testing}
              className="btn-secondary px-5 py-2 text-xs flex items-center gap-2 disabled:opacity-40"
            >
              <Bell size={14} />
              {testing ? 'Sending...' : 'Send Test Message'}
            </button>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {message.text}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 flex items-center gap-2 text-sm font-bold">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}
