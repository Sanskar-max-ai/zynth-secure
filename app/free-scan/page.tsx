'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { ArrowRight, Lock, Radar, Shield, ShieldAlert, Sparkles } from 'lucide-react'
import PublicNav from '@/components/marketing/PublicNav'
import PublicFooter from '@/components/marketing/PublicFooter'
import CyberBackground from '@/components/ui/CyberBackground'

type ScanIssue = {
  id: string
  testName: string
  severity: string
  description: string
  hidden?: boolean
}

type ScanResult = {
  url: string
  score: number
  totalIssuesFound: number
  issues: ScanIssue[]
}

export default function FreeScanPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const router = useRouter()
  const params = use(searchParams)
  const targetUrl = params.url || ''
  const posthog = usePostHog()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('Initiating external security probes...')

  useEffect(() => {
    if (!targetUrl) {
      router.push('/')
      return
    }

    const messages = [
      'Checking SSL/TLS encryption...',
      'Probing security headers...',
      'Scanning for exposed configurations...',
      'Analyzing domain and email routing policies...',
      'Compiling initial baseline report...',
    ]

    let msgIndex = 0
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setLoadingMsg(messages[msgIndex])
    }, 2500)

    const runScan = async () => {
      posthog?.capture('free_scan_started', { url: targetUrl })
      try {
        const res = await fetch('/api/scan/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to complete scan')
        
        // Ensure the loading animation stays for at least 8 seconds for the WOW effect
        setTimeout(() => {
          setResult(data)
          setLoading(false)
          clearInterval(interval)
        }, Math.max(0, 8000 - 0 /* assuming immediate API return for now, but usually it takes a few secs */))

      } catch (err: any) {
        setError(err.message)
        setLoading(false)
        clearInterval(interval)
      }
    }

    runScan()

    return () => clearInterval(interval)
  }, [targetUrl, router])

  return (
    <div className="marketing-shell min-h-screen text-white">
      <CyberBackground />
      <PublicNav />

      <main className="page-container relative py-16 md:py-24">
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <Radar size={48} className="animate-spin text-[var(--zynthsecure-green)] opacity-50 duration-3000" />
              <Shield size={24} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-white">Scanning {targetUrl}</h1>
            <p className="mt-4 text-[var(--zynthsecure-green)] font-mono text-sm animate-pulse">
              {loadingMsg}
            </p>
          </div>
        ) : error ? (
           <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
             <ShieldAlert size={48} className="text-[#ff4444] mb-4" />
             <h1 className="text-2xl font-bold tracking-[-0.04em] text-white mb-2">Scan Failed</h1>
             <p className="text-[var(--zynthsecure-text)] text-sm mb-6">{error}</p>
             <Link href="/" className="btn-secondary px-6 py-3">Try Another URL</Link>
           </div>
        ) : result && (
          <div className="animate-fade-up max-w-4xl mx-auto space-y-12">
            
            <div className="text-center">
               <div className="section-kicker mx-auto">
                 <span>Preview Report</span>
               </div>
               <h1 className="mt-6 text-4xl font-bold tracking-[-0.05em] md:text-5xl">
                 We found <span className="text-[#ff4444]">{result.totalIssuesFound} security risks</span> on your site.
               </h1>
               <p className="mt-4 text-[var(--zynthsecure-text)] leading-relaxed max-w-2xl mx-auto">
                 Below is a limited teaser of the vulnerabilities discovered on <strong>{result.url}</strong>. To see the full evidence, severity breakdowns, and remediation steps, unlock your full report.
               </p>
            </div>

            <div className="marketing-panel p-8 grid md:grid-cols-3 gap-8 text-center items-center">
               <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Overall Score</div>
                 <div className="text-5xl font-black text-[var(--zynthsecure-text)] opacity-50 blur-sm select-none">??</div>
               </div>
               <div className="border-l border-r border-white/5 py-4">
                 <div className="text-[10px] font-black uppercase tracking-widest text-[#ff4444] mb-2">Critical Issues</div>
                 <div className="text-5xl font-black text-[#ff4444]">{result.issues.filter(i => i.severity === 'CRITICAL' || i.hidden).length}</div>
               </div>
               <div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">High/Medium</div>
                 <div className="text-5xl font-black text-white">{result.issues.filter(i => i.severity !== 'CRITICAL' && !i.hidden).length}</div>
               </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/10">
              {/* Visible Issues */}
              <div className="bg-[#060b14] p-6 border-b border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Visible Findings</h3>
                {result.issues.filter(i => !i.hidden).map(issue => (
                  <div key={issue.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-white">{issue.testName}</div>
                      <div className="text-[10px] uppercase text-[var(--zynthsecure-text)] mt-1">{issue.description}</div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded text-[var(--zynthsecure-text)]">{issue.severity}</span>
                  </div>
                ))}
                {result.issues.filter(i => !i.hidden).length === 0 && (
                  <div className="text-sm text-[var(--zynthsecure-text)] italic">No low-severity issues found. All findings are critical.</div>
                )}
              </div>

              {/* Blurred Issues / Paywall */}
              <div className="relative p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Critical Vulnerabilities <Lock size={14} className="inline ml-1 text-[#ff4444]" /></h3>
                
                {result.issues.filter(i => i.hidden).slice(0, 3).map((issue, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-[#ff4444]/20 flex justify-between items-center blur-[6px] opacity-60 pointer-events-none select-none">
                    <div>
                      <div className="font-bold text-sm text-[#ff4444]">CRITICAL VULNERABILITY FOUND: MULTIPLE</div>
                      <div className="text-[10px] uppercase text-[var(--zynthsecure-text)] mt-1">Details hidden. Upgrade to review evidence and path to remediation.</div>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-[#ff4444]/20 px-2 py-1 rounded text-[#ff4444]">CRITICAL</span>
                  </div>
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-[#060b14] via-[#060b14]/80 to-transparent flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                  <Lock size={32} className="text-[var(--zynthsecure-green)] mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4 max-w-md mx-auto">
                    Unlock your full technical brief
                  </h2>
                  <p className="text-sm text-[var(--zynthsecure-text)] max-w-sm mb-8">
                    Create a free account to view the hidden critical findings, evidence paths, and concrete remediation steps for your engineers.
                  </p>
                  <Link href={`/auth/signup?url=${encodeURIComponent(result.url)}`} className="btn-primary px-8 py-4 text-sm font-bold shadow-[0_0_40px_rgba(0,255,136,0.3)] hover:shadow-[0_0_60px_rgba(0,255,136,0.5)] transition-shadow">
                    Create Account To View Report
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}
