'use client'

import { useState } from 'react'
import { X, UserCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ExpertRequestModalProps {
  isOpen: boolean
  onClose: () => void
  scanId: string
  userId: string
  url: string
}

const EXPERT_TYPES = [
  { id: 'remediation', name: 'Security Remediation', desc: 'A hands-on expert to fix the vulnerabilities found in your audit.' },
  { id: 'consulting', name: 'Strategic Consulting', desc: 'Advice on your overall security posture and infrastructure.' },
  { id: 'compliance', name: 'Compliance Review', desc: 'Specific guidance for PCI-DSS, SOC2, or HIPAA readiness.' },
]

export default function ExpertRequestModal({ isOpen, onClose, scanId, userId, url }: ExpertRequestModalProps) {
  const [selectedType, setSelectedType] = useState('remediation')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbErr } = await supabase.from('expert_requests').insert({
        user_id: userId,
        scan_id: scanId,
        expert_type: selectedType,
        message: message,
        status: 'pending'
      })

      if (dbErr) throw dbErr
      setSuccess(true)
    } catch (err: any) {
      console.error('Expert request error:', err)
      setError(err.message || 'Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0d1526] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 text-[#00ff88]">
              <UserCheck size={20} />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">Hire a Zynth Expert</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">Choose your expert path</label>
                <div className="space-y-3">
                  {EXPERT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedType === type.id 
                          ? 'bg-[#00ff88]/5 border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.1)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="font-bold text-sm mb-1 text-white">{type.name}</div>
                      <div className="text-xs text-gray-400 leading-relaxed">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Tell us more (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. My site is on WordPress and I need the SSL fix ASAP..."
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#00ff88] transition-colors h-24 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 italic">
                  ⚠ {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 font-black flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Send Request
                      <span className="text-xs opacity-50 font-normal">· Free Matching</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-3 leading-relaxed">
                  We'll review your scan at <span className="text-gray-300 font-mono">{url}</span> and match you with a certified security professional within 24 hours.
                </p>
              </div>
            </form>
          ) : (
            <div className="py-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 text-[#00ff88] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black mb-3">Request Received</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed mb-8">
                A Zynth Security Specialist has been assigned to your case. We'll contact you at your account email briefly to discuss the next steps.
              </p>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
