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
    if (!isOpen || messages.length > 0) {
      return
    }

    let isCancelled = false

    async function loadHistory() {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true })

      if (!isCancelled) {
        if (error) {
          console.error('Failed to load history:', error)
        } else {
          setMessages(data as Message[])
        }

        setIsLoading(false)
      }
    }

    loadHistory()

    return () => {
      isCancelled = true
    }
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

      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'I could not generate a reply just now.' }])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('Chat error:', err)
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
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-3xl bg-[var(--plasma-gradient)] p-5 text-sm font-black text-black shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all hover:scale-105 group"
          >
            <Brain size={20} className="group-hover:rotate-6 transition-transform" />
            ASK ZYNTH
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] premium-glass border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="flex-none p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--zynthsecure-green)]/10 flex items-center justify-center text-[var(--zynthsecure-green)] shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">Zynth Security Guide</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--zynthsecure-green)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--zynthsecure-green)]">Ready To Help</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/50 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide overscroll-contain"
            >
              <AnimatePresence initial={false}>
                {messages.length === 0 && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center px-12 opacity-30"
                  >
                    <Shield size={64} className="text-[var(--zynthsecure-green)] mb-6" />
                    <p className="font-black text-xl mb-2">Ask about this report</p>
                    <p className="text-sm">Try questions about findings, severity, remediation steps, or what to fix first.</p>
                  </motion.div>
                )}

                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex gap-4 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${m.role === 'assistant' ? 'bg-[var(--zynthsecure-green)]/10 text-[var(--zynthsecure-green)] border border-[var(--zynthsecure-green)]/20' : 'bg-white/5 text-white border border-white/10'}`}>
                      {m.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                    </div>
                    <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === 'assistant' ? '' : 'items-end'}`}>
                      <div className={`p-5 rounded-2xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-white/5 text-blue-50/90 border border-white/5 shadow-sm' : 'bg-[var(--plasma-gradient)] text-[#060b14] font-bold shadow-[0_0_20px_rgba(0,255,136,0.2)]'}`}>
                        {m.content.split('\n').map((line, idx) => (
                          <p key={idx} className={line.trim() === '' ? 'h-3' : 'mb-2 last:mb-0'}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        {m.role === 'assistant' ? 'Zynth Guide' : 'You'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 items-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--zynthsecure-green)]/10 text-[var(--zynthsecure-green)] flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--zynthsecure-green)] opacity-50">Preparing Response...</span>
                </motion.div>
              )}

              {error && (
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-100 text-xs flex gap-4 items-center shadow-inner">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="font-bold">{error}</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex-none p-6 sm:p-8 border-t border-white/5 bg-white/[0.02]">
              <form onSubmit={handleSend} className="relative mb-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this report..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-sm text-white focus:outline-none focus:border-[var(--zynthsecure-green)] transition-all backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 p-3 rounded-xl bg-[var(--zynthsecure-green)] text-black hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-[10px] text-center text-[var(--zynthsecure-text)] italic opacity-50 px-8 leading-tight">
                Review suggested fixes carefully before applying any change in production.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
