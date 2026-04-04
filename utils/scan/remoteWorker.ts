import { ScanIssue } from '@/types';

/**
 * ZYNTH REMOTE WORKER CLIENT
 * ==========================
 * This client communicates with the Dockerized scan worker (nmap/nuclei).
 * It sends scan jobs and retrieves structured results for the dashboard.
 */

const SCAN_WORKER_URL = process.env.SCAN_WORKER_URL;
const SCAN_WORKER_SECRET = process.env.SCAN_WORKER_SECRET;

export async function runRemotePentest(target: string): Promise<ScanIssue[]> {
  if (!SCAN_WORKER_URL || !SCAN_WORKER_SECRET) {
    console.warn('[REMOTE_WORKER] Warning: Remote scan worker not configured.');
    return [];
  }

  try {
    const res = await fetch(`${SCAN_WORKER_URL}/pentest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-zynth-secret': SCAN_WORKER_SECRET
      },
      body: JSON.stringify({ target }),
      // Long timeout since pentests can take a while (60s)
      signal: AbortSignal.timeout(90000)
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('[REMOTE_WORKER] Error: Worker responded with', res.status, error);
      return [];
    }

    const data = await res.json() as { findings: ScanIssue[] };
    return data.findings || [];
  } catch (err) {
    console.error('[REMOTE_WORKER] Failed to contact scan worker cluster:', err);
    return [];
  }
}
