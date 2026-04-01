import type { ScanIssue } from '@/types'

export interface RemediationPayload {
  type: string
  file: string
  snippet: string
  description: string
  nextSteps: string[]
  evidence: string[]
  source: string
}

type IssueDetails = {
  findingSource?: 'direct' | 'heuristic' | 'external'
  evidence?: string[]
  serverHeader?: string
  path?: string
}

function asEvidence(details?: IssueDetails | null): string[] {
  if (!details) return []
  if (Array.isArray(details.evidence)) return details.evidence
  if (details.path) return [`Publicly accessible path found: ${details.path}`]
  if (details.serverHeader) return [`Server header exposed: ${details.serverHeader}`]
  return []
}

function sourceLabel(source?: IssueDetails['findingSource']): string {
  switch (source) {
    case 'direct':
      return 'Direct observation'
    case 'external':
      return 'External lookup'
    case 'heuristic':
      return 'Heuristic match'
    default:
      return 'Unspecified'
  }
}

function fallbackSteps(issue: Pick<ScanIssue, 'aiFixSteps' | 'severity' | 'aiExplanation'>): string[] {
  if (Array.isArray(issue.aiFixSteps) && issue.aiFixSteps.length > 0) {
    return issue.aiFixSteps
  }

  if (issue.severity === 'CRITICAL') {
    return ['Investigate immediately', 'Patch or block the exposed surface', 'Retest after deployment']
  }

  return ['Apply the suggested configuration change', 'Retest the target', 'Monitor for regressions']
}

export function generateFixPayload(issue: Pick<ScanIssue, 'testName' | 'severity' | 'aiFixSteps' | 'aiExplanation' | 'details'>): RemediationPayload {
  const name = issue.testName.toLowerCase()
  const evidence = asEvidence(issue.details as IssueDetails | null)
  const source = sourceLabel((issue.details as IssueDetails | null | undefined)?.findingSource)
  const nextSteps = fallbackSteps(issue)

  if (name.includes('hsts') || name.includes('transport security')) {
    return {
      type: 'NGINX_CONFIG',
      file: 'nginx.conf',
      snippet: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
      description: 'Enforces HTTPS for all future visits and blocks SSL stripping attacks.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('frame-options') || name.includes('clickjacking')) {
    return {
      type: 'APACHE_HTACCESS',
      file: '.htaccess',
      snippet: 'Header set X-Frame-Options "SAMEORIGIN"',
      description: 'Prevents your site from being embedded in malicious iframes.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('csp') || name.includes('content security')) {
    return {
      type: 'SECURITY_HEADER',
      file: 'Response Header',
      snippet: "Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.com;",
      description: 'A strong baseline CSP that reduces XSS risk.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('.env') || name.includes('secrets')) {
    return {
      type: 'SERVER_BLOCK',
      file: 'nginx.conf',
      snippet: 'location ~ /\\.env {\n    deny all;\n}',
      description: 'Blocks public access to secret environment variables.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('server version') || name.includes('vulnerability found') || name.includes('cve')) {
    return {
      type: 'PATCH_AND_RESTART',
      file: 'Release Notes',
      snippet: 'Upgrade the affected package or image, then redeploy the service.',
      description: 'This finding is tied to a known software version and should be patched before exposure continues.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('open port')) {
    return {
      type: 'FIREWALL_RULE',
      file: 'WAF / Firewall',
      snippet: 'Allow only required source IPs; block public access to non-web ports.',
      description: 'Closes unnecessary internet-facing services.',
      nextSteps,
      evidence,
      source,
    }
  }

  if (name.includes('spf') || name.includes('dmarc')) {
    return {
      type: 'DNS_RECORD',
      file: 'DNS TXT',
      snippet: 'v=DMARC1; p=none; rua=mailto:security@yourdomain.com',
      description: 'Improves email authentication and reduces spoofing risk.',
      nextSteps,
      evidence,
      source,
    }
  }

  return {
    type: 'MANUAL_GUIDE',
    file: 'Documentation',
    snippet: 'Consult the specific fix steps listed in the audit report and apply the smallest safe change.',
    description: issue.aiExplanation || 'A custom security patch is required for this architecture.',
    nextSteps,
    evidence,
    source,
  }
}
