'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Users, UserPlus, Trash2, Crown, Eye, ShieldCheck, Mail, Lock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

type TeamMember = {
  id: string
  invited_email: string
  user_id: string | null
  role: 'admin' | 'viewer'
  status: 'pending' | 'active'
  created_at: string
}

type CurrentProfile = {
  plan: string | null
  email: string | null
}

const PLAN_SEAT_LIMITS: Record<string, number> = {
  professional: 3,
  agency: 10,
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [profile, setProfile] = useState<CurrentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profileData }, { data: membersData }] = await Promise.all([
      supabase.from('profiles').select('plan, email').eq('id', user.id).single(),
      supabase.from('team_members').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    ])

    setProfile(profileData)
    setMembers((membersData || []) as TeamMember[])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const canInviteTeam = profile?.plan === 'professional' || profile?.plan === 'agency'
  const planKey = profile?.plan || 'free'
  const seatLimit = PLAN_SEAT_LIMITS[planKey] || 0
  const activeSeats = members.filter(m => m.status === 'active').length
  const atLimit = activeSeats >= seatLimit

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setMessage(null)

    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    })

    const data = await res.json()

    if (res.ok) {
      setMessage({ type: 'success', text: `Invite sent to ${inviteEmail}!` })
      setInviteEmail('')
      loadData()
    } else {
      setMessage({ type: 'error', text: data.error || 'Failed to send invite.' })
    }
    setInviting(false)
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId)
    await fetch('/api/team/invite', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    loadData()
    setRemovingId(null)
  }

  if (loading) return <div className="animate-pulse p-20 text-center text-[var(--zynthsecure-text)]">Loading team settings...</div>

  return (
    <div className="max-w-3xl animate-fade-up">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-[var(--zynthsecure-text)] hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Settings
      </Link>

      <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker"><span>Team</span></div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white">Team Seats</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--zynthsecure-text)]">
          Invite team members to collaborate on your workspace. Admins can manage scans; viewers can read reports.
        </p>
      </div>

      {!canInviteTeam ? (
        <div className="marketing-panel p-8 border-l-4 border-l-orange-500 bg-orange-500/5 relative overflow-hidden mb-6">
          <div className="absolute top-4 right-4 opacity-10"><Lock size={64} /></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Pro or Agency Plan Required</h3>
              <p className="text-sm text-[var(--zynthsecure-text)] leading-relaxed mb-4">
                Team seats are available on Pro (3 seats) and Agency (10 seats) plans. Upgrade to start collaborating.
              </p>
              <Link href="/dashboard/settings/billing" className="btn-primary px-6 py-2.5 text-sm inline-flex">
                Upgrade Plan →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Seat Usage Banner */}
          <div className="marketing-panel p-5 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--zynthsecure-green)]/10 flex items-center justify-center text-[var(--zynthsecure-green)]">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{activeSeats} of {seatLimit} seats used</p>
                <p className="text-[11px] text-[var(--zynthsecure-text)]">{planKey.charAt(0).toUpperCase() + planKey.slice(1)} plan</p>
              </div>
            </div>
            <div className="flex-1 max-w-[200px] bg-white/5 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (activeSeats / seatLimit) * 100)}%`,
                  background: activeSeats >= seatLimit ? '#ff4444' : 'var(--zynthsecure-green)',
                }}
              />
            </div>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="marketing-panel p-8 mb-6">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <UserPlus size={18} className="text-[var(--zynthsecure-green)]" /> Invite a team member
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  disabled={atLimit}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all bg-[#060b14] border border-white/10 text-white focus:border-[var(--zynthsecure-green)]/50 placeholder:text-white/20 disabled:opacity-40"
                />
              </div>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as 'admin' | 'viewer')}
                disabled={atLimit}
                className="px-4 py-3 rounded-xl text-sm bg-[#060b14] border border-white/10 text-white outline-none focus:border-[var(--zynthsecure-green)]/50 disabled:opacity-40"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviting || atLimit || !inviteEmail.trim()}
                className="btn-primary px-6 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap disabled:opacity-40"
              >
                {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
            {atLimit && (
              <p className="text-[11px] text-orange-400 mt-3 flex items-center gap-1">
                <AlertTriangle size={12} /> Seat limit reached. Upgrade to Agency to add more members.
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-[var(--zynthsecure-text)]">
              <div className="flex items-start gap-2 bg-white/3 rounded-lg p-3 border border-white/5">
                <Eye size={12} className="mt-0.5 text-blue-400" />
                <div><strong className="text-white">Viewer</strong> — Can see all scans and reports. Cannot modify anything.</div>
              </div>
              <div className="flex items-start gap-2 bg-white/3 rounded-lg p-3 border border-white/5">
                <ShieldCheck size={12} className="mt-0.5 text-[var(--zynthsecure-green)]" />
                <div><strong className="text-white">Admin</strong> — Full access including starting new scans and managing findings.</div>
              </div>
            </div>
          </form>
        </>
      )}

      {/* Status message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium mb-6 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* Member List */}
      {members.length > 0 && (
        <div className="marketing-panel p-8">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <Users size={18} className="text-[var(--zynthsecure-green)]" /> {members.length} {members.length === 1 ? 'member' : 'members'}
          </h3>
          <div className="space-y-3">
            {/* Owner row */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--zynthsecure-green)]/5 border border-[var(--zynthsecure-green)]/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--zynthsecure-green)]/10 flex items-center justify-center text-[var(--zynthsecure-green)]">
                  <Crown size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{profile?.email}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--zynthsecure-green)]">Owner</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-[var(--zynthsecure-green)]/10 text-[var(--zynthsecure-green)] border border-[var(--zynthsecure-green)]/20">Active</span>
            </div>

            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/8">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${member.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {member.role === 'admin' ? <ShieldCheck size={16} /> : <Eye size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.invited_email}</p>
                    <p className="text-[10px] text-[var(--zynthsecure-text)] uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${member.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {member.status}
                  </span>
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                    title="Remove member"
                  >
                    {removingId === member.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
