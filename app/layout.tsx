import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zynth — AI-Powered Security Audit Service',
  description: 'Instant security audits for your digital infrastructure. Zynth uses advanced AI to find vulnerabilities in websites, APIs, and AI agents before hackers do.',
  keywords: 'security audit, Zynth, cyber security, AI security, vulnerability scanner, penetration testing, zynthsecure',
  authors: [{ name: 'Zynth Security' }],
  openGraph: {
    title: 'Zynth — AI Security Audit',
    description: 'Professional security audits in under 2 minutes. No technical knowledge needed.',
    type: 'website',
    url: 'https://zynthsecure.com',
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
