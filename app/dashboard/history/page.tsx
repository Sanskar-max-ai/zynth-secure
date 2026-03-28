import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Calendar, ArrowRight } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: scans } = await supabase
    .from('scans')
    .select('id, url, score, started_at, scan_issues!inner(severity)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  return (
    <div className="animate-fade-up max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Audit History</h1>
        <p style={{ color: 'var(--shield-text)' }}>
          A complete log of all security audits performed on your account.
        </p>
      </div>

      <div className="card overflow-hidden">
        {(!scans || scans.length === 0) ? (
          <div className="p-12 text-center text-[var(--shield-text)]">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium text-white mb-1">No audit history available</p>
            <p className="text-sm mb-4">Run your first audit to generate a report.</p>
            <Link href="/dashboard/scan" className="btn-primary px-6 py-2">Run New Audit</Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[var(--shield-text)] bg-white/5">
                <th className="p-4 font-bold">Target URL</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Score</th>
                <th className="p-4 font-bold">Critical Issues</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {scans.map((scan) => {
                const date = new Date(scan.started_at)
                const criticalCount = scan.scan_issues.filter((i: any) => i.severity === 'CRITICAL').length
                const scoreColor = scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#ffd700' : '#ff4444'

                return (
                  <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 font-bold text-white">{scan.url}</td>
                    <td className="p-4 text-sm text-[var(--shield-text)] flex items-center gap-2">
                       <Calendar size={14} /> {date.toLocaleDateString()}
                    </td>
                    <td className="p-4 font-black" style={{ color: scoreColor }}>
                      {scan.score}<span className="text-xs text-[var(--shield-text)] font-semibold">/100</span>
                    </td>
                    <td className="p-4">
                      {criticalCount > 0 ? (
                        <span className="bg-red-500/10 text-red-500 font-bold px-2 py-1 rounded text-xs">
                          {criticalCount}
                        </span>
                      ) : (
                        <span className="text-[var(--shield-text)] text-sm">—</span>
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
        )}
      </div>
    </div>
  )
}
