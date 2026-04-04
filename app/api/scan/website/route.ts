import { NextRequest, NextResponse } from 'next/server'
import { ScanIssue, ScanResult } from '@/types'
import { createClient } from '@/utils/supabase/server'
import { calculateScore, generateId, normalizeUrl, runFullScan } from '@/utils/scan/engine'
import { getClientIp, rateLimit } from '@/utils/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const limit = rateLimit(`scan:website:${ip}`, 10, 60_000)
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many scan requests. Please wait and try again.' }, { status: 429 })
    }

    const body = await req.json() as { url?: string; apiKey?: string }
    let { url, apiKey } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    url = normalizeUrl(url)
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const scanId = generateId()
    const allIssues: ScanIssue[] = await runFullScan(url, scanId, apiKey)

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
        const aiData = await aiRes.json() as {
          enrichedIssues?: ScanIssue[]
          executiveSummary?: string
          priorityGuide?: string
        }

        enrichedIssues = aiData.enrichedIssues || allIssues
        executiveSummary = aiData.executiveSummary || ''
        aiPriority = aiData.priorityGuide || ''
      }
    } catch {
      // AI enrichment is optional. The built-in explanations remain usable.
    }

    const finalScore = calculateScore(enrichedIssues)
    const completedAt = new Date().toISOString()

    const result: ScanResult = {
      id: scanId,
      url,
      scanType: 'website',
      status: 'completed',
      score: finalScore,
      issues: enrichedIssues,
      executiveSummary,
      aiPriority,
      scannedAt: completedAt,
      completedAt,
    }

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
          score: finalScore,
          executive_summary: executiveSummary,
          ai_priority: aiPriority,
        })

        if (enrichedIssues.length > 0) {
          const issuesToInsert = enrichedIssues.map((issue) => ({
            id: issue.id,
            scan_id: scanId,
            test_name: issue.testName,
            severity: issue.severity,
            description: issue.description,
            ai_explanation: issue.aiExplanation,
            ai_fix_steps: issue.aiFixSteps,
            is_fixed: false,
            auto_remediable: issue.autoRemediable || false,
            details: {
              ...(issue.details || {}),
              findingSource: issue.findingSource || 'heuristic',
              evidence: issue.evidence || [],
            },
          }))

          await supabase.from('scan_issues').insert(issuesToInsert)
        }
      }
    } catch (dbErr) {
      console.error('Failed to save scan to database:', dbErr)
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
