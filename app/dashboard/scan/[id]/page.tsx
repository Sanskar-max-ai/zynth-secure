import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Severity } from '@/types'
import { ArrowLeft, CheckCircle, AlertTriangle, Info, Clock, ExternalLink, LayoutDashboard, Bot, Globe } from 'lucide-react'
import { Shimmer } from '@/components/dashboard/skeletons'
import VerifiedReportBadge from '@/components/VerifiedReportBadge'
import ResolutionCenter from '@/components/ResolutionCenter'
import SecurityTutor from '@/components/SecurityTutor'
import DownloadPdfButton from '@/components/DownloadPdfButton'
import HackerViewToggle from '@/components/HackerViewToggle'
import RemediationButton from '@/components/RemediationButton'

const WEB_CHECKS = [
  { id: 'ssl', name: 'SSL/TLS Encryption', desc: 'Verified secure data transmission' },
  { id: 'https', name: 'HTTPS Enforcement', desc: 'Verified HTTP-to-HTTPS upgrades' },
  { id: 'hsts', name: 'Strict Transport Security', desc: 'Checked HSTS header enforcement' },
  { id: 'content security policy', name: 'Content Security Policy', desc: 'Checked XSS attack prevention' },
  { id: 'x-frame-options', name: 'Clickjacking Protection', desc: 'Validated X-Frame-Options' },
  { id: 'x-content-type-options', name: 'MIME-Type Protection', desc: 'Checked X-Content-Type-Options' },
  { id: 'server', name: 'Server Obfuscation', desc: 'Ensured software version is hidden' },
  { id: 'spf', name: 'SPF Email Auth', desc: 'Validated domain email sender policy' },
  { id: 'dmarc', name: 'DMARC Policy', desc: 'Verified email spoofing protection' },
  { id: '.env', name: 'Environment Secrets', desc: 'Scanned for exposed .env files' },
  { id: '.git', name: 'Source Code Security', desc: 'Checked for exposed .git directories' },
  { id: 'backup', name: 'Backup Protections', desc: 'Scanned for exposed database backups' }
]

const AI_CHECKS = [
  { id: 'llm01', name: 'Prompt Injection', desc: 'Tested for unauthorized instruction bypass' },
  { id: 'llm07', name: 'System Prompt Leak', desc: 'Checked for extraction of system rules' },
  { id: 'llm02', name: 'Data Exfiltration', desc: 'Scanned for PII or secret disclosure' },
  { id: 'llm06', name: 'Excessive Agency', desc: 'Validated autonomous action limits' },
  { id: 'llm10', name: 'Resource Exhaustion', desc: 'Tested for token consumption limits' },
  { id: 'jailbreak', name: 'Model Jailbreak', desc: 'Attempted multi-step behavioral bypass' }
]

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
}

type PriorityDetails = {
  today: string[]
  week: string[]
  month: string[]
}

export default async function ScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch scan metadata
  const { data: scan } = await supabase
    .from('scans')
    .select('url, scan_type')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!scan) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan !== 'free'

  return (
    <div className="animate-fade-up max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--zynth-text)] hover:text-white transition-colors mb-6 print:hidden">
        <ArrowLeft size={16} /> Back to Overview
      </Link>

      <Suspense fallback={<ReportHeaderSkeleton />}>
        <ReportHeader id={id} userId={user.id} />
      </Suspense>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          {/* HACKER'S VIEW TOGGLE - SHOCK FACTOR */}
          <HackerViewToggle id={id} />

          <Suspense fallback={<div className="grid md:grid-cols-2 gap-4 mb-12"><Shimmer className="h-20" /><Shimmer className="h-20" /></div>}>
            <SecurityTestsSub id={id} userId={user.id} scanType={scan.scan_type} />
          </Suspense>

          <Suspense fallback={<div className="h-48 card mb-12"><Shimmer className="h-full" /></div>}>
            <ActionPlanSub id={id} userId={user.id} />
          </Suspense>

          <Suspense fallback={<div className="space-y-6"><Shimmer className="h-40" /><Shimmer className="h-40" /></div>}>
            <DetailedFindingsSub id={id} />
          </Suspense>
        </div>

        <aside className="space-y-6 sticky top-24 print:hidden">
          <DownloadPdfButton isPro={isPro} />

          <VerifiedReportBadge scanId={id} />
          
          <ResolutionCenter scanId={id} userId={user.id} />

          <div className="card p-6 bg-gradient-to-br from-[#00ff88]/10 to-transparent">
             <h4 className="text-sm font-bold mb-2">Compliance Ready</h4>
             <p className="text-[10px] text-[var(--zynth-text)] leading-relaxed mb-4">
               This report meets the preliminary requirements for PCI-DSS, SOC2, and HIPAA security audit baseline checks.
             </p>
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-bold border border-white/10">PCI</div>
                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-bold border border-white/10">SOC2</div>
                <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-[10px] font-bold border border-white/10">HIPAA</div>
             </div>
          </div>
        </aside>
      </div>
      <div className="print:hidden">
        <SecurityTutor scanId={id} />
      </div>
    </div>
  )
}

function ReportHeaderSkeleton() {
  return (
    <div className="card p-8 mb-8 border-t-4 border-t-white/10">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <Shimmer className="w-64 h-8" />
          <Shimmer className="w-48 h-4" />
        </div>
        <Shimmer className="w-32 h-16 rounded-xl" />
      </div>
      <Shimmer className="w-full h-24 mt-4" />
    </div>
  )
}

async function ReportHeader({ id, userId }: { id: string, userId: string }) {
  const supabase = await createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('*, scan_issues(severity)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!scan) return <div className="p-20 text-center card"><h2 className="text-xl font-bold">Audit Not Found</h2></div>

  const scoreColor = scan.score >= 80 ? '#00ff88' : scan.score >= 50 ? '#ffd700' : '#ff4444'

  return (
    <div className="card p-8 mb-8 border-t-4 print:border-none print:shadow-none print:bg-white print:text-black" style={{ borderTopColor: scoreColor }}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black print:text-black">{scan.url}</h1>
            <a href={scan.url} target="_blank" rel="noopener noreferrer" className="text-[var(--zynth-text)] hover:text-[#00ff88] print:hidden">
              <ExternalLink size={18} />
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-[var(--zynth-text)] whitespace-nowrap print:text-gray-500">
            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(scan.started_at).toLocaleString()}</span>
            <span>•</span>
            <span className="uppercase text-white text-xs px-2 py-0.5 rounded bg-white/10 flex items-center gap-1 print:bg-gray-100 print:text-gray-600">
              {scan.scan_type === 'ai' ? <Bot size={12} /> : <Globe size={12} />}
              {scan.scan_type} Audit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0 bg-[#060b14] p-4 rounded-xl border border-white/5 print:bg-white print:border-gray-200">
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--zynth-text)] font-bold mb-1 print:text-gray-500">Security Score</div>
            <div className="text-4xl font-black" style={{ color: scoreColor }}>{scan.score}<span className="text-xl">/100</span></div>
          </div>
          <div className="w-px h-12 bg-white/10 print:bg-gray-200" />
          <div>
            <div className="text-xs uppercase tracking-wider text-[var(--zynth-text)] font-bold mb-1 print:text-gray-500">Total Issues</div>
            <div className="text-3xl font-bold text-white print:text-black">{scan.scan_issues.length}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-5 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5 print:bg-gray-50 print:border-gray-200">
        <h3 className="font-bold flex items-center gap-2 mb-2 print:text-black"><Info size={16} className="text-[#00ff88]" /> Executive Summary</h3>
        <p className="text-sm leading-relaxed text-[var(--zynth-text)] print:text-gray-700">
          {scan.executive_summary || "Automated scan completed. Review the security findings below."}
        </p>
      </div>
    </div>
  )
}

async function SecurityTestsSub({ id, userId, scanType }: { id: string, userId: string, scanType: string }) {
  const supabase = await createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('scan_issues(test_name)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!scan) return null

  const checks = scanType === 'ai' ? AI_CHECKS : WEB_CHECKS

  return (
    <div className="print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-6 mt-12 border-t border-white/10 pt-8 print:text-black print:border-gray-200 print:mt-8">Security Tests Performed</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {checks.map((check, i) => {
          const failed = (scan.scan_issues as ScanIssueRecord[]).some((issue) => issue.test_name.toLowerCase().includes(check.id))
          return (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${failed ? 'bg-red-500/5 text-red-100 border-red-500/20 print:bg-white print:border-red-200 print:text-red-700' : 'bg-[#060b14] border-white/5 text-white print:bg-white print:border-gray-100 print:text-black'}`}>
              {failed ? (
                <AlertTriangle className="text-[#ff4444] shrink-0 mt-0.5" size={18} />
              ) : (
                <CheckCircle className="text-[#00ff88] shrink-0 mt-0.5" size={18} />
              )}
              <div>
                <div className="font-bold text-sm mb-0.5">{check.name}</div>
                <div className="text-xs opacity-70 print:text-gray-500">{check.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

async function ActionPlanSub({ id, userId }: { id: string, userId: string }) {
  const supabase = await createClient()
  const { data: scan } = await supabase
    .from('scans')
    .select('*, scan_issues(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!scan || !scan.scan_issues || scan.scan_issues.length === 0) return null

  const issues = scan.scan_issues as ScanIssueRecord[]
  const storedPriorityDetails = scan.ai_priority_details as Partial<PriorityDetails> | null | undefined
  const priorityDetails: PriorityDetails = {
    today: storedPriorityDetails?.today || issues.filter((issue) => issue.severity === 'CRITICAL' || issue.severity === 'HIGH').map((issue) => issue.id),
    week: storedPriorityDetails?.week || issues.filter((issue) => issue.severity === 'MEDIUM').map((issue) => issue.id),
    month: storedPriorityDetails?.month || issues.filter((issue) => issue.severity === 'LOW').map((issue) => issue.id)
  }

  const todayIssues = issues.filter(i => priorityDetails.today?.includes(i.id))
  const weekIssues = issues.filter(i => priorityDetails.week?.includes(i.id))

  if (todayIssues.length === 0 && weekIssues.length === 0) return null

  return (
    <div className="mb-12 print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 print:text-black">
        <LayoutDashboard className="text-[#00ff88]" size={24} /> 
        Your Priority Action Plan
      </h2>

      <div className="grid gap-4">
        {todayIssues.length > 0 && (
          <div className="card p-5 border-l-4 border-l-[#ff4444] bg-[#ff4444]/5 print:bg-white print:border-gray-200">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-red-100 flex items-center gap-2 print:text-red-700">
                 <AlertTriangle size={18} className="text-[#ff4444]" /> Fix Today (Urgent)
               </h3>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4444] bg-[#ff4444]/10 px-2 py-0.5 rounded print:hidden">Immediate Action</span>
            </div>
            <div className="space-y-3">
              {todayIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${issue.severity === 'CRITICAL' ? 'bg-[#ff4444] animate-pulse' : 'bg-orange-500'}`} />
                    <span className="text-sm font-bold text-white print:text-black">{issue.test_name}</span>
                  </div>
                  <div className="flex items-center gap-4 print:hidden">
                    <span className="text-[10px] font-bold text-[var(--zynth-text)] uppercase">Effort: <span className={issue.difficulty === 'EASY' ? 'text-[#00ff88]' : 'text-orange-400'}>{issue.difficulty || 'MEDIUM'}</span></span>
                    <Link href={`#issue-${issue.id}`} className="text-[#00ff88] hover:underline text-[10px] font-bold uppercase tracking-widest">View Fix →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weekIssues.length > 0 && (
          <div className="card p-5 border-l-4 border-l-blue-500 bg-blue-500/5 print:bg-white print:border-gray-200">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-blue-100 flex items-center gap-2 print:text-blue-700">
                 <Clock size={18} className="text-blue-500" /> Fix This Week (Recommended)
               </h3>
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded print:hidden">Medium Priority</span>
            </div>
            <div className="space-y-3">
              {weekIssues.map(issue => (
                <div key={issue.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5 print:bg-gray-50 print:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-bold text-white print:text-black">{issue.test_name}</span>
                  </div>
                  <div className="flex items-center gap-4 print:hidden">
                    <span className="text-[10px] font-bold text-[var(--zynth-text)] uppercase">Effort: <span className="text-blue-300">{issue.difficulty || 'MEDIUM'}</span></span>
                    <Link href={`#issue-${issue.id}`} className="text-blue-400 hover:underline text-[10px] font-bold uppercase tracking-widest">View Fix →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

async function DetailedFindingsSub({ id }: { id: string }) {
  const supabase = await createClient()
  const { data: issues } = await supabase
    .from('scan_issues')
    .select('*')
    .eq('scan_id', id)
    .order('severity', { ascending: false })

  return (
    <div className="print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-6 print:text-black">Detailed Findings</h2>
      <div className="space-y-6">
        {!issues || issues.length === 0 ? (
          <div className="card p-12 text-center border-dashed border-white/10 text-[var(--zynth-text)] flex flex-col items-center print:text-gray-500">
             <CheckCircle className="text-[#00ff88] mb-4" size={48} />
             <h3 className="text-lg font-bold text-white mb-2 print:text-black">Perfect Score!</h3>
             <p>We couldn&apos;t find any common vulnerabilities on this domain.</p>
           </div>
         ) : (
          (issues as ScanIssueRecord[]).map((issue) => (
            <div key={issue.id} id={`issue-${issue.id}`} className="card overflow-hidden group scroll-mt-24 print:break-inside-avoid print:bg-white print:border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                       <span className={`badge-${issue.severity.toLowerCase()} text-xs font-black uppercase px-2.5 py-1 rounded tracking-wide print:border-none print:bg-gray-100`}>
                         {issue.severity}
                       </span>
                       <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wide bg-white/5 text-[var(--zynth-text)] border border-white/10 print:hidden">
                         EFFORT: {issue.difficulty || 'MEDIUM'}
                       </span>
                       <h3 className="text-lg font-bold text-white print:text-black">{issue.test_name}</h3>
                    </div>
                    <p className="text-sm font-medium text-[var(--zynth-text)] print:text-gray-600">{issue.description}</p>
                  </div>
                  
                  <div className="shrink-0 flex flex-col items-end gap-2 print:hidden">
                    {issue.severity === 'CRITICAL' && <AlertTriangle className="text-[#ff4444] mb-1" size={24} />}
                    <RemediationButton 
                      scanId={id} 
                      issueId={issue.id} 
                      testName={issue.test_name}
                      isFixed={Boolean(issue.is_fixed)}
                      autoRemediable={Boolean(issue.auto_remediable)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#060b14] rounded-lg p-4 border border-white/5 print:bg-white print:border-gray-100">
                     <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-[var(--zynth-text)] print:text-gray-500">What does this mean?</h4>
                     <p className="text-sm leading-relaxed text-blue-50/80 print:text-gray-700">
                       {issue.ai_explanation || "No advanced explanation available for this issue."}
                     </p>
                  </div>

                  <div className="bg-[#060b14] rounded-lg p-4 border border-white/5 border-l-2 border-l-[#00ff88] print:bg-white print:border-gray-100 print:border-l-gray-500">
                     <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--zynth-green)] print:text-gray-600">How to fix it</h4>
                     {Array.isArray(issue.ai_fix_steps) && issue.ai_fix_steps.length > 0 ? (
                       <ol className="text-sm space-y-3">
                         {issue.ai_fix_steps.map((step: string, i: number) => (
                           <li key={i} className="flex items-start gap-2">
                             <span className="shrink-0 w-5 h-5 rounded-full bg-[#00ff88]/10 text-[#00ff88] flex items-center justify-center text-xs font-bold mt-0.5 print:bg-gray-100 print:text-gray-600">
                               {i + 1}
                             </span>
                             <span className="text-blue-50/90 leading-relaxed print:text-gray-700">{step}</span>
                           </li>
                         ))}
                       </ol>
                     ) : (
                       <p className="text-sm text-[var(--zynth-text)] print:text-gray-700">Consult your hosting provider or developer to resolve this configuration.</p>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
