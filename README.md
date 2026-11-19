# Technical Contributions

A private, evidence-backed report of Wayne Gift Ludenyi's technical contributions at Zuri Health and the Play Group. Built with Nuxt, Vue 3, TypeScript and Tailwind CSS.

**Confidential.** The site sends `noindex` headers, ships a `robots.txt` that disallows everything, and contains no secrets or source code.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && node .output/server/index.mjs
```

Print version: open `/report` and use **Print / Save as PDF** (A4).

## Access control

Set `PORTFOLIO_PASSWORD` (and optionally `PORTFOLIO_USER`, default `management`) in the server environment to enable HTTP Basic Auth on every route (`server/middleware/auth.ts`). Credentials are checked on the server with a constant-time comparison. For stronger control, deploy behind Cloudflare Access, Vercel password protection or SSO.

## Presenting

- **Overview** (`/`) carries the key contributions, driven by `content/highlights.ts`.
- **Clean view**: opening any page with `?present=1` hides every placeholder and everything unconfirmed (`?present=0` turns it back on). There is no on-screen switch.
- **Order of projects** is set in `content/site.ts` (`projectOrder`).
- **Chatbots**: the SendPulse list is scoped to Kenyan numbers (`scripts/sendpulse-inventory.mjs`). Attribution (built by Wayne and Kingsley, self-reported) is in `content/evidence/chatbot-ownership.ts`.
- `docs/talking-points.md` is private notes for the author and is not served by the site.

## Where content lives

| What | File |
|---|---|
| Projects, contributions, attribution | `content/projects.ts` |
| Profile, categories, capabilities, chatbots, research | `content/site.ts` |
| Commit evidence (generated, committed) | `content/evidence/commits.json` |
| Per-repo commit counts (generated, committed) | `content/evidence/repo-stats.json` |
| Hand-picked commits to show | `content/evidence/selection.json` |
| Screenshots, recordings, PRs | `content/evidence/media.ts` |
| Schemas | `app/types/content.ts` |

## Refreshing git evidence

```bash
node scripts/import-git-evidence.mjs   # reads local clones, metadata only -> content/.generated (gitignored)
node scripts/curate-evidence.mjs       # resolves selection.json -> commits.json / repo-stats.json
```

Repos and author emails are configured in `scripts/repos.config.json`. The importer never reads file contents and strips credentials from remote URLs. `curate-evidence` fails if a selected hash does not exist or is not authored by you, so evidence cannot be invented.

To add a commit: add an entry to `selection.json`, then run both scripts. Reference its id (`<repo>-<sha7>`) from a contribution in `content/projects.ts`.

## Rules the content follows

- Evidence status is one of Verified, Documented, Self-reported, Pending.
- Technologies come from dependency manifests, not from the stated skills list.
- Commit share is shown beside every project; counts show activity, not value.
- Unknown information is a visible `Pending` placeholder, never filler.
