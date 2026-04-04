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

  if (name.includes('open port') || name.includes('pentest exploit')) {
    // Pentest-specific patches based on the exploited service
    if (name.includes('redis')) {
      return {
        type: 'REDIS_CONFIG',
        file: 'redis.conf',
        snippet: `# Zynth Autonomous Fix — Redis Hardening
bind 127.0.0.1              # Only listen on localhost
requirepass YOUR_STRONG_PASSWORD_HERE
protected-mode yes
# Block external access at the firewall:
# ufw deny 6379`,
        description: 'Immediately blocks unauthenticated remote Redis access. This exploit allows full key-store read/write.',
        nextSteps,
        evidence,
        source,
      }
    }
    if (name.includes('ftp')) {
      return {
        type: 'FTP_CONFIG',
        file: 'vsftpd.conf',
        snippet: `# Zynth Autonomous Fix — FTP Hardening
anonymous_enable=NO
local_enable=YES
write_enable=NO
chroot_local_user=YES
passive_enable=NO
# Or completely disable FTP:
# systemctl disable vsftpd && ufw deny 21`,
        description: 'Disables anonymous FTP login which allows anyone to browse your file system.',
        nextSteps,
        evidence,
        source,
      }
    }
    if (name.includes('mongodb')) {
      return {
        type: 'MONGODB_CONFIG',
        file: 'mongod.conf',
        snippet: `# Zynth Autonomous Fix — MongoDB Hardening
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1  # Remove :: to prevent IPv6 external access
  port: 27017
# Firewall: ufw deny 27017`,
        description: 'Enables MongoDB authorization and restricts network binding to localhost.',
        nextSteps,
        evidence,
        source,
      }
    }
    if (name.includes('ssh')) {
      return {
        type: 'SSH_CONFIG',
        file: '/etc/ssh/sshd_config',
        snippet: `# Zynth Autonomous Fix — SSH Hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 20
ClientAliveInterval 300
ClientAliveCountMax 0
# Then: systemctl restart sshd`,
        description: 'Disables password-based SSH auth and restricts root login to prevent brute-force attacks.',
        nextSteps,
        evidence,
        source,
      }
    }
    if (name.includes('smuggling') || name.includes('http')) {
      return {
        type: 'NGINX_CONFIG',
        file: 'nginx.conf',
        snippet: `# Zynth Autonomous Fix — HTTP Smuggling Prevention
proxy_http_version 1.1;
chunked_transfer_encoding off;
proxy_request_buffering on;
# Reject requests with both Content-Length and Transfer-Encoding:
if ($http_transfer_encoding ~* "chunked") {
  return 400;
}`,
        description: 'Disables ambiguous HTTP/1.1 header combinations that enable request smuggling attacks.',
        nextSteps,
        evidence,
        source,
      }
    }
    return {
      type: 'FIREWALL_RULE',
      file: 'ufw / iptables',
      snippet: `# Zynth Autonomous Fix — Port Hardening
# Block the exploited port from all external sources:
sudo ufw deny ${name.match(/\d+/)?.[0] || 'PORT'}/tcp
sudo ufw reload

# Or restrict to your own IP only:
sudo ufw allow from YOUR_IP to any port ${name.match(/\d+/)?.[0] || 'PORT'}`,
      description: 'Closes the exploited port from public internet access using firewall rules.',
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

  const isAiReport = name.includes('llm') || name.includes('prompt') || name.includes('model') || name.includes('jailbreak') || name.includes('exfiltration')
  
  const snippet = Array.isArray(issue.aiFixSteps) && issue.aiFixSteps.length > 0
    ? issue.aiFixSteps.map((step, i) => `// Step ${i + 1}\n${step}`).join('\n\n')
    : 'Review your source code and apply the recommended security patch.'

  return {
    type: isAiReport ? 'AI_SYSTEM_PROMPT' : 'SOURCE_CODE_PATCH',
    file: isAiReport ? 'System Instructions' : 'Source Code',
    snippet,
    description: issue.aiExplanation || 'A custom security patch is required to mitigate this vulnerability.',
    nextSteps,
    evidence,
    source,
  }
}
