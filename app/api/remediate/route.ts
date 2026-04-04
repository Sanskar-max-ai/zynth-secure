import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateFixPayload } from '@/utils/scan/remediation'
import { generateSecurityPatch } from '@/utils/scan/patcher'
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

    // 1. Fetch scan context
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('url')
      .eq('id', scanId)
      .single()

    if (scanError || !scan) throw new Error('Scan context not found')

    // 2. Generate a REAL fix payload (Legacy)
    const fixPayload = generateFixPayload({
      testName: issue.test_name || testName,
      severity: issue.severity,
      aiFixSteps: issue.ai_fix_steps || undefined,
      aiExplanation: issue.ai_explanation || undefined,
      details: issue.details || undefined,
    })

    // 3. Generate a SECURE AI PATCH (Stage 5.1)
    const securityPatch = await generateSecurityPatch({
      id: issueId,
      testName: issue.test_name || testName,
      severity: issue.severity,
      description: issue.description,
      aiExplanation: issue.ai_explanation || undefined,
      aiFixSteps: issue.ai_fix_steps || undefined,
      isFixed: true,
      details: issue.details || undefined
    }, scan.url)

    // 4. Mark the issue as fixed and save the patch in the DB
    const { error: updateError } = await supabase
      .from('scan_issues')
      .update({ 
        is_fixed: true,
        patch: securityPatch 
      })
      .eq('id', issueId)
      .eq('scan_id', scanId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      payload: {
        message: `Security Patch Generated for ${testName}`,
        ...fixPayload,
        patch: securityPatch,
        timestamp: new Date().toISOString()
      } 
    })
  } catch (err) {
    console.error('Remediation error:', err)
    return NextResponse.json({ error: 'Remediation engine failure' }, { status: 500 })
  }
}
