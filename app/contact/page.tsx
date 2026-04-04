'use client'

import { motion } from 'framer-motion'
import { Mail, MessageSquare, ShieldCheck, ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('sending')
    setTimeout(() => setFormStatus('sent'), 1500)
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20 text-white selection:bg-[#00ff88]/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-kicker mx-auto mb-6"
          >
            <span>Get in touch</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white sm:text-6xl"
          >
            How can <span className="text-[#00ff88]">we help?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-400"
          >
            Whether you are looking for enterprise pricing, technical support, or security partnerships, 
            our specialized team is ready to respond.
          </motion.p>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
             <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8">
                <div className="flex items-center gap-4 text-sm font-bold text-[#00ff88]">
                  <Zap size={18} />
                  <span>Support // Response</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold">24/7 Priority Support</h3>
                <p className="mt-3 text-slate-400 text-sm leading-7">
                  Zynth Enterprise customers receive dedicated technical support with a <span className="text-white font-bold">60-minute SLA</span> for critical security incidents.
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm font-bold text-white">
                  <Mail size={16} className="text-[#00ff88]" />
                  support@zynth.io
                </div>
             </div>

             <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8">
                <div className="flex items-center gap-4 text-sm font-bold text-blue-400">
                  <MessageSquare size={18} />
                  <span>Sales // Partnerships</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold">Custom Enterprise Plans</h3>
                <p className="mt-3 text-slate-400 text-sm leading-7">
                  Running thousands of scans a month? We offer tailored agency and enterprise pricing for mass security monitoring.
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm font-bold text-white">
                  <Mail size={16} className="text-blue-400" />
                  partners@zynth.io
                </div>
             </div>
          </motion.div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] border border-white/8 bg-white/[0.02] p-10 shadow-2xl backdrop-blur-xl"
          >
            {formStatus === 'sent' ? (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center animate-fade-up">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00ff88]/10 text-[#00ff88]">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Securely Sent</h3>
                <p className="mt-4 text-slate-400">Our security engineers will review your request and get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Name</label>
                    <input required type="text" className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#00ff88]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Work Email</label>
                    <input required type="email" className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Topic</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#00ff88] appearance-none">
                    <option className="bg-black">Enterprise Sales Inquiry</option>
                    <option className="bg-black">Technical Security Support</option>
                    <option className="bg-black">Media & Partnerships</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Security Perspective</label>
                  <textarea rows={4} className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-blue-500 resize-none" placeholder="How can Zynth assist you..."></textarea>
                </div>

                <button 
                  disabled={formStatus === 'sending'}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00ff88] px-8 py-5 text-sm font-black uppercase tracking-widest text-[#020617] hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  {formStatus === 'sending' ? 'Transmitting...' : 'Send Message'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
