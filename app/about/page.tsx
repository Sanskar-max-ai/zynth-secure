'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Zap, Users, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: Shield, title: 'Defensive excellence', desc: 'Enterprise-grade security scanning for every startup.' },
  { icon: Target, title: 'Adversarial focus', desc: 'We think like hackers so you don\'t have to.' },
  { icon: Zap, title: 'Real-time response', desc: 'Scan, detect, and remediate in under 60 seconds.' },
  { icon: Globe, title: 'Global visibility', desc: 'Protect your assets across any infrastructure.' },
  { icon: Lock, title: 'Privacy first', desc: 'Your security data is encrypted and secure with Zynth.' },
  { icon: Users, title: 'Team collaboration', desc: 'Manage your security posture with multi-user RBAC.' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020617] py-20 text-white selection:bg-[#00ff88]/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="mx-auto max-w-2xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-kicker mx-auto mb-6"
          >
            <span>Our Mission</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white sm:text-6xl"
          >
            The world's first <span className="text-[#00ff88]">Autonomous CISO</span> for startups.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-400"
          >
            Startups change the world, but security often slows them down. Zynth was built to automate the complex 
            security operations that usually require a 6-figure team. We move security to the speed of development.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="flex flex-col rounded-3xl border border-white/8 bg-white/[0.03] p-8 transition-colors hover:bg-white/[0.05]"
              >
                <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00ff88]/10 text-[#00ff88]">
                    <feature.icon size={20} />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-slate-400">
                  <p className="flex-auto">{feature.desc}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-32 overflow-hidden rounded-[3rem] border border-[#00ff88]/20 bg-gradient-to-br from-[#00ff88]/10 to-transparent p-12 text-center"
        >
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Secure your future today.</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
            Join 500+ startups who rely on Zynth for autonomous protection and adversarial auditing.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup" className="rounded-xl bg-[#00ff88] px-10 py-4 text-sm font-black uppercase tracking-widest text-[#020617] hover:scale-105 transition-transform">
              Start Free Audit
            </Link>
            <Link href="/contact" className="text-sm font-bold leading-6 text-white hover:text-[#00ff88] transition-colors">
              Contact Sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
