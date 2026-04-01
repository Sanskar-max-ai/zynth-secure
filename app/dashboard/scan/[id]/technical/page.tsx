import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Severity } from '@/types'
import { ArrowLeft, Shield, ShieldCheck, Terminal, Globe, Lock, Search } from 'lucide-react'
import PrintTechnicalBriefButton from '@/components/PrintTechnicalBriefButton'
import { getEvidenceLines, getFindingSourceLabel } from '@/utils/scan/report'

type TechnicalIssue = {
  id: string
  severity: Severity
  test_name: string
  description: string
  ai_explanation?: string | null
  ai_fix_steps?: string[] | null
  details?: {
    findingSource?: 'direct' | 'heuristic' | 'external'
    evidence?: string[]
    serverHeader?: string
    path?: string
  } | null
}

type TechnicalScan = {
  id: string
  url: string
  scan_type: string
  score: number
  executive_summary?: string | null
  scan_issues: TechnicalIssue[]
}

export default async function TechnicalBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: scan } = await supabase
    .from('scans')
    .select('*, scan_issues(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!scan) {
    return <div className="p-20 text-center">Audit Not Found</div>
  }

  const technicalScan = scan as unknown as TechnicalScan
  const criticalIssues = technicalScan.scan_issues.filter((issue) => issue.severity === 'CRITICAL')
  const highIssues = technicalScan.scan_issues.filter((issue) => issue.severity === 'HIGH')

  return (
    <div className="bg-white text-slate-900 min-h-screen p-8 sm:p-12 font-sans selection:bg-slate-200 print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Top Controls - Hidden on Print */}
        <div className="flex items-center justify-between mb-12 print:hidden">
          <Link href={`/dashboard/scan/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to Report
          </Link>
          <PrintTechnicalBriefButton />
        </div>

        {/* Report Header */}
        <header className="border-b-4 border-slate-900 pb-8 mb-12 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="fill-slate-900" size={28} />
              <span className="text-xl font-black uppercase tracking-tighter">Zynth Technical Brief</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{technicalScan.url}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-1.5"><Globe size={14} /> DOMAIN: {new URL(technicalScan.url).hostname}</div>
              <div className="flex items-center gap-1.5 uppercase"><Terminal size={14} /> TYPE: {technicalScan.scan_type} REPORT</div>
              <div className="flex items-center gap-1.5"><Lock size={14} /> ID: {technicalScan.id}</div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Score</div>
             <div className="text-6xl font-black">{technicalScan.score}<span className="text-xl text-slate-300">/100</span></div>
          </div>
        </header>

        {/* Summary Boxes */}
        <section className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Critical Risks</div>
             <div className="text-3xl font-black text-red-600">{criticalIssues.length}</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">High Risks</div>
             <div className="text-3xl font-black text-orange-500">{highIssues.length}</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Findings</div>
             <div className="text-3xl font-black text-slate-900">{technicalScan.scan_issues.length}</div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
            <Search size={14} /> Executive Summary
          </h2>
          <div className="p-8 bg-slate-900 text-slate-100 rounded-3xl leading-relaxed">
            {technicalScan.executive_summary || "Automated scan completed. This brief summarizes the technical findings recorded for the target."}
          </div>
        </section>

        {/* Technical Findings */}
        <section className="space-y-12 mb-20">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
            <Terminal size={14} /> Technical Findings
          </h2>
          
          {technicalScan.scan_issues.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <ShieldCheck size={48} className="mx-auto text-emerald-500 mb-4" />
              <p className="font-bold text-slate-500">No findings were recorded.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {technicalScan.scan_issues.map((issue, i: number) => (
                <div key={i} className="group break-inside-avoid">
                  <div className="flex items-start gap-4 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 mt-1.5 ${
                      issue.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 
                      issue.severity === 'HIGH' ? 'bg-orange-500 text-white' : 
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {issue.severity}
                    </span>
                    <h3 className="text-xl font-black tracking-tight">{issue.test_name}</h3>
                  </div>
                  <div className="pl-14">
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      {issue.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Source: {getFindingSourceLabel(issue.details?.findingSource)}
                      </span>
                      {getEvidenceLines(issue.details).slice(0, 2).map((line, index) => (
                        <span key={index} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {line}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-100 italic font-medium">
                       <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Technical Impact</div>
                         <p className="text-xs leading-relaxed text-slate-700">{issue.ai_explanation}</p>
                       </div>
                       <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Remediation Steps</div>
                         <ul className="space-y-2">
                           {Array.isArray(issue.ai_fix_steps) && issue.ai_fix_steps.map((step: string, j: number) => (
                             <li key={j} className="text-xs leading-relaxed text-slate-700 flex gap-2">
                               <span className="text-slate-300 font-bold">0{j+1}</span> {step}
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div>Generated by Zynth Scan</div>
           <div>Report ID: {technicalScan.id}</div>
           <div className="print:hidden">Copyright 2026 Zynth Security. All rights reserved.</div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; padding: 0 !important; }
              .print\\:hidden { display: none !important; }
              @page { margin: 2cm; }
              .break-inside-avoid { break-inside: avoid; }
            }
          `,
        }}
      />
    </div>
  )
}

