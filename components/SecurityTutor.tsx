'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadHistory() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load history:', error)
    } else {
      setMessages(data as Message[])
    }
    setIsLoading(false)
  }

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

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-110 transition-transform flex items-center gap-2 group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="font-bold text-sm">Ask Zynth Tutor</span>
      </button>

      {/* Chat Sidebar/Modal */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#060b14] border-l border-white/10 shadow-2xl z-[60] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0d1526]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 text-[#00ff88]">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">AI Security Tutor</h3>
              <p className="text-[10px] text-[#00ff88] animate-pulse uppercase tracking-widest font-bold">Zynth Guard Active</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--zynth-text)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-8">
              <Bot size={48} className="text-[#00ff88]" />
              <div>
                <p className="font-bold text-white">How can I help with your audit?</p>
                <p className="text-xs">Ask me how to fix specific vulnerabilities, or for the terminal commands for your platform.</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'}`}>
              <div className={`p-2 rounded-lg shrink-0 ${m.role === 'assistant' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-white'}`}>
                {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`flex flex-col gap-1 max-w-[85%] ${m.role === 'assistant' ? '' : 'items-end'}`}>
                 <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-white/5 text-blue-50/90 rounded-tl-none' : 'bg-[#00ff88] text-black font-medium rounded-tr-none'}`}>
                   {m.content.split('\n').map((line, idx) => (
                     <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                       {line}
                     </p>
                   ))}
                 </div>
                 <span className="text-[9px] text-[var(--zynth-text)] opacity-50 uppercase font-black">
                   {m.role === 'assistant' ? 'Zynth AI' : 'You'}
                 </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="p-2 rounded-lg bg-[#00ff88]/10 text-[#00ff88]">
                <Loader2 size={18} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 text-blue-50/50 text-sm italic rounded-tl-none">
                Analyzing audit findings...
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-100 text-xs flex gap-3 items-center">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10 bg-[#0d1526]/50">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up about this audit..."
              className="w-full bg-[#060b14] border border-white/10 rounded-xl py-4 pl-4 pr-14 text-sm text-white focus:outline-none focus:border-[#00ff88] transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-[#00ff88] text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center mt-4 text-[var(--zynth-text)] opacity-50">
             Zynth AI can make mistakes. Verify critical commands.
          </p>
        </div>
      </div>
    </>
  )
}
