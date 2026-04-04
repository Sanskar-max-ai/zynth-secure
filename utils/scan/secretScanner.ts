import { ScanIssue } from '@/types'
import { generateId } from '@/utils/scan/engine'

/**
 * ZYNTH SECRET SENTINEL
 * -----------------------------------------
 * Scans public assets (JS bundles, HTML) for leaked API keys
 * and sensitive service credentials.
 */

interface SecretPattern {
  name: string
  regex: RegExp
  severity: 'CRITICAL' | 'HIGH'
  description: string
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'OpenAI API Key',
    regex: /sk-[a-zA-Z0-9]{32,}/g, // Basic pattern for older keys
    severity: 'CRITICAL',
    description: 'A legacy OpenAI API key was found in a public script.'
  },
  {
    name: 'OpenAI Project Key',
    regex: /sk-proj-[a-zA-Z0-9_-]{40,}/g, // Modern project-based keys
    severity: 'CRITICAL',
    description: 'A modern OpenAI Project API key was found exposed in a public JS bundle.'
  },
  {
    name: 'Anthropic API Key',
    regex: /sk-ant-sid01-[a-zA-Z0-9_-]{30,}/g,
    severity: 'CRITICAL',
    description: 'An Anthropic Claude API key was found in a public asset.'
  },
  {
    name: 'Google Gemini API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/g,
    severity: 'HIGH',
    description: 'A Google Cloud / Gemini API key was found exposed.'
  },
  {
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    description: 'An AWS Access Key ID was found. This could lead to full infrastructure compromise.'
  }
]

export async function scanForSecrets(url: string, html: string): Promise<ScanIssue[]> {
  const issues: ScanIssue[] = []
  const visitedAssets = new Set<string>()
  
  // 1. Scan the main HTML content
  const htmlIssues = findSecretsInContent(html, 'Main Page HTML')
  issues.push(...htmlIssues)

  // 2. Discover and scan JS bundles
  const scriptRegex = /<script[^>]+src=["']([^"'>]+\.js)["']/g
  let match
  const baseUrl = new URL(url)

  while ((match = scriptRegex.exec(html)) !== null) {
    let scriptUrl = match[1]
    if (scriptUrl.startsWith('/')) scriptUrl = `${baseUrl.origin}${scriptUrl}`
    if (!scriptUrl.startsWith('http')) continue
    if (visitedAssets.has(scriptUrl)) continue
    
    visitedAssets.add(scriptUrl)

    try {
      const res = await fetch(scriptUrl, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const content = await res.text()
      
      const assetIssues = findSecretsInContent(content, scriptUrl)
      issues.push(...assetIssues)
    } catch {
      // Skip failed asset
    }

    if (visitedAssets.size >= 10) break // Safety limit
  }

  return issues
}

function findSecretsInContent(content: string, source: string): ScanIssue[] {
  const findings: ScanIssue[] = []
  
  for (const pattern of SECRET_PATTERNS) {
    const matches = content.match(pattern.regex)
    if (matches) {
      for (const m of matches) {
        // Mask the secret for the report
        const masked = `${m.substring(0, 8)}...${m.substring(m.length - 4)}`
        
        findings.push({
          id: generateId(),
          testName: `Exposed Secret: ${pattern.name}`,
          severity: pattern.severity,
          description: pattern.description,
          aiExplanation: `Our Sentinel deep-scan found a sensitive ${pattern.name} in ${source}. This key is publicly accessible and can be used by anyone to incur costs or access your private data.`,
          aiFixSteps: [
            `Revoke the key immediately in your ${pattern.name.split(' ')[0]} dashboard`,
            'Generate a new key and store it in environment variables (server-side only)',
            'Remove the hardcoded reference from your source code and redeploy',
            'Check your usage logs for any unauthorized activity'
          ],
          isFixed: false,
          findingSource: 'external',
          evidence: [masked, `Found in: ${source}`]
        })
      }
    }
  }
  
  return findings
}
