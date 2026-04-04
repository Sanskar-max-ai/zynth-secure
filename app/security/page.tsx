'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Server, Radio, Database } from 'lucide-react'

const SECURITY_PILLARS = [
  { icon: Shield, title: 'Adversarial Defense', desc: 'Zynth uses autonomous Red Teaming to simulate bypasses before they happen.' },
  { icon: Lock, title: 'Data Encryption', desc: 'All scan metadata and findings are encrypted at rest with AES-256 and TLS 1.3.' },
  { icon: Eye, title: 'Zero-Trust Auditing', desc: 'Every internal scan is performed with least-privileged access models.' },
  { icon: Server, title: 'Infrastructure Isolation', desc: 'Scan engines run in ephemeral, isolated environments for total safety.' },
  { icon: Database, title: 'Secure Persistence', desc: 'We leverage Supabase and Row-Level Security to ensure your data stays yours.' },
  { icon: Radio, title: 'Compliance Mapping', desc: 'Our findings map directly to OWASP, SOC2, and ISO 27001 requirements.' }
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#020617] py-20 text-white selection:bg-[#00ff88]/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="mx-auto max-w-2xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-kicker mx-auto mb-6"
          >
            <span>Security Protocol</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white sm:text-6xl"
          >
            Trust is the <span className="text-[#00ff88]">terminal signal.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-400"
          >
            We don't just find vulnerabilities; we protect the data of those who find them. 
            Zynth is built on a foundation of professional-grade security architecture.
          </motion.p>
        </div>

        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {SECURITY_PILLARS.map((pillar, idx) => (
              <motion.div 
                key={pillar.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="marketing-card p-8 group"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ff88]/10 text-[#00ff88] group-hover:scale-110 transition-transform">
                  <pillar.icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-32 rounded-[3.5rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-12 lg:p-20 text-center"
        >
           <h2 className="text-3xl font-black text-white mb-6">Built for the next era of defense.</h2>
           <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
              <div className="text-xs font-black tracking-widest">OWASP Top 10</div>
              <div className="text-xs font-black tracking-widest">SOC2 TYPE II</div>
              <div className="text-xs font-black tracking-widest">GDPR COMPLIANT</div>
              <div className="text-xs font-black tracking-widest">ISO 27001 READY</div>
           </div>
        </motion.div>
      </div>
    </div>
  )
}
