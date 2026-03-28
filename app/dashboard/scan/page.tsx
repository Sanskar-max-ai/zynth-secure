'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldAlert } from 'lucide-react'

export default function NewScanPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    
    // In the next step, we will wire this up to save to Supabase!
    // For now, it will just hit the API and redirect to the report.
    try {
      const res = await fetch('/api/scan/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      
      // Redirect directly to the newly generated detailed scan report
      if (data && data.id) {
        router.push(`/dashboard/scan/${data.id}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Run New Audit</h1>
        <p style={{ color: 'var(--shield-text)' }}>
          Enter any domain below to run a comprehensive security and vulnerability audit.
        </p>
      </div>

      <div className="card p-8 mb-8" style={{ border: '1px solid rgba(0,255,136,0.2)' }}>
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#060b14] border border-gray-800 rounded-lg py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary px-8 font-bold text-lg disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Auditing...
              </span>
            ) : 'Start Audit'}
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/5">
          <ShieldAlert className="mb-4 text-[#00ff88]" size={28} />
          <h3 className="font-bold mb-2">What happens during an audit?</h3>
          <ul className="text-sm space-y-2" style={{ color: 'var(--shield-text)' }}>
            <li>• Testing Data Privacy & Encryption</li>
            <li>• Verifying Anti-Hacking Shields</li>
            <li>• Hunting for Data Leaks & Exposures</li>
            <li>• Checking Email & Identity Security</li>
          </ul>
        </div>
        
        <div className="p-6 rounded-xl bg-white/5 border border-white/5">
          <h3 className="font-bold mb-2">Notice on Authorization</h3>
          <p className="text-sm" style={{ color: 'var(--shield-text)' }}>
            Only audit domains that you own or have explicit authorization to audit. 
            All audits are completely passive and will not disrupt target web active services.
          </p>
        </div>
      </div>
    </div>
  )
}
