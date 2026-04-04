import { NextRequest, NextResponse } from 'next/server'
import { scanPullRequest } from '@/utils/scan/github'

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

/**
 * Zynth GitHub Webhook Handler (Stage 7.1)
 * -----------------------------------------
 * This endpoint receives events from GitHub Apps.
 */

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { action, pull_request, repository } = payload

    console.log(`[ZYNTH_GITHUB_WEBHOOK] Received ${action} event for ${repository.full_name}`)

    // 1. Listen for PR opening or updates
    if (action === 'opened' || action === 'synchronize') {
       const owner = repository.owner.login
       const repo = repository.name
       const prNumber = pull_request.number

       // Trigger the autonomous Scan
       // We run this as a non-blocking process in the background (Edge Functions compatible)
       void scanPullRequest(owner, repo, prNumber)

       return NextResponse.json({ 
         success: true, 
         message: `Zynth Security Audit triggered for ${repository.full_name} PR #${prNumber}`
       })
    }

    return NextResponse.json({ success: true, message: 'Event ignored' })

  } catch (err) {
    console.error('[ZYNTH_GITHUB_WEBHOOK] Error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
