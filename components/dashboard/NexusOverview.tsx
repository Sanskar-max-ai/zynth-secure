'use client'

import { motion } from 'framer-motion'
import { Shield, Activity, Zap, Command, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface NexusOverviewProps {
  score: number
  totalIssues: number
  scansCount: number
}

export default function NexusOverview({ score, totalIssues, scansCount }: NexusOverviewProps) {
  return (
    <div className="grid md:grid-cols-3 gap-12">
      {/* Metric Card: Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="enterprise-card group"
        {...({} as any)}
      >
        <div className="flex items-start justify-between mb-8">
           <div className="text-label">LATEST_SCORE</div>
           <Activity size={32} className="text-[var(--zynthsecure-green)] opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-large-metric text-white font-black">{score}</span>
          <span className="text-2xl font-bold text-[#64748b]">/100</span>
        </div>
        <div className="mt-4 h-1 w-full bg-[#1f2937] overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${score}%` }}
             className="h-full bg-[var(--zynthsecure-green)]"
             {...({} as any)}
           />
        </div>
      </motion.div>

      {/* Metric Card: Critical Issues */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="enterprise-card group"
        {...({} as any)}
      >
        <div className="flex items-start justify-between mb-8">
           <div className="text-label">OPEN_CRITICAL_ISSUES</div>
           <Shield size={32} className={`${totalIssues > 0 ? 'text-[#ef4444]' : 'text-[var(--zynthsecure-green)]'} opacity-50 group-hover:opacity-100 transition-opacity`} />
        </div>
        <div className="text-large-metric text-white font-black">{totalIssues}</div>
        <div className="mt-4 text-[11px] font-mono text-[#64748b] uppercase tracking-widest">
           {totalIssues > 0 ? 'Immediate Action Required' : 'System Secure'}
        </div>
      </motion.div>

      {/* Metric Card: Total Scans */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="enterprise-card group"
        {...({} as any)}
      >
        <div className="flex items-start justify-between mb-8">
           <div className="text-label">TOTAL_SCANS_EXECUTED</div>
           <Zap size={32} className="text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-large-metric text-white font-black">{scansCount}</div>
        <div className="mt-4 text-[11px] font-mono text-[#64748b] uppercase tracking-widest">
           Node Integration Active
        </div>
      </motion.div>
    </div>
  )
}
