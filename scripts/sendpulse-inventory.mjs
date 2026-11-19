#!/usr/bin/env node
/**
 * Read-only SendPulse bot inventory. GET requests only.
 * Collects bot name, channel, id, creation info and aggregate counts. Never fetches
 * contacts, conversations or messages. Writes content/.generated/sendpulse-bots.json (gitignored).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const BASE = 'https://api.sendpulse.com'
const tok = await (await fetch(`${BASE}/oauth/access_token`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ grant_type: 'client_credentials', client_id: env.SENDPULSE_ID, client_secret: env.SENDPULSE_SECRET }),
})).json()
if (!tok.access_token) { console.error('auth failed'); process.exit(1) }
const get = async (p) => { const r = await fetch(`${BASE}${p}`, { headers: { Authorization: `Bearer ${tok.access_token}` } }); return { status: r.status, json: await r.json().catch(() => null) } }

const mode = process.argv[2] ?? 'keys'
const { status, json } = await get('/chatbots/bots')
const bots = json?.data ?? []
if (mode === 'keys') {
  console.log('status', status, 'bots', bots.length)
  const b = bots[0] ?? {}
  console.log('top-level keys:', Object.keys(b).join(', '))
  for (const [k, v] of Object.entries(b)) if (v && typeof v === 'object' && !Array.isArray(v)) console.log(` ${k}:`, Object.keys(v).join(', '))
} else {
  mkdirSync(join(root, 'content/.generated'), { recursive: true })
  const slim = bots.map((b) => ({ id: b.id, name: b.name, channel: b.channel, status: b.status, created_at: b.created_at, inbox_total: b.inbox?.total, inbox_unread: b.inbox?.unread, deleted: b.delete_at ?? null }))
  writeFileSync(join(root, 'content/.generated/sendpulse-bots.json'), JSON.stringify(slim, null, 2))
  // Committed, report-safe subset: no tokens, settings, unread counts or status codes.
  const curated = {
    retrievedAt: new Date().toISOString(),
    source: 'SendPulse chatbots API, read-only',
    bots: slim.map((b) => ({
      id: b.id,
      name: b.name.trim(),
      channel: b.channel,
      createdAt: b.created_at.slice(0, 10),
      inboxTotal: b.inbox_total,
      // Placement overrides requested by the author.
      projectId: /^byzara$/i.test(b.name.trim()) && b.channel === 'WHATSAPP' ? 'byzara' : null,
    })),
  }
  writeFileSync(join(root, 'content/evidence/chatbots.json'), JSON.stringify(curated, null, 2) + '\n')
  console.log('wrote content/evidence/chatbots.json', curated.bots.length)
}
