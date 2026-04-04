import Link from 'next/link'
import BrandMark from '@/components/marketing/BrandMark'

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#030712]">
      <div className="page-container py-20 pb-12">
        <div className="grid gap-16 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-6">
            <BrandMark />
            <p className="max-w-md text-[13px] font-medium leading-relaxed text-white/40">
              Zynth is an automated security command center helping engineering teams run tactial audits, 
              identify high-impact findings, and accelerate remediation without the tool-noise.
            </p>
          </div>

          <div>
            <h3 className="mb-6 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Operational</h3>
            <div className="space-y-4 text-[13px] font-bold text-white/40">
              <div><Link href="/quick-scan" className="hover:text-[var(--zynthsecure-green)] transition-colors">Quick Scan</Link></div>
              <div><Link href="/pricing" className="hover:text-[var(--zynthsecure-green)] transition-colors">Pricing</Link></div>
              <div><Link href="/security" className="hover:text-[var(--zynthsecure-green)] transition-colors">Security Protocol</Link></div>
            </div>
          </div>

          <div>
            <h3 className="mb-6 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Organization</h3>
            <div className="space-y-4 text-[13px] font-bold text-white/40">
              <div><Link href="/about" className="hover:text-[var(--zynthsecure-green)] transition-colors">About Mission</Link></div>
              <div><Link href="/contact" className="hover:text-[var(--zynthsecure-green)] transition-colors">Contact Command</Link></div>
              <div><Link href="/privacy" className="hover:text-[var(--zynthsecure-green)] transition-colors">Privacy Protocol</Link></div>
              <div><Link href="/terms" className="hover:text-[var(--zynthsecure-green)] transition-colors">Terms of Service</Link></div>
              <div><Link href="/auth/signup" className="hover:text-[var(--zynthsecure-green)] transition-colors">Init Pattern</Link></div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/5 pt-8 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <span>© 2026 ZynthSecure.OS</span>
            <span className="hidden opacity-50 md:inline">|</span>
            <span>Terminal Operational</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-1 w-1 rounded-full bg-[var(--zynthsecure-green)]/40" />
             <span>Web Scanning First. AI Security Next.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
