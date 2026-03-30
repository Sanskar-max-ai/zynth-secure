'use client'

import React, { useState } from 'react'
import { Shield, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function MonitorToggle({ 
  domainId, 
  initialEnabled, 
  domainName,
  isPro = false
}: { 
  domainId: string, 
  initialEnabled: boolean, 
  domainName: string,
  isPro?: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function toggleMonitor() {
    if (!isPro && !enabled) {
      router.push('/dashboard/billing')
      return
    }

    setIsLoading(true)
    const nextState = !enabled
    
    const { error } = await supabase
      .from('domains')
      .update({ monitoring_enabled: nextState })
      .eq('id', domainId)

    if (error) {
      console.error('Failed to toggle monitoring:', error)
      alert('Failed to update monitoring status.')
    } else {
      setEnabled(nextState)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-[#0d1526]/50 rounded-xl border border-white/5 hover:border-[#00ff88]/30 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${enabled ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-[var(--zynth-text)]'}`}>
          {enabled ? <Shield size={20} /> : <ShieldAlert size={20} />}
        </div>
        <div>
          <div className="font-bold text-sm text-white">{domainName}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-50 flex items-center gap-1">
            {enabled ? (
              <span className="text-[#00ff88]">Guarded</span>
            ) : (
              <span>Not Monitored</span>
            )}
            {showSuccess && <CheckCircle2 size={10} className="text-[#00ff88] animate-bounce" />}
          </div>
        </div>
      </div>

      <button
        onClick={toggleMonitor}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-[#00ff88]' : 'bg-white/10'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={12} className="animate-spin text-black" />
          </div>
        )}
      </button>
    </div>
  )
}
