'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Terminal, UserCheck, Download, Share2 } from 'lucide-react'
import ExpertRequestModal from './ExpertRequestModal'

interface ResolutionCenterProps {
  scanId: string
  userId: string
  url: string
}

export default function ResolutionCenter({ scanId, userId, url }: ResolutionCenterProps) {
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false)

  return (
    <>
      <div className="card p-6 border-l-4 border-l-[#00ff88]">
        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-[#00ff88]" />
          Resolution Center
        </h3>
        <p className="text-xs text-[var(--zynth-text)] mb-6 leading-relaxed">
          Finding vulnerabilities is only half the battle. Zynth helps you close the loop with verified resolution paths.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => setIsExpertModalOpen(true)}
            className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 group transition-all transform active:scale-95"
          >
            <UserCheck size={16} />
            Hire a Zynth Expert
            <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded opacity-70 group-hover:opacity-100 transition-opacity">PRO</span>
          </button>
          
          <Link 
            href={`/dashboard/scan/${scanId}/technical`}
            className="w-full btn-secondary py-3 text-sm font-bold flex items-center justify-center gap-2 block text-center"
          >
            <Download size={16} />
            PDF for Developers
          </Link>
          
          <button 
            className="w-full border border-white/10 hover:bg-white/5 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Report link copied to clipboard!');
            }}
          >
            <Share2 size={16} />
            Share Brief Link
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
            Next Recommended Step
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs italic text-gray-400">
            "Download the technical brief and assign it to your lead developer. If you don't have a developer, our Zynth experts can remediate these findings for a flat fee."
          </div>
        </div>
      </div>

      <ExpertRequestModal 
        isOpen={isExpertModalOpen} 
        onClose={() => setIsExpertModalOpen(false)} 
        scanId={scanId}
        userId={userId}
        url={url}
      />
    </>
  )
}
