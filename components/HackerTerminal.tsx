'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Loader2, Activity, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HackerTerminalProps {
  title: string
  steps: string[]
  onComplete?: () => void
  isRemediation?: boolean
  target?: string
}

export default function HackerTerminal({ 
  title, 
  steps, 
  onComplete, 
  isRemediation = false,
  target
}: HackerTerminalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)
  const isAutoScrollEnabled = useRef(true)

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`])
        setCurrentStep(prev => prev + 1)
      }, 300 + Math.random() * 500)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 1200)
      return () => clearTimeout(timer)
    }
  }, [currentStep, steps, onComplete])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // If user scrolls up, disable auto-scroll. If they hit the bottom, re-enable it.
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10
    isAutoScrollEnabled.current = isAtBottom
  }

  useEffect(() => {
    if (isAutoScrollEnabled.current && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const colorHex = isRemediation ? '#3b82f6' : '#00ff88'
  
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-[500px] border border-[#1f2937] bg-black shadow-2xl overflow-hidden font-mono uppercase tracking-widest text-[11px] enterprise-terminal">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#1f2937] bg-[#111827]/30">
        <div className="flex items-center gap-4">
           <Terminal size={14} style={{ color: colorHex }} />
           <div className="space-y-1">
              <div className="text-[9px] text-[#64748b] font-black tracking-[0.3em]">{isRemediation ? 'REMEDIATION_PROTOCOL' : 'SECURITY_AUDIT_LOG'}</div>
              <div className="text-white font-bold leading-none">{title}</div>
           </div>
        </div>
        <div className="flex gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/20" />
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={terminalRef}
        onScroll={handleScroll}
        className="p-8 overflow-y-auto space-y-3 bg-[#0a0a0a]/50 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {terminalLines.map((line, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4"
              {...({} as any)}
            >
              <span className="opacity-30" style={{ color: colorHex }}>0{i+1}</span>
              <span className="text-[#64748b]">❯</span>
              <span className="text-white normal-case font-medium">{line}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentStep < steps.length && (
           <div className="flex items-center gap-4 pt-4">
              <Loader2 size={12} className="animate-spin" style={{ color: colorHex }} />
              <span className="text-[10px] font-black animate-pulse" style={{ color: colorHex }}>
                 {isRemediation ? 'SYNCHRONIZING' : 'ANALYZING'}_NODE...
              </span>
           </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-8 py-6 border-t border-[#1f2937] bg-[#111827]/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="text-[10px] text-[#64748b] font-bold">STATUS:</div>
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--zynthsecure-green)] animate-pulse shadow-[0_0_8px_var(--zynthsecure-green)]" />
              <span className="text-white font-bold">{Math.round((currentStep / steps.length) * 100)}%</span>
           </div>
        </div>

        {target && (
           <div className="hidden sm:flex items-center gap-4">
              <span className="text-[10px] text-[#64748b] font-bold">TARGET:</span>
              <span className="text-white font-bold truncate max-w-[200px]">{target}</span>
           </div>
        )}

        <div className="w-32 h-1 bg-[#1f2937] rounded-full overflow-hidden">
           <motion.div 
             className="h-full"
             style={{ background: colorHex }}
             animate={{ width: `${(currentStep / steps.length) * 100}%` }}
             {...({} as any)}
           />
        </div>
      </div>
    </div>
  )
}
