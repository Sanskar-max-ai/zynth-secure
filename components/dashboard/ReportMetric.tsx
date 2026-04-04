'use client'

import { motion } from 'framer-motion'

interface ReportMetricProps {
  score: number
  label: string
  subtext?: string
}

export default function ReportMetric({ score, label, subtext }: ReportMetricProps) {
  const color = score >= 80 ? '#00ff88' : score >= 50 ? '#f59e0b' : '#ef4444'
  const radius = 60
  const circumference = 2 * Math.PI * radius

  return (
    <div className="enterprise-card flex flex-col items-center justify-center p-10 text-center">
      <div className="relative mb-6">
        {/* Shadow Background */}
        <div className="absolute inset-0 rounded-full bg-black shadow-[inset_0_0_20px_rgba(0,0,0,1)]" />
        
        <svg className="w-40 h-40 -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth="4"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
            {...({} as any)}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">{score}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">INDEX</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">{label}</h3>
        {subtext && <p className="text-[11px] text-[#64748b] font-medium">{subtext}</p>}
      </div>
    </div>
  )
}
