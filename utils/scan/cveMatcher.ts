/**
 * ZYNTH VULNERABILITY SIGNATURE ENGINE (Nuclei Style)
 * ---------------------------------------------------
 * This utility matches detected software signatures (from HTTP headers) 
 * against a database of known CVEs (Common Vulnerabilities and Exposures).
 */

export interface CVESignature {
  id: string
  name: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  remediation: string
}

// A high-fidelity mock database of real-world CVEs
// In a full production app, this would be an external API or a large JSON file.
const COMMON_CVE_SIGNATURES: Record<string, CVESignature[]> = {
  'nginx/1.14.0': [
    {
      id: 'CVE-2019-9511',
      name: 'HTTP/2 "Data Dribble" Resource Exhaustion',
      severity: 'HIGH',
      description: 'An attacker could use a sequence of small window updates to consume excess CPU and memory on the Nginx server.',
      remediation: 'Upgrade to Nginx v1.16.1 or higher.'
    }
  ],
  'nginx/1.10.0': [
    {
      id: 'CVE-2017-7529',
      name: 'Nginx Integer Overflow in Range Filter',
      severity: 'HIGH',
      description: 'A vulnerability in the Nginx range filter module can lead to sensitive information disclosure.',
      remediation: 'Upgrade to Nginx v1.13.3 or higher.'
    }
  ],
  'apache/2.4.49': [
    {
      id: 'CVE-2021-41773',
      name: 'Apache Path Traversal & File Disclosure',
      severity: 'CRITICAL',
      description: 'A flaw was found in a change made to path normalization in Apache 2.4.49. An attacker could use a path traversal attack to map URLs to files outside the expected document root.',
      remediation: 'Upgrade to Apache v2.4.51 immediately.'
    }
  ],
  'wordpress/5.4': [
    {
      id: 'CVE-2020-28032',
      name: 'WordPress Authenticated User Privilege Escalation',
      severity: 'HIGH',
      description: 'A vulnerability in the WordPress core allows authenticated users to obtain higher privileges via a specially crafted request.',
      remediation: 'Update to WordPress v5.4.2 or higher.'
    }
  ]
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Matches a detected server header to known CVE signatures
 * If no local match, it uses AI to research the vulnerabilities live.
 */
export async function matchCVESignatures(serverHeader: string): Promise<CVESignature[]> {
  if (!serverHeader) return []
  
  const normalizedHeader = serverHeader.toLowerCase()
  
  // Find a match in our local signature database first
  const matchedKey = Object.keys(COMMON_CVE_SIGNATURES).find(key => 
    normalizedHeader.includes(key.toLowerCase())
  )

  if (matchedKey) {
    return COMMON_CVE_SIGNATURES[matchedKey]
  }

  // Autonomous Intelligence Phase: Research the version live
  if (!GEMINI_API_KEY) return []

  const prompt = `You are a cybersecurity research agent.
Research the top 3 most critical, real-world CVE vulnerabilities for the software version: "${serverHeader}".
Return ONLY a valid JSON array of CVESignature objects:
[{"id": "string", "name": "string", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "description": "string", "remediation": "string"}]`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: prompt }] },
          contents: [{ role: 'user', parts: [{ text: `CVE Research for ${serverHeader}` }] }],
          generationConfig: { temperature: 0.1, response_mime_type: 'application/json' }
        })
      }
    )
    const data = await res.json()
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '[]')
  } catch (err) {
    console.error(`CVE Live Scan Failed for ${serverHeader}:`, err)
    return []
  }
}

/**
 * Higher-level function to analyze tech stacks
 */
export async function auditTechStack(technologies: string[]): Promise<CVESignature[]> {
  let allFindings: CVESignature[] = []
  
  for (const tech of technologies) {
    const findings = await matchCVESignatures(tech)
    allFindings = [...allFindings, ...findings]
  }

  return allFindings
}
