import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type AlertIssue = {
  testName: string
  severity: string
  description: string
}

type SendAlertEmailParams = {
  to: string
  url: string
  scanId: string
  criticalCount: number
  highCount: number
  newIssues: AlertIssue[]
}

export async function sendAlertEmail({
  to,
  url,
  scanId,
  criticalCount,
  highCount,
  newIssues,
}: SendAlertEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zynthsecure.com'
  const reportUrl = `${siteUrl}/dashboard/scan/${scanId}`

  const issueRows = newIssues
    .slice(0, 5)
    .map(
      (issue) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1a2535;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;background:${issue.severity === 'CRITICAL' ? 'rgba(255,68,68,0.15)' : 'rgba(255,165,0,0.15)'};color:${issue.severity === 'CRITICAL' ? '#ff6b6b' : '#ffa500'};">${issue.severity}</span>
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #1a2535;color:#e2e8f0;font-size:13px;font-weight:600;">${issue.testName}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1a2535;color:#64748b;font-size:12px;">${issue.description}</td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#030712;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:32px;background:linear-gradient(135deg,#0d1117 0%,#0a1628 100%);border-radius:16px 16px 0 0;border:1px solid #1a2535;border-bottom:none;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.04em;">Zynt<span style="color:#00ff88;">h</span></span>
            </div>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#475569;">AI Guard — Weekly Report</p>
          </td>
        </tr>

        <!-- Alert Banner -->
        <tr>
          <td style="background:#0a1628;border-left:1px solid #1a2535;border-right:1px solid #1a2535;padding:24px 32px;">
            <div style="background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.2);border-radius:12px;padding:20px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">New vulnerabilities detected on</p>
              <p style="margin:0 0 16px;font-size:20px;font-weight:900;color:#fff;">${url}</p>
              <div style="display:inline-flex;gap:24px;justify-content:center;">
                ${criticalCount > 0 ? `<div><p style="margin:0;font-size:36px;font-weight:900;color:#ff4444;line-height:1;">${criticalCount}</p><p style="margin:4px 0 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff6b6b;">Critical</p></div>` : ''}
                ${highCount > 0 ? `<div><p style="margin:0;font-size:36px;font-weight:900;color:#ffa500;line-height:1;">${highCount}</p><p style="margin:4px 0 0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ffb732;">High</p></div>` : ''}
              </div>
            </div>
          </td>
        </tr>

        <!-- Issues Table -->
        <tr>
          <td style="background:#0a1628;border-left:1px solid #1a2535;border-right:1px solid #1a2535;padding:0 32px 24px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#475569;">New Findings</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #1a2535;">
              <thead>
                <tr style="background:#0d1117;">
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#475569;">Severity</th>
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#475569;">Issue</th>
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#475569;">Detail</th>
                </tr>
              </thead>
              <tbody>${issueRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0a1628;border-left:1px solid #1a2535;border-right:1px solid #1a2535;padding:8px 32px 32px;text-align:center;">
            <a href="${reportUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#00ff88,#00cc6a);border-radius:50px;font-size:13px;font-weight:900;color:#030712;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;box-shadow:0 0 30px rgba(0,255,136,0.3);">
              View Full Report →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background:#030712;border:1px solid #1a2535;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#334155;">You're receiving this because Zynth AI Guard is actively monitoring <strong style="color:#475569;">${url}</strong>.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#334155;">Manage alerts in <a href="${siteUrl}/dashboard/settings/notifications" style="color:#00ff88;text-decoration:none;">Notification Settings</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return resend.emails.send({
    from: 'Zynth AI Guard <alerts@zynthsecure.com>',
    to,
    subject: `⚠️ Zynth AI Guard: ${criticalCount + highCount} new vulnerabilities found on ${url}`,
    html,
  })
}
