'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ShieldAlert, CheckCircle2, Globe, Bot } from 'lucide-react'
import HackerTerminal from '@/components/HackerTerminal'

const WEB_SCAN_STEPS = [
  'Initializing Zynth website scan...',
  'Resolving target DNS and certificate details...',
  'Checking public web services and open ports...',
  'Reviewing TLS configuration and redirect behavior...',
  'Scanning for exposed files and common misconfigurations...',
  'Inspecting HTTP security headers...',
  'Enriching findings with known vulnerability signals...',
  'Preparing the report and remediation summary...',
]

const AI_SCAN_STEPS = [
  'Initializing Zynth AI scan...',
  'Connecting to the submitted AI endpoint...',
  'Testing direct prompt injection behavior...',
  'Checking for system prompt leakage and jailbreak paths...',
  'Reviewing output for data exposure patterns...',
  'Evaluating rate controls and guardrail behavior...',
  'Preparing the AI risk summary and findings...',
]

type ScanType = 'web' | 'ai'

export default function NewScanPage() {
  const [url, setUrl] = useState('')
  const [scanType, setScanType] = useState<ScanType>('web')
  const [loading, setLoading] = useState(false)
  const [scanId, setScanId] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSteps = scanType === 'web' ? WEB_SCAN_STEPS : AI_SCAN_STEPS

  useEffect(() => {
    const presetUrl = searchParams.get('url')
    const presetType = searchParams.get('type')

    if (presetUrl && !url) {
      setUrl(presetUrl)
    }

    if (presetType === 'ai' || presetType === 'web') {
      setScanType(presetType)
    }
  }, [searchParams, url])

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setScanId(null)
    
    try {
      const endpoint = scanType === 'web' ? '/api/scan/website' : '/api/scan/ai'
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await res.json()
      setScanId(data.id || 'demo-scan-id')
    } catch (err) {
      console.error(err)
      setScanId('demo-scan-id') 
    }
  }

  function handleComplete() {
    if (scanId) {
       router.push(`/dashboard/scan/${scanId}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-4 animate-fade-up px-4">
      <div className="mb-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="section-kicker">
          <span>Run Scan</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">Start a new security scan</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--zynth-text)] md:text-base">
          Choose what you want to assess, enter a target you own, and Zynth will generate a report with findings,
          severity, evidence, and remediation guidance.
        </p>
      </div>

      {!loading ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setScanType('web')}
              className={`rounded-[1.75rem] border p-6 text-left transition-all ${
                scanType === 'web' 
                  ? 'border-[#00ff88]/40 bg-[#00ff88]/8 shadow-[0_18px_40px_rgba(0,255,136,0.08)]' 
                  : 'border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'
              }`}
            >
              <div className={`mb-5 inline-flex rounded-2xl border p-3 ${scanType === 'web' ? 'border-[#00ff88]/20 bg-[#00ff88]/10 text-[#00ff88]' : 'border-white/8 bg-white/5 text-white/55'}`}>
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Website Scan</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--zynth-text)]">
                  Review headers, TLS posture, exposed files, domain signals, and common website security gaps.
                </p>
              </div>
            </button>

            <button 
              onClick={() => setScanType('ai')}
              className={`rounded-[1.75rem] border p-6 text-left transition-all ${
                scanType === 'ai' 
                  ? 'border-blue-500/35 bg-blue-500/8 shadow-[0_18px_40px_rgba(59,130,246,0.08)]' 
                  : 'border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'
              }`}
            >
              <div className={`mb-5 inline-flex rounded-2xl border p-3 ${scanType === 'ai' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : 'border-white/8 bg-white/5 text-white/55'}`}>
                <Bot size={28} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">AI Scan</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--zynth-text)]">
                  Evaluate an AI endpoint for prompt injection, leakage, and guardrail-related weaknesses.
                </p>
              </div>
            </button>
          </div>

          <div className="marketing-panel p-8 mb-8" style={{ borderColor: scanType === 'web' ? 'rgba(0,255,136,0.18)' : 'rgba(59,130,246,0.22)' }}>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  placeholder={scanType === 'web' ? 'https://yourcompany.com' : 'https://your-ai-endpoint.com/chat'}
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full rounded-2xl border border-white/10 bg-[#060b14] py-4 pl-12 pr-4 text-white outline-none transition-colors ${scanType === 'web' ? 'focus:border-[#00ff88]' : 'focus:border-blue-500'}`}
                />
              </div>
              <button 
                type="submit" 
                className={`rounded-2xl px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] transition-transform hover:scale-[1.01] ${
                  scanType === 'web'
                    ? 'btn-primary text-black'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Start scan
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="marketing-card p-6">
              <ShieldAlert className={`mb-4 ${scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'}`} size={28} />
              <h3 className="font-semibold text-white">What happens during this scan?</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--zynth-text)]">
                {scanType === 'web' ? (
                  <>
                    <li>Check transport security, redirects, and certificate posture</li>
                    <li>Review headers, exposed files, and public service surface</li>
                    <li>Enrich findings with known-risk lookup signals</li>
                    <li>Generate a report with severity, evidence, and next steps</li>
                  </>
                ) : (
                  <>
                    <li>Test prompt injection and system prompt exposure behavior</li>
                    <li>Look for risky output patterns and data leakage signals</li>
                    <li>Review guardrails, rate controls, and tool-use concerns</li>
                    <li>Generate an AI risk report with remediation guidance</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="marketing-card p-6">
              <h3 className="font-semibold text-red-400">Authorization notice</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--zynth-text)]">
                Only scan assets, domains, or APIs that you own or are explicitly allowed to assess. Unauthorized
                scanning can trigger defensive systems and create legal or operational issues.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <HackerTerminal 
            title={scanType === 'web' ? 'Running Website Scan' : 'Running AI Scan'}
            steps={activeSteps}
            onComplete={handleComplete}
            target={url}
          />
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-60">
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Connection ready
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Scan in progress
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Preparing findings
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

