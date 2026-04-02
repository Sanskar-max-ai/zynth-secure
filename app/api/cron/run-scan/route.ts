import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runFullScan, calculateScore } from '@/utils/scan/engine'

export const maxDuration = 60 // Allow 60s for the scan completion

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, url } = await req.json()

    if (!userId || !url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    // 1. Run the actual security sweep (skipping AI text/fixes since that is on-demand in UI)
    const issues = await runFullScan(url)
    const score = calculateScore(issues)

    // 2. Insert into scans
    const { data: scanRow, error: scanErr } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        url,
        scan_type: 'web',
        score,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (scanErr) throw scanErr

    // 3. Insert issues
    const formattedIssues = issues.map((i) => ({
      scan_id: scanRow.id,
      test_name: i.testName,
      severity: i.severity,
      description: i.description,
      is_fixed: i.isFixed || false,
      ai_explanation: i.aiExplanation || null,
      ai_fix_steps: i.aiFixSteps || null,
      auto_remediable: i.autoRemediable || false,
      details: i.details || null
    }))

    if (formattedIssues.length > 0) {
      const { error: issueErr } = await supabase.from('scan_issues').insert(formattedIssues)
      if (issueErr) throw issueErr
    }

    return NextResponse.json({ success: true, scanId: scanRow.id })

  } catch (error: any) {
    console.error('CRON Worker scan error:', error)
    return NextResponse.json({ error: 'Scan worker failed' }, { status: 500 })
  }
}
