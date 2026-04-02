import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runFullScan, calculateScore } from '@/utils/scan/engine'
import { sendAlertEmail } from '@/utils/email'

export const maxDuration = 60

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

    // 1. Run the security sweep
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

    // 4. Check for new critical/high issues and trigger alerts
    const newCritical = issues.filter((i) => i.severity === 'CRITICAL')
    const newHigh = issues.filter((i) => i.severity === 'HIGH')
    const alertableIssues = [...newCritical, ...newHigh]

    if (alertableIssues.length > 0) {
      // Fetch user email and notification preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, discord_webhook_url, email_alerts_enabled')
        .eq('id', userId)
        .single()

      const alertPayload = {
        url,
        scanId: scanRow.id,
        criticalCount: newCritical.length,
        highCount: newHigh.length,
        newIssues: alertableIssues.map((i) => ({
          testName: i.testName,
          severity: i.severity,
          description: i.description,
        })),
      }

      // --- Email Alert ---
      if (profile?.email && profile?.email_alerts_enabled !== false) {
        try {
          await sendAlertEmail({ to: profile.email, ...alertPayload })
        } catch (emailErr) {
          console.error('Failed to send alert email:', emailErr)
        }
      }

      // --- Discord Webhook Alert ---
      if (profile?.discord_webhook_url) {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zynthsecure.com'
          const discordPayload = {
            username: 'Zynth AI Guard',
            avatar_url: `${siteUrl}/favicon.ico`,
            embeds: [{
              title: `⚠️ ${alertableIssues.length} new vulnerabilities found on ${url}`,
              url: `${siteUrl}/dashboard/scan/${scanRow.id}`,
              color: 0xff4444,
              fields: alertableIssues.slice(0, 5).map((issue) => ({
                name: `[${issue.severity}] ${issue.testName}`,
                value: issue.description,
                inline: false,
              })),
              footer: { text: 'Zynth AI Guard — Automated Security Monitor' },
              timestamp: new Date().toISOString(),
            }],
          }

          await fetch(profile.discord_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload),
          })
        } catch (discordErr) {
          console.error('Failed to send Discord alert:', discordErr)
        }
      }
    }

    return NextResponse.json({ success: true, scanId: scanRow.id, alertsFired: alertableIssues.length > 0 })

  } catch (error: any) {
    console.error('CRON Worker scan error:', error)
    return NextResponse.json({ error: 'Scan worker failed' }, { status: 500 })
  }
}
