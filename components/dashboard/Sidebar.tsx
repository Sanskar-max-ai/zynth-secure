'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import { Shield, Home, History, LogOut, Menu, X, Target, Settings, ScanLine } from 'lucide-react'

interface SidebarProfile {
  full_name: string | null
}

interface SidebarProps {
  profile: SidebarProfile | null
  user: User
}

export default function Sidebar({ profile, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: 'Overview', icon: Home, href: '/dashboard' },
    { label: 'Run Scan', icon: Target, href: '/dashboard/scan' },
    { label: 'Scan History', icon: History, href: '/dashboard/history' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsOpen(true)}
            className="lg:hidden fixed left-4 top-4 z-[100] rounded-2xl border border-white/10 bg-[#08101c]/90 p-3 text-white shadow-xl backdrop-blur-xl"
          >
            <Menu size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Aside */}
      <aside 
        className={`fixed top-0 left-0 z-[90] flex h-full w-72 flex-col border-r border-white/8 transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1) lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'rgba(6,11,20,0.86)', backdropFilter: 'blur(30px)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <motion.div
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-full h-1/4 bg-gradient-to-b from-transparent via-[var(--zynthsecure-green)] to-transparent opacity-20 blur-3xl"
          />
        </div>

        <div className="flex-1 p-8">
          <div className="mb-10 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 px-2 group" onClick={() => setIsOpen(false)}>
              <motion.div 
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.25 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--zynthsecure-green)]/30 bg-[var(--zynthsecure-green)]/10 transition-colors group-hover:bg-[var(--zynthsecure-green)]/20"
              >
                <Shield className="text-[var(--zynthsecure-green)]" size={24} />
              </motion.div>
              <div>
                <span className="block text-xl font-bold tracking-tight text-white">
                  Zynth<span className="text-[var(--zynthsecure-green)]">Secure</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Scan Workspace
                </span>
              </div>
            </Link>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-8 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-[var(--zynthsecure-green)]">
                <ScanLine size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Zynth Scan v1</p>
                <p className="text-xs leading-6 text-white/45">
                  Run scans, review findings, and keep remediation moving.
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-4">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                      isActive ? 'bg-white/6 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]' : 'text-white/45 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 border-l-2 border-[var(--zynthsecure-green)] bg-gradient-to-r from-[var(--zynthsecure-green)]/10 to-transparent"
                      />
                    )}
                    <item.icon size={19} className={isActive ? 'text-[var(--zynthsecure-green)]' : 'transition-colors group-hover:text-white'} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          <div className="mt-12 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--zynthsecure-green)] shadow-[0_0_10px_rgba(0,255,136,0.8)]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">Workspace Active</span>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/45">
              Your dashboard is ready for new scans, report review, and remediation tracking.
            </p>
          </div>
        </div>

        <div className="border-t border-white/8 bg-white/[0.02] p-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5 max-w-[170px]">
              <div className="truncate text-sm font-bold text-white">{profile?.full_name || 'Zynth Operator'}</div>
              <div className="text-[10px] font-medium text-white/40 truncate">{user?.email}</div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:scale-105 hover:border-red-400/30 hover:text-red-400">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
