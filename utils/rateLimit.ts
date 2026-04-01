type RateLimitState = {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, RateLimitState>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = memoryStore.get(key)

  if (!existing || now > existing.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  const next = { count: existing.count + 1, resetAt: existing.resetAt }
  memoryStore.set(key, next)
  return { allowed: true, remaining: limit - next.count, resetAt: next.resetAt }
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || 'unknown'
}
