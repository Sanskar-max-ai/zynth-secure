'use client'

import { useState } from 'react'
import { Zap, CheckCircle, X, Copy, FileCode, Terminal as TerminalIcon } from 'lucide-react'
import HackerTerminal from './HackerTerminal'
import { useRouter } from 'next/navigation'
import { SecurityPatch } from '@/types'

interface RemediationButtonProps {
  scanId: string
  issueId: string
  testName: string
  isFixed: boolean
  autoRemediable: boolean
  initialPatch?: SecurityPatch | null
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
  patch?: SecurityPatch
}

const REMEDIATION_STEPS = [
  'Analyzing vulnerability context...',
  'Checking the current configuration state...',
  'Generating a patch payload from the scan findings...',
  'Validating the patch structure...',
  'Finalizing remediation instructions...',
  'Patch payload generated.',
]

export default function RemediationButton({ 
  scanId, 
  issueId, 
  testName, 
  isFixed, 
  autoRemediable,
  initialPatch
}: RemediationButtonProps) {
  const [done, setDone] = useState(isFixed)
  const [showTerminal, setShowTerminal] = useState(false)
  const [remediation, setRemediation] = useState<RemediationPayload | null>(
    isFixed && initialPatch ? {
      message: `Security Patch Active for ${testName}`,
      type: 'PATCH_ACTIVE',
      file: initialPatch.filePath,
      snippet: initialPatch.patchContent,
      description: initialPatch.explanation,
      timestamp: new Date().toISOString(),
      patch: initialPatch
    } : null
  )
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleFix() {
    if (done) return
    setError(null)
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
        router.refresh()
      } else {
        setError('Zynth could not complete this remediation automatically.')
      }
    } catch (err) {
      console.error('Remediation failed:', err)
      setError('Zynth could not complete this remediation automatically.')
    }
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--zynthsecure-green)]">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--zynthsecure-green)] shadow-[0_0_8px_var(--zynthsecure-green)]" />
          Patch_Integrated
        </div>
        
        {remediation && (
          <div className="enterprise-card p-8 bg-[#111827]/50 max-w-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TerminalIcon size={14} className="text-[var(--zynthsecure-green)]" />
                <span className="text-label text-[var(--zynthsecure-green)]">Remediation_Manifest</span>
              </div>
              <span className="text-[9px] font-mono text-[#64748b]">{new Date(remediation.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="font-bold text-white text-base mb-6 leading-tight">{remediation.description}</div>
            
            {remediation.patch ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode size={12} className="text-blue-500" />
                    <span className="font-mono text-[10px] text-[#64748b]">{remediation.patch.filePath}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(remediation.patch?.patchContent || '')
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#64748b] hover:text-white transition-colors"
                  >
                    Copy_Patch
                  </button>
                </div>
                
                <pre className="p-6 bg-black border border-[#1f2937] font-mono text-[11px] text-blue-100 overflow-x-auto">
                   <code>{remediation.patch.patchContent}</code>
                </pre>
                
                <p className="text-[11px] italic text-[#64748b] leading-relaxed border-l border-[#1f2937] pl-4">
                  {remediation.patch.explanation}
                </p>
              </div>
            ) : (
              <div className="text-[#64748b] text-sm italic">
                {remediation.file} | {remediation.type}
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
      <div className="space-y-4">
        <button 
          onClick={handleFix}
          className="btn-enterprise-primary"
        >
          <Zap size={14} className="mr-3" />
          Generate Patch
        </button>
        {error && (
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#ef4444] mt-4">
            {error}
          </div>
        )}
      </div>

      {showTerminal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95">
          <div className="w-full max-w-4xl relative">
            <button 
              onClick={() => setShowTerminal(false)}
              className="absolute -top-16 right-0 text-label hover:text-white"
            >
              <X size={16} className="mr-2 inline" /> Exit_Terminal
            </button>
            <HackerTerminal 
              title={`Generating Patch - ${testName}`}
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

