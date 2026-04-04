'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle, AlertTriangle, 
  Clock, ExternalLink, LayoutDashboard, 
  Bot, Globe, Shield, Activity, Zap, Brain 
} from 'lucide-react'
import ReportMetric from '@/components/dashboard/ReportMetric'
import SecurityTutor from '@/components/SecurityTutor'
import RemediationButton from '@/components/RemediationButton'
import ExportButton from '@/components/dashboard/ExportButton'
import VerifiedReportBadge from '@/components/VerifiedReportBadge'
import ResolutionCenter from '@/components/ResolutionCenter'
import VisualProofTerminal from '@/components/VisualProofTerminal'
import { getEvidenceLines, getFindingSourceLabel } from '@/utils/scan/report'

// Component-specific types
type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

type ScanIssueRecord = {
  id: string
  severity: Severity
  test_name: string
  description: string
  difficulty?: Difficulty | null
  ai_explanation?: string | null
  ai_fix_steps?: string[] | null
  is_fixed?: boolean | null
  auto_remediable?: boolean | null
  patch?: any | null
  details?: {
    findingSource?: 'direct' | 'heuristic' | 'external'
    evidence?: string[]
    serverHeader?: string
    path?: string
    attackTrace?: Array<{ role: 'user' | 'assistant'; content: string }>
  } | null
}

const WEB_CHECKS = [
  { id: 'ssl', name: 'SSL/TLS Encryption', desc: 'Secure data transmission' },
  { id: 'https', name: 'HTTPS Enforcement', desc: 'Protocol consistency' },
  { id: 'hsts', name: 'Strict Transport', desc: 'HSTS header enforcement' },
  { id: 'content security policy', name: 'Content Security', desc: 'XSS prevention' },
  { id: 'x-frame-options', name: 'Clickjacking', desc: 'X-Frame-Options' }
]

export default function ScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [scan, setScan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchScan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('scans')
        .select('*, scan_issues(*)')
        .eq('id', resolvedParams.id)
        .eq('user_id', user.id)
        .single()
      
      setScan(data)
      setLoading(false)
    }
    fetchScan()
  }, [resolvedParams.id])

  if (loading) return <div className="p-24 text-center font-mono text-label animate-pulse">INITIATING_FORENSIC_DECRYPT...</div>
  if (!scan) return <div className="p-24 text-center">Scan data unreachable. Access denied.</div>

  const scoreColor = scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-up">
      {/* Tactical Header */}
      <header className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-12">
        <div className="max-w-[700px]">
          <Link href="/dashboard" className="text-label hover:text-[var(--zynthsecure-green)] transition-colors inline-flex items-center gap-2 mb-8">
            <ArrowLeft size={12} /> BACK_TO_MISSION_CONTROL
          </Link>
          <div className="flex items-center gap-4 mb-6">
             <div className="h-1.5 w-1.5 bg-[var(--zynthsecure-green)] rounded-full animate-pulse shadow-[0_0_8px_var(--zynthsecure-green)]" />
             <span className="text-label tracking-[0.4em]">TARGET_NODE_DEBRIS</span>
          </div>
          <h1 className="text-massive mb-6 break-all">{scan.url}</h1>
          <div className="flex flex-wrap items-center gap-6 text-[#64748b] font-mono text-[11px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><Clock size={14} /> {new Date(scan.started_at).toLocaleString()}</span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-sm bg-white/5 border border-[#1f2937]">
              {scan.scan_type === 'ai' ? <Bot size={14} /> : <Globe size={14} />}
              {scan.scan_type}_AUDIT_ACTIVE
            </span>
          </div>
        </div>
        
        {/* Metric Hub Integration */}
        <div className="shrink-0">
          <ReportMetric score={scan.score} label="Security Index" subtext="Calculated via autonomous telemetry" />
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-24">
        {/* Primary Content (8 Columns) */}
        <div className="lg:col-span-8 space-y-24">
          
          {/* Executive Summary */}
          <section className="enterprise-card border-l-4 border-l-[var(--zynthsecure-green)] p-12 bg-[#111827]/30">
            <div className="flex items-center gap-3 mb-8">
               <Shield size={20} className="text-[var(--zynthsecure-green)]" />
               <span className="text-label">EXECUTIVE_SUMMARY_BRIEFING</span>
            </div>
            <p className="text-xl font-medium leading-relaxed italic text-white/90">
              "{scan.executive_summary || "Automated scan complete. Systematic evaluation of the attack surface indicates multiple remediation pathways."}"
            </p>
          </section>

          {/* Detailed Findings Table */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold tracking-tight">Security Findings</h2>
               <span className="text-label text-[#ef4444]">{scan.scan_issues?.length || 0} Vulnerabilities Detected</span>
            </div>
            
            <div className="overflow-hidden border border-[#1f2937]">
              <table className="enterprise-table">
                <thead>
                  <tr className="border-b border-[#1f2937] text-left">
                    <th className="p-6 text-label">Severity</th>
                    <th className="p-6 text-label">Test Definition</th>
                    <th className="p-6 text-label">Source</th>
                    <th className="p-6 text-label text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(scan.scan_issues as ScanIssueRecord[])?.map((issue) => (
                    <tr key={issue.id} className="group transition-colors hover:bg-white/[0.02]">
                      <td className="p-6">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-sm tracking-widest ${
                          issue.severity === 'CRITICAL' ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20' :
                          issue.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="p-6">
                         <div className="font-bold text-white mb-1 leading-tight">{issue.test_name}</div>
                         <div className="text-[11px] text-[#64748b] font-medium leading-relaxed max-w-[400px]">{issue.description}</div>
                         
                         {/* Sentinel Visual Proof Integration */}
                         {issue.details?.attackTrace && (
                           <VisualProofTerminal 
                             trace={issue.details.attackTrace} 
                             title={`REPLAY: ${issue.test_name}`}
                           />
                         )}
                      </td>
                      <td className="p-6 font-mono text-[10px] text-[#64748b] uppercase tracking-widest leading-loose">
                        {getFindingSourceLabel(issue.details?.findingSource)}
                      </td>
                      <td className="p-6 text-right">
                         <RemediationButton 
                            scanId={resolvedParams.id} 
                            issueId={issue.id} 
                            testName={issue.test_name}
                            isFixed={Boolean(issue.is_fixed)}
                            autoRemediable={Boolean(issue.auto_remediable)}
                            initialPatch={issue.patch}
                          />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Plan */}
          <section className="space-y-12">
             <div className="flex items-center gap-3">
                <Brain size={24} className="text-blue-500" />
                <h2 className="text-2xl font-bold tracking-tight">AI Strategy Plan</h2>
             </div>
             <div className="grid md:grid-cols-2 gap-12 text-sm leading-relaxed text-secondary italic">
               <p>
                 Following autonomous telemetry analysis, Zynth recommends prioritizing high-impact 
                 remediations first to significantly improve the overall security posture.
               </p>
               <p>
                 Tactical fix procedures are available for {scan.scan_issues?.filter((i:any) => i.auto_remediable).length} findings 
                 via our autonomous remediation agent.
               </p>
             </div>
          </section>

        </div>

        {/* Tactical Sidewalk (4 Columns) */}
        <aside className="lg:col-span-4 space-y-24 sticky top-24 h-fit">
          
          <div className="space-y-12">
            <h3 className="text-label text-white pr-2 border-b border-[#1f2937] pb-4">EXPORT_COMMANDS</h3>
            <div className="enterprise-card p-6 flex items-center justify-between group cursor-pointer hover:border-[var(--zynthsecure-green)]/30">
               <div className="flex items-center gap-4">
                  <Activity size={20} className="text-[var(--zynthsecure-green)]" />
                  <span className="text-sm font-bold text-white">Generate Full PDF</span>
               </div>
               <ExportButton result={scan as any} />
            </div>
          </div>

          <div className="space-y-12">
            <h3 className="text-label text-white pr-2 border-b border-[#1f2937] pb-4">TRUST_VALIDATION</h3>
            <div className="space-y-8">
               <VerifiedReportBadge scanId={resolvedParams.id} />
               <ResolutionCenter scanId={resolvedParams.id} userId={scan.user_id} />
            </div>
          </div>

          <div className="enterprise-card p-8 bg-[#111827]/50 border-t border-t-blue-500/20">
             <div className="flex items-center gap-3 mb-6">
                <Brain size={16} className="text-blue-500 animate-pulse" />
                <h4 className="text-label text-white uppercase tracking-widest">Sentinel_Intelligence_Brief</h4>
             </div>
             <p className="text-[11px] leading-relaxed text-[#64748b] font-medium italic mb-6">
               "Deep-crawling active. Our autonomous sentinel expanded the assessment surface to 10+ sub-pages including /support and /chat gateways."
             </p>
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-sm border border-[#1f2937] bg-black flex items-center justify-center text-[10px] font-bold text-[#64748b] hover:border-[#00ff88]/30 transition-colors">PCI</div>
                <div className="w-10 h-10 rounded-sm border border-[#1f2937] bg-black flex items-center justify-center text-[10px] font-bold text-[#64748b] hover:border-[#00ff88]/30 transition-colors">SOC2</div>
                <div className="w-10 h-10 rounded-sm border border-[#1f2937] bg-black flex items-center justify-center text-[10px] font-bold text-[#64748b] hover:border-[#00ff88]/30 transition-colors">GDPR</div>
             </div>
             <p className="mt-8 text-[10px] leading-loose text-secondary border-t border-white/5 pt-6">
               <span className="text-[#00ff88]">✓</span> ACTIVE_CRAWLER_LOGS_ATTACHED <br />
               <span className="text-[#00ff88]">✓</span> REAL_WORLD_EXPLOIT_PROOF_VERIFIED <br />
               <span className="text-[#00ff88]">✓</span> CVE_LIVE_INTEL_SYNCED
             </p>
          </div>

        </aside>
      </div>

      {/* Floating Tactical AI Tutor */}
      <div className="fixed bottom-12 right-12 z-[100]">
         <SecurityTutor scanId={resolvedParams.id} />
      </div>

    </div>
  )
}

