export type FindingSource = 'direct' | 'heuristic' | 'external'

type IssueDetails = {
  findingSource?: FindingSource
  evidence?: string[]
  serverHeader?: string
  path?: string
}

export function getFindingSourceLabel(source?: FindingSource | null): string {
  switch (source) {
    case 'direct':
      return 'Direct Observation'
    case 'heuristic':
      return 'Heuristic / Derived'
    case 'external':
      return 'External Lookup'
    default:
      return 'Unspecified'
  }
}

export function getEvidenceLines(details?: IssueDetails | null): string[] {
  if (!details) return []

  if (Array.isArray(details.evidence) && details.evidence.length > 0) {
    return details.evidence
  }

  if (details.path) {
    return [`Publicly accessible path: ${details.path}`]
  }

  if (details.serverHeader) {
    return [`Server header exposed: ${details.serverHeader}`]
  }

  return []
}
