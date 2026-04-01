'use client'

import { Download, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DownloadPdfButton({ isPro }: { isPro: boolean }) {
  const router = useRouter()

  function handleDownload() {
    if (!isPro) {
      router.push('/dashboard/settings/billing')
      return
    }

    // Trigger the print dialog which is styled for PDF in globals.css
    window.print()
  }

  return (
    <button 
      onClick={handleDownload}
      className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 transition-all shadow-lg border border-white/10"
    >
      {isPro ? <Download size={18} /> : <Lock size={18} />}
      {isPro ? 'Download PDF Report' : 'Upgrade for PDF Export'}
    </button>
  )
}
