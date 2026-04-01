import Link from 'next/link'

export function ShieldLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3L5 9v10c0 9.5 6.5 18.4 15 21 8.5-2.6 15-11.5 15-21V9L20 3z"
        fill="url(#brand-grad)"
        stroke="rgba(0,255,136,0.38)"
        strokeWidth="1"
      />
      <path d="M14 20l4 4 8-8" stroke="#051019" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="brand-grad" x1="5" y1="3" x2="35" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00ff88" />
          <stop offset="1" stopColor="#00d2ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function BrandMark() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <ShieldLogo />
      <span className="text-xl font-bold tracking-tight text-white">
        Zynth<span className="text-[var(--zynthsecure-green)]">Secure</span>
      </span>
    </Link>
  )
}
