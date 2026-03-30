import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { runFullScan, calculateScore, generateId } from '@/utils/scan/engine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // 1. Fetch domain schedules
  const { data: domains, error } = await supabase
    .from('domains')
    .select('*, profiles(id, plan)')
    .eq('monitoring_enabled', true)

  if (error || !domains) {
    return NextResponse.json({ error: 'Failed to fetch domains', details: error }, { status: 500 })
  }

  const results = []

  for (const domain of domains) {
    try {
      // 2. Run scan
      const issues = await runFullScan(domain.domain)
      const newScore = calculateScore(issues)

      // 3. Compare with last scan score
      const { data: lastScan } = await supabase
        .from('scans')
        .select('score')
        .eq('url', domain.domain.startsWith('http') ? domain.domain : `https://${domain.domain}`)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      const oldScore = lastScan?.score || 100

      // 4. Record the Guard Audit
      const scanId = generateId()
      await supabase.from('scans').insert({
        id: scanId,
        user_id: domain.user_id,
        url: domain.domain.startsWith('http') ? domain.domain : `https://${domain.domain}`,
        scan_type: 'automated-guard',
        status: 'completed',
        score: newScore,
        ai_priority: newScore < oldScore ? '⚠️ Score decreased! Check your new findings.' : '✅ Secure. No changes detected.'
      })

      // 5. Generate alert if score drops
      if (newScore < oldScore) {
        await supabase.from('security_alerts').insert({
          user_id: domain.user_id,
          domain_id: domain.id,
          old_score: oldScore,
          new_score: newScore,
          change_type: 'drop'
        })
      }

      // 6. Update domain status
      await supabase.from('domains')
        .update({ last_monitored_at: new Date().toISOString() })
        .eq('id', domain.id)

      results.push({ domain: domain.domain, oldScore, newScore })

    } catch (err) {
      console.error(`Monitor failed for ${domain.domain}:`, err)
    }
  }

  return NextResponse.json({ 
    message: `Guard audit complete for ${domains.length} domains.`,
    results 
  })
}
