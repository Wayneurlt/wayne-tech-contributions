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
  // Country calling code of a WhatsApp bot's number. Only the code is kept, never the number.
  const dialCode = (phone) => {
    const d = String(phone ?? '').replace(/\D/g, '')
    if (!d) return null
    return ['254', '234', '233', '260', '256', '255', '250', '251', '27', '44', '1'].find((c) => d.startsWith(c)) ?? `other:${d.slice(0, 3)}`
  }
  const OTHER_COUNTRY_NAME = /nigeria|ghana|zambia|uganda|tanzania|rwanda|ethiopia|south africa|\b(ng|gh|zm|ug|tz|rw|et|za)\b/i
  const slim = bots.map((b) => ({ id: b.id, name: b.name, channel: b.channel, status: b.status, created_at: b.created_at, inbox_total: b.inbox?.total, inbox_unread: b.inbox?.unread, deleted: b.delete_at ?? null, dial: b.channel === 'WHATSAPP' ? dialCode(b.channel_data?.phone) : null }))
  writeFileSync(join(root, 'content/.generated/sendpulse-bots.json'), JSON.stringify(slim, null, 2))

  // Scope: WhatsApp bots on Kenyan (+254) numbers. Bots without a number (Instagram, website chat)
  // are kept unless their name points at another country.
  const keep = (b) => (b.channel === 'WHATSAPP' ? b.dial === '254' : !OTHER_COUNTRY_NAME.test(b.name))
  const removed = slim.filter((b) => !keep(b))
  console.log('not listed (non-Kenyan):', removed.map((b) => `${b.name.trim()} [${b.channel === 'WHATSAPP' ? '+' + b.dial : b.channel}]`).join('; '))

  // Committed, report-safe subset: no tokens, phone numbers, settings, unread counts or status codes.
  const curated = {
    retrievedAt: new Date().toISOString(),
    source: 'SendPulse chatbots API, read-only',
    scope: 'WhatsApp bots on Kenyan (+254) numbers, plus Instagram and website chat bots not named for another country',
    bots: slim.filter(keep).map((b) => ({
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
