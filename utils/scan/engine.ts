import { ScanIssue, Severity } from '@/types'
import * as dns from 'dns'
import { promisify } from 'util'
import { matchCVESignatures } from '@/utils/scan/cveMatcher'
import { scanCommonPorts } from '@/utils/scan/portScanner'
import { runAiRedTeam } from '@/utils/scan/aiRedTeam'
import { runLogicAudit } from '@/utils/scan/logicAudit'
import { scanForSecrets } from '@/utils/scan/secretScanner'
import { runPenetrationTest } from '@/utils/scan/pentestEngine'
import { runRemotePentest } from '@/utils/scan/remoteWorker'

const dnsResolveTxt = promisify(dns.resolveTxt)
const severityOrder: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
}

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

export function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`
}

export function calculateScore(issues: ScanIssue[]): number {
  let score = 100
  for (const issue of issues) {
    if (issue.isFixed) continue
    
    // Stage 6: Red Team findings are weighted more heavily
    const isRedTeam = issue.findingSource === 'external' && issue.testName.includes('Red Team')
    const multiplier = isRedTeam ? 1.5 : 1

    switch (issue.severity) {
      case 'CRITICAL': score -= (20 * multiplier); break
      case 'HIGH':     score -= (10 * multiplier); break
      case 'MEDIUM':   score -= (5 * multiplier);  break
      case 'LOW':      score -= (2 * multiplier);  break
      case 'INFO':     break
    }
  }
  return Math.max(0, Math.round(score))
}

export function sortIssuesBySeverity(issues: ScanIssue[]): ScanIssue[] {
  return [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

function annotateIssue(issue: ScanIssue): ScanIssue {
  if (issue.testName.startsWith('Critical Vulnerability Found:')) {
    return {
      ...issue,
      findingSource: 'external',
      evidence: issue.evidence || ['Matched against a known vulnerability signature database'],
    }
  }

  if (issue.testName === 'SSL/TLS Grade F' || issue.testName === 'Weak SSL/TLS Configuration') {
    return {
      ...issue,
      findingSource: 'external',
      evidence: issue.evidence || ['SSL Labs analysis reported a weak certificate or TLS configuration'],
    }
  }

  if (issue.testName === 'SSL Certificate Expired' || issue.testName === 'SSL Certificate Expiring Soon') {
    return {
      ...issue,
      findingSource: 'external',
      evidence: issue.evidence || ['Certificate transparency lookup returned the certificate expiry information'],
    }
  }

  const directEvidence = issue.details?.path
    ? [`Publicly accessible path found: ${String(issue.details.path)}`]
    : [`Observed during a live scan of the target application or infrastructure`]

  return {
    ...issue,
    findingSource: 'direct',
    evidence: issue.evidence || directEvidence,
  }
}

async function checkSSL(url: string): Promise<{ issues: ScanIssue[]; info: Record<string, unknown> }> {
  const issues: ScanIssue[] = []
  const info: Record<string, unknown> = {}

  try {
    const domain = extractDomain(url)
    const endpoint = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&fromCache=on&maxAge=24&all=done&ignoreMismatch=on`

    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Zynth-Scanner/1.0' },
    })

    if (res.ok) {
      const data = await res.json() as { status: string; endpoints?: Array<{ grade?: string }> }
      if (data.status === 'READY' && data.endpoints?.length) {
        const grade = data.endpoints[0].grade
        info.sslGrade = grade

        if (grade && ['F', 'T'].includes(grade)) {
          issues.push({
            id: generateId(),
            testName: 'SSL/TLS Grade F',
            severity: 'CRITICAL',
            description: `SSL/TLS grade is ${grade}. Your connection encryption is critically weak or broken.`,
            aiExplanation: `Your website's security certificate has serious problems (grade ${grade}). Visitors are vulnerable to having their data intercepted by attackers.`,
            aiFixSteps: ['Contact your hosting provider immediately', 'Request a new SSL certificate', 'Ensure TLS 1.2+ is enabled'],
            isFixed: false,
          })
        } else if (grade === 'C' || grade === 'D') {
          issues.push({
            id: generateId(),
            testName: 'Weak SSL/TLS Configuration',
            severity: 'HIGH',
            description: `SSL/TLS grade is ${grade}. Weak cipher suites or protocols may be in use.`,
            aiExplanation: `Your SSL/TLS security grade is ${grade} out of A+. This means your encryption isn't as strong as it should be, leaving some room for attackers.`,
            aiFixSteps: ['Ask your hosting provider to disable TLS 1.0 and 1.1', 'Enable only strong cipher suites', 'Consider upgrading your hosting plan'],
            isFixed: false,
          })
        }
      }
    }
  } catch {
    // Fall through to the HTTPS availability check below.
  }

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      redirect: 'manual',
    })

    if (!url.startsWith('https://')) {
      issues.push({
        id: generateId(),
        testName: 'Site Not Using HTTPS',
        severity: 'CRITICAL',
        description: 'Site appears to be on HTTP and all data is transmitted unencrypted.',
        aiExplanation: "Your website doesn't use HTTPS encryption. Everything visitors send to your site can be read by anyone on the same network.",
        aiFixSteps: ['Contact your hosting provider to enable HTTPS/SSL', "Most hosts offer free Let's Encrypt SSL", 'Once enabled, update all site URLs to https://'],
        isFixed: false,
      })
    }

    info.statusCode = res.status
  } catch {
    // Ignore transient network failures here.
  }

  return { issues, info }
}

async function checkSecurityHeaders(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Zynth-Scanner/1.0)' },
    })
    const headers = res.headers

    if (!headers.get('strict-transport-security')) {
      issues.push({
        id: generateId(),
        testName: 'Missing HSTS Header',
        severity: 'HIGH',
        description: 'HTTP Strict Transport Security (HSTS) header is not set.',
        aiExplanation: 'Your website is missing a security instruction that tells browsers to always use the encrypted version of your site.',
        aiFixSteps: ['Add the HSTS header in your web server or CDN settings', 'Enable HSTS in Cloudflare if you use it', 'Verify the header is returned on every response'],
        isFixed: false,
        autoRemediable: true,
      })
    }

    if (!headers.get('content-security-policy')) {
      issues.push({
        id: generateId(),
        testName: 'Missing Content Security Policy (CSP)',
        severity: 'HIGH',
        description: 'No Content-Security-Policy header found.',
        aiExplanation: 'Your website is missing a Content Security Policy, which helps stop injected scripts from running in user browsers.',
        aiFixSteps: ['Add a basic CSP header to your server config', 'Start with a restrictive default-src policy', 'Tune it gradually for any legitimate external assets'],
        isFixed: false,
        autoRemediable: true,
      })
    }

    if (!headers.get('x-frame-options') && !headers.get('content-security-policy')?.includes('frame-ancestors')) {
      issues.push({
        id: generateId(),
        testName: 'Missing X-Frame-Options (Clickjacking Risk)',
        severity: 'MEDIUM',
        description: 'X-Frame-Options header not set and the site can be embedded in iframes.',
        aiExplanation: 'Your site can be embedded inside another page, which can be abused for clickjacking attacks.',
        aiFixSteps: ['Add X-Frame-Options: SAMEORIGIN', 'Or use CSP frame-ancestors if you need more control', 'Retest after deploying the header'],
        isFixed: false,
        autoRemediable: true,
      })
    }

    if (!headers.get('x-content-type-options')) {
      issues.push({
        id: generateId(),
        testName: 'Missing X-Content-Type-Options',
        severity: 'MEDIUM',
        description: 'X-Content-Type-Options: nosniff header is missing.',
        aiExplanation: 'Your site is missing a header that prevents browsers from guessing file types in risky ways.',
        aiFixSteps: ['Add X-Content-Type-Options: nosniff to your server config'],
        isFixed: false,
        autoRemediable: true,
      })
    }

    const server = headers.get('server')
    if (server && /[\d.]+/.test(server)) {
      issues.push({
        id: generateId(),
        testName: 'Server Version Exposed',
        severity: 'MEDIUM',
        description: `Server header reveals version: ${server}`,
        aiExplanation: `Your website is broadcasting the software version it is running (${server}). That makes targeted attacks easier.`,
        aiFixSteps: ['Hide or shorten the Server header', 'Use minimal version disclosure in Nginx or Apache', 'Recheck the response headers after deploy'],
        isFixed: false,
        details: { serverHeader: server },
      })
    }

    if (url.startsWith('https://')) {
      const httpUrl = url.replace('https://', 'http://')
      try {
        const httpRes = await fetch(httpUrl, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(5000),
        })
        if (httpRes.status !== 301 && httpRes.status !== 302) {
          issues.push({
            id: generateId(),
            testName: 'HTTP to HTTPS Redirect Missing',
            severity: 'MEDIUM',
            description: 'Site does not automatically redirect HTTP to HTTPS.',
            aiExplanation: "Visitors can still land on the insecure HTTP version of your site if they don't type https:// themselves.",
            aiFixSteps: ['Enable force-HTTPS at the server or CDN layer', 'Verify the redirect returns 301 or 302', 'Retest both the root path and common deep links'],
            isFixed: false,
          })
        }
      } catch {
        // Ignore the redirect probe failing.
      }
    }
  } catch {
    // Skip header checks on network failure.
  }

  return issues
}

async function checkDNSRecords(domain: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []

  try {
    const txtRecords = await dnsResolveTxt(domain)
    const allTxt = txtRecords.flat()

    if (!allTxt.some((record) => record.startsWith('v=spf1'))) {
      issues.push({
        id: generateId(),
        testName: 'Missing SPF Record',
        severity: 'MEDIUM',
        description: 'No SPF DNS record found for this domain.',
        aiExplanation: 'Without SPF, attackers can spoof your domain in email much more easily.',
        aiFixSteps: ['Add an SPF TXT record in your DNS provider', 'Include your mail provider in the record', 'Verify the record after propagation'],
        isFixed: false,
      })
    }

    const hasDmarcInline = allTxt.some((record) => record.startsWith('v=DMARC1'))
    if (!hasDmarcInline) {
      try {
        const dmarcRecords = await dnsResolveTxt(`_dmarc.${domain}`)
        const hasDmarc = dmarcRecords.flat().some((record) => record.startsWith('v=DMARC1'))
        if (!hasDmarc) {
          throw new Error('Missing DMARC record')
        }
      } catch {
        issues.push({
          id: generateId(),
          testName: 'Missing DMARC Record',
          severity: 'MEDIUM',
          description: 'No DMARC DNS record found.',
          aiExplanation: 'Without DMARC, receiving mail servers have weaker guidance for handling forged mail that pretends to be from you.',
          aiFixSteps: ['Add a DMARC TXT record at _dmarc.yourdomain.com', 'Start with a monitoring policy like p=none', 'Review reports and then tighten the policy'],
          isFixed: false,
        })
      }
    }
  } catch {
    // DNS lookups can fail on external targets; skip instead of failing the scan.
  }

  return issues
}

async function checkNetworkPorts(domain: string): Promise<{ portIssues: ScanIssue[], openPorts: number[] }> {
  const portIssues: ScanIssue[] = []
  const openPorts: number[] = []
  const portResults = await scanCommonPorts(domain)

  for (const result of portResults) {
    if (result.status === 'OPEN') {
      openPorts.push(result.port)
      portIssues.push({
        id: generateId(),
        testName: `Open Port Detected: ${result.port} (${result.service})`,
        severity: ['80', '443'].includes(String(result.port)) ? 'INFO' : 'HIGH',
        description: `TCP probe confirmed port ${result.port} (${result.service}) is publicly accessible.`,
        aiExplanation: `Your server has port ${result.port} open to the internet. Zynth will now launch active exploit probes against this port.`,
        aiFixSteps: [
          `Confirm whether port ${result.port} really needs to be public`,
          'Restrict access with firewall rules where possible',
          'Retest after the access policy changes',
        ],
        isFixed: false,
        autoRemediable: true,
        evidence: [`TCP SYN/ACK handshake confirmed on ${domain}:${result.port}`]
      })
    }
  }

  return { portIssues, openPorts }
}

async function checkExposedFiles(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []
  const baseUrl = url.replace(/\/$/, '')

  const filesToCheck = [
    { path: '/.env', name: 'Exposed .env File', severity: 'CRITICAL' as Severity, explanation: 'Your .env file appears to be publicly accessible and may expose secrets.' },
    { path: '/.git/config', name: 'Exposed .git Directory', severity: 'HIGH' as Severity, explanation: 'Your source repository metadata appears to be publicly accessible.' },
    { path: '/backup.zip', name: 'Exposed Backup File', severity: 'HIGH' as Severity, explanation: 'A backup archive appears to be accessible from the public web.' },
    { path: '/phpinfo.php', name: 'PHP Info File Exposed', severity: 'MEDIUM' as Severity, explanation: 'A phpinfo file appears to be exposed and can reveal internal server details.' },
    { path: '/wp-config.php.bak', name: 'Exposed WordPress Config', severity: 'CRITICAL' as Severity, explanation: 'A backup WordPress config file appears to be publicly accessible.' },
  ]

  const checks = filesToCheck.map(async ({ path, name, severity, explanation }) => {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })

      if (res.status !== 200) {
        return
      }

      const contentType = res.headers.get('content-type') || ''
      const text = await res.text()
      const isHtml = contentType.includes('text/html') || text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html')

      if (!isHtml) {
        issues.push({
          id: generateId(),
          testName: name,
          severity,
          description: `${path} is publicly accessible (HTTP 200, non-HTML).`,
          aiExplanation: explanation,
          aiFixSteps: [
            `Block access to ${path} in your server config`,
            'Remove the file if it should not be public',
            'Retest the URL after deployment',
          ],
          isFixed: false,
          details: { path },
        })
      }
    } catch {
      // Ignore individual file-probe failures.
    }
  })

  await Promise.all(checks)
  return issues
}

async function checkSSLExpiry(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []

  try {
    const domain = extractDomain(url)
    const res = await fetch(`https://crt.sh/?q=${domain}&output=json`, {
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return issues
    }

    const certs = await res.json() as Array<{ not_after?: string }>
    const latest = certs[0]
    if (!latest?.not_after) {
      return issues
    }

    const expiresAt = new Date(latest.not_after)
    const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) {
      issues.push({
        id: generateId(),
        testName: 'SSL Certificate Expired',
        severity: 'CRITICAL',
        description: `SSL certificate expired ${Math.abs(daysLeft)} days ago.`,
        aiExplanation: 'Your SSL certificate has expired, which can trigger browser warnings and reduce trust immediately.',
        aiFixSteps: ['Renew the certificate immediately', 'Enable auto-renewal if available', 'Retest after renewal completes'],
        isFixed: false,
      })
    } else if (daysLeft < 30) {
      issues.push({
        id: generateId(),
        testName: 'SSL Certificate Expiring Soon',
        severity: daysLeft < 7 ? 'HIGH' : 'LOW',
        description: `SSL certificate expires in ${daysLeft} days.`,
        aiExplanation: `Your SSL certificate will expire in ${daysLeft} days unless it is renewed.`,
        aiFixSteps: ['Renew the certificate before expiry', 'Confirm auto-renewal is configured', 'Retest the expiry date after renewal'],
        isFixed: false,
      })
    }
  } catch {
    // Certificate lookups can fail on remote targets; skip instead of failing the whole scan.
  }

  return issues
}

export async function runWebsiteScan(url: string): Promise<ScanIssue[]> {
  const domain = extractDomain(url)
  const [sslResult, headerIssues, dnsIssues, exposedFileIssues, sslExpiryIssues, networkResult, secretIssues] = await Promise.all([
    checkSSL(url),
    checkSecurityHeaders(url),
    checkDNSRecords(domain),
    checkExposedFiles(url),
    checkSSLExpiry(url),
    checkNetworkPorts(domain),
    scanForSecrets(url, '')
  ])

  const { portIssues, openPorts } = networkResult

  // Active Pentest Phase: Attack every open port with real exploit probes
  const { pentestIssues } = await runPenetrationTest(domain, openPorts)

  const cveIssues: ScanIssue[] = []
  const serverIssue = headerIssues.find((issue) => issue.testName === 'Server Version Exposed')
  if (serverIssue?.details?.serverHeader) {
    const signatures = await matchCVESignatures(serverIssue.details.serverHeader as string)
    for (const signature of signatures) {
      cveIssues.push({
        id: generateId(),
        testName: `Critical Vulnerability Found: ${signature.id}`,
        severity: signature.severity,
        description: `${signature.name} - ${signature.description}`,
        aiExplanation: `Your server appears to match ${signature.id}, a known vulnerability tied to the exposed software version.`,
        aiFixSteps: [signature.remediation, 'Restrict exposure while patching', `Retest after applying the ${signature.id} fix`],
        isFixed: false,
        autoRemediable: true,
      })
    }
  }

  return sortIssuesBySeverity([
    ...sslResult.issues,
    ...headerIssues,
    ...dnsIssues,
    ...exposedFileIssues,
    ...sslExpiryIssues,
    ...portIssues,
    ...pentestIssues,  // Real exploit results
    ...cveIssues,
    ...secretIssues,
  ].map(annotateIssue))
}

export async function runFullScan(url: string, scanId: string = generateId(), apiKey?: string): Promise<ScanIssue[]> {
  const normalizedUrl = normalizeUrl(url)
  
  // 1. Run standard configuration scans
  const standardIssues = await runWebsiteScan(normalizedUrl)
  
  // 2. Stage 7: Run Remote Distributed Scan (Nmap/Nuclei) in parallel with Stage 6
  // This uses the cloud worker cluster, not the local CPU.
  const domain = extractDomain(normalizedUrl)
  const [aiRedTeamReport, logicReport, remoteIssues] = await Promise.all([
    runAiRedTeam(normalizedUrl, scanId, apiKey),
    runLogicAudit(normalizedUrl, scanId),
    runRemotePentest(domain)
  ])

  // Map Red Team findings to ScanIssues
  const redTeamIssues: ScanIssue[] = [
    ...aiRedTeamReport.tests.filter(t => t.isExploited).map(t => ({
      id: generateId(),
      testName: `Red Team: ${t.testName}`,
      severity: t.gradingScore >= 9 ? 'CRITICAL' : 'HIGH' as Severity,
      description: `Target exploited via adversarial probe: ${t.testName}`,
      aiExplanation: t.gradingExplanation,
      aiFixSteps: ['Apply Zynth Firewall Guardrails', 'Sanitize user inputs specifically for LLM context'],
      isFixed: false,
      findingSource: 'external' as const,
      evidence: [t.payload, t.targetResponse || 'N/A'],
      details: { 
        category: 'AI' as const, 
        gradingScore: t.gradingScore,
        attackTrace: t.attackTrace 
      }
    })),
    ...logicReport.tests.filter(t => t.isExploited).map(t => ({
      id: generateId(),
      testName: `Logic Guard: ${t.testName}`,
      severity: t.gradingScore >= 9 ? 'CRITICAL' : 'HIGH' as Severity,
      description: `Business logic flaw detected: ${t.testName}`,
      aiExplanation: t.gradingExplanation,
      aiFixSteps: ['Validate semantic state transitions', 'Enforce strict role-based access at the API layer'],
      isFixed: false,
      findingSource: 'external' as const,
      evidence: [t.payload, t.targetResponse || 'N/A'],
      details: {
        attackTrace: t.attackTrace
      }
    }))
  ]

  return sortIssuesBySeverity([
    ...standardIssues,
    ...redTeamIssues,
    ...remoteIssues // Findings from Docker Nmap/Nuclei
  ])
}
