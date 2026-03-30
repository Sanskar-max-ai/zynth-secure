'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Home, Search, History, Settings, LogOut, ChevronRight, Menu, X } from 'lucide-react'

interface SidebarProps {
  profile: any
  user: any
}

export default function Sidebar({ profile, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when navigating to a new page on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const navItems = [
    { label: 'Overview', icon: Home, href: '/dashboard' },
    { label: 'New Scan', icon: Search, href: '/dashboard/scan' },
    { label: 'Scan History', icon: History, href: '/dashboard/history' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <>
      {/* Mobile Menu Button - Fixed at top right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0d1526] border border-[#1a2540] text-white"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 border-r flex flex-col z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: 'var(--zynth-border)', background: 'rgba(6,11,20,0.98)' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded shrink-0 bg-gradient-to-br from-[#00ff88] to-[#00664d] flex items-center justify-center">
                <Shield size={18} className="text-[#060b14]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--zynth-white)' }}>
                Zynt<span style={{ color: 'var(--zynth-green)' }}>h</span>
              </span>
            </Link>
            
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-[var(--zynth-text)]"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'
                  }`}
                  style={{ color: isActive ? 'var(--zynth-green)' : 'var(--zynth-text)' }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Plan Upgrade Teaser */}
        <div className="mt-auto p-6">
          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)' }}>
            <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--zynth-green)' }}>
              {profile?.plan || 'Free'} Plan
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--zynth-text)' }}>
              {profile?.plan === 'free' ? 'Upgrade to Starter to unlock full AI reports.' : 'Manage your billing & usage.'}
            </p>
            <Link href="/dashboard/settings/billing" className="text-xs font-semibold flex items-center gap-1 transition-colors hover:text-white" style={{ color: 'var(--zynth-green)' }}>
              View plans <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--zynth-border)' }}>
            <div className="truncate pr-2">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</div>
              <div className="text-xs truncate" style={{ color: 'var(--zynth-text)' }}>{user.email}</div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-[var(--zynth-text)] hover:text-white transition-colors" title="Log out">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
