'use client'

import { motion } from 'framer-motion'
import { ShieldAlert, Scale, FileText, Ban } from 'lucide-react'

const SECTIONS = [
  { icon: ShieldAlert, title: 'Authorized Scanning Only', content: 'You may ONLY use Zynth to scan domains, IP addresses, or applications that you OWN or have EXPLICIT WRITTEN PERMISSION to audit. Use of Zynth against unauthorized targets is a violation of these terms and may be illegal.' },
  { icon: Scale, title: 'No Liability For Findings', content: 'Zynth provides "as-is" security analysis and automated remediation code. While our AI Red Team is highly advanced, it is not a 100% guarantee that all vulnerabilities have been identified. Applied fixes are the sole responsibility of the user.' },
  { icon: FileText, title: 'Account Security', content: 'You are responsible for maintaining the confidentiality of your session tokens and credentials. Any suspicious activity must be reported immediately to Zynth Command.' },
  { icon: Ban, title: 'Signal Termination', content: 'Zynth Security reserves the right to terminate access for users found using the service for malicious or unauthorized reconnaissance or automated API abuse.' }
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] py-20 text-white selection:bg-[#00ff88]/30">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-kicker mx-auto mb-4"
          >
            <span>Legal Protocol</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight sm:text-6xl"
          >
            Terms of <span className="text-[#00ff88]">Service</span>
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
            By using Zynth, you acknowledge these tactical constraints and responsibilities.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
