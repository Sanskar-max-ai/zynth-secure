'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Loader2 } from 'lucide-react'

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
  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setTerminalLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`])
        setCurrentStep(prev => prev + 1)
      }, 500 + Math.random() * 700)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 1500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, steps, onComplete])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLines])

  const colorClass = isRemediation ? 'text-blue-400' : 'text-[#00ff88]'
  const borderColor = isRemediation ? 'border-blue-500/30' : 'border-[#00ff88]/30'
  const shadowColor = isRemediation ? 'shadow-blue-500/10' : 'shadow-[#00ff88]/10'

  return (
    <div className={`card overflow-hidden bg-[#060b14] shadow-[0_0_50px_rgba(0,0,0,0.5)] ${borderColor} ${shadowColor}`}>
      <div className="bg-[#0d1526] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={18} className={colorClass} />
          <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">
            {title}
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]/20" />
        </div>
      </div>
      
      <div className="p-4 sm:p-6 h-[400px] overflow-y-auto font-mono text-xs sm:text-[13px] space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
        {terminalLines.map((line, i) => (
          <div key={i} className="flex gap-3 animate-fade-in">
            <span className={`shrink-0 ${colorClass}`}>❯</span>
            <span className="text-gray-300">{line}</span>
          </div>
        ))}
        {currentStep < steps.length && (
          <div className="flex gap-3 items-center mt-4">
            <Loader2 className={`animate-spin ${colorClass}`} size={14} />
            <span className={`animate-pulse ${colorClass}`}>
              {isRemediation ? 'Fixing' : 'Executing'}: {steps[currentStep]}
            </span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      <div className="bg-[#0d1526] p-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-800 gap-4">
        {target && (
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Target: <span className="text-gray-300 truncate max-w-[150px] inline-block align-bottom">{target}</span></div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-24 sm:w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isRemediation ? 'bg-blue-500' : 'bg-[#00ff88]'}`}
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold ${colorClass}`}>
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
