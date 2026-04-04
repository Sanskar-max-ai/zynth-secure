/**
 * ZYNTH AI-GUARD DETECTION ENGINE
 * -----------------------------------------
 * This utility identifies if a target URL contains LLM-driven components, 
 * chatbots, or AI integrations by analyzing HTML, scripts, and common API routes.
 */

export interface AIDetectionResult {
  isAI: boolean
  confidence: number
  platform?: string
  detectedSignatures: string[]
}

const AI_SIGNATURES = [
  { name: 'OpenAI', regex: /openai|gpt-[345]|chatgpt/i },
  { name: 'Anthropic', regex: /anthropic|claude/i },
  { name: 'Intercom (AI Enabled)', regex: /intercom\.io|intercomcdn\.com/i },
  { name: 'Drift', regex: /drift\.com|driftt\.com/i },
  { name: 'Chatbase', regex: /chatbase\.co/i },
  { name: 'Crisp', regex: /crisp\.chat/i },
  { name: 'Tidio', regex: /tidio\.co/i },
  { name: 'Zendesk Answer Bot', regex: /zendesk\.com\/embeddable/i },
  { name: 'Dante AI', regex: /dante-ai\.com/i },
  { name: 'Custom LLM Chatbox', regex: /chatbot|assistant|ai-chat|smart-reply/i }
]

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const hrefRegex = /href=["'](https?:\/\/[^"'>]+|(\/[^"'>]+))["']/g
  let match
  
  const baseHostname = new URL(baseUrl).hostname

  while ((match = hrefRegex.exec(html)) !== null) {
    let link = match[1]
    if (link.startsWith('/')) {
      link = `${new URL(baseUrl).origin}${link}`
    }
    
    try {
      const linkUrl = new URL(link)
      if (linkUrl.hostname === baseHostname && !links.includes(link)) {
        links.push(link)
      }
    } catch {
      // Invalid URL
    }
    
    if (links.length >= 10) break // Limit link collection
  }
  return links
}

export async function detectAISignatures(url: string, html: string): Promise<AIDetectionResult> {
  const detectedSignatures: string[] = []
  let confidence = 0
  
  const bodyLower = html.toLowerCase()

  // 1. Scan for specific script/platform signatures
  for (const sig of AI_SIGNATURES) {
    if (sig.regex.test(bodyLower)) {
      detectedSignatures.push(sig.name)
      confidence += 40
    }
  }

  // 2. Scan for common AI UI markers
  const uiMarkers = [
    'chat-widget', 'chat-button', 'ask-ai', 'ai-assistant', 
    'message-bubble', 'floating-chat', 'bot-response'
  ]
  
  for (const marker of uiMarkers) {
    if (bodyLower.includes(marker)) {
      confidence += 15
    }
  }

  // 3. Scan for common AI API routes (heuristic)
  const apiMarkers = ['/api/chat', '/v1/completions', '/query-ai']
  for (const api of apiMarkers) {
    if (bodyLower.includes(api)) {
      confidence += 25
    }
  }

  // Cap confidence at 100
  confidence = Math.min(100, confidence)

  return {
    isAI: confidence >= 40, // 40% threshold for "Probably has AI"
    confidence,
    platform: detectedSignatures.length > 0 ? detectedSignatures[0] : undefined,
    detectedSignatures
  }
}

/**
 * Higher-level function to fetch and detect AI
 */
export async function runAIDetection(url: string): Promise<AIDetectionResult> {
  const visited = new Set<string>()
  const queue = [url]
  const allDetectedSignatures = new Set<string>()
  let maxConfidence = 0
  let resultsCount = 0

  console.log(`[ SENTINEL_CRAWLER ] Initiating deep AI discovery for ${url}...`)

  while (queue.length > 0 && resultsCount < 5) { // Deep scan limit of 5 pages
    const currentUrl = queue.shift()!
    if (visited.has(currentUrl)) continue
    visited.add(currentUrl)

    try {
      const res = await fetch(currentUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Zynth-Sentinel/1.0)' },
        signal: AbortSignal.timeout(8000)
      })
      
      if (!res.ok) continue
      
      const html = await res.text()
      const result = await detectAISignatures(currentUrl, html)
      
      result.detectedSignatures.forEach(sig => allDetectedSignatures.add(sig))
      maxConfidence = Math.max(maxConfidence, result.confidence)
      resultsCount++

      // Discovery Phase: Find more subpages to scan
      const sublinks = extractLinks(html, url)
      for (const link of sublinks) {
        if (!visited.has(link) && 
           (link.includes('chat') || link.includes('support') || link.includes('contact') || link.includes('ai') || link.includes('help'))) {
          queue.push(link)
        }
      }
    } catch (err) {
      // Skip failed page
    }
  }

  return { 
    isAI: maxConfidence >= 40, 
    confidence: maxConfidence, 
    detectedSignatures: Array.from(allDetectedSignatures),
    platform: Array.from(allDetectedSignatures)[0]
  }
}
