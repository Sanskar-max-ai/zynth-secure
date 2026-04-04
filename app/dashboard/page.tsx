import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Severity } from '@/types'
import { Plus, AlertTriangle, ShieldCheck, Activity, Search, ChevronRight, Shield, Bell, Brain, History, CheckCircle } from 'lucide-react'
import MonitorToggle from '@/components/MonitorToggle'
import { StatsSkeleton, ScanFeedSkeleton, AIPrioritySkeleton, Shimmer } from '@/components/dashboard/skeletons'
import { FadeIn, ScanLine, BrainPulse, GlowCard } from '@/components/dashboard/VisualAesthetics'
import NexusOverview from '@/components/dashboard/NexusOverview'
import AgentStatusFeed from '@/components/dashboard/AgentStatusFeed'

type ScanIssueSummary = {
  id: string
  test_name: string
  severity: Severity
  is_fixed?: boolean
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
      <header className="mb-24 flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[700px]">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-1 w-1 bg-[var(--zynthsecure-green)] rounded-full animate-pulse shadow-[0_0_8px_var(--zynthsecure-green)]" />
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#64748b]">DASHBOARD</span>
          </div>
          <h1 className="text-massive mb-4">Security Overview</h1>
          <p className="text-secondary leading-relaxed">
            Review your latest score, recent scans, monitored domains, and the next issues worth fixing. Professional grade autonomous security monitoring active.
          </p>
        </div>
        <Link href="/dashboard/scan" className="btn-enterprise-primary">
          <Plus size={18} className="mr-3" strokeWidth={3} /> 
          Start Scan
        </Link>
      </header>

      {/* Main Command Grid */}
      <div className="space-y-24">
        
        {/* Metric Row: Massive numbers, minimal cards */}
        <section>
          <Suspense fallback={<StatsSkeleton />}>
            <NexusOverviewDataLoader />
          </Suspense>
        </section>

        <div className="grid lg:grid-cols-12 gap-24">
          {/* Left Column: Activity & Scans (8 cols) */}
          <div className="lg:col-span-8 space-y-24">
            <Suspense fallback={<div className="h-48" />}>
              <FadeIn delay={0.2}>
                <AgentStatusFeed />
              </FadeIn>
            </Suspense>

            <Suspense fallback={<ScanFeedSkeleton />}>
              <FadeIn delay={0.4}>
                <RecentScansFeed />
              </FadeIn>
            </Suspense>

            <Suspense fallback={<div className="h-48" />}>
              <ProtectedDomainsSub />
            </Suspense>
          </div>

          {/* Right Column: Intelligence & Secondary (4 cols) */}
          <div className="lg:col-span-4 space-y-24">
            <Suspense fallback={<AIPrioritySkeleton />}>
              <FadeIn delay={0.6}>
                <AIPriorityGuide />
              </FadeIn>
            </Suspense>

            <Suspense fallback={<div className="h-48" />}>
              <FadeIn delay={0.8}>
                 <GitHubActivityFeed />
              </FadeIn>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

async function NexusOverviewDataLoader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: scans } = await supabase
    .from('scans')
    .select('score, scan_issues(severity, is_fixed)')
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })

  const { count } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const latestScan = scans?.[0]
  const totalIssues = scans?.reduce((acc, s) => acc + (s.scan_issues?.filter(i => i.severity === 'CRITICAL' && !i.is_fixed).length || 0), 0) || 0

  return (
    <NexusOverview 
      score={latestScan?.score || 100} 
      totalIssues={totalIssues}
      scansCount={count || 0}
    />
  )
}

async function RecentScansFeed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: recentScans } = await supabase
    .from('scans')
    .select('id, url, score, started_at, scan_issues(id, test_name, severity)')
    .eq('user_id', user!.id)
    .order('started_at', { ascending: false })
    .limit(5)

  const scans = (recentScans ?? []) as unknown as RecentScanSummary[]

  if (scans.length === 0) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Scans</h2>
        <Link href="/dashboard/history" className="text-label hover:text-[var(--zynthsecure-green)] transition-colors">
          View All Scans &rarr;
        </Link>
      </div>
      
      <div className="overflow-hidden border border-[#1f2937]">
        <table className="enterprise-table">
          <thead>
            <tr className="border-b border-[#1f2937] text-left">
              <th className="p-4 text-label">Score</th>
              <th className="p-4 text-label">Target URL</th>
              <th className="p-4 text-label">Timestamp</th>
              <th className="p-4 text-label text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="group transition-colors hover:bg-white/[0.02]">
                <td className="p-4">
                  <span className={`font-mono font-bold ${scan.score >= 80 ? 'text-[var(--zynthsecure-green)]' : scan.score >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                    {scan.score}
                  </span>
                </td>
                <td className="p-4 font-bold text-white tracking-tight">{scan.url}</td>
                <td className="p-4 text-[#64748b] font-mono">{new Date(scan.started_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <Link href={`/dashboard/scan/${scan.id}`} className="text-[var(--zynthsecure-green)] text-xs font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                    View Report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Active Monitors</h2>
        <div className="flex items-center gap-2">
           <div className="h-1.5 w-1.5 rounded-full bg-[var(--zynthsecure-green)] animate-pulse" />
           <span className="text-label">Live_Security_Signal</span>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6">
        {protectedDomains.map((domain) => (
          <div key={domain.id} className="enterprise-card flex items-center justify-between p-6">
             <div className="min-w-0">
                <div className="text-xs text-[#64748b] font-bold uppercase tracking-widest mb-1">Protected_Node</div>
                <div className="text-sm font-bold text-white truncate">{domain.id}</div>
             </div>
             <MonitorToggle 
                domainId={domain.id} 
                initialStatus={domain.monitoring_enabled} 
              />
          </div>
        ))}
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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Strategic Intelligence</h2>
      <div className="enterprise-card border-l-4 border-l-blue-500 bg-[#111827]/30 p-8 space-y-6">
        <div className="flex items-center gap-3">
           <Brain size={20} className="text-blue-500" />
           <span className="text-label text-blue-500/80">AI_THREAT_EVALUATION</span>
        </div>
        
        {!priorityScan ? (
           <p className="text-sm text-[#64748b] leading-relaxed italic">Awaiting telemetry from initial audit stream.</p>
        ) : (
          <>
            <p className="text-sm text-white/90 leading-relaxed font-medium italic border-l border-white/10 pl-4 py-1">
              "{priorityScan.ai_priority || "Autonomous evaluation complete. Maintain standard security baseline across all protected nodes."}"
            </p>
            {priorityScan.ai_priority && (
              <Link href={`/dashboard/scan/${priorityScan.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                Initiate Remediation Protocols <ChevronRight size={14} />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

async function GitHubActivityFeed() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Ecosystem Guard</h2>
      <div className="enterprise-card border-dashed p-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-sm border border-[#1f2937] flex items-center justify-center mx-auto text-[#64748b]">
           <Plus size={20} />
        </div>
        <div>
           <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Connect Repository</h3>
           <p className="text-xs text-[#64748b] leading-relaxed max-w-[200px] mx-auto">
             Enable zero-trust code scanning for your enterprise repositories.
           </p>
        </div>
        <button className="btn-enterprise-primary !h-10 !px-6 !text-[10px]">
          Authorize GitHub
        </button>
      </div>
    </div>
  )
}
