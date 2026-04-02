import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { sendTeamInviteEmail } from '@/utils/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check they are on a pro or agency plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, email')
      .eq('id', user.id)
      .single()

    if (!profile || profile.plan === 'free' || profile.plan === null) {
      return NextResponse.json({ error: 'Team seats require a Pro or Agency plan.' }, { status: 403 })
    }

    const { email, role } = await req.json()

    if (!email || !role || !['admin', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid invite parameters.' }, { status: 400 })
    }

    // Don't allow inviting yourself
    if (email.toLowerCase() === profile.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot invite yourself.' }, { status: 400 })
    }

    // Check for existing invite from this owner to this email
    const { data: existing } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('invited_email', email.toLowerCase())
      .single()

    if (existing && existing.status === 'active') {
      return NextResponse.json({ error: 'This person is already in your team.' }, { status: 409 })
    }

    // Insert (or re-send) the team invitation
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    if (existing) {
      // Re-send: reset status to pending
      await service.from('team_members').update({ role, status: 'pending' }).eq('id', existing.id)
    } else {
      await service.from('team_members').insert({
        owner_id: user.id,
        invited_email: email.toLowerCase(),
        role,
        status: 'pending',
      })
    }

    // Send invite email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zynthsecure.com'
    const acceptUrl = `${siteUrl}/auth/signup?team_invite=${encodeURIComponent(email)}&owner=${user.id}`

    try {
      await sendTeamInviteEmail({
        to: email,
        ownerEmail: profile.email || 'your team owner',
        role,
        acceptUrl,
      })
    } catch (emailErr) {
      console.error('Failed to send invite email (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Team invite error:', error)
    return NextResponse.json({ error: 'Failed to send invitation.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { memberId } = await req.json()
    await supabase.from('team_members').delete().eq('id', memberId).eq('owner_id', user.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove member.' }, { status: 500 })
  }
}
