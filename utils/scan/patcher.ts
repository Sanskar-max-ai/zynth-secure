import { ScanIssue, SecurityPatch } from '@/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * AI Patching Engine
 * -----------------------------------------
 * This utility uses Gemini to generate a specific code patch 
 * for a security vulnerability found during a Zynth scan.
 */
export async function generateSecurityPatch(issue: ScanIssue, targetUrl: string): Promise<SecurityPatch | null> {
  if (!GEMINI_API_KEY) {
    console.error('Zynth Patcher Error: GEMINI_API_KEY is missing')
    return null
  }

  const systemPrompt = `You are the ZynthSecure Autonomous Patcher (ZAP). 
Your goal is to generate a high-precision, production-grade security patch for the following vulnerability found on ${targetUrl}.

STACK CONTEXT:
- Target: ${targetUrl}
- Test: ${issue.testName}
- Severity: ${issue.severity}
- Finding: ${issue.description}
- Evidence: ${issue.evidence?.join(' | ') || 'N/A'}

FIX STANDARDS:
1. PRECISION: Generate only the exact code required. Do not add boilerplate.
2. CONTEXT: If the target uses Next.js, prefer 'next.config.ts' or 'middleware.ts'. If it's a raw server, prefer standard headers or config files.
3. ROBUSTNESS: Use industry-standard security headers (e.g., Strict-Transport-Security: max-age=31536000; includeSubDomains; preload).
4. DNS: If the issue is SPF, DMARC, or DNS-related, set filePath to 'DNS Records' and providing the TXT record content.

OUTPUT FORMAT:
Return ONLY a raw JSON object with NO markdown or backticks:
{
  "filePath": "relative/path/to/file or 'DNS Records'",
  "patchContent": "The exact code or config line",
  "patchType": "replace" | "add" | "delete",
  "explanation": "Brief technical explanation of why this fix is secure."
}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: 'user', parts: [{ text: `Generate a safe patch for: ${issue.testName}` }] }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            response_mime_type: 'application/json'
          }
        })
      }
    )

    if (!res.ok) {
      throw new Error(`Gemini API returned ${res.status}`)
    }

    const data = await res.json()
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!rawContent) return null

    const patch = JSON.parse(rawContent) as SecurityPatch
    return patch

  } catch (err) {
    console.error('Zynth Patcher AI Error:', err)
    return null
  }
}
