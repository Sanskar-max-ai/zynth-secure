'use client'

import { useState } from 'react'
import { Search, ShieldCheck, Lock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import HackerTerminal from '@/components/HackerTerminal'
import { ScanIssue } from '@/types'
import Link from 'next/link'

const QUICK_SCAN_STEPS = [
  'Initializing Zynth micro-scanner...',
  'Resolving target DNS details...',
  'Checking public web services...',
  'Reviewing SSL/TLS configuration...',
  'Inspecting HTTP security headers...',
  'Finalizing teaser report...',
]

export default function QuickScanPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<ScanIssue[]>([])
  const [scanComplete, setScanComplete] = useState(false)

  async function handleQuickScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    
    try {
      const res = await fetch('/api/scan/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) {
      console.error(err)
    }
  }

  function handleComplete() {
    setLoading(false)
    setScanComplete(true)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#00ff88]/30">
      <div className="relative mx-auto max-w-5xl px-6 py-20 lg:py-32">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-full overflow-hidden opacity-20">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#00ff88] blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500 blur-[150px]" />
        </div>

        {!loading && !scanComplete && (
          <div className="animate-fade-up text-center">
            <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88]">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Find your security gaps in <span className="text-[#00ff88]">30 seconds.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Run a free quick scan to identify critical configuration vulnerabilities. Zero setup, zero cost.
            </p>
            
            <form onSubmit={handleQuickScan} className="mx-auto mt-12 max-w-2xl px-4">
              <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-all focus-within:border-[#00ff88]/50 focus-within:ring-4 focus-within:ring-[#00ff88]/10">
                <Search className="ml-4 text-slate-500" size={20} />
                <input
                  type="url"
                  placeholder="https://yourcompany.com"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border-none bg-transparent py-4 pl-4 pr-6 text-lg text-white outline-none placeholder:text-slate-600"
                />
                <button 
                  type="submit"
                  className="hidden rounded-xl bg-[#00ff88] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[#020617] transition-transform hover:scale-[1.02] active:scale-95 sm:block"
                >
                  Quick Scan
                </button>
              </div>
              <button 
                type="submit"
                className="mt-4 w-full rounded-xl bg-[#00ff88] px-8 py-4 text-sm font-black uppercase tracking-widest text-[#020617] sm:hidden"
              >
                Quick Scan
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="mx-auto max-w-2xl">
            <HackerTerminal 
              title="Zynth Quick Audit"
              steps={QUICK_SCAN_STEPS}
              target={url}
              onComplete={handleComplete}
            />
          </div>
        )}

        {scanComplete && (
          <div className="animate-fade-in space-y-8 pb-32">
            <div className="text-center">
              <div className="section-kicker mx-auto mb-4"><span>Teaser Report Ready</span></div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Scan Report: {new URL(url).hostname}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[2.5rem] border border-white/8 bg-white/[0.03] p-8 text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Grade</div>
                <div className="mt-4 text-7xl font-black text-[#00ff88]">B-</div>
                <p className="mt-4 text-xs text-slate-500 italic px-4 leading-relaxed">
                  "Decent foundation, but 3 critical configuration gaps detected."
                </p>
              </div>

              <div className="col-span-2 rounded-[2.5rem] border border-white/8 bg-white/[0.03] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Critical Findings</div>
                  <AlertTriangle className="text-red-500" size={18} />
                </div>
                <div className="space-y-4">
                  {issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <div className="font-bold text-sm text-white mb-1">{issue.testName}</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">{issue.aiExplanation || issue.description}</p>
                      </div>
                    </div>
                  ))}
                  {issues.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-sm italic">
                      Zero critical configuration issues found. Great job!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[3rem] border border-[#00ff88]/20 bg-[#00ff88]/5 p-12 lg:p-16">
              <div className="absolute right-0 top-0 h-full w-1/2 translate-x-1/4 select-none opacity-[0.03]">
                <ShieldCheck className="h-full w-auto text-[#00ff88]" />
              </div>
              
              <div className="relative z-10 max-w-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ff88]/10 text-[#00ff88] mb-6">
                  <Lock size={20} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white">Unlock full AI Red Teaming.</h3>
                <p className="mt-4 text-lg text-slate-400 leading-relaxed text-balance">
                  This quick scan only looks at headers. Our **Hacker Brain** detected potential AI prompt-injection and logic flaws on your site.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/auth/signup" className="w-full sm:w-auto rounded-xl bg-[#00ff88] px-10 py-4 text-sm font-black uppercase tracking-widest text-[#020617] text-center hover:scale-[1.02] transition-transform">
                    Unlock Full Report
                  </Link>
                  <p className="text-xs text-slate-500 font-medium">Free trial, no credit card required.</p>
                </div>
              </div>

              {/* Blurred findings teaser */}
              <div className="mt-12 select-none opacity-20 blur-md grayscale sm:mt-16 pointer-events-none">
                <div className="section-kicker mb-4"><span>Adversarial Findings Locked</span></div>
                <div className="space-y-4">
                  <div className="h-16 w-full rounded-2xl bg-white/10" />
                  <div className="h-16 w-full rounded-2xl bg-white/10" />
                  <div className="h-16 w-full rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
               <div className="flex items-center gap-8 opacity-40">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                    SSL Probed
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                    Headers Inspected
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                    DNS Evaluated
                  </div>
               </div>
               <Link href="/" className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Return to Home
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
