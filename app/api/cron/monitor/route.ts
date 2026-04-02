import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60 // Allows 60s execution on Vercel Pro/Hobby fallback
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  // Verify Vercel Cron Secret (or local testing secret)
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Bypass RLS in CRON by using Service Role Key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )

  try {
    // 1. Get all users who are on a paid plan
    const { data: proProfiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, plan')
      .neq('plan', 'free')

    if (profileErr) throw profileErr
    if (!proProfiles || proProfiles.length === 0) {
      return NextResponse.json({ message: 'No pro users to schedule monitors for.' })
    }

    const tasks: Promise<any>[] = []
    
    // 2. Queue up unique target scans for each Pro user
    for (const profile of proProfiles) {
      // Find the unique URLs this user has previously scanned
      const { data: userScans } = await supabase
        .from('scans')
        .select('url')
        .eq('user_id', profile.id)

      if (!userScans) continue

      const uniqueUrls = Array.from(new Set(userScans.map(s => s.url)))

      for (const url of uniqueUrls) {
        // Dispatch to background worker
        // Using absolute URL if hosted, or fallback to localhost
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        
        // We push the fetch promise. We wait for the handoff to complete, not the scan.
        tasks.push(
          fetch(`${baseUrl}/api/cron/run-scan`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'authorization': `Bearer ${process.env.CRON_SECRET}` 
            },
            body: JSON.stringify({ userId: profile.id, url }),
          }).catch(err => {
            console.error(`Failed to dispatch scan for ${url}:`, err)
          })
        )
      }
    }

    // Wait for all HTTP dispatch requests to fire and be acknowledged
    await Promise.allSettled(tasks)

    return NextResponse.json({ queuedScans: tasks.length })
  } catch (err: any) {
    console.error('Monitor dispatcher error:', err)
    return NextResponse.json({ error: 'Monitor dispatch failed' }, { status: 500 })
  }
}
