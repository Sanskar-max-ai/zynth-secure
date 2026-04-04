import { Octokit } from 'octokit'
import { ScanIssue, Severity } from '@/types'

const GITHUB_APP_ID = process.env.GITHUB_APP_ID
const GITHUB_PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Zynth GitHub Engine (Stage 7.1)
 * -----------------------------------------
 * This utility handles autonomous scanning of Pull Requests (PRs).
 */

export async function scanPullRequest(owner: string, repo: string, prNumber: number) {
  if (!GITHUB_PRIVATE_KEY || !GEMINI_API_KEY) {
    console.warn('[ZYNTH_GITHUB] Missing credentials for autonomous PR scan')
    return null
  }

  const octokit = new Octokit({ auth: GITHUB_PRIVATE_KEY })

  try {
    // 1. Fetch Pull Request Diffs
    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      headers: { accept: 'application/vnd.github.v3.diff' }
    })

    // 2. AI Code Analysis (Stage 6 Logic + Code Context)
    const findings = await analyzeCodeDiff(diff as unknown as string, repo)

    // 3. Post Findings as a Comment
    if (findings.length > 0) {
      await postSecurityReport(octokit, owner, repo, prNumber, findings)
    }

    return findings

  } catch (err) {
    console.error('[ZYNTH_GITHUB] PR Scan Error:', err)
    return null
  }
}

async function analyzeCodeDiff(diff: string, repoName: string): Promise<ScanIssue[]> {
  const systemPrompt = `You are the ZynthSecure GitHub Guardian. 
Your goal is to audit the following code diff for security vulnerabilities.

REPO: ${repoName}
DIFF:
${diff.slice(0, 5000)} // Truncate if too large

INSTRUCTIONS:
1. Look for: Hardcoded secrets, SQL Injection, XSS, Weak Auth, or Business Logic Flaws.
2. For each found issue, provide the exact fix code.
3. Return ONLY a valid JSON array of ScanIssue objects.

[
  {
    "testName": "Vulnerability Name",
    "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "description": "Technical summary",
    "aiExplanation": "Why this is a risk",
    "aiFixSteps": ["Step 1", "Step 2"],
    "isFixed": false,
    "autoRemediable": true
  }
]`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Audit this diff for ${repoName}` }] }],
          generationConfig: { temperature: 0.2, response_mime_type: 'application/json' }
        })
      }
    )
    const data = await res.json()
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]')
  } catch (err) {
    console.error('[ZYNTH_GITHUB] AI Audit Error:', err)
    return []
  }
}

async function postSecurityReport(octokit: Octokit, owner: string, repo: string, prNumber: number, findings: ScanIssue[]) {
  const header = `## 🛡️ ZynthSecure Security Audit Report\n\nI have scanned your Pull Request and found **${findings.length}** security concerns that require attention.`
  
  const body = findings.map(f => {
    const severityIcon = f.severity === 'CRITICAL' ? '🔴' : f.severity === 'HIGH' ? '🟠' : '🟡'
    return `### ${severityIcon} ${f.testName} (${f.severity})\n\n**Risk:** ${f.aiExplanation}\n\n**Recommended Fix:**\n${f.aiFixSteps?.map(s => `- ${s}`).join('\n')}`
  }).join('\n\n---\n\n')

  const footer = `\n\n---\n*ZynthSecure Autonomous CISO Agent*`

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `${header}\n\n${body}${footer}`
  })
}
