'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function ShieldLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
        fill="url(#sl2)" stroke="rgba(0,255,136,0.4)" strokeWidth="1" />
      <path d="M14 20l4 4 8-8" stroke="#060b14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="sl2" x1="5" y1="3" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ff88" /><stop offset="1" stopColor="#00664d" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="hero-bg grid-bg min-h-screen flex items-center justify-center px-6"><div className="animate-spin w-8 h-8 border-4 border-[var(--zynth-green)] border-t-transparent rounded-full" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const nextUrl = searchParams.get('url')
  const nextType = searchParams.get('type')
  const nextParams = new URLSearchParams()

  if (nextUrl) nextParams.set('url', nextUrl)
  if (nextType) nextParams.set('type', nextType)

  const signupHref = nextParams.toString()
    ? `/auth/signup?${nextParams.toString()}`
    : '/auth/signup'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const nextScan = nextParams.toString()
        ? `/dashboard/scan?${nextParams.toString()}`
        : '/dashboard/scan'

      router.push(nextScan)
    }
  }

  return (
    <div className="hero-bg grid-bg min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <ShieldLogo />
            <span className="text-2xl font-extrabold text-white">Zynt<span style={{ color: 'var(--zynth-green)' }}>h</span></span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--zynth-text)' }}>Sign in to your account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff8888' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid var(--zynth-border)', color: 'var(--zynth-white)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--zynth-border)')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="********"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid var(--zynth-border)', color: 'var(--zynth-white)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--zynth-border)')} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 40" /></svg> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--zynth-border)' }}>
            <button className="btn-secondary w-full py-3 text-sm font-medium flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--zynth-text)' }}>
          Don&apos;t have an account?{' '}
          <Link href={signupHref} className="font-semibold" style={{ color: 'var(--zynth-green)' }}>
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
