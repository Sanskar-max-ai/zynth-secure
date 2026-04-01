import Link from 'next/link'
import BrandMark from '@/components/marketing/BrandMark'

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/6 bg-[#040911]">
      <div className="page-container py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <BrandMark />
            <p className="max-w-md text-sm leading-7 text-[var(--zynthsecure-text)]">
              Zynth helps teams run security scans, understand the findings, and move into remediation
              without needing a specialist for every step.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/70">Product</h3>
            <div className="space-y-3 text-sm text-[var(--zynthsecure-text)]">
              <div><Link href="/" className="hover:text-white">Overview</Link></div>
              <div><Link href="/pricing" className="hover:text-white">Pricing</Link></div>
              <div><Link href="/security" className="hover:text-white">Security</Link></div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/70">Company</h3>
            <div className="space-y-3 text-sm text-[var(--zynthsecure-text)]">
              <div><Link href="/privacy" className="hover:text-white">Privacy</Link></div>
              <div><Link href="/terms" className="hover:text-white">Terms</Link></div>
              <div><Link href="/auth/signup" className="hover:text-white">Get Started</Link></div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/6 pt-6 text-xs uppercase tracking-[0.18em] text-white/40 md:flex-row md:items-center md:justify-between">
          <span>© 2026 ZynthSecure</span>
          <span>Website scanning first. AI security next.</span>
        </div>
      </div>
    </footer>
  )
}
