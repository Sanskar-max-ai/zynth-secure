'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldAlert, CheckCircle2, Globe, Bot } from 'lucide-react'
import HackerTerminal from '@/components/HackerTerminal'

const WEB_SCAN_STEPS = [
  "Initializing Zynth WebGuard Engine...",
  "Resolving target DNS & WHOIS records...",
  "Testing SSL/TLS handshake protocols...",
  "Scanning for exposed .env and configuration files...",
  "Analyzing HTTP security headers (HSTS, CSP, XFO)...",
  "Probing for common XSS and CSRF entry points...",
  "Verifying database connection shielding...",
  "Auditing third-party script integrity...",
  "Cross-referencing with global threat pipelines (CVE)...",
  "Finalizing interactive vulnerability report..."
]

const AI_SCAN_STEPS = [
  "Initializing Zynth AIGuard Engine...",
  "Establishing connection to target AI endpoint...",
  "Injecting [LLM01] Developer Bypass Prompts...",
  "Testing for System Prompt Leakage (Jailbreaks)...",
  "Fuzzing context window for token exploitation...",
  "Analyzing output for Data Exfiltration (PII/Keys)...",
  "Simulating [LLM06] Excessive Agency attack payloads...",
  "Deploying multi-step indirect prompt injections...",
  "Validating Guardrail filtering mechanisms...",
  "Finalizing AI Trust Score & Vulnerability report..."
]

type ScanType = 'web' | 'ai'

export default function NewScanPage() {
  const [url, setUrl] = useState('')
  const [scanType, setScanType] = useState<ScanType>('web')
  const [loading, setLoading] = useState(false)
  const [scanId, setScanId] = useState<string | null>(null)
  
  const router = useRouter()
  const activeSteps = scanType === 'web' ? WEB_SCAN_STEPS : AI_SCAN_STEPS

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
    <div className="max-w-4xl mx-auto py-8 animate-fade-up px-4">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black mb-2">Run New Audit</h1>
        <p style={{ color: 'var(--zynth-text)' }}>
          Choose your target and run a comprehensive security vulnerability scan.
        </p>
      </div>

      {!loading ? (
        <>
          {/* Engine Selector */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setScanType('web')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                scanType === 'web' 
                  ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_30px_rgba(0,255,136,0.15)]' 
                  : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 text-gray-500'
              }`}
            >
              <div className={`p-3 rounded-full ${scanType === 'web' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-black/20 text-gray-400'}`}>
                <Globe size={32} />
              </div>
              <div>
                <h3 className={`font-black text-lg ${scanType === 'web' ? 'text-white' : 'text-gray-400'}`}>Zynth WebGuard</h3>
                <p className="text-xs mt-1 leading-relaxed opacity-80">Scan a traditional website for SSL issues, open ports, and infrastructure vulnerabilities.</p>
              </div>
            </button>

            <button 
              onClick={() => setScanType('ai')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 relative overflow-hidden group ${
                scanType === 'ai' 
                  ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                  : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10 text-gray-500'
              }`}
            >
              {scanType === 'ai' && (
                <span className="absolute top-0 right-0 py-1 px-3 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg">
                  New
                </span>
              )}
              <div className={`p-3 rounded-full ${scanType === 'ai' ? 'bg-blue-500/20 text-blue-400' : 'bg-black/20 text-gray-400'}`}>
                <Bot size={32} />
              </div>
              <div>
                <h3 className={`font-black text-lg ${scanType === 'ai' ? 'text-white' : 'text-gray-400'}`}>Zynth AIGuard</h3>
                <p className="text-xs mt-1 leading-relaxed opacity-80">Stress-test an AI Chatbot or LLM endpoint for prompt injections and data exfiltration.</p>
              </div>
            </button>
          </div>

          <div className="card p-8 mb-8" style={{ border: `1px solid ${scanType === 'web' ? 'rgba(0,255,136,0.2)' : 'rgba(59,130,246,0.2)'}` }}>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  placeholder={scanType === 'web' ? "https://yourwebsite.com" : "https://your-chatbot-api.com/chat"}
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full bg-[#060b14] border border-gray-800 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none transition-colors ${scanType === 'web' ? 'focus:border-[#00ff88]' : 'focus:border-blue-500'}`}
                />
              </div>
              <button 
                type="submit" 
                className={`px-8 font-black text-lg flex items-center justify-center gap-2 rounded-lg transition-transform hover:scale-105 ${
                  scanType === 'web'
                    ? 'bg-[#00ff88] text-black hover:bg-[#00e67a]'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Attack Target
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <ShieldAlert className={`mb-4 ${scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'}`} size={28} />
              <h3 className="font-bold mb-2">What happens during an audit?</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--zynth-text)' }}>
                {scanType === 'web' ? (
                  <>
                    <li>• Testing Data Privacy & Encryption</li>
                    <li>• Hunting for Data Leaks & Exposures</li>
                    <li>• Verifying Missing Security Headers</li>
                    <li>• Cross-referencing Threat Intel</li>
                  </>
                ) : (
                  <>
                    <li>• Testing for Prompt Injections</li>
                    <li>• Simulating Data Exfiltration</li>
                    <li>• Checking for System Prompt Leaks</li>
                    <li>• Assessing Model Guardrails</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-bold mb-2 text-red-400">Notice on Authorization</h3>
              <p className="text-sm" style={{ color: 'var(--zynth-text)' }}>
                Only audit domains or APIs that you own or have explicit authorization to attack. 
                Unauthorized probing may trigger external security alerts via WAF or Cloudflare.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-fade-in max-w-2xl mx-auto">
          {/* THE WOW FACTOR HACKER TERMINAL COMPONENT */}
          <HackerTerminal 
            title={`Live Attack Console - ${scanType === 'web' ? 'WebGuard' : 'AIGuard'}`}
            steps={activeSteps}
            onComplete={handleComplete}
            target={url}
          />
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 opacity-60">
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Active Connection
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Payload Injection Ready
             </div>
             <div className="h-px w-8 bg-gray-800 hidden sm:block" />
             <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--zynth-text)] uppercase tracking-widest">
               <CheckCircle2 size={12} className={scanType === 'web' ? 'text-[#00ff88]' : 'text-blue-500'} />
               Real-Time Intel
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

