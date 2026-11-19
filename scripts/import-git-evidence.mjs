#!/usr/bin/env node
/**
 * Read-only git evidence importer.
 *
 * Reads commit METADATA ONLY (hash, date, subject, numstat totals) from local
 * clones, filtered to the configured author emails. File contents are never read.
 * Output goes to content/.generated/git-import.json (gitignored, because commit
 * subjects from private repos are confidential). Curate selected items into
 * content/evidence/*.ts by hand.
 *
 * Usage: node scripts/import-git-evidence.mjs [reposRoot]
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(readFileSync(join(here, 'repos.config.json'), 'utf8'))
const root = resolve(process.argv[2] ?? config.reposRoot)
const mine = new Set(config.authorEmails.map((e) => e.toLowerCase()))

const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

/** Strip credentials (tokens, user:pass) from a remote URL. */
function publicRemote(url) {
  const clean = url.trim().replace(/^(https?:\/\/)[^@/]+@/, '$1').replace(/\.git$/, '')
  return clean
}

const SEP = '\x1f'
const REC = '\x1e'

function readRepo(entry) {
  const cwd = join(root, entry.dir)
  if (!existsSync(join(cwd, '.git'))) return { ...entry, error: 'not a git clone' }

  let remote = ''
  try { remote = publicRemote(git(cwd, ['remote', 'get-url', 'origin'])) } catch { /* no remote */ }
  const isGithub = /^https:\/\/github\.com\//.test(remote)

  const raw = git(cwd, [
    'log', '--all', '--no-merges', '--numstat',
    `--format=${REC}%H${SEP}%aI${SEP}%ae${SEP}%an${SEP}%s`,
  ])

  const all = []
  for (const chunk of raw.split(REC).slice(1)) {
    const [head, ...stat] = chunk.split('\n')
    const [hash, date, email, name, subject] = head.split(SEP)
    let ins = 0, del = 0, files = 0
    for (const l of stat) {
      const m = l.match(/^(\d+|-)\t(\d+|-)\t/)
      if (!m) continue
      files++
      ins += m[1] === '-' ? 0 : +m[1]
      del += m[2] === '-' ? 0 : +m[2]
    }
    all.push({ hash, date, email: email.toLowerCase(), name, subject, files, ins, del })
  }

  const own = all.filter((c) => mine.has(c.email))
  const contributors = {}
  for (const c of all) contributors[c.name] = (contributors[c.name] ?? 0) + 1

  return {
    ...entry,
    remote,
    totalCommits: all.length,
    myCommits: own.length,
    myShare: all.length ? +(own.length / all.length).toFixed(3) : 0,
    firstCommit: own.at(-1)?.date ?? null,
    lastCommit: own[0]?.date ?? null,
    myLinesAdded: own.reduce((s, c) => s + c.ins, 0),
    myLinesRemoved: own.reduce((s, c) => s + c.del, 0),
    contributors,
    commits: own.map((c) => ({
      hash: c.hash,
      date: c.date,
      subject: c.subject,
      files: c.files,
      additions: c.ins,
      deletions: c.del,
      url: isGithub ? `${remote}/commit/${c.hash}` : null,
    })),
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  note: 'Commit metadata only. Counts are not a measure of contribution quality.',
  repos: config.repos.map(readRepo),
}

const target = join(here, '..', 'content', '.generated')
mkdirSync(target, { recursive: true })
writeFileSync(join(target, 'git-import.json'), JSON.stringify(out, null, 2))

console.table(
  out.repos.map((r) => ({
    repo: r.dir,
    project: r.projectId,
    mine: r.myCommits ?? r.error,
    total: r.totalCommits,
    first: r.firstCommit?.slice(0, 10),
    last: r.lastCommit?.slice(0, 10),
  })),
)
