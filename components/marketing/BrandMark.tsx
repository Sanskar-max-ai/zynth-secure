import Link from 'next/link'

export function ShieldLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="relative group/logo">
      <div className="absolute inset-0 bg-[var(--zynthsecure-green)]/20 blur-xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="relative z-10 drop-shadow-[0_0_12px_rgba(0,255,136,0.3)]">
        <path d="M12 2L4 5v6.5c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" fill="#030712" stroke="url(#logo-grad)" strokeWidth="1.5" />
        <path d="M8 12l2.5 2.5 5.5-5.5" stroke="var(--zynthsecure-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />
        <defs>
          <linearGradient id="logo-grad" x1="4" y1="2" x2="20" y2="22">
            <stop stopColor="#00ff88" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function BrandMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <ShieldLogo />
      <div>
        <span className="block text-xl font-black tracking-tighter text-white">
          Zynt<span className="text-[var(--zynthsecure-green)]">h</span>
        </span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
          Secure.os
        </span>
      </div>
    </Link>
  )
}
