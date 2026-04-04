export type AIPlatform = 'openai' | 'anthropic' | 'gemini' | 'custom'

export interface AIAdapterResponse {
  rawResponse: string
  error?: string
}

export async function detectPlatform(url: string, apiKey?: string): Promise<AIPlatform> {
  const u = url.toLowerCase()
  if (u.includes('api.openai.com')) return 'openai'
  if (u.includes('api.anthropic.com')) return 'anthropic'
  if (u.includes('generativelanguage.googleapis.com')) return 'gemini'
  
  // Heuristic based on key prefixes if URL is a proxy
  if (apiKey?.startsWith('sk-')) {
    if (apiKey.includes('ant-')) return 'anthropic'
    return 'openai'
  }
  
  return 'custom'
}

export async function executeAiProbe(
  url: string, 
  apiKey: string, 
  payload: string, 
  platformOverride?: AIPlatform
): Promise<AIAdapterResponse> {
  const platform = platformOverride || await detectPlatform(url, apiKey)
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    if (platform === 'anthropic') {
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`
    }
  }

  let body: any = {}

  switch (platform) {
    case 'openai':
      body = {
        model: 'gpt-3.5-turbo', // Defaults to a cheap model for probes unless specified
        messages: [{ role: 'user', content: payload }],
        temperature: 0.0
      }
      break
    case 'anthropic':
      body = {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: payload }]
      }
      break
    case 'gemini':
      // Gemini expects a different structure
      return await executeGeminiProbe(url, apiKey, payload)
    case 'custom':
    default:
      // For custom, we try a generic message-based JSON body
      // Most developer-built "AI wrapper" APIs use one of these keys
      body = {
        message: payload,
        prompt: payload,
        input: payload,
        query: payload
      }
      break
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000) // 30s timeout for safety
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { rawResponse: '', error: `HTTP ${response.status}: ${errorText}` }
    }

    const data = await response.json()
    
    // Extract text from common response formats
    let rawText = JSON.stringify(data)
    if (data.choices?.[0]?.message?.content) rawText = data.choices[0].message.content
    if (data.content?.[0]?.text) rawText = data.content[0].text
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) rawText = data.candidates[0].content.parts[0].text
    if (data.response) rawText = data.response
    if (data.text) rawText = data.text

    return { rawResponse: rawText }
  } catch (err: any) {
    return { rawResponse: '', error: err.message || 'Unknown network error' }
  }
}

async function executeGeminiProbe(url: string, apiKey: string, payload: string): Promise<AIAdapterResponse> {
  // Direct Gemini API call if user provided the raw Google URL
  const endpoint = url.includes('?') ? `${url}&key=${apiKey}` : `${url}?key=${apiKey}`
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: payload }] }]
      })
    })
    const data = await res.json()
    return { rawResponse: data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data) }
  } catch (err: any) {
    return { rawResponse: '', error: err.message }
  }
}
