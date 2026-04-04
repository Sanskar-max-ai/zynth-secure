'use client'

import { useState, useEffect } from 'react'
import { Bot, Terminal, ShieldAlert, Cpu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VisualProofTerminalProps {
  trace: Array<{ role: 'user' | 'assistant'; content: string }>
  title?: string
}

export default function VisualProofTerminal({ trace, title = 'EXPLOIT_PROOF_TRACE' }: VisualProofTerminalProps) {
  const [displayedSteps, setDisplayedSteps] = useState(0)

  useEffect(() => {
    if (displayedSteps < trace.length) {
      const timer = setTimeout(() => {
        setDisplayedSteps(prev => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [displayedSteps, trace.length])

  return (
    <div className="mt-8 overflow-hidden rounded-sm border border-[#1f2937] bg-black font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1f2937] bg-[#111827]/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <Terminal size={12} className="text-[#00ff88]" />
          <span className="text-[10px] font-black tracking-[0.2em] text-[#64748b]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse shadow-[0_0_8px_#ef4444]" />
          <span className="text-[9px] font-bold text-[#ef4444]">ACTIVE_EXPLOIT_TRACE</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide text-[11px] leading-relaxed">
        <AnimatePresence>
          {trace.slice(0, displayedSteps).map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex gap-4 group"
            >
              <div className="shrink-0 pt-1">
                {msg.role === 'user' ? (
                  <ShieldAlert size={14} className="text-[#3b82f6]" />
                ) : (
                  <Cpu size={14} className="text-[#ef4444]" />
                )}
              </div>
              <div className="space-y-2 flex-grow">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                    {msg.role === 'user' ? 'ADVERSARY_PAYLOAD' : 'TARGET_RESPONSE'}
                  </span>
                  <span className="text-[9px] font-mono text-[#1f2937] group-hover:text-[#64748b] transition-colors uppercase">
                    Step_0{idx + 1}
                  </span>
                </div>
                <div className={`p-3 rounded-sm border ${
                  msg.role === 'user' 
                    ? 'bg-blue-500/5 border-blue-500/10 text-blue-100' 
                    : 'bg-red-500/5 border-red-500/10 text-red-100 italic'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {displayedSteps < trace.length && (
          <div className="flex items-center gap-3 pt-2 text-[#64748b] animate-pulse font-black text-[9px] tracking-widest">
            <span className="w-1 h-1 bg-[#64748b] rounded-full animate-bounce" />
            DECRYPTING_NEXT_INTERACTION...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1f2937] bg-[#111827]/30 px-4 py-2 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <span className="text-[9px] text-[#2d3748] font-black uppercase">Integrity_Check:</span>
           <span className="text-[9px] font-bold text-[#00ff88]">VERIFIED_BY_ZYNTH_SENTINEL</span>
         </div>
         <div className="text-[9px] text-[#2d3748] font-bold font-mono">
           {Math.min(100, Math.round((displayedSteps / trace.length) * 100))}% SYNC
         </div>
      </div>
    </div>
  )
}
