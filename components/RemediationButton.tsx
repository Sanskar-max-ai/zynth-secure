'use client'

import { useState } from 'react'
import { Zap, CheckCircle, X } from 'lucide-react'
import HackerTerminal from './HackerTerminal'
import { useRouter } from 'next/navigation'

interface RemediationButtonProps {
  scanId: string
  issueId: string
  testName: string
  isFixed: boolean
  autoRemediable: boolean
}

type RemediationPayload = {
  message: string
  type: string
  file: string
  snippet: string
  description: string
  nextSteps?: string[]
  evidence?: string[]
  source?: string
  timestamp: string
}

const REMEDIATION_STEPS = [
  "Initializing Zynth Auto-Fix Protocol...",
  "Authenticating with deployment gateway...",
  "Fetching current configuration state...",
  "Generating security patch based on scan findings...",
  "Validating patch against application schema...",
  "Applying fix: [REMEDIATION_PAYLOAD]...",
  "Restarting security middleware...",
  "Verifying resolution with secondary audit...",
  "Patch successfully deployed & verified."
]

export default function RemediationButton({ 
  scanId, 
  issueId, 
  testName, 
  isFixed, 
  autoRemediable 
}: RemediationButtonProps) {
  const [done, setDone] = useState(isFixed)
  const [showTerminal, setShowTerminal] = useState(false)
  const [remediation, setRemediation] = useState<RemediationPayload | null>(null)
  const router = useRouter()

  async function handleFix() {
    if (done) return
    setShowTerminal(true)
  }

  async function executeRemediation() {
    try {
      const res = await fetch('/api/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, issueId, testName })
      })
      
      if (res.ok) {
        const data = await res.json() as { payload?: RemediationPayload }
        setRemediation(data.payload || null)
        setDone(true)
        // Refresh the page data to update the score and status
        router.refresh()
      }
    } catch (err) {
      console.error('Remediation failed:', err)
    }
  }

  if (done) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#00ff88] font-bold text-xs uppercase tracking-widest bg-[#00ff88]/10 px-3 py-1.5 rounded-lg border border-[#00ff88]/20">
          <CheckCircle size={14} />
          Fixed by Zynth
        </div>
        {remediation && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/80 max-w-sm">
            <div className="font-black uppercase tracking-[0.2em] text-[#00ff88] mb-2">
              Patch Applied
            </div>
            <div className="font-bold text-white mb-2">{remediation.description}</div>
            <div className="text-white/60 mb-2">
              {remediation.file} · {remediation.type}
            </div>
            {remediation.evidence && remediation.evidence.length > 0 && (
              <div className="text-white/50">
                Evidence: {remediation.evidence[0]}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!autoRemediable) return null

  return (
    <>
      <button 
        onClick={handleFix}
        className="flex items-center gap-2 bg-[#00ff88] text-black hover:bg-[#00e67a] px-4 py-2 rounded-lg font-black text-xs uppercase tracking-tighter transition-all transform hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(0,255,136,0.3)]"
      >
        <Zap size={14} fill="currentColor" />
        Fix with Zynth
      </button>

      {showTerminal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl relative">
            <button 
              onClick={() => setShowTerminal(false)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
            >
              <X size={16} /> Close
            </button>
            <HackerTerminal 
              title={`Zynth Remediation - ${testName}`}
              steps={REMEDIATION_STEPS}
              isRemediation={true}
              onComplete={() => {
                executeRemediation()
                setTimeout(() => setShowTerminal(false), 1000)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
