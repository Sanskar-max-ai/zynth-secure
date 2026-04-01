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
  
  // More robust session check for App Router API routes
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    console.error('ZynthSecure Auth Error: No session found', sessionError)
    return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User missing' }, { status: 401 })
  }

  const { scanId, message } = await req.json()

  if (!scanId || !message) {
    return NextResponse.json({ error: 'Missing components' }, { status: 400 })
  }

  // 1. Verify ownership and fetch scan context
  const { data: scan } = await supabase
    .from('scans')
    .select('*, scan_issues(*)')
    .eq('id', scanId)
    .eq('user_id', user.id)
    .single()

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  // 2. Fetch recent chat history
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('scan_id', scanId)
    .order('created_at', { ascending: true })
    .limit(20)

  // 3. Save User Message
  await supabase.from('chat_messages').insert({
    scan_id: scanId,
    user_id: user.id,
    role: 'user',
    content: message
  })

  // 4. Call Gemini
  const systemPrompt = `You are the ZynthSecure Security Guard, an elite cybersecurity tutor. 
Your goal is to help the user understand and fix the security issues found in their recent audit of ${scan.url}.

SCAN CONTEXT:
${JSON.stringify(scan.scan_issues, null, 2)}

INSTRUCTIONS:
- Be encouraging, professional, and highly technical when needed.
- Provide specific terminal commands, code snippets, or configuration examples (Nginx, Apache, WordPress, etc.).
- If the user asks something unrelated to security, politely steer them back to their audit results.
- Keep responses concise but actionable.
- Use Markdown for formatting.`

  try {
    const contents = [
      ...(history || []).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    const data = await res.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm having trouble processing that right now."

    // 5. Save AI Response
    await supabase.from('chat_messages').insert({
      scan_id: scanId,
      user_id: user.id,
      role: 'assistant',
      content: aiResponse
    })

    return NextResponse.json({ message: aiResponse })

  } catch (err) {
    console.error('Chat AI Error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
