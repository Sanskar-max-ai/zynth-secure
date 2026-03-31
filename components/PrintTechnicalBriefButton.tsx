'use client'

import { Printer } from 'lucide-react'

export default function PrintTechnicalBriefButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
    >
      <Printer size={16} /> Print Technical Brief
    </button>
  )
}
