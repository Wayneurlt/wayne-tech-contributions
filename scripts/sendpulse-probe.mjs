#!/usr/bin/env node
/**
 * Read-only SendPulse probe. Reads SENDPULSE_ID / SENDPULSE_SECRET from .env,
 * obtains a token, then performs GET requests only. Never prints credentials
 * or tokens. Output: HTTP status and top-level shape of each response, no personal data.
 *
 * Usage: node scripts/sendpulse-probe.mjs [path ...]
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const BASE = 'https://api.sendpulse.com'

const res = await fetch(`${BASE}/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ grant_type: 'client_credentials', client_id: env.SENDPULSE_ID, client_secret: env.SENDPULSE_SECRET }),
})
const body = await res.json().catch(() => ({}))
console.log('token:', res.status, body.access_token ? 'received' : JSON.stringify({ error: body.error, message: body.message ?? body.error_description }))
if (!body.access_token) process.exit(1)

const shape = (v, d = 0) => {
  if (Array.isArray(v)) return `array(${v.length})` + (v[0] && d < 2 ? ' of ' + shape(v[0], d + 1) : '')
  if (v && typeof v === 'object') return '{' + Object.keys(v).slice(0, 14).join(', ') + '}'
  return typeof v
}

for (const p of process.argv.slice(2)) {
  const r = await fetch(`${BASE}${p}`, { headers: { Authorization: `Bearer ${body.access_token}` } })
  const j = await r.json().catch(() => null)
  console.log(`GET ${p} -> ${r.status}`, shape(j))
}
