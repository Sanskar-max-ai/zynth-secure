import { NextRequest, NextResponse } from 'next/server'
import { ScanResult, ScanIssue, Severity } from '@/types'
import { createClient } from '@/utils/supabase/server'
import * as dns from 'dns'
import { promisify } from 'util'

const dnsResolve = promisify(dns.resolve)
const dnsResolveTxt = promisify(dns.resolveTxt)

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

// ── Security Score Calculator ────────────────────────────────────────────────

function calculateScore(issues: ScanIssue[]): number {
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

// ── Individual Checks ────────────────────────────────────────────────────────

async function checkSSL(url: string): Promise<{ issues: ScanIssue[], info: Record<string, unknown> }> {
  const issues: ScanIssue[] = []
  const info: Record<string, unknown> = {}

  try {
    // Use SSL Labs API (free, no key needed)
    const domain = extractDomain(url)
    const endpoint = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&fromCache=on&maxAge=24&all=done&ignoreMismatch=on`
    
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Zynth-Scanner/1.0' }
    })
    
    if (res.ok) {
      const data = await res.json() as { status: string; endpoints?: Array<{ grade?: string; details?: Record<string, unknown> }> }
      if (data.status === 'READY' && data.endpoints?.length) {
        const endpoint = data.endpoints[0]
        const grade = endpoint.grade
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
    // SSL Labs unavailable or slow — fall through
  }

  // Check if HTTPS works at all
  try {
    const res = await fetch(url, { 
      method: 'HEAD', 
      signal: AbortSignal.timeout(8000),
      redirect: 'manual'
    })
    if (!url.startsWith('https://')) {
      issues.push({
        id: generateId(),
        testName: 'Site Not Using HTTPS',
        severity: 'CRITICAL',
        description: 'Site appears to be on HTTP — all data is transmitted unencrypted.',
        aiExplanation: 'Your website doesn\'t use HTTPS encryption. Everything visitors send to your site (including passwords and payment info) can be read by anyone on the same network.',
        aiFixSteps: ['Contact your hosting provider to enable HTTPS/SSL', 'Most hosts (Bluehost, SiteGround, etc.) offer free Let\'s Encrypt SSL', 'Once enabled, set all URLs to https://'],
        isFixed: false,
      })
    }
    info.statusCode = res.status
  } catch {}

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

    // HSTS
    if (!headers.get('strict-transport-security')) {
      issues.push({
        id: generateId(),
        testName: 'Missing HSTS Header',
        severity: 'HIGH',
        description: 'HTTP Strict Transport Security (HSTS) header is not set.',
        aiExplanation: 'Your website is missing a security instruction that tells browsers to always use the encrypted version of your site. Without it, attackers can trick browsers into using the unencrypted version.',
        aiFixSteps: ['In your web server config (Nginx/Apache/Cloudflare), add the HSTS header', 'Cloudflare users: Enable HSTS in SSL/TLS → Edge Certificates → HSTS', 'WordPress users: Install the Really Simple SSL plugin'],
        isFixed: false,
        autoRemediable: true
      })
    }

    // CSP
    if (!headers.get('content-security-policy')) {
      issues.push({
        id: generateId(),
        testName: 'Missing Content Security Policy (CSP)',
        severity: 'HIGH',
        description: 'No Content-Security-Policy header found.',
        aiExplanation: 'Your website is missing a Content Security Policy. This security feature tells browsers which scripts and resources are allowed to load on your site. Without it, attackers who inject scripts can run malicious code on your visitors\' browsers.',
        aiFixSteps: ['Add a basic CSP header to your web server config', 'For Cloudflare: Use Transform Rules to add response headers', 'WordPress: Use the HTTP Headers plugin (free)'],
        isFixed: false,
        autoRemediable: true
      })
    }

    // X-Frame-Options
    if (!headers.get('x-frame-options') && !headers.get('content-security-policy')?.includes('frame-ancestors')) {
      issues.push({
        id: generateId(),
        testName: 'Missing X-Frame-Options (Clickjacking Risk)',
        severity: 'MEDIUM',
        description: 'X-Frame-Options header not set — site can be embedded in iframes.',
        aiExplanation: 'Your website can be secretly embedded inside another webpage. Attackers use this technique (called clickjacking) to trick your visitors into clicking things they didn\'t intend to.',
        aiFixSteps: ['Add X-Frame-Options: SAMEORIGIN to your server headers', 'Cloudflare users: Add this in the Transform Rules section', 'Ask your hosting provider if you\'re unsure how to add headers'],
        isFixed: false,
        autoRemediable: true
      })
    }

    // X-Content-Type-Options
    if (!headers.get('x-content-type-options')) {
      issues.push({
        id: generateId(),
        testName: 'Missing X-Content-Type-Options',
        severity: 'MEDIUM',
        description: 'X-Content-Type-Options: nosniff header is missing.',
        aiExplanation: 'Your website is missing a header that prevents browsers from "sniffing" file types — a technique attackers use to execute malicious files disguised as harmless ones.',
        aiFixSteps: ['Add X-Content-Type-Options: nosniff to your server config', 'This is a one-line change in most web servers'],
        isFixed: false,
        autoRemediable: true
      })
    }

    // Server version exposed
    const server = headers.get('server')
    if (server && /[\d.]+/.test(server)) {
      issues.push({
        id: generateId(),
        testName: 'Server Version Exposed',
        severity: 'MEDIUM',
        description: `Server header reveals version: ${server}`,
        aiExplanation: `Your website is broadcasting what software and version it's running (${server}). This is like putting a "using this specific lock brand" sign on your front door — attackers can look up known weaknesses for that exact version.`,
        aiFixSteps: ['Hide or remove the Server header in your web server settings', 'In Apache: use ServerTokens Prod', 'In Nginx: use server_tokens off'],
        isFixed: false,
        details: { serverHeader: server },
      })
    }

    // HTTPS redirect check
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
            aiExplanation: 'Your website doesn\'t automatically redirect visitors from the insecure http:// version to the secure https:// version. Visitors who type your URL without "https" get an unencrypted connection.',
            aiFixSteps: ['Enable "Force HTTPS" in your hosting control panel (cPanel/Plesk)', 'Cloudflare: Enable "Always Use HTTPS" in SSL/TLS settings', 'WordPress: Go to Settings → General and change both URLs to https://'],
            isFixed: false,
          })
        }
      } catch {}
    }

  } catch {
    // Network issue — skip header checks
  }

  return issues
}

async function checkDNSRecords(domain: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []

  // SPF
  try {
    const txtRecords = await dnsResolveTxt(domain)
    const allTxt = txtRecords.flat()
    
    const spf = allTxt.some(r => r.startsWith('v=spf1'))
    if (!spf) {
      issues.push({
        id: generateId(),
        testName: 'Missing SPF Record',
        severity: 'MEDIUM',
        description: 'No SPF DNS record found for this domain.',
        aiExplanation: 'Your domain is missing an SPF record. Without it, anyone can send emails pretending to be from your business (email spoofing). Scammers could send fake invoices or phishing emails that look like they\'re from you.',
        aiFixSteps: ['Log into your domain registrar (GoDaddy, Namecheap, etc.)', 'Go to DNS settings and add a TXT record: v=spf1 include:_spf.yourmailprovider.com ~all', 'Use mail-tester.com to verify your email authentication'],
        isFixed: false,
      })
    }

    const dmarc = allTxt.some(r => r.startsWith('v=DMARC1'))
    if (!dmarc) {
      try {
        const dmarcRecords = await dnsResolveTxt(`_dmarc.${domain}`)
        if (!dmarcRecords.flat().some(r => r.startsWith('v=DMARC1'))) throw new Error()
      } catch {
        issues.push({
          id: generateId(),
          testName: 'Missing DMARC Record',
          severity: 'MEDIUM',
          description: 'No DMARC DNS record found.',
          aiExplanation: 'DMARC is a protection that tells email servers what to do with suspicious emails pretending to be from your domain. Without it, fake emails using your domain name bypass spam filters more easily.',
          aiFixSteps: ['Add a DMARC TXT record at _dmarc.yourdomain.com', 'Start with: v=DMARC1; p=none; rua=mailto:you@yourdomain.com', 'Use mxtoolbox.com/dmarc to test and verify'],
          isFixed: false,
        })
      }
    }
  } catch {}

  return issues
}

async function checkExposedFiles(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []
  const domain = url.replace(/\/$/, '')

  const filesToCheck = [
    { path: '/.env',            name: 'Exposed .env File',           severity: 'CRITICAL' as Severity, explanation: 'Your .env configuration file is publicly accessible! This file contains your database passwords, API keys, and secret tokens. Any attacker can immediately steal all your credentials by visiting this URL.' },
    { path: '/.git/config',     name: 'Exposed .git Directory',      severity: 'HIGH' as Severity,     explanation: 'Your website\'s source code repository is publicly accessible. Attackers can download your entire codebase, including any hardcoded passwords or API keys in the commit history.' },
    { path: '/backup.zip',      name: 'Exposed Backup File',         severity: 'HIGH' as Severity,     explanation: 'A backup file is publicly accessible at /backup.zip. This likely contains your entire website files and potentially your database, giving attackers everything they need.' },
    { path: '/phpinfo.php',     name: 'PHP Info File Exposed',       severity: 'MEDIUM' as Severity,   explanation: 'A phpinfo.php file is publicly accessible, revealing detailed information about your server configuration that attackers can use to find vulnerabilities.' },
    { path: '/wp-config.php.bak', name: 'Exposed WordPress Config', severity: 'CRITICAL' as Severity, explanation: 'A backup of your WordPress configuration file is publicly accessible, which may contain your database credentials.' },
  ]

  const checks = filesToCheck.map(async ({ path, name, severity, explanation }) => {
    try {
      const res = await fetch(`${domain}${path}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      
      // If it returns 200 OK, we must verify it's not a "soft 404" (an HTML error page returning 200)
      if (res.status === 200) {
        const contentType = res.headers.get('content-type') || ''
        const text = await res.text()
        const isHtml = contentType.includes('text/html') || text.trim().toLowerCase().startsWith('<!doctype html') || text.trim().toLowerCase().startsWith('<html')
        
        // Only flag if it's NOT an HTML page
        if (!isHtml) {
          issues.push({
            id: generateId(),
            testName: name,
            severity,
            description: `${path} is publicly accessible (HTTP 200, non-HTML)`,
            aiExplanation: explanation,
            aiFixSteps: [
              `Block access to ${path} in your web server config`,
              'In Nginx: add deny all; for this location',
              'In Apache: add Options -Indexes and restrict via .htaccess',
              'Delete the file if it\'s not needed',
            ],
            isFixed: false,
            details: { path },
          })
        }
      }
    } catch {}
  })

  await Promise.all(checks)
  return issues
}

async function checkSSLExpiry(url: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []
  try {
    const domain = extractDomain(url)
    // Use crt.sh to get cert info without needing TLS lib
    const res = await fetch(`https://crt.sh/?q=${domain}&output=json`, {
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const certs = await res.json() as Array<{ not_after?: string }>
      if (certs.length > 0) {
        const latest = certs[0]
        if (latest.not_after) {
          const expiresAt = new Date(latest.not_after)
          const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (daysLeft < 0) {
            issues.push({
              id: generateId(),
              testName: 'SSL Certificate Expired',
              severity: 'CRITICAL',
              description: `SSL certificate expired ${Math.abs(daysLeft)} days ago`,
              aiExplanation: `Your SSL certificate has expired. Browsers are showing a "Not Secure" or red warning page to all your visitors, destroying trust and causing them to leave immediately.`,
              aiFixSteps: ['Renew your SSL certificate immediately through your hosting provider', 'Most hosting providers offer free SSL via Let\'s Encrypt', 'Contact support at your host for same-day renewal'],
              isFixed: false,
            })
          } else if (daysLeft < 30) {
            issues.push({
              id: generateId(),
              testName: 'SSL Certificate Expiring Soon',
              severity: daysLeft < 7 ? 'HIGH' : 'LOW',
              description: `SSL certificate expires in ${daysLeft} days`,
              aiExplanation: `Your SSL certificate will expire in ${daysLeft} days. After expiry, browsers will show security warnings to all visitors and block access to your site.`,
              aiFixSteps: ['Renew your SSL certificate before it expires', 'Enable auto-renewal in your hosting control panel', 'Most hosts do this automatically — verify auto-renewal is turned on'],
              isFixed: false,
            })
          }
        }
      }
    }
  } catch {}
  return issues
}

// ── Main Scanner ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string }
    let { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Normalize URL
    if (!url.startsWith('http')) url = 'https://' + url
    try { new URL(url) } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const domain = extractDomain(url)
    const scanId = generateId()

    // Run all checks in parallel
    const [sslResult, headerIssues, dnsIssues, exposedFileIssues, sslExpiryIssues] = await Promise.all([
      checkSSL(url),
      checkSecurityHeaders(url),
      checkDNSRecords(domain),
      checkExposedFiles(url),
      checkSSLExpiry(url),
    ])

    const allIssues: ScanIssue[] = [
      ...sslResult.issues,
      ...headerIssues,
      ...dnsIssues,
      ...exposedFileIssues,
      ...sslExpiryIssues,
    ]

    // Sort by severity
    const severityOrder: Record<Severity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 }
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    const score = calculateScore(allIssues)

    // Try to get AI explanations (non-blocking — works without key)
    let enrichedIssues = allIssues
    let executiveSummary = ''
    let aiPriority = ''

    try {
      const aiRes = await fetch(new URL('/api/ai/explain', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues: allIssues, url, scanType: 'website' }),
        signal: AbortSignal.timeout(20000),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json() as { enrichedIssues?: ScanIssue[]; executiveSummary?: string; priorityGuide?: string }
        enrichedIssues = aiData.enrichedIssues || allIssues
        executiveSummary = aiData.executiveSummary || ''
        aiPriority = aiData.priorityGuide || ''
      }
    } catch {
      // AI unavailable — use built-in explanations (already set above)
    }

    const result: ScanResult = {
      id: scanId,
      url,
      scanType: 'website',
      status: 'completed',
      score: calculateScore(enrichedIssues),
      issues: enrichedIssues,
      executiveSummary,
      aiPriority,
      scannedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }

    // Attempt to save to database if user is logged in
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('scans').insert({
          id: scanId,
          user_id: user.id,
          url,
          scan_type: 'website',
          status: 'completed',
          score,
          executive_summary: executiveSummary,
          ai_priority: aiPriority
        })
        
        if (enrichedIssues.length > 0) {
          const issuesToInsert = enrichedIssues.map((i) => ({
            id: i.id,
            scan_id: scanId,
            test_name: i.testName,
            severity: i.severity,
            description: i.description,
            ai_explanation: i.aiExplanation,
            ai_fix_steps: i.aiFixSteps,
            is_fixed: false,
            auto_remediable: i.autoRemediable || false
          }))
          await supabase.from('scan_issues').insert(issuesToInsert)
        }
      }
    } catch (dbErr) {
      console.error('Failed to save scan to database:', dbErr)
      // We don't fail the request if saving to DB fails, still return the result
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Website scan error:', err)
    return NextResponse.json(
      { error: 'Scan failed. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}
