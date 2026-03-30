'use client'

import { Download, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DownloadPdfButton({ isPro }: { isPro: boolean }) {
  function handleDownload() {
    // Trigger the print dialog which is styled for PDF in globals.css
    window.print()
  }

  return (
    <button 
      onClick={handleDownload}
      className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 transition-all shadow-lg border border-white/10"
    >
      <Download size={18} />
      Download PDF Report
    </button>
  )
}
