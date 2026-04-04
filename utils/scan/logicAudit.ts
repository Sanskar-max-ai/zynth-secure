import { RedTeamTest, RedTeamReport } from '@/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Zynth Logic Guard Engine (Stage 6.2)
 * -----------------------------------------
 * This engine probes for semantic business logic flaws
 * common in SaaS applications.
 */

const LOGIC_AUDIT_TESTS = [
  { name: 'Auth Escalation Probe', path: '/api/admin/config', payloadRaw: 'role=admin' },
  { name: 'Negative Value Validation', path: '/api/checkout', payloadRaw: 'quantity=-1' },
  { name: 'RBAC Bypass Probe', path: '/api/billing/settings', payloadRaw: 'tier=free' },
  { name: 'Race Condition (Credits)', path: '/api/credits/spend', payloadRaw: 'credits=100' },
  { name: 'Cross-Tenant Access Leak', path: '/api/user/data', payloadRaw: 'tenantId=attacker-01' },
  { name: 'Secret Environment Exposure', path: '/api/v1/debug', payloadRaw: 'debug=true' },
  { name: 'Bypass MFA Probe', path: '/api/auth/mfa/verify', payloadRaw: 'code=000000' },
  { name: 'IDOR: File Access', path: '/api/files/download', payloadRaw: 'fileId=9999' },
  { name: 'IDOR: User Profile', path: '/api/users/profile', payloadRaw: 'userId=1' }
]

export async function runLogicAudit(targetUrl: string, scanId: string): Promise<RedTeamReport> {
  console.log(`[ZYNTH_LOGIC_GUARD] Starting semantic logic audit for ${targetUrl}...`)
  
  const results: RedTeamTest[] = []
  
  for (const test of LOGIC_AUDIT_TESTS) {
    // 1. EXECUTE PROBE
    const probeResponse = await performLogicProbe(targetUrl, test)
    
    // 2. GRADE PROBE (using AI to judge if the response is "vulnerable")
    const grade = await gradeLogicResponse(targetUrl, test.name, test.path, probeResponse)

    results.push({
      testName: test.name,
      category: 'LOGIC',
      payload: `${test.path}?${test.payloadRaw}`,
      targetResponse: probeResponse,
      gradingScore: grade.score,
      gradingExplanation: grade.explanation,
      isExploited: grade.score >= 7
    })
  }

  const criticalFindings = results.filter(r => r.isExploited).length
  
  return {
    scanId,
    tests: results,
    criticalFindings,
    summary: `Business logic audit complete. Detected ${criticalFindings} potential semantic vulnerability vectors.`
  }
}

async function performLogicProbe(baseUrl: string, test: { name: string; path: string; payloadRaw: string }) {
  const url = `${baseUrl.replace(/\/$/, '')}${test.path}?${test.payloadRaw}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'User-Agent': 'ZynthSecure-LogicGuard/1.0',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: AbortSignal.timeout(10000)
    })

    const text = await res.text()
    return `HTTP ${res.status} ${res.statusText}\n${text.substring(0, 1000)}` 
  } catch (err: any) {
    return `PROBE_FAILED: ${err.message}`
  }
}

async function gradeLogicResponse(targetUrl: string, testName: string, path: string, response: string) {
  if (!GEMINI_API_KEY) {
    // Fallback if no API key
    const score = response.includes('Access Granted') || response.includes('DB_PASS') ? 9 : 0
    return { score, explanation: score > 0 ? `Logical exploit confirmed on ${path}` : 'No logic flaw detected.' }
  }

  const systemPrompt = `You are the ZynthSecure Logic Grader. 
Judge if the following response from a target at ${targetUrl} indicates a successful business logic or semantic exploit.

TEST: ${testName}
PATH: ${path}
RESPONSE: ${response}

GRADING CRITERIA:
- Score 1-10 (1 = Secure, 10 = Critical logic bypass)
- 7+ = Confirmed Vulnerability
- Look for "Access Granted", sensitive JSON data, or internal server info in 200 OK responses.

Return ONLY JSON: {"score": number, "explanation": "string"}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Grade logic response: ${response}` }] }],
          generationConfig: { temperature: 0.1, response_mime_type: 'application/json' }
        })
      }
    )
    const data = await res.json()
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{"score": 0, "explanation": "Grader failed"}')
  } catch (err) {
    return { score: 0, explanation: "Logic grading engine failed" }
  }
}
