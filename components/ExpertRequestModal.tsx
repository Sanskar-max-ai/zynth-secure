'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserCheck, Shield, Send, CheckCircle2 } from 'lucide-react'

interface ExpertRequestModalProps {
  scanId: string
  userId: string
  onClose: () => void
}

export default function ExpertRequestModal({ scanId, userId, onClose }: ExpertRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('remediation')

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('expert_requests')
      .insert({
        user_id: userId,
        scan_id: scanId,
        expert_type: type,
        message: message,
        status: 'pending'
      })

    if (!error) {
      setSent(true)
      // Small Delay before closing
      setTimeout(onClose, 2500)
    } else {
      console.error('Zynth Error: Expert Request Failed:', error)
      alert('FAILED TO SEND REQUEST. PLEASE TRY AGAIN.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full card p-8 text-center border-[#00ff88]/30 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
          <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mx-auto mb-6 border border-[#00ff88]/30">
            <CheckCircle2 size={32} className="text-[#00ff88] animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Request Decrypted</h2>
          <p className="text-sm text-gray-400 mb-0 leading-relaxed">
            A Zynth Forensic Expert has been matched to your audit. We will reach out within <span className="text-white font-bold">2-4 Hours</span> via your registered email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-fade-up">
      <div className="max-w-xl w-full card overflow-hidden border-[#00ff88]/20 shadow-[0_0_100px_rgba(0,255,136,0.05)]">
        <div className="bg-[#0d1526] p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <UserCheck size={24} className="text-[#00ff88]" />
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Premium Service</h2>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Hire Zynth Forensic Pro</h3>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <button 
                onClick={() => setType('remediation')}
                className={`p-4 rounded-xl border text-left transition-all ${type === 'remediation' ? 'bg-[#00ff88]/10 border-[#00ff88]/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
             >
                <div className={`text-[10px] font-bold uppercase mb-1 ${type === 'remediation' ? 'text-[#00ff88]' : 'text-gray-500'}`}>Type 01</div>
                <div className="text-sm font-black text-white uppercase">Auto-Remediation Pro</div>
             </button>
             <button 
                onClick={() => setType('security_consulting')}
                className={`p-4 rounded-xl border text-left transition-all ${type === 'security_consulting' ? 'bg-[#00ff88]/10 border-[#00ff88]/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
             >
                <div className={`text-[10px] font-bold uppercase mb-1 ${type === 'security_consulting' ? 'text-[#00ff88]' : 'text-gray-500'}`}>Type 02</div>
                <div className="text-sm font-black text-white uppercase">Security Architecture</div>
             </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Context (What should we look at?)</label>
            <textarea 
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00ff88]/40 outline-none transition-all placeholder:text-gray-700"
              placeholder="e.g. Needs immediate patching of detected CVEs on our production Nginx server..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-4">
             <Shield size={20} className="text-yellow-500 shrink-0" />
             <p className="text-[10px] sm:text-xs text-yellow-500/80 leading-relaxed font-bold">
               Zynth Experts are industry-certified security specialists. This is a premium billed service starting at $250/hour for hands-on review.
             </p>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading || !message}
            className="w-full py-4 bg-[#00ff88] text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Transmitting...' : (
              <>
                <Send size={18} />
                Send Request to Command Center
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
