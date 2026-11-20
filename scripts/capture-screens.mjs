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
 * Pages that load slowly can be given longer: SCREENS_WAIT_MS=40000 npm run screens -- i3-zuri-health
 *
 * Headless Chrome can return before it has finished writing the image, so the script waits
 * for the file to appear and stop growing instead of trusting the exit code.
 *
 * REVIEW EVERY IMAGE before committing it. Make sure nothing private is visible (names,
 * patient or customer data, internal figures) and that the page loaded properly (no broken
 * images or error pages). If a capture is not good enough, delete that file and the card
 * falls back to the placeholder.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'node:fs'
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sizeOf = (p) => (existsSync(p) ? statSync(p).size : 0)

/** Resolves true once the file exists, is non-trivial and has stopped growing. */
async function waitForFile(path, timeoutMs = 90_000) {
  const start = Date.now()
  let last = -1
  while (Date.now() - start < timeoutMs) {
    const size = sizeOf(path)
    if (size > 5_000 && size === last) return true
    last = size
    await sleep(1500)
  }
  return false
}

let failures = 0
for (const { id, url } of sites) {
  if (only.length && !only.includes(id)) continue
  const out = join(outDir, `${id}.png`)
  const profile = join(tmpdir(), `screens-profile-${id}-${Date.now()}`)
  // Clear this site's previous capture so a stale file is never mistaken for a new one.
  if (existsSync(out)) unlinkSync(out)

  const child = spawn(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      `--virtual-time-budget=${process.env.SCREENS_WAIT_MS ?? 15000}`,
      `--user-data-dir=${profile}`,
      '--window-size=1280,800',
      `--screenshot=${out}`,
      url,
    ],
    { stdio: 'ignore', windowsHide: true },
  )
  child.on('error', () => {})

  const ok = await waitForFile(out)
  if (ok) console.log(`ok      ${id.padEnd(20)} ${(sizeOf(out) / 1024).toFixed(0)} KB  ${url}`)
  else {
    failures++
    console.log(`FAILED  ${id.padEnd(20)} no image written within 90s  ${url}`)
  }
}

console.log(
  failures
    ? `\n${failures} capture(s) failed. Cards for those sites show the placeholder.`
    : '\nDone. Open each image in public/screens/ and check it before committing.',
)
process.exit(failures ? 1 : 0)
