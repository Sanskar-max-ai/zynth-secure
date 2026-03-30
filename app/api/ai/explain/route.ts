import { NextRequest, NextResponse } from 'next/server'
import { ScanIssue, AIExplainRequest, AIExplainResponse } from '@/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Detect platform from URL and content
function detectPlatform(url: string, issues: ScanIssue[]): string {
  const urlLower = url.toLowerCase()
  const issueText = JSON.stringify(issues).toLowerCase()

  if (urlLower.includes('wordpress') || issueText.includes('wordpress') || issueText.includes('wp-')) return 'WordPress'
  if (urlLower.includes('shopify') || issueText.includes('shopify')) return 'Shopify'
  if (urlLower.includes('wix') || issueText.includes('wix')) return 'Wix'
  if (urlLower.includes('squarespace') || issueText.includes('squarespace')) return 'Squarespace'
  if (urlLower.includes('webflow') || issueText.includes('webflow')) return 'Webflow'
  if (issueText.includes('laravel') || issueText.includes('php')) return 'PHP/Laravel'
  if (issueText.includes('nginx')) return 'Nginx'
  if (issueText.includes('apache')) return 'Apache'
  return 'your website'
}

function generateFallbackSummary(issues: ScanIssue[], url: string): string {
  const critical = issues.filter(i => i.severity === 'CRITICAL' && !i.isFixed).length
  const high = issues.filter(i => i.severity === 'HIGH' && !i.isFixed).length
  const total = issues.filter(i => !i.isFixed).length

  if (total === 0) return `${url} has no detected security issues — excellent security posture!`

  const parts: string[] = []
  if (critical > 0) parts.push(`${critical} critical issue${critical > 1 ? 's' : ''} that need immediate attention`)
  if (high > 0) parts.push(`${high} high severity issue${high > 1 ? 's' : ''} to fix this week`)

  const remaining = total - critical - high
  if (remaining > 0) parts.push(`${remaining} medium/low priority issue${remaining > 1 ? 's' : ''}`)

  return `Security scan of ${url} found ${total} issue${total > 1 ? 's' : ''}: ${parts.join(', ')}. ${critical > 0 ? 'Immediate action required on critical issues.' : 'Address high severity issues soon to reduce risk.'}`
}

function generateFallbackPriority(issues: ScanIssue[]): string {
  const critical = issues.filter(i => i.severity === 'CRITICAL' && !i.isFixed)
  const high = issues.filter(i => i.severity === 'HIGH' && !i.isFixed)
  const medium = issues.filter(i => i.severity === 'MEDIUM' && !i.isFixed)

  const parts: string[] = []
  if (critical.length > 0) parts.push(`🔴 Fix TODAY: ${critical.map(i => i.testName).join(', ')}`)
  if (high.length > 0) parts.push(`🟠 Fix THIS WEEK: ${high.map(i => i.testName).join(', ')}`)
  if (medium.length > 0) parts.push(`🟡 Fix THIS MONTH: ${medium.map(i => i.testName).join(', ')}`)

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  let body: AIExplainRequest | undefined;
  try {
    body = await req.json() as AIExplainRequest
    const { issues, url, scanType } = body

    if (!issues || issues.length === 0) {
      return NextResponse.json({ enrichedIssues: [], executiveSummary: '', priorityGuide: '' })
    }

    const platform = body.platform || detectPlatform(url, issues)

    // ── Fallback: use built-in explanations if no Gemini key ────────────────
    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        enrichedIssues: issues,
        executiveSummary: generateFallbackSummary(issues, url),
        priorityGuide: generateFallbackPriority(issues),
        aiModel: 'fallback',
      } as AIExplainResponse & { aiModel: string })
    }

    // ── Gemini AI enrichment ─────────────────────────────────────────────────
    const prompt = `You are a cybersecurity expert who explains vulnerabilities in plain English for non-technical small business owners.

You are analyzing a ${scanType} security scan of: ${url}
Detected platform: ${platform}

Here are the raw scan findings in JSON:
${JSON.stringify(issues.slice(0, 15), null, 2)}

Your task:
1. For each issue, write a 1-2 sentence plain-English explanation (no jargon) that a non-technical person can understand.
2. For each issue, provide 3-4 specific fix steps tailored for ${platform}.
3. For each issue, assign a "difficulty": "EASY" (takes < 15 mins), "MEDIUM" (takes 1-2 hours), or "HARD" (requires developer).
4. Write a 3-sentence executive summary focused on business risk.
5. Write a "priorityGuide" summary string.
6. Categorize the issue IDs into "priorityDetails": {"today": [], "week": [], "month": []} based on a mix of severity and difficulty. "Today" should be Critical/High or Easy/Medium.

Respond in valid JSON with this exact structure:
{
  "enrichedIssues": [
    {
      "id": "<same id as input>",
      "aiExplanation": "<plain English explanation>",
      "aiFixSteps": ["step 1", "step 2", "step 3"],
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ],
  "executiveSummary": "<3 sentence business-focused summary>",
  "priorityGuide": "<priority breakdown text>",
  "priorityDetails": {
    "today": ["id1", "id2"],
    "week": ["id3", "id4"],
    "month": ["id5"]
  }
}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    )

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`)
    }

    const geminiData = await geminiRes.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('No response from Gemini')

    const parsed = JSON.parse(text) as {
      enrichedIssues?: Array<{ id: string; aiExplanation?: string; aiFixSteps?: string[]; difficulty?: 'EASY' | 'MEDIUM' | 'HARD' }>
      executiveSummary?: string
      priorityGuide?: string
      priorityDetails?: { today: string[]; week: string[]; month: string[] }
    }

    // Merge AI enrichment back into original issues
    const enrichedMap = new Map(
      (parsed.enrichedIssues || []).map(e => [e.id, e])
    )

    const enrichedIssues: ScanIssue[] = issues.map(issue => {
      const aiData = enrichedMap.get(issue.id)
      return {
        ...issue,
        aiExplanation: aiData?.aiExplanation || issue.aiExplanation || issue.description,
        aiFixSteps: aiData?.aiFixSteps || issue.aiFixSteps,
        difficulty: aiData?.difficulty || 'MEDIUM'
      }
    })

    return NextResponse.json({
      enrichedIssues,
      executiveSummary: parsed.executiveSummary || generateFallbackSummary(issues, url),
      priorityGuide: parsed.priorityGuide || generateFallbackPriority(issues),
      priorityDetails: parsed.priorityDetails || { 
        today: issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').map(i => i.id),
        week: issues.filter(i => i.severity === 'MEDIUM').map(i => i.id),
        month: issues.filter(i => i.severity === 'LOW').map(i => i.id)
      },
      aiModel: 'gemini-1.5-flash',
    })

  } catch (err) {
    console.error('AI explain error:', err)
    return NextResponse.json({
      enrichedIssues: body?.issues || [],
      executiveSummary: body?.issues ? generateFallbackSummary(body.issues, body.url || '') : '',
      priorityGuide: body?.issues ? generateFallbackPriority(body.issues) : '',
      priorityDetails: { today: [], week: [], month: [] },
      aiModel: 'fallback-error',
    })
  }
}
