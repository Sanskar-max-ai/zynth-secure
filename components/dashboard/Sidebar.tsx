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
            {...({} as any)}
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
            {...({} as any)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Aside */}
      <aside 
        className={`fixed top-0 left-0 z-[90] flex h-full w-[280px] flex-col border-r border-[#1f2937] transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1) lg:translate-x-0 bg-[#000000] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 px-8 py-10">
          <div className="mb-12 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#1f2937] bg-[#111827] transition-all group-hover:border-[var(--zynthsecure-green)]">
                <Shield className="text-[var(--zynthsecure-green)]" size={20} />
              </div>
              <div>
                <span className="block text-xl font-black tracking-tighter text-white uppercase italic">
                  ZYNTH<span className="text-[var(--zynthsecure-green)]">_</span>
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">
                  Enterprise_v1
                </span>
              </div>
            </Link>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-sm hover:bg-white/5 text-white/30"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-4">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  {...({} as any)}
                >
                  <Link 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-4 py-2 transition-all ${
                      isActive ? 'text-[var(--zynthsecure-green)]' : 'text-[#d1d1d1] hover:text-white'
                    }`}
                  >
                    <item.icon size={12} className={isActive ? 'text-[var(--zynthsecure-green)]' : 'text-[#64748b] group-hover:text-white'} />
                    <span className="text-base font-semibold tracking-tight">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-8">
           <div className="mb-8 p-6 rounded-sm border border-[#1f2937] bg-[#111827]/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--zynthsecure-green)] shadow-[0_0_8px_var(--zynthsecure-green)]" />
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[var(--zynthsecure-green)]">Workspace Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#64748b] font-medium">
                Enterprise node connected. All signals are nominal.
              </p>
           </div>

          <div className="pt-8 border-t border-[#1f2937] flex items-center justify-between">
            <div className="flex flex-col gap-1 min-w-0">
               <div className="truncate text-sm font-bold text-white pr-2">{profile?.full_name || 'Operator'}</div>
               <div className="font-mono text-[10px] text-[#64748b] truncate">{user?.email}</div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#1f2937] bg-[#111827] text-[#64748b] transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
