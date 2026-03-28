import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shieldly — AI Security Audit Service for Small Business',
  description: 'Paste a URL. Get a professional security audit in under 2 minutes. No technical knowledge needed. Shieldly audits your website, APIs, and AI agents for vulnerabilities — then tells you exactly how to fix them.',
  keywords: 'security audit, website security, AI security, small business security, vulnerability scanner, penetration testing, cybersecurity service',
  authors: [{ name: 'Shieldly' }],
  openGraph: {
    title: 'Shieldly — AI Security Audit Service for Small Business',
    description: 'Paste a URL. Get a professional security audit. No technical knowledge needed.',
    type: 'website',
    url: 'https://shieldly.io',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shieldly — AI Security Audit Service',
    description: 'Paste a URL. Get a professional security audit. No technical knowledge needed.',
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
