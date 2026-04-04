'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Brain, Database, ShieldAlert, CheckCircle } from 'lucide-react'

const AGENT_THOUGHTS = [
  "Mapping initial attack surface...",
  "Querying vulnerability databases...",
  "Analyzing SSL/TLS certificate chain...",
  "Detecting platform-specific vulnerabilities...",
  "Evaluating business logic flows...",
  "Simulating adversarial prompt injection...",
  "Synthesizing remediation strategy...",
  "Wait: Found potential CVE-2024 mapping.",
  "Correlating findings across 15 vectors...",
  "Zynth Secure: System heartbeat stable.",
  "Monitoring reactive security layers..."
]

export default function AgentStatusFeed() {
  const [currentThought, setCurrentThought] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThought(prev => (prev + 1) % AGENT_THOUGHTS.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const icons = [
    <Cpu size={14} key="cpu" />,
    <Brain size={14} key="brain" />,
    <Database size={14} key="db" />,
    <ShieldAlert size={14} key="alert" />,
    <CheckCircle size={14} key="check" />
  ]

  return (
    <div className="marketing-panel p-6 border-blue-500/10 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
         <div className="animate-pulse">
           <Cpu size={32} className="text-[var(--zynthsecure-green)]" />
         </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[var(--zynthsecure-green)]/10 flex items-center justify-center text-[var(--zynthsecure-green)] border border-[var(--zynthsecure-green)]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
           <Brain size={18} className="animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 block mb-0.5">Autonomous Agent</span>
          <span className="text-xs font-bold text-white">Zynth Core Thought Process</span>
        </div>
      </div>

      <div className="h-10 overflow-hidden bg-black/40 rounded-xl border border-white/5 flex items-center px-4 gap-4 relative">
        <div className="absolute left-0 top-0 h-full w-1 bg-[var(--zynthsecure-green)] opacity-50" />
        <div className="flex-none text-[var(--zynthsecure-green)] flicker">
           {icons[currentThought % icons.length]}
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentThought}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[11px] font-mono text-white/70 italic truncate"
              {...({} as any)}
            >
              {AGENT_THOUGHTS[currentThought]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
           {[1,2,3,4].map(i => (
             <div key={i} className={`w-1 h-1 rounded-full bg-[var(--zynthsecure-green)] ${currentThought % 4 === i-1 ? 'opacity-100 scale-125' : 'opacity-20'}`} />
           ))}
        </div>
      </div>
    </div>
  )
}
