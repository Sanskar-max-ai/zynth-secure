'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function FadeIn({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function ScanLine() {
  return <div className="scan-line pointer-events-none" />
}

export function BrainPulse({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{ 
        boxShadow: ['0 0 20px rgba(0, 255, 136, 0)', '0 0 20px rgba(0, 255, 136, 0.1)', '0 0 20px rgba(0, 255, 136, 0)']
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

export function GlowCard({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`cyber-glow marketing-panel ${className}`}>
      {children}
    </div>
  )
}
