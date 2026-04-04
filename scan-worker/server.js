/**
 * ZYNTH SCAN WORKER SERVER
 * ========================
 * This Express server runs on a cloud VPS (NOT your dev PC).
 * It exposes a simple REST API that the Next.js app calls.
 * It runs nmap and nuclei as child processes and returns structured results.
 */

const express = require('express')
const cors = require('cors')
const { spawn } = require('child_process')

const app = express()
app.use(express.json())
app.use(cors())

const WORKER_SECRET = process.env.WORKER_SECRET || 'zynth-super-secret-change-me'

// ── Auth Middleware ──────────────────────────────────────────
function authenticate(req, res, next) {
  const auth = req.headers['x-zynth-secret']
  if (auth !== WORKER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'SENTINEL_ONLINE', time: new Date().toISOString() })
})

// ── NMAP Scan ─────────────────────────────────────────────────
app.post('/nmap', authenticate, (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  const args = ['-sV', '-sC', '--open', '-T4', '-p', '21,22,23,25,80,443,3306,6379,27017', '-oX', '-', target]
  runTool(res, 'nmap', 'nmap', args, (stdout) => parseNmapXml(stdout, target))
})

// ── NUCLEI Scan ───────────────────────────────────────────────
app.post('/nuclei', authenticate, (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  const args = ['-u', target, '-t', 'exposures,misconfiguration,cves', '-severity', 'critical,high', '-json', '-silent']
  runTool(res, 'nuclei', 'nuclei', args, (stdout) => parseNucleiJson(stdout, target))
})

// ── SQLMAP Scan ───────────────────────────────────────────────
// Runs: sqlmap -u <target> --batch --flush-session --crawl=2
app.post('/sqlmap', authenticate, (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  const args = ['-u', target, '--batch', '--random-agent', '--level=1', '--risk=1', '--threads=5', '--flush-session']
  runTool(res, 'sqlmap', 'sqlmap', args, (stdout) => parseSqlmapOutput(stdout, target))
})

// ── FFUF (Fuzzing) ─────────────────────────────────────────────
// Runs: ffuf -u <target>/FUZZ -w <wordlist> -mc 200
app.post('/ffuf', authenticate, (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  const baseUrl = target.endsWith('/') ? target : `${target}/`
  // Use a small internal wordlist for speed in this demo
  const args = ['-u', `${baseUrl}FUZZ`, '-w', '/usr/share/dict/words', '-mc', '200', '-t', '50', '-s']
  runTool(res, 'ffuf', 'ffuf', args, (stdout) => parseFfufOutput(stdout, target))
})

// ── WHATWEB (Tech Fingerprint) ────────────────────────────────
app.post('/whatweb', authenticate, (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  const args = [target, '--color=never', '--no-errors']
  runTool(res, 'whatweb', 'whatweb', args, (stdout) => parseWhatWebOutput(stdout, target))
})

// ── FULL PENTEST (Orchestrator) ───────────────────────────────
app.post('/pentest', authenticate, async (req, res) => {
  const { target } = req.body
  if (!target) return res.status(400).json({ error: 'target is required' })

  console.log(`[PENTEST_CLUSTER] Starting full professional audit for: ${target}`)

  const tools = ['nmap', 'nuclei', 'sqlmap', 'whatweb']
  const scanPromises = tools.map(tool => 
    fetch(`http://localhost:4000/${tool}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-zynth-secret': WORKER_SECRET },
      body: JSON.stringify({ target })
    }).then(r => r.json()).catch(() => ({ findings: [] }))
  )

  try {
    const results = await Promise.all(scanPromises)
    const allFindings = results.flatMap(r => r.findings || [])
    
    console.log(`[PENTEST_CLUSTER] Audit complete. Total findings: ${allFindings.length}`)
    res.json({ target, findings: allFindings, scannedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: 'Pentest orchestration failed', detail: err.message })
  }
})

// ── Tool Runner Helper ────────────────────────────────────────

function runTool(res, name, command, args, parser) {
  let stdout = ''
  let stderr = ''
  const proc = spawn(command, args)

  proc.stdout.on('data', d => { stdout += d.toString() })
  proc.stderr.on('data', d => { stderr += d.toString() })

  proc.on('close', code => {
    const findings = parser(stdout)
    res.json({ tool: name, target: args[args.length-1], findings })
  })

  proc.on('error', err => {
    res.status(500).json({ error: `${name} execution failed`, detail: err.message })
  })
}

// ── Parsers ───────────────────────────────────────────────────

function parseSqlmapOutput(stdout, target) {
  const findings = []
  if (stdout.includes('is vulnerable') || stdout.includes('back-end DBMS')) {
    findings.push({
      testName: 'Possible SQL Injection',
      severity: 'CRITICAL',
      description: 'Sqlmap detected potential SQL injection vulnerability or database fingerprint.',
      tool: 'sqlmap',
      evidence: [stdout.substring(stdout.indexOf('DBMS'), stdout.indexOf('DBMS') + 200)]
    })
  }
  return findings
}

function parseFfufOutput(stdout, target) {
  const findings = []
  const lines = stdout.split('\n')
  for (const line of lines) {
    if (line.includes('[Status: 200')) {
      findings.push({
        testName: 'Discovered Hidden Path',
        severity: 'MEDIUM',
        description: `ffuf discovered a publicly accessible resource: ${line}`,
        tool: 'ffuf',
        evidence: [line]
      })
    }
  }
  return findings
}

function parseWhatWebOutput(stdout, target) {
  const findings = []
  if (stdout.includes('WordPress') || stdout.includes('JQuery')) {
    findings.push({
      testName: 'Technology Fingerprint Detected',
      severity: 'INFO',
      description: 'WhatWeb identified specific technologies running on the target.',
      tool: 'whatweb',
      evidence: [stdout.trim()]
    })
  }
  return findings
}

function parseNmapXml(xml, target) {
  const findings = []
  const portRegex = /portid="(\d+)".*?state="open".*?name="([^"]*)"/g
  let match
  while ((match = portRegex.exec(xml)) !== null) {
    const [, port, service] = match
    findings.push({
      testName: `Open Port Core Tool: ${port}`,
      severity: port === '80' || port === '443' ? 'INFO' : 'HIGH',
      description: `Nmap confirmed port ${port} (${service}) is open.`,
      tool: 'nmap',
      evidence: [`Port: ${port}/tcp`, `Service: ${service}`]
    })
  }
  return findings
}

function parseNucleiJson(stdout, target) {
  const findings = []
  const lines = stdout.split('\n').filter(l => l.trim().startsWith('{'))
  for (const line of lines) {
    try {
      const r = JSON.parse(line)
      findings.push({
        testName: `Nuclei: ${r.info.name}`,
        severity: r.info.severity.toUpperCase(),
        description: r.info.description || 'Nuclei finding',
        tool: 'nuclei',
        evidence: [r['matched-at']]
      })
    } catch (e) {}
  }
  return findings
}

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║     ZYNTH SCAN WORKER ONLINE             ║
║     Port: ${PORT}                           ║
║     Tools: nmap + nuclei                 ║
║     Status: SENTINEL_ACTIVE              ║
╚══════════════════════════════════════════╝
  `)
})
