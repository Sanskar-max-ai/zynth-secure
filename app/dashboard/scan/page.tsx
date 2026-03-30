'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldAlert, Terminal, CheckCircle2, Loader2 } from 'lucide-react'

const SCAN_STEPS = [
  "Initializing Zynth Security Engine...",
  "Resolving target DNS records...",
  "Testing SSL/TLS handshake protocols...",
  "Scanning for exposed configuration files...",
  "Analyzing HTTP security headers (HSTS, CSP, XFO)...",
  "Checking for common XSS and CSRF entry points...",
  "Verifying database connection shielding...",
  "Auditing third-party script integrity...",
  "Cross-referencing with global threat databases...",
  "Finalizing AI-powered vulnerability report..."
]

export default function NewScanPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [scanData, setScanData] = useState<any>(null)
  const router = useRouter()
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Redirect after scan completes
  useEffect(() => {
    if (loading && currentStep >= SCAN_STEPS.length && scanData?.id) {
      const timer = setTimeout(() => {
        router.push(`/dashboard/scan/${scanData.id}`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, currentStep, scanData, router])

  useEffect(() => {
    if (loading && currentStep < SCAN_STEPS.length) {
      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${SCAN_STEPS[currentStep]}`])
        setCurrentStep(prev => prev + 1)
      }, 600 + Math.random() * 800)
      return () => clearTimeout(timer)
    }
  }, [loading, currentStep])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setTerminalLines([])
    setCurrentStep(0)
    setScanData(null)
    
    try {
      const res = await fetch('/api/scan/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      setScanData(data)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-up px-4">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black mb-2">Run New Audit</h1>
        <p style={{ color: 'var(--zynth-text)' }}>
          Enter any domain below to run a comprehensive security and vulnerability audit.
        </p>
      </div>

      {!loading ? (
        <>
          <div className="card p-8 mb-8" style={{ border: '1px solid rgba(0,255,136,0.2)' }}>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#060b14] border border-gray-800 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary px-8 font-bold text-lg flex items-center justify-center gap-2"
              >
                Start Audit
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <ShieldAlert className="mb-4 text-[#00ff88]" size={28} />
              <h3 className="font-bold mb-2">What happens during an audit?</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--zynth-text)' }}>
                <li>• Testing Data Privacy & Encryption</li>
                <li>• Verifying Anti-Hacking Shields</li>
                <li>• Hunting for Data Leaks & Exposures</li>
                <li>• Checking Email & Identity Security</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-bold mb-2">Notice on Authorization</h3>
              <p className="text-sm" style={{ color: 'var(--zynth-text)' }}>
                Only audit domains that you own or have explicit authorization to audit. 
                All audits are completely passive and will not disrupt target services.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="card overflow-hidden bg-[#060b14] border-[#00ff88]/30 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
            <div className="bg-[#0d1526] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[#00ff88]" />
                <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">Active Audit Console</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]/20" />
              </div>
            </div>
            
            <div className="p-4 sm:p-6 h-[400px] overflow-y-auto font-mono text-xs sm:text-sm space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
              {terminalLines.map((line, i) => (
                <div key={i} className="flex gap-3 animate-fade-in">
                  <span className="text-[#00ff88] shrink-0">✔</span>
                  <span className="text-gray-300">{line}</span>
                </div>
              ))}
              {currentStep < SCAN_STEPS.length && (
                <div className="flex gap-3 items-center">
                  <Loader2 className="animate-spin text-[#00ff88]" size={14} />
                  <span className="text-[#00ff88] animate-pulse">Running {SCAN_STEPS[currentStep]}...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            <div className="bg-[#0d1526] p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-800 gap-4">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold text-gray-500">TARGET: <span className="text-gray-300 truncate max-w-[150px] inline-block align-bottom">{url}</span></div>
                <div className="text-[10px] font-bold text-gray-500">ENGINE: <span className="text-[#00ff88]">ZYNTH-V2-AI</span></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 sm:w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00ff88] transition-all duration-500" 
                    style={{ width: `${(currentStep / SCAN_STEPS.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#00ff88]">{Math.round((currentStep / SCAN_STEPS.length) * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-60">
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className="text-[#00ff88]" />
               Verifiable Evidence
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className="text-[#00ff88]" />
               Zero-Data Retention
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className="text-[#00ff88]" />
               Real-Time Analysis
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

