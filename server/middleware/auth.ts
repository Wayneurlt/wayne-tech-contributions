import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Server-side access gate (HTTP Basic Auth).
 *
 * Enabled only when PORTFOLIO_PASSWORD is set in the server environment, so local
 * development stays frictionless. Credentials never reach client code. For stronger
 * protection put the site behind an identity-aware proxy (Cloudflare Access, Vercel
 * password protection or SSO); this middleware is the portable fallback.
 */
const digest = (v: string) => createHash('sha256').update(v).digest()

export default defineEventHandler((event) => {
  const password = process.env.PORTFOLIO_PASSWORD
  if (!password) return

  const user = process.env.PORTFOLIO_USER || 'management'
  const header = getHeader(event, 'authorization') ?? ''
  const [scheme, encoded] = header.split(' ')

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    const i = decoded.indexOf(':')
    const u = decoded.slice(0, i)
    const p = decoded.slice(i + 1)
    const okUser = timingSafeEqual(digest(u), digest(user))
    const okPass = timingSafeEqual(digest(p), digest(password))
    if (i >= 0 && okUser && okPass) return
  }

  setResponseStatus(event, 401)
  setHeader(event, 'WWW-Authenticate', 'Basic realm="Private technical report", charset="UTF-8"')
  setHeader(event, 'Cache-Control', 'no-store')
  return 'Authentication required.'
})
