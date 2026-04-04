import Link from 'next/link'
import BrandMark from '@/components/marketing/BrandMark'

const links = [
  { href: '/quick-scan', label: 'Quick Scan' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-3xl">
      <div className="page-container flex items-center justify-between py-4">
        <BrandMark />

        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="pill-link px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] border-transparent hover:border-white/10">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login" className="btn-secondary px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] border-white/5">
            Operator Log
          </Link>
          <Link href="/auth/signup" className="btn-primary px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            Init Audit
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/auth/signup" className="btn-primary px-4 py-2.5 text-[9px] font-black uppercase tracking-widest">
            Init Scan
          </Link>
        </div>
      </div>
    </header>
  )
}
