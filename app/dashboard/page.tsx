import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Severity } from '@/types'
import { Plus, AlertTriangle, ShieldCheck, Activity, Search, ChevronRight, Shield, Bell, Brain } from 'lucide-react'
import MonitorToggle from '@/components/MonitorToggle'
import { StatsSkeleton, ScanFeedSkeleton, AIPrioritySkeleton, Shimmer } from '@/components/dashboard/skeletons'

type ScanIssueSummary = {
  id: string
  test_name: string
  severity: Severity
  is_fixed?: boolean
}

type LatestScanSummary = {
  score: number
  scan_issues: Pick<ScanIssueSummary, 'severity' | 'is_fixed'>[]
}

type RecentScanSummary = {
  id: string
  url: string
  score: number
  started_at: string
  scan_issues: ScanIssueSummary[]
}

type ProtectedDomain = {
  id: string
  monitoring_enabled: boolean
}

type LatestPriorityScan = {
  id: string
  ai_priority: string | null
}

export default async function DashboardOverview() {
  return (
    <div className="animate-fade-up">
      <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_22px_60px_rgba(0,0,0,0.2)] md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="section-kicker">
            <span>Dashboard</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">Security overview</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--zynthsecure-text)] md:text-base">
            Review your latest score, recent scans, monitored domains, and the next issues worth fixing.
          </p>
        </div>
        <Link href="/dashboard/scan" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
          <Plus size={18} /> Start Scan
        </Link>
      </header>

      {/* Top Stats Grid - Suspended */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsDataGrid />
      </Suspense>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Scans Feed - Suspended */}
        <div className="lg:col-span-2 space-y-8">
          <Suspense fallback={<div className="h-48 card"><Shimmer className="h-full" /></div>}>
            <ProtectedDomainsSub />
          </Suspense>

          <Suspense fallback={<ScanFeedSkeleton />}>
            <RecentScansFeed />
          </Suspense>
        </div>

        {/* Priority AI Action Feed - Suspended */}
        <div>
          <Suspense fallback={<AIPrioritySkeleton />}>
            <AIPriorityGuide />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function StatsDataGrid() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: scans } = await supabase
    .from('scans')
    .select('score, scan_issues(severity, is_fixed)')
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })
    .limit(1)

  const latestScan = (scans?.[0] ?? null) as LatestScanSummary | null
  const scoreColor = latestScan ? (latestScan.score >= 80 ? '#00ff88' : latestScan.score >= 50 ? '#ffd700' : '#ff4444') : '#94a3b8'
  const criticalCount = latestScan?.scan_issues?.filter((issue) => issue.severity === 'CRITICAL' && !issue.is_fixed).length || 0

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      <div className="marketing-card p-8 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-[var(--zynthsecure-text)] opacity-70">Latest Score</div>
          <div className="text-5xl font-black" style={{ color: scoreColor }}>
            {latestScan ? latestScan.score : '--'}<span className="text-xl opacity-40">/100</span>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5" style={{ background: `${scoreColor}10`, color: scoreColor }}>
          <Activity size={28} />
        </div>
      </div>

      <div className="marketing-card p-8 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-[var(--zynthsecure-text)] opacity-70">Open Critical Issues</div>
          <div className="text-5xl font-black" style={{ color: criticalCount > 0 ? '#ff4444' : '#00ff88' }}>
            {criticalCount}
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5 bg-red-500/10 text-red-500">
          <AlertTriangle size={28} />
        </div>
      </div>

      <div className="marketing-card p-8 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black mb-2 uppercase tracking-[0.2em] text-[var(--zynthsecure-text)] opacity-70">Total Scans</div>
          <ScanCountBadge userId={user!.id} />
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/5 bg-blue-500/10 text-blue-400">
          <ShieldCheck size={28} />
        </div>
      </div>
    </div>
  )
}

async function ScanCountBadge({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  return <div className="text-5xl font-black text-white">{count || 0}</div>
}

async function RecentScansFeed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: recentScans } = await supabase
    .from('scans')
    .select('id, url, score, started_at, scan_issues(id, test_name, severity)')
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })
    .limit(3)

  const scans = (recentScans ?? []) as unknown as RecentScanSummary[]
  const hasScans = scans.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-white">Recent scans</h2>
        <Link href="/dashboard/history" className="pill-link text-xs font-semibold uppercase tracking-[0.14em]">
          View all
        </Link>
      </div>
      {!hasScans ? (
        <div className="marketing-panel p-16 text-center border-dashed border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-[var(--zynthsecure-text)]">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold mb-3">No scans yet</h3>
          <p className="text-sm mb-8 max-w-sm mx-auto text-[var(--zynthsecure-text)]">
            Run your first scan to generate a baseline report, issue list, and remediation summary.
          </p>
          <Link href="/dashboard/scan" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Start your first scan
          </Link>
        </div>
      ) : (
        scans.map((scan) => (
          <div key={scan.id} className="marketing-card group p-6 transition-all hover:border-[var(--zynthsecure-green)]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl font-black flex items-center justify-center text-xl shadow-lg" 
                  style={{ 
                    background: scan.score >= 80 ? 'rgba(0,255,136,0.1)' : scan.score >= 50 ? 'rgba(255,215,0,0.1)' : 'rgba(255,68,68,0.1)',
                    color: scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#ffd700' : '#ff4444',
                    border: `1px solid ${scan.score >= 80 ? 'rgba(0,255,136,0.2)' : scan.score >= 50 ? 'rgba(255,215,0,0.2)' : 'rgba(255,68,68,0.2)'}`
                  }}>
                  {scan.score}
                </div>
                <div>
                  <div className="font-bold text-lg group-hover:text-[var(--zynthsecure-green)] transition-colors">{scan.url}</div>
                  <div className="text-xs text-[var(--zynthsecure-text)]">
                    {new Date(scan.started_at).toLocaleString()} | {scan.scan_issues.length} findings recorded
                  </div>
                </div>
              </div>
              <Link href={`/dashboard/scan/${scan.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                View Report
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {scan.scan_issues.slice(0, 3).map((issue) => (
                <span key={issue.id} className={`badge-${issue.severity.toLowerCase()} text-[10px] font-bold px-2 py-0.5 rounded uppercase`}>
                  {issue.test_name}
                </span>
              ))}
              {scan.scan_issues.length > 3 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-white">
                  +{scan.scan_issues.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

async function ProtectedDomainsSub() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const protectedDomains = (domains ?? []) as unknown as ProtectedDomain[]

  if (protectedDomains.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="text-[#00ff88]" size={24} /> Monitored domains
        </h2>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff88] bg-[#00ff88]/10 px-3 py-1.5 rounded border border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">Monitoring Enabled</span>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {protectedDomains.map((domain) => (
          <MonitorToggle 
            key={domain.id} 
            domainId={domain.id} 
            initialStatus={domain.monitoring_enabled} 
          />
        ))}
      </div>

      <div className="marketing-panel flex items-center gap-4 p-5 shadow-inner">
        <div className="p-3 rounded-xl bg-red-400/10 text-red-400">
           <Bell size={20} />
        </div>
        <div>
           <p className="text-sm font-bold text-white">Recurring monitoring is active</p>
           <p className="text-[11px] text-[var(--zynthsecure-text)] leading-relaxed">Monitored domains are rescanned on a schedule so score drops and new findings are easier to catch.</p>
        </div>
      </div>
    </div>
  )
}

async function AIPriorityGuide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: latestScan } = await supabase
    .from('scans')
    .select('id, ai_priority')
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  const priorityScan = latestScan as LatestPriorityScan | null

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-[-0.03em] text-white">Priority summary</h2>
      <div className="marketing-panel p-8 group relative overflow-hidden" style={{ background: 'rgba(0,255,136,0.05)' }}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
           <Brain size={64} />
        </div>
        {!priorityScan ? (
          <p className="text-sm italic text-[var(--zynthsecure-text)]">Run a scan to generate the next priority summary for your workspace.</p>
        ) : (
          <div className="relative z-10">
            <p className="text-sm whitespace-pre-line leading-relaxed text-white/90">
              {priorityScan.ai_priority || "No critical issues are currently being elevated by the latest scan. Review the report for medium and low priority follow-up work."}
            </p>
            {priorityScan.ai_priority && (
              <Link href={`/dashboard/scan/${priorityScan.id}`} className="mt-6 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors text-[var(--zynthsecure-green)]">
                Open Report <ChevronRight size={16} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
