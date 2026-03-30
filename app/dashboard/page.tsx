import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { Plus, AlertTriangle, ShieldCheck, Activity, Search, ChevronRight } from 'lucide-react'
import { StatsSkeleton, ScanFeedSkeleton, AIPrioritySkeleton } from '@/components/dashboard/skeletons'

export default async function DashboardOverview() {
  return (
    <div className="animate-fade-up">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Security Dashboard</h1>
          <p className="text-sm text-[var(--zynth-text)]">Overview of your web properties and recent scans.</p>
        </div>
        <Link href="/dashboard/scan" className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> New Scan
        </Link>
      </header>

      {/* Top Stats Grid - Suspended */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsDataGrid />
      </Suspense>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Scans Feed - Suspended */}
        <div className="lg:col-span-2">
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

  const latestScan = scans && scans.length > 0 ? scans[0] : null
  const scoreColor = latestScan ? (latestScan.score >= 80 ? '#00ff88' : latestScan.score >= 50 ? '#ffd700' : '#ff4444') : '#94a3b8'
  const criticalCount = latestScan?.scan_issues?.filter((i: any) => i.severity === 'CRITICAL' && !i.is_fixed).length || 0

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="card p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-[var(--zynth-text)]">Latest Score</div>
          <div className="text-4xl font-black" style={{ color: scoreColor }}>
            {latestScan ? latestScan.score : '--'}<span className="text-lg">/100</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${scoreColor}15`, color: scoreColor }}>
          <Activity size={24} />
        </div>
      </div>

      <div className="card p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-[var(--zynth-text)]">Critical Issues</div>
          <div className="text-4xl font-black text-white" style={{ color: criticalCount > 0 ? '#ff4444' : '#00ff88' }}>
            {criticalCount}
          </div>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="card p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold mb-1 uppercase tracking-wider text-[var(--zynth-text)]">Total Scans</div>
          <ScanCountBadge userId={user!.id} />
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-400">
          <ShieldCheck size={24} />
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
  
  return <div className="text-4xl font-black text-white">{count || 0}</div>
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

  const hasScans = recentScans && recentScans.length > 0

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Recent Scans</h2>
      {!hasScans ? (
        <div className="card p-12 text-center border-dashed">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-[var(--zynth-text)]">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">No scans yet</h3>
          <p className="text-sm mb-6 max-w-sm mx-auto text-[var(--zynth-text)]">
            You haven't run any security scans. Start by scanning your first domain.
          </p>
          <Link href="/dashboard/scan" className="btn-primary inline-flex items-center gap-2 px-6 py-2">
            Run First Scan
          </Link>
        </div>
      ) : (
        recentScans.map((scan) => (
          <div key={scan.id} className="card p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full font-black flex items-center justify-center text-lg" 
                  style={{ 
                    background: scan.score >= 80 ? 'rgba(0,255,136,0.1)' : scan.score >= 50 ? 'rgba(255,215,0,0.1)' : 'rgba(255,68,68,0.1)',
                    color: scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#ffd700' : '#ff4444',
                    border: `1px solid ${scan.score >= 80 ? 'rgba(0,255,136,0.2)' : scan.score >= 50 ? 'rgba(255,215,0,0.2)' : 'rgba(255,68,68,0.2)'}`
                  }}>
                  {scan.score}
                </div>
                <div>
                  <div className="font-bold">{scan.url}</div>
                  <div className="text-xs text-[var(--zynth-text)]">
                    {new Date(scan.started_at).toLocaleString()} • {scan.scan_issues.length} total issues
                  </div>
                </div>
              </div>
              <Link href={`/dashboard/scan/${scan.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                View Report
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {scan.scan_issues.slice(0, 3).map((issue: any) => (
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">AI Priority Guide</h2>
      <div className="card p-6" style={{ background: 'rgba(0,255,136,0.02)' }}>
        {!latestScan ? (
          <p className="text-sm italic text-[var(--zynth-text)]">Run a scan to get AI-prioritized fix instructions.</p>
        ) : (
          <div>
            <p className="text-sm whitespace-pre-line leading-relaxed text-[var(--zynth-text)]">
              {latestScan.ai_priority || "All critical issues have been resolved. Excellent work maintaining your security posture."}
            </p>
            {latestScan.ai_priority && (
              <Link href={`/dashboard/scan/${latestScan.id}`} className="mt-4 text-xs font-bold flex items-center gap-1 hover:underline text-[var(--zynth-green)]">
                Read step-by-step fix guides <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
