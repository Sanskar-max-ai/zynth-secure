import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getClientIp, rateLimit } from '@/utils/rateLimit'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const chatLimit = rateLimit(`chat:${ip}`, 20, 60_000)

  if (!chatLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((chatLimit.resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
    )
  }

  const supabase = await createClient()
  
  // Robust session check
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    console.error('[Zynth_Audit] Auth Failure: No session found', sessionError)
    return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[Zynth_Audit] User Validation Failure', userError)
    return NextResponse.json({ error: 'USER_VERIFICATION_FAILED' }, { status: 401 })
  }

  const { scanId, message } = await req.json()

  if (!scanId || !message) {
    return NextResponse.json({ error: 'MALFORMED_REQUEST' }, { status: 400 })
  }

  // 1. Verify ownership and fetch scan context
  const { data: scan, error: scanFetchError } = await supabase
    .from('scans')
    .select('*, scan_issues(*)')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .single()

  if (scanFetchError || !scan) {
    console.error('[Zynth_Audit] Resource Access Denied', scanFetchError)
    return NextResponse.json({ error: 'RESOURCE_UNREACHABLE' }, { status: 404 })
  }

  // 2. Fetch recent chat history
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('scan_id', scanId)
    .order('created_at', { ascending: true })
    .limit(15)

  // 3. Save User Message
  const { error: insertError } = await supabase.from('chat_messages').insert({
    scan_id: scanId,
    user_id: user.id,
    role: 'user',
    content: message
  })

  if (insertError) {
    console.error('[Zynth_Audit] Telemetry Storage Failure', insertError)
  }

  // 4. Call Gemini
  const systemPrompt = `YOU ARE THE ZYNTHSECURITY ADVISOR // ELITE CYBERSECURITY TELEMETRY ANALYST.
SYSTEM_CONTEXT: AUDIT REPORT FOR ${scan.url}
FINDINGS_JSON: ${JSON.stringify(scan.scan_issues)}

MISSION:
- TRANSLATE TECHNICAL VULNERABILITIES INTO EXECUTIVE ACTION PATHWAYS.
- PROVIDE TERMINAL COMMANDS, PATCH SNIPPETS, AND CONFIGURATION BLOCKS.
- MAINTAIN A HIGH-LEVEL, STRATEGIC, AND PROFESSIONAL TONE.
- CONSTRAIN ALL GUIDANCE TO THE SCOPE OF THE PROVIDED AUDIT.`

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('CONFIG_ERROR: AI_KEY_MISSING')
    }

    const contents = [
      ...(history || []).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      }
    )

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text()
      console.error(`[Zynth_Audit] AI Hub Error: ${geminiRes.status}`, errorBody)
      throw new Error(`AI_HUB_UNAVAILABLE: ${geminiRes.status}`)
    }

    const data = await geminiRes.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_RESPONSE_GENERATED"

    // 5. Save AI Response
    await supabase.from('chat_messages').insert({
      scan_id: scanId,
      user_id: user.id,
      role: 'assistant',
      content: aiResponse
    })

    return NextResponse.json({ message: aiResponse })

  } catch (err: any) {
    console.error('[Zynth_Audit] Critical Pipeline Fault:', err.message)
    return NextResponse.json({ error: err.message || 'SYSTEM_PIPELINE_FAULT' }, { status: 500 })
  }
}
