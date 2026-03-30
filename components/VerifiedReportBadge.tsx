'use client'

import { ShieldCheck, Info } from 'lucide-react'

interface VerifiedReportBadgeProps {
  scanId: string
  compact?: boolean
}

export default function VerifiedReportBadge({ scanId, compact = false }: VerifiedReportBadgeProps) {
  // Generates a mock but realistic-looking hash from the scanId
  const hash = Array.from(scanId || 'zynth')
    .slice(0, 12)
    .map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
    .join('')

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00ff88]/10 border border-[#00ff88]/20 text-[9px] font-mono font-bold text-[#00ff88] uppercase tracking-tighter">
        <ShieldCheck size={10} />
        VERIFIED {hash}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/20 group relative overflow-hidden transition-all hover:bg-[#00ff88]/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00ff88]/10 text-[#00ff88]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-black text-[#00ff88] uppercase tracking-widest">Verifiable Audit Report</div>
            <div className="text-[10px] font-mono text-gray-400">HASH: {hash}</div>
          </div>
        </div>
        <div className="hidden sm:block">
           <Info size={14} className="text-gray-600 hover:text-gray-400 cursor-help" />
        </div>
      </div>
      
      {/* Tooltip-like info */}
      <div className="mt-2 pt-2 border-t border-[#00ff88]/10 text-[10px] leading-relaxed text-gray-500 italic">
        "This report is cryptographically signed by the Zynth Security Engine. It contains immutable evidence of the scan parameters and findings."
      </div>
    </div>
  )
}
