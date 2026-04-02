import type { Metadata } from 'next'
import './globals.css'
import { PostHogProvider } from '@/providers/PostHogProvider'

export const metadata: Metadata = {
  title: 'ZynthSecure — AI-Powered Security Audit Service',
  description: 'Proactive remediation and security auditing for digital infrastructure. ZynthSecure uses advanced AI to find vulnerabilities in websites, APIs, and AI agents before hackers do.',
  keywords: 'security audit, ZynthSecure, cyber security, AI security, vulnerability scanner, penetration testing, zynthsecure',
  authors: [{ name: 'ZynthSecure Security' }],
  openGraph: {
    title: 'ZynthSecure — AI Security Audit',
    description: 'Professional security audits in under 2 minutes. No technical knowledge needed.',
    type: 'website',
    url: 'https://zynthsecure.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZynthSecure — AI Security',
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
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
