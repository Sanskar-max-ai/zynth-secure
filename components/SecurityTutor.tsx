'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Bot, User, Loader2, Shield, Brain, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function SecurityTutor({ scanId }: { scanId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    if (!isOpen || messages.length > 0) return
    let isCancelled = false
    async function loadHistory() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true })
      if (!isCancelled) {
        if (!error) setMessages(data as Message[])
        setIsLoading(false)
      }
    }
    loadHistory()
    return () => { isCancelled = true }
  }, [isOpen, messages.length, scanId, supabase])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, message: userMessage })
      })
      const data = await res.json() as { error?: string; message?: string }
      if (data.error) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Error occurred.' }])
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-12 right-12 z-50 flex items-center gap-4 bg-[var(--zynthsecure-green)] text-black font-black px-8 py-4 rounded-sm shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:scale-105 transition-all text-xs tracking-widest enterprise-btn"
            {...({} as any)}
          >
            <Brain size={18} />
            ASK_SECURITY_ADVISOR
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-black border-l border-[#1f2937] shadow-[-20px_0_60px_rgba(0,0,0,0.8)] z-[100] flex flex-col font-inter"
            {...({} as any)}
          >
            {/* Header */}
            <div className="flex-none p-10 border-b border-[#1f2937] flex items-center justify-between bg-[#111827]/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-sm bg-[var(--zynthsecure-green)]/10 flex items-center justify-center text-[var(--zynthsecure-green)] border border-[var(--zynthsecure-green)]/20 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight uppercase">Security Advisor</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--zynthsecure-green)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--zynthsecure-green)]">Operational</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 text-[#64748b] hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide"
            >
              {messages.length === 0 && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-30">
                  <Shield size={64} className="text-[#64748b] mb-8" />
                  <p className="text-massive-label text-white mb-4 italic">Request Insight</p>
                  <p className="text-sm text-[#64748b] leading-relaxed">System is ready to translate audit telemetry into remediation pathways.</p>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex gap-5 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
                  {...({} as any)}
                >
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-[#111827] text-[var(--zynthsecure-green)] border border-[#1f2937]' : 'bg-[var(--zynthsecure-green)] text-black'}`}>
                    {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`flex flex-col gap-3 max-w-[85%] ${m.role === 'assistant' ? '' : 'items-end'}`}>
                    <div className={`p-6 rounded-sm text-sm leading-relaxed border ${m.role === 'assistant' ? 'bg-[#111827]/50 border-[#1f2937] text-white/90' : 'bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]'}`}>
                      {m.content.split('\n').map((line, idx) => (
                        <p key={idx} className={line.trim() === '' ? 'h-3' : 'mb-3 last:mb-0'}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <span className="text-label text-[#64748b]">
                      {m.role === 'assistant' ? 'Advisor_Telemetry' : 'Operator_Request'}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-center">
                  <Loader2 size={16} className="animate-spin text-[var(--zynthsecure-green)]" />
                  <span className="text-label text-[var(--zynthsecure-green)] animate-pulse">DECODING_REPSONSE...</span>
                </div>
              )}

              {error && (
                <div className="p-6 border border-[#ef4444]/20 bg-[#ef4444]/5 text-[#ef4444] text-[11px] flex gap-4 items-center">
                  <AlertCircle size={14} className="shrink-0" />
                  <p className="font-bold tracking-widest">{error.toUpperCase()}</p>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex-none p-10 border-t border-[#1f2937] bg-[#111827]/50">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for mission-critical insight..."
                  className="w-full bg-black border border-[#1f2937] rounded-sm py-6 pl-8 pr-20 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[var(--zynthsecure-green)] transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-4 top-4 p-3 rounded-sm bg-[var(--zynthsecure-green)] text-black hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send size={20} />
                </button>
              </form>
              <div className="mt-8 text-[10px] text-center text-[#64748b] uppercase tracking-[0.2em]">
                Secure Transmission Active // AI_Guidance_Enabled
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
