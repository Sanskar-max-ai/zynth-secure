'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function ShieldLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
        fill="url(#sl3)" stroke="rgba(0,255,136,0.4)" strokeWidth="1" />
      <path d="M14 20l4 4 8-8" stroke="#060b14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="sl3" x1="5" y1="3" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ff88" /><stop offset="1" stopColor="#00664d" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="hero-bg grid-bg min-h-screen flex items-center justify-center px-6"><div className="animate-spin w-8 h-8 border-4 border-[var(--zynth-green)] border-t-transparent rounded-full" /></div>}>
      <SignupContent />
    </Suspense>
  )
}

function SignupContent() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const success = ''
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const nextUrl = searchParams.get('url')
  const nextType = searchParams.get('type')
  const nextParams = new URLSearchParams()

  if (nextUrl) nextParams.set('url', nextUrl)
  if (nextType) nextParams.set('type', nextType)

  const loginHref = nextParams.toString()
    ? `/auth/login?${nextParams.toString()}`
    : '/auth/login'

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Auto-create account via Supabase
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const nextUrl = searchParams.get('url')
      const nextType = searchParams.get('type')
      const nextParams = new URLSearchParams()

      if (nextUrl) nextParams.set('url', nextUrl)
      if (nextType) nextParams.set('type', nextType)

      const nextScan = nextParams.toString()
        ? `/dashboard/scan?${nextParams.toString()}`
        : '/dashboard/scan'

      router.push(nextScan)
    }
  }

  return (
    <div className="hero-bg grid-bg min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <ShieldLogo />
            <span className="text-2xl font-extrabold text-white">Zynt<span style={{ color: 'var(--zynth-green)' }}>h</span></span>
          </Link>
          <h1 className="text-2xl font-bold">Start for free</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--zynth-text)' }}>No credit card required - 3 free scans per month</p>
        </div>

        <div className="card p-8">
          {/* Value props */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: 'Secure', text: '3 free scans' },
              { icon: 'AI', text: 'AI reports' },
              { icon: 'Fast', text: '60 sec results' },
            ].map(({ icon, text }) => (
              <div key={text} className="text-center py-2 rounded-lg text-xs" style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', color: 'var(--zynth-text)' }}>
                <div className="text-lg mb-0.5">{icon}</div>
                {text}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff8888' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>
              Success: {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
              { field: 'email', label: 'Work Email', type: 'email', placeholder: 'you@company.com' },
              { field: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--zynth-text)' }}>{label}</label>
                <input type={type} value={form[field as keyof typeof form]}
                  onChange={e => update(field, e.target.value)} required
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid var(--zynth-border)', color: 'var(--zynth-white)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--zynth-border)')} />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 40" /></svg> Creating account...</>
              ) : 'Create Free Account'}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--zynth-text)' }}>
            By signing up you agree to our <Link href="/terms" style={{ color: 'var(--zynth-green)' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--zynth-green)' }}>Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--zynth-text)' }}>
          Already have an account?{' '}
          <Link href={loginHref} className="font-semibold" style={{ color: 'var(--zynth-green)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
