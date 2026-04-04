'use client'

import { motion } from 'framer-motion'
import { ShieldAlert, Scale, FileText, Ban, Eye, Database, Lock } from 'lucide-react'

const SECTIONS = [
  { icon: Eye, title: 'Data Collection', content: 'We collect scan metadata (URLs, headers, findings) and user credentials (via Supabase Auth) to provide security reporting and dashboard history.' },
  { icon: Lock, title: 'Data Encryption', content: 'All data is encrypted in transit using TLS 1.3 and at rest via AES-256 in our Supabase instance. We use Row-Level Security (RLS) to ensure your data is isolated.' },
  { icon: Database, title: 'Third-Party Tools', content: 'AI Engine: We use Google Gemini to analyze scan findings. No user-identifying data is sent to the AI, only raw scan outputs. Infrastructure: Our services are hosted on Vercel and Supabase.' },
  { icon: Ban, title: 'Right to Be Forgotten', content: 'You have the "Right to be Forgotten." You can request the permanent destruction of all scan history and user profiles at any time through your dashboard or by emailing our Zynth Command Center.' }
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] py-20 text-white selection:bg-[#00ff88]/30">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-kicker mx-auto mb-4"
          >
            <span>Privacy Protocol</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight sm:text-6xl"
          >
            Data <span className="text-[#00ff88]">Security</span>
          </motion.h1>
          <p className="mt-6 text-slate-400 font-mono text-[11px] uppercase tracking-widest">Effective April 2026</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="marketing-panel p-10 border-white/5 bg-white/[0.01]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-white/5 text-[#00ff88]">
                  <section.icon size={20} />
                </div>
                <h3 className="text-2xl font-bold">{section.title}</h3>
              </div>
              <p className="text-lg leading-8 text-slate-400">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 p-8 rounded-3xl border border-[#00ff88]/10 bg-[#00ff88]/5 text-center"
        >
          <p className="text-sm font-bold text-[#00ff88] uppercase tracking-widest">
            Privacy is our signal. Security is our foundation.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
