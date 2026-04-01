import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Severity } from '@/types'
import { ShieldCheck, Calendar, ArrowRight } from 'lucide-react'
import { TableSkeleton } from '@/components/dashboard/skeletons'

type HistoryScan = {
  id: string
  url: string
  score: number
  started_at: string
  scan_issues: Array<{ severity: Severity }>
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="animate-fade-up max-w-5xl mx-auto">
      <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker">
          <span>History</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">Scan history</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--zynth-text)]">
          Review previous scans, compare scores over time, and reopen any report that still needs action.
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <AuditHistoryTable userId={user.id} />
      </Suspense>
    </div>
  )
}

async function AuditHistoryTable({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { data: scans } = await supabase
    .from('scans')
    .select(`
      id, 
      url, 
      score, 
      started_at, 
      scan_issues(severity)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  const historyScans = (scans ?? []) as unknown as HistoryScan[]

  if (historyScans.length === 0) {
    return (
      <div className="marketing-panel p-12 text-center text-[var(--zynth-text)]">
        <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
        <p className="font-medium text-white mb-1">No scan history yet</p>
        <p className="text-sm mb-4">Run your first scan to generate a score, findings, and remediation guidance.</p>
        <Link href="/dashboard/scan" className="btn-primary px-6 py-2">Run Scan</Link>
      </div>
    )
  }

  return (
    <div className="marketing-panel overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[var(--zynth-text)] bg-white/5">
            <th className="p-4 font-bold">Target URL</th>
            <th className="p-4 font-bold">Date</th>
            <th className="p-4 font-bold">Score</th>
            <th className="p-4 font-bold">Open Criticals</th>
            <th className="p-4 font-bold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {historyScans.map((scan) => {
            const date = new Date(scan.started_at)
            const criticalCount = scan.scan_issues.filter((issue) => issue.severity === 'CRITICAL').length
            const scoreColor = scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#ffd700' : '#ff4444'

            return (
              <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4 font-bold text-white">{scan.url}</td>
                <td className="p-4 text-sm text-[var(--zynth-text)]">
                   <div className="flex items-center gap-2"><Calendar size={14} /> {date.toLocaleDateString()}</div>
                </td>
                <td className="p-4 font-black" style={{ color: scoreColor }}>
                  {scan.score}<span className="text-xs text-[var(--zynth-text)] font-semibold">/100</span>
                </td>
                <td className="p-4">
                  {criticalCount > 0 ? (
                    <span className="bg-red-500/10 text-red-500 font-bold px-2 py-1 rounded text-xs">
                      {criticalCount}
                    </span>
                  ) : (
                    <span className="text-[var(--zynth-text)] text-sm">—</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/dashboard/scan/${scan.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#00ff88] hover:text-white transition-colors">
                    View <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
