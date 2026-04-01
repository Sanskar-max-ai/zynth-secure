import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateFixPayload } from '@/utils/scan/remediation'
import { getClientIp, rateLimit } from '@/utils/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const remediationLimit = rateLimit(`remediate:${ip}`, 12, 60_000)

    if (!remediationLimit.allowed) {
      const retryAfter = Math.max(1, Math.ceil((remediationLimit.resetAt - Date.now()) / 1000))
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      )
    }

    const { scanId, issueId, testName } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: issue, error: issueError } = await supabase
      .from('scan_issues')
      .select('test_name, severity, description, ai_explanation, ai_fix_steps, details')
      .eq('id', issueId)
      .eq('scan_id', scanId)
      .single()

    if (issueError) throw issueError
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // 1. Analyze the issue and generate a REAL fix payload
    const fixPayload = generateFixPayload({
      testName: issue.test_name || testName,
      severity: issue.severity,
      aiFixSteps: issue.ai_fix_steps || undefined,
      aiExplanation: issue.ai_explanation || undefined,
      details: issue.details || undefined,
    })

    // 2. Mark the issue as fixed in the DB (Audit Trail)
    const { error: updateError } = await supabase
      .from('scan_issues')
      .update({ is_fixed: true })
      .eq('id', issueId)
      .eq('scan_id', scanId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      payload: {
        message: `Security Patch Generated for ${testName}`,
        ...fixPayload,
        timestamp: new Date().toISOString()
      } 
    })
  } catch (err) {
    console.error('Remediation error:', err)
    return NextResponse.json({ error: 'Remediation engine failure' }, { status: 500 })
  }
}
