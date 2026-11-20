#!/usr/bin/env node
/**
 * Captures a screenshot of each live site's PUBLIC landing view into public/screens/<id>.png,
 * which the project cards pick up automatically.
 *
 *   npm run screens              capture every site in scripts/screens.config.json
 *   npm run screens -- byzara    capture only the listed ids
 *
 * Uses the Chrome or Edge already installed (set CHROME_PATH to override). It opens each
 * address exactly as a visitor would: no logins, no cookies, no credentials. Sites behind a
 * login therefore show only their login page.
 *
 * REVIEW EVERY IMAGE before committing it. Make sure nothing private is visible (names,
 * patient or customer data, internal figures). If a capture shows something it should not,
 * delete that file and the card falls back to the placeholder.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const sites = JSON.parse(readFileSync(join(here, 'screens.config.json'), 'utf8'))
const only = process.argv.slice(2)
const outDir = resolve(here, '..', 'public', 'screens')
mkdirSync(outDir, { recursive: true })

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const browser = candidates.find((p) => existsSync(p))
if (!browser) {
  console.error('No Chrome or Edge found. Install one, or set CHROME_PATH to its executable.')
  process.exit(1)
}
console.log(`Using ${browser}\n`)

let failures = 0
for (const { id, url } of sites) {
  if (only.length && !only.includes(id)) continue
  const out = join(outDir, `${id}.png`)
  const profile = join(tmpdir(), `screens-profile-${id}-${Date.now()}`)
  const res = spawnSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--virtual-time-budget=15000',
      `--user-data-dir=${profile}`,
      '--window-size=1280,800',
      `--screenshot=${out}`,
      url,
    ],
    { timeout: 90_000, stdio: 'ignore' },
  )
  const ok = existsSync(out) && statSync(out).size > 5_000
  if (ok) console.log(`ok      ${id.padEnd(20)} ${(statSync(out).size / 1024).toFixed(0)} KB  ${url}`)
  else {
    failures++
    console.log(`FAILED  ${id.padEnd(20)} exit ${res.status ?? res.signal ?? 'unknown'}  ${url}`)
  }
}

console.log(failures ? `\n${failures} capture(s) failed. Cards for those sites show the placeholder.` : '\nDone. Open each image in public/screens/ and check it before committing.')
process.exit(failures ? 1 : 0)
