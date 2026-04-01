import Link from 'next/link'
import BrandMark from '@/components/marketing/BrandMark'

const links = [
  { href: '/', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/privacy', label: 'Privacy' },
]

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#050b14]/88 backdrop-blur-xl">
      <div className="page-container flex items-center justify-between py-4">
        <BrandMark />

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="pill-link text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login" className="btn-secondary px-4 py-2 text-sm font-medium">
            Log In
          </Link>
          <Link href="/auth/signup" className="btn-primary px-4 py-2 text-sm">
            Start Free
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/pricing" className="pill-link text-xs font-medium">
            Pricing
          </Link>
          <Link href="/auth/signup" className="btn-primary px-3 py-2 text-xs">
            Start
          </Link>
        </div>
      </div>
    </header>
  )
}
