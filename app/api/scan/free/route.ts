import { NextRequest, NextResponse } from 'next/server'
import { runFullScan } from '@/utils/scan/engine'
import { rateLimit, getClientIp } from '@/utils/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Rate limit check: 2 scans per IP per day for unauthenticated lead magnet
    const ip = getClientIp(req as any)
    const { allowed } = rateLimit(ip, 2, 86400 * 1000) // 2 req / 24 hrs in ms
    if (!allowed) {
      return NextResponse.json(
        { error: 'You have reached the free scan limit for today. Please create an account to run unlimited scans.' },
        { status: 429 }
      )
    }

    const issues = await runFullScan(url)

    // Obfuscate Critical/High issues to push users to sign up
    const processedIssues = issues.map((issue) => {
      if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') {
        return {
          id: issue.id,
          testName: 'Hidden Critical/High Vulnerability',
          severity: issue.severity,
          description: 'This issue is obscured in the free scan. Create an account to reveal details, evidence, and remediation steps.',
          aiFixSteps: [],
          aiExplanation: null,
          details: null,
          hidden: true, // Flag for the frontend paywall
        }
      }
      return issue
    })

    // Precalculate score locally so we don't have to save it to the DB yet
    let score = 100
    for (const issue of issues) {
      if (issue.severity === 'CRITICAL') score -= 20
      else if (issue.severity === 'HIGH') score -= 10
      else if (issue.severity === 'MEDIUM') score -= 5
      else if (issue.severity === 'LOW') score -= 2
    }
    score = Math.max(0, score)

    return NextResponse.json({
      url,
      score,
      issues: processedIssues,
      totalIssuesFound: issues.length,
    })

  } catch (error: any) {
    console.error('Free scan error:', error)
    return NextResponse.json({ error: 'Failed to complete the free audit.' }, { status: 500 })
  }
}
