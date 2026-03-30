// ===== SCAN TYPES =====

export type ScanType = 'website' | 'api' | 'code' | 'mobile' | 'ai' | 'ai-agent' | 'cloud'

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface ScanIssue {
  id: string
  testName: string
  severity: Severity
  description: string        // Raw technical description
  aiExplanation?: string     // Plain-English AI explanation
  aiFixSteps?: string[]      // Step-by-step fix instructions
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' // Level of effort
  isFixed: boolean
  autoRemediable?: boolean
  details?: Record<string, unknown>
}

export interface ScanResult {
  id: string
  url: string
  scanType: ScanType
  status: ScanStatus
  score: number              // 0-100
  issues: ScanIssue[]
  executiveSummary?: string
  aiPriority?: string        // "Fix these 2 today..."
  priorityDetails?: {
    today: string[]          // ScanIssue IDs
    week: string[]
    month: string[]
  }
  platform?: string          // Detected: WordPress, Shopify, etc.
  scannedAt: string
  completedAt?: string
  aiModel?: string           // gemini-1.5-flash
}

// ===== WEBSITE SCAN =====

export interface WebsiteScanRequest {
  url: string
}

export interface SSLInfo {
  valid: boolean
  expiresAt?: string
  daysUntilExpiry?: number
  issuer?: string
  grade?: string
}

export interface SecurityHeaders {
  csp: boolean
  hsts: boolean
  xFrameOptions: boolean
  xContentTypeOptions: boolean
  referrerPolicy: boolean
  permissionsPolicy: boolean
}

export interface WebsiteRawResult {
  url: string
  ssl: SSLInfo
  httpsRedirect: boolean
  securityHeaders: SecurityHeaders
  techStack: string[]
  cms?: string
  dnsRecords: {
    spf: boolean
    dmarc: boolean
    dkim: boolean
  }
  exposedFiles: string[]      // .env, .git, backup files found
  cookieSecurity: boolean
  serverVersion?: string
  openDirectories: boolean
  mixedContent: boolean
  breachFound?: boolean
  malwareDetected?: boolean
  subdomainTakeover?: string[]
}

// ===== AI AGENT SCAN =====

export interface AIAgentScanRequest {
  endpoint: string
  systemPrompt?: string
  apiKey?: string
}

export interface AIAgentTestResult {
  testName: string
  passed: boolean             // true = secure, false = vulnerable
  severity: Severity
  payload?: string
  response?: string
  finding?: string
}

// ===== AI EXPLANATION =====

export interface AIExplainRequest {
  issues: ScanIssue[]
  platform?: string
  url: string
  scanType: ScanType
}

export interface AIExplainResponse {
  enrichedIssues: ScanIssue[]
  executiveSummary: string
  priorityGuide: string
}

// ===== USER & PLANS =====

export type Plan = 'free' | 'starter' | 'professional' | 'agency' | 'agency-annual' | 'enterprise'

export const PLAN_LIMITS: Record<Plan, { scansPerMonth: number; domains: number; label: string; price: string }> = {
  free:           { scansPerMonth: 3,        domains: 1,         label: 'Free',           price: '$0/mo' },
  starter:        { scansPerMonth: 25,       domains: 3,         label: 'Starter',        price: '$19/mo' },
  professional:   { scansPerMonth: 999,      domains: 25,        label: 'Professional',   price: '$49/mo' },
  agency:         { scansPerMonth: 999,      domains: 999,       label: 'Agency',         price: '$149/mo' },
  'agency-annual':{ scansPerMonth: 999,      domains: 999,       label: 'Agency Annual',  price: '$9,900/yr' },
  enterprise:     { scansPerMonth: 999999,   domains: 999999,    label: 'Enterprise',     price: '$499/mo' },
}
