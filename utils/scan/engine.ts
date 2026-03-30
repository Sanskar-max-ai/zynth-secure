import { ScanResult, ScanIssue, Severity } from '@/types'
import * as dns from 'dns'
import { promisify } from 'util'

const dnsResolveTxt = promisify(dns.resolveTxt)

export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function calculateScore(issues: ScanIssue[]): number {
  let score = 100
  for (const issue of issues) {
    if (issue.isFixed) continue
    switch (issue.severity) {
      case 'CRITICAL': score -= 20; break
      case 'HIGH':     score -= 10; break
      case 'MEDIUM':   score -= 5;  break
      case 'LOW':      score -= 2;  break
    }
  }
  return Math.max(0, score)
}

export async function checkSSL(url: string): Promise<{ issues: ScanIssue[], info: Record<string, unknown> }> {
  const issues: ScanIssue[] = []
  const info: Record<string, unknown> = {}
  try {
    const domain = extractDomain(url)
    const endpoint = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&fromCache=on&maxAge=24&all=done&ignoreMismatch=on`
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) })
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'READY' && data.endpoints?.length) {
        const grade = data.endpoints[0].grade
        info.sslGrade = grade
        if (grade && ['F', 'T'].includes(grade)) {
          issues.push({ id: generateId(), testName: 'SSL/TLS Grade F', severity: 'CRITICAL', description: 'Critical weak SSL/TLS Grade.', isFixed: false })
        }
      }
    }
  } catch {}
  return { issues, info }
}

export async function checkSecurityHeaders(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(10000) })
    const headers = res.headers
    if (!headers.get('strict-transport-security')) {
      issues.push({ id: generateId(), testName: 'Missing HSTS Header', severity: 'HIGH', description: 'HSTS not set.', isFixed: false })
    }
    if (!headers.get('content-security-policy')) {
      issues.push({ id: generateId(), testName: 'Missing Content Security Policy (CSP)', severity: 'HIGH', description: 'CSP not set.', isFixed: false })
    }
  } catch {}
  return issues
}

export async function runFullScan(url: string): Promise<ScanIssue[]> {
  const domain = extractDomain(url)
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
  
  const [ssl, headers] = await Promise.all([
    checkSSL(normalizedUrl),
    checkSecurityHeaders(normalizedUrl)
  ])

  return [...ssl.issues, ...headers]
}
