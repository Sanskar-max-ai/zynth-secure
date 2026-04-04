import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/providers/PostHogProvider'

export const metadata: Metadata = {
  title: 'Zynth — Autonomous Cybersecurity Agent',
  description: 'Enterprise-grade security auditing and automated remediation for modern SaaS and AI startups. Zynth uses adversarial AI to find vulnerabilities before hackers do.',
  keywords: 'security audit, zynth, cyber security, AI security, vulnerability scanner, penetration testing, autonomous CISO',
  authors: [{ name: 'Zynth Security' }],
  openGraph: {
    title: 'Zynth — Autonomous Security Audit',
    description: 'Professional security audits in under 2 minutes. No technical knowledge needed.',
    type: 'website',
    url: 'https://zynth.io',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zynth — AI Security',
    description: 'Instant AI-powered security audits for small businesses.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
