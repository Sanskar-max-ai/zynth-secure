'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ScanResult } from '@/types'

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(26,37,64,0.8)' }}>
      <div className="flex items-center gap-2">
        <ShieldLogo size={32} />
        <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--zynth-white)' }}>
          Zynt<span style={{ color: 'var(--zynth-green)' }}>h</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {['Features', 'Pricing', 'FAQ'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--zynth-text)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--zynth-green)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--zynth-text)')}>
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="btn-secondary text-sm px-4 py-2 font-medium">Log in</Link>
        <Link href="/auth/signup" className="btn-primary text-sm px-4 py-2">Get Free Audit</Link>
      </div>
    </nav>
  )
}

// ── Shield SVG Logo ──────────────────────────────────────────────────────────
function ShieldLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
        fill="url(#sg)" stroke="rgba(0,255,136,0.4)" strokeWidth="1" />
      <path d="M14 20l4 4 8-8" stroke="#060b14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="sg" x1="5" y1="3" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ff88" />
          <stop offset="1" stopColor="#00664d" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    
    let scanUrl = url.trim()
    if (!scanUrl.startsWith('http')) scanUrl = 'https://' + scanUrl

    // Option B: Redirect to signup to capture the lead before answering
    router.push(`/auth/signup?url=${encodeURIComponent(scanUrl)}`)
  }

  return (
    <section className="hero-bg grid-bg min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
      {/* Floating badge */}
      <div className="animate-fade-up mb-6 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
        style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: 'var(--zynth-green)' }}>
        <span className="inline-block w-2 h-2 rounded-full animate-pulse-green" style={{ background: 'var(--zynth-green)' }} />
        Professional AI Security Audit Service — Trusted by 500+ businesses
      </div>

      {/* Main headline */}
      <h1 className="animate-fade-up delay-100 text-center text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-4xl">
        Your Website Has
        <br />
        <span style={{ color: 'var(--zynth-green)' }} className="text-glow">Security Holes.</span>
        <br />
        <span style={{ color: 'var(--zynth-text)', fontSize: '0.85em' }}>We Find Them for You.</span>
      </h1>

      <p className="animate-fade-up delay-200 text-center text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
        style={{ color: 'var(--zynth-text)' }}>
        Paste any URL below. Our AI audit runs{' '}
        <span style={{ color: 'var(--zynth-white)', fontWeight: 600 }}>30+ security tests</span>{' '}
        with{' '}
        <span style={{ color: 'var(--zynth-green)', fontWeight: 600 }}>verifiable evidence</span>{' '}
        and delivers a{' '}
        <span style={{ color: 'var(--zynth-green)', fontWeight: 600 }}>resolution guide</span>{' '}
        to actually fix the holes.
      </p>

      {/* Scan input */}
      <form onSubmit={handleScan} 
        className="animate-fade-up delay-300 w-full max-w-2xl flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://yourbusiness.com"
          className="flex-1 px-5 py-4 rounded-xl text-base font-medium outline-none transition-all"
          style={{
            background: 'rgba(13,21,38,0.9)',
            border: '1px solid var(--zynth-border)',
            color: 'var(--zynth-white)',
            caretColor: 'var(--zynth-green)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,255,136,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--zynth-border)')}
          disabled={scanning}
        />
        <button type="submit" disabled={scanning}
          className="btn-primary px-8 py-4 font-bold text-base whitespace-nowrap flex items-center gap-2 disabled:opacity-60">
          {scanning ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 40" />
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Get Free Scan Preview
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="animate-fade-up w-full max-w-2xl mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff8888' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Quick scan result preview */}
      {scanResult && <QuickResultCard result={scanResult} />}

      {/* Trust signals */}
      {!scanResult && (
        <div className="animate-fade-up delay-400 flex flex-wrap justify-center gap-6 mt-4">
          {[
            { icon: '🔒', text: '$0 to start' },
            { icon: '⚡', text: 'Results in 60 sec' },
            { icon: '🧠', text: 'AI explains everything' },
            { icon: '📋', text: 'No tech knowledge needed' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--zynth-text)' }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Quick Result Card (shown right on landing after free scan) ───────────────
function QuickResultCard({ result }: { result: ScanResult }) {
  const scoreColor = result.score >= 80 ? 'var(--zynth-green)' : result.score >= 50 ? 'var(--medium)' : 'var(--critical)'
  const critical = result.issues.filter(i => i.severity === 'CRITICAL').length
  const high = result.issues.filter(i => i.severity === 'HIGH').length

  return (
    <div className="animate-fade-up w-full max-w-2xl mt-4 card p-6 glow-green">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono mb-1" style={{ color: 'var(--zynth-text)' }}>SECURITY SCORE</div>
          <div className="text-5xl font-black" style={{ color: scoreColor }}>{result.score}<span className="text-xl">/100</span></div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)' }}>
            <div className="text-2xl font-bold" style={{ color: '#ff6666' }}>{critical}</div>
            <div className="text-xs" style={{ color: 'var(--shield-text)' }}>Critical</div>
          </div>
          <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)' }}>
            <div className="text-2xl font-bold" style={{ color: '#ffaa44' }}>{high}</div>
            <div className="text-xs" style={{ color: 'var(--shield-text)' }}>High</div>
          </div>
        </div>
      </div>

      {/* Top 3 issues */}
      <div className="space-y-2 mb-4">
        {result.issues.slice(0, 3).map((issue, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--zynth-border)' }}>
            <span className={`badge-${issue.severity.toLowerCase()} text-xs font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0`}>
              {issue.severity}
            </span>
            <span className="text-sm" style={{ color: 'var(--zynth-text)' }}>
              {issue.aiExplanation || issue.description}
            </span>
          </div>
        ))}
      </div>

      <Link href="/auth/signup"
        className="btn-primary w-full py-3 text-center font-bold block rounded-xl">
        Request Full Audit & Fix Guide →
      </Link>
      <p className="text-center text-xs mt-2" style={{ color: 'var(--zynth-text)' }}>
        Free account · No credit card · Full report in 60 seconds
      </p>
    </div>
  )
}

// ── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: '2,481+', label: 'Vulnerabilities found last week' },
    { value: '532+', label: 'Websites secured' },
    { value: '100%', label: 'Verifiable audit trail' },
    { value: '24/7', label: 'AI monitoring active' },
  ]
  return (
    <section className="py-12 px-6" style={{ background: 'rgba(13,21,38,0.6)', borderTop: '1px solid var(--zynth-border)', borderBottom: '1px solid var(--zynth-border)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--zynth-green)' }}>{value}</div>
            <div className="text-sm" style={{ color: 'var(--zynth-text)' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', icon: '🔗', title: 'Paste Your URL', desc: 'Enter any website URL or AI agent address. No setup, no installation, no technical knowledge required.' },
    { n: '02', icon: '⚡', title: 'Verifiable Audit', desc: 'Watch our engine perform 30+ checks in real-time. We provide a signed cryptographic hash for every report to ensure authenticity.' },
    { n: '03', icon: '📋', title: 'Plain-English Report', desc: 'Every vulnerability is explained in simple language with prioritized fix instructions tailored to your platform.' },
    { n: '04', icon: '🛠️', title: 'Closing the Loop', desc: 'Use our dev handover tools or hire a Zynth-certified expert to remediate findings instantly. We stay until it is fixed.' },
  ]
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--zynth-green)' }}>How It Works</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Security in 4 Steps</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--zynth-text)' }}>We don't just find problems. We help you solve them.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ n, icon, title, desc }) => (
            <div key={n} className="card p-8 text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-black opacity-5" style={{ color: 'var(--zynth-green)' }}>{n}</div>
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--zynth-text)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Scan Types ────────────────────────────────────────────────────────────────
function ScanTypes() {
  const types = [
    { icon: '🌐', title: 'Website Audit', badge: 'LAUNCH', desc: '30+ checks on any URL — privacy, hacking shields, data leaks, and brand security.', color: '#00ff88' },
    { icon: '🔌', title: 'API Audit', badge: 'MONTH 2', desc: 'Tests REST & GraphQL APIs for deep-level security vulnerabilities.', color: '#00bfff' },
    { icon: '💻', title: 'Code Audit', badge: 'MONTH 3', desc: 'Audits GitHub repos for hardcoded secrets, vulnerable packages, and injection risks.', color: '#a78bfa' },
    { icon: '📱', title: 'Mobile App Audit', badge: 'MONTH 4', desc: 'Comprehensive audit of APK/IPA files for insecure storage and exposed keys.', color: '#fb923c' },
    { icon: '🤖', title: 'AI Agent Audit', badge: '★ UNIQUE', desc: 'Exclusive testing of LLM apps for prompt injection and system leakage.', color: '#f472b6' },
    { icon: '☁️', title: 'Cloud Config Audit', badge: 'MONTH 6', desc: 'Audits AWS, GCP, Azure for open buckets and permissive IAM roles.', color: '#fbbf24' },
  ]
  return (
    <section className="py-24 px-6" style={{ background: 'rgba(13,21,38,0.4)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--zynth-green)' }}>6 Audit Types</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">One Platform. Total Security.</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--zynth-text)' }}>Competitors cover 1–2 audit types. Zynth covers all 6.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map(({ icon, title, badge, desc, color }) => (
            <div key={title} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>{badge}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--zynth-text)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Free', price: '$0', period: '/month', highlight: false,
      features: ['3 scans/month', '1 domain', 'Basic report (no AI)', 'Website scanner only'],
      cta: 'Get Started Free', ctaHref: '/auth/signup',
    },
    {
      name: 'Starter', price: '$19', period: '/month', highlight: false,
      features: ['25 scans/month', '3 domains', 'Full AI explanations', 'Step-by-step fix guides', 'PDF export', 'Weekly email reports'],
      cta: 'Start Starter', ctaHref: '/auth/signup',
    },
    {
      name: 'Professional', price: '$49', period: '/month', highlight: true,
      features: ['Unlimited scans', '25 domains', 'All 6 scan types', 'AI Chat Assistant', 'API access + CI/CD', 'Slack/Discord alerts', 'Compliance reports'],
      cta: 'Start Professional', ctaHref: '/auth/signup',
    },
    {
      name: 'Agency', price: '$149', period: '/month', highlight: false,
      features: ['Unlimited everything', 'All clients dashboard', 'White-label PDF reports', 'Bulk scan all clients', 'Team accounts (3 users)', 'Priority support'],
      cta: 'Start Agency', ctaHref: '/auth/signup',
    },
    {
      name: 'Agency Annual', price: '$9,900', period: '/year', highlight: false,
      features: ['Everything in Agency', '12-month commitment', '$825/mo equivalent', 'Dedicated account manager', 'SLA guarantee', 'Quarterly review calls', 'Custom compliance'],
      badge: 'BEST FOR AGENCIES',
      cta: 'Talk to Sales', ctaHref: 'mailto:sales@zynthsecure.com',
    },
  ]
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--zynth-green)' }}>Pricing</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Start Free. Scale as You Grow.</h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--zynth-text)' }}>
            Competitors charge $199–$50,000/month. Zynth starts at $0.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {plans.map(plan => (
            <div key={plan.name}
              className={`card p-6 flex flex-col relative ${plan.highlight ? 'glow-green' : ''}`}
              style={plan.highlight ? { borderColor: 'rgba(0,255,136,0.5)' } : {}}>
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'var(--zynth-green)', color: '#060b14' }}>
                  {plan.badge}
                </div>
              )}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'var(--zynth-green)', color: '#060b14' }}>
                  MOST POPULAR
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--shield-text)' }}>{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--shield-text)' }}>{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--zynth-text)' }}>
                    <span style={{ color: 'var(--zynth-green)', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={plan.ctaHref}
                className={`${plan.highlight ? 'btn-primary' : 'btn-secondary'} px-4 py-2.5 text-sm font-semibold text-center block rounded-xl`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Vulnerability Checklist ───────────────────────────────────────────────────
function VulnerabilityChecklist() {
  const categories = [
    {
      title: 'Privacy & Data Encryption',
      checks: ['Expired SSL Certificate', 'Expiring Soon SSL (30 Days)', 'Enforcement of secure connections', 'Redirection of insecure links', 'Weak Encryption (Outdated SSL)']
    },
    {
      title: 'Anti-Hacking Shields',
      checks: ['Protection against malicious scripts', 'Secure connection policy', 'Protection against Clickjacking attacks', 'Protection against content spoofing', 'Private Server Information']
    },
    {
      title: 'Data Leak Prevention',
      checks: ['Leaked Configuration Files', 'Leaked Database Backups', 'Exposed Development History', 'Exposed Backup (ZIP) Files', 'Exposed Server Debug Info']
    },
    {
      title: 'Email & Identity Security',
      checks: ['Protection against email impersonation', 'Shielding your Brand\'s Identity']
    }
  ]

  return (
    <section className="py-32 px-6 border-y" style={{ background: 'rgba(2,6,23,0.5)', borderColor: 'var(--zynth-border)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-bold mb-4 uppercase tracking-[0.3em]" style={{ color: 'var(--zynth-secondary)' }}>Checklist</div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">Deep Analysis Vector</h2>
          <p className="text-lg max-w-xl mx-auto opacity-70" style={{ color: 'var(--zynth-text)' }}>
            Every scan executes 17+ critical tests across your infrastructure path.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((cat, i) => (
            <div key={i} className="card p-8 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5" style={{ color: 'var(--zynth-green)' }}>{i + 1}</span>
                {cat.title}
              </h3>
              <ul className="space-y-4">
                {cat.checks.map(check => (
                  <li key={check} className="flex items-start gap-3 text-sm">
                    <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--zynth-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span style={{ color: 'var(--zynth-white)' }}>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Why Zynth Wins ────────────────────────────────────────────────────────────
function WhyZynth() {
  const rows = [
    { factor: 'Price', them: '$119–$50,000+/month', us: '$0–$149/month' },
    { factor: 'Verifiable Evidence', them: '✗ Black-box results', us: '✓ Live terminal + Signed hash' },
    { factor: 'Plain English Reports', them: '✗ Raw technical output', us: '✓ AI explains everything' },
    { factor: 'Human-in-the-Loop Fixes', them: '✗ You are on your own', us: '✓ Hire an expert path' },
    { factor: 'Fix Instructions', them: 'Vague or none', us: 'Step-by-step, platform-specific' },
    { factor: 'Setup Required', them: 'Technical expertise needed', us: 'Paste URL. Done.' },
    { factor: 'Insurance Ready', them: '✗ Requires enterprise audit', us: '✓ Baseline compliance pre-check' },
  ]
  return (
    <section className="py-24 px-6" style={{ background: 'rgba(13,21,38,0.4)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--zynth-green)' }}>Competitive Edge</div>
          <h2 className="text-4xl font-black mb-4">Why Zynth Wins</h2>
        </div>
        <div className="card overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-3 text-xs font-bold uppercase tracking-wider"
            style={{ background: 'rgba(0,255,136,0.05)', borderBottom: '1px solid var(--zynth-border)', color: 'var(--zynth-text)' }}>
            <span>Factor</span><span>Competitors</span><span style={{ color: 'var(--zynth-green)' }}>Zynth</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 px-6 py-4 text-sm gap-4"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--zynth-border)' : 'none' }}>
              <span className="font-medium">{row.factor}</span>
              <span style={{ color: 'var(--zynth-text)' }}>{row.them}</span>
              <span style={{ color: 'var(--zynth-green)', fontWeight: 600 }}>{row.us}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: 'Is this legal? Can I scan any website?', a: 'You can scan websites you own. Zynth requires domain verification (proving you own the domain) before running a full scan. The free preview scan is read-only and only checks public information.' },
    { q: 'I have zero technical knowledge. Will I understand the reports?', a: 'Yes — that\'s exactly why Zynth exists. Our AI explains every finding in plain English, like "Your website\'s front door doesn\'t have a lock." and then gives you step-by-step fix instructions for your exact platform.' },
    { q: 'How is this different from free tools like SSL Labs?', a: 'SSL Labs checks one thing. Zynth runs 30+ checks across SSL, security headers, exposed files, malware, DNS, and more — then uses AI to explain everything and prioritize what to fix first.' },
    { q: 'I\'m a web agency. How does the Agency plan work?', a: 'You get one dashboard showing all your clients, their security scores, and any critical issues. You can white-label the PDF reports with your agency\'s logo and send them to clients as your own security service.' },
    { q: 'What is the AI Agent Scanner?', a: 'If you have an AI chatbot or LLM-powered app, we test it for prompt injection attacks, jailbreaks, and system prompt leakage. This is brand new — almost no commercial tool offers this. It\'s available on Professional plan and above.' },
    { q: 'How much does it actually cost at scale?', a: 'Free forever for basic scanning. Paid plans start at $19/month. If you\'re an agency with 20 clients, the Agency Annual plan at $9,900/year ($825/month equiv.) gives you unlimited scanning for all clients with white-label reports.' },
  ]
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--zynth-green)' }}>FAQ</div>
          <h2 className="text-4xl font-black">Common Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4">
                <span className="font-semibold text-sm md:text-base">{faq.q}</span>
                <span style={{ color: 'var(--zynth-green)', flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)', fontSize: '1.5rem', lineHeight: 1 }}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: 'var(--zynth-text)', borderTop: '1px solid var(--zynth-border)' }}>
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 px-6" style={{ borderTop: '1px solid var(--zynth-border)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <ShieldLogo size={28} />
          <span className="font-bold">Zynth Security</span>
          <span className="text-sm ml-4" style={{ color: 'var(--zynth-text)' }}>AI Security for Everyone</span>
        </div>
        <div className="flex gap-8 text-sm" style={{ color: 'var(--zynth-text)' }}>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="mailto:hello@zynthsecure.com" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="text-sm" style={{ color: 'var(--zynth-text)' }}>© 2026 Zynth Security. All rights reserved.</div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <VulnerabilityChecklist />
      <ScanTypes />
      <WhyZynth />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
