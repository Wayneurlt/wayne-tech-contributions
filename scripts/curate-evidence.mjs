#!/usr/bin/env node
/**
 * Resolves the hand-curated selection (content/evidence/selection.json) against
 * the importer output and writes the two files the site consumes:
 *   content/evidence/commits.json     - selected commits as Evidence records
 *   content/evidence/repo-stats.json  - aggregate counts per repo
 *
 * Fails loudly if a selected hash cannot be found, so no evidence can be invented.
 * Run `node scripts/import-git-evidence.mjs` first.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const imp = JSON.parse(readFileSync(join(root, 'content/.generated/git-import.json'), 'utf8'))
const selection = JSON.parse(readFileSync(join(root, 'content/evidence/selection.json'), 'utf8'))

const byRepo = Object.fromEntries(imp.repos.map((r) => [r.dir, r]))
const errors = []
const evidence = []

for (const s of selection) {
  const repo = byRepo[s.r]
  const commit = repo?.commits?.filter((c) => c.hash.startsWith(s.s))
  if (!commit || commit.length !== 1) {
    errors.push(`${s.r}@${s.s}: ${commit?.length ?? 0} matches (must be exactly 1, authored by me)`)
    continue
  }
  const c = commit[0]
  evidence.push({
    id: `${s.r}-${s.s}`,
    type: 'commit',
    projectId: s.p,
    title: s.t,
    reference: c.subject,
    url: c.url,
    date: c.date.slice(0, 10),
    repo: s.r,
    kind: s.k,
    area: s.a,
    status: 'verified',
  })
}

if (errors.length) {
  console.error('Unresolved selections:\n' + errors.join('\n'))
  process.exit(1)
}

evidence.sort((a, b) => (a.date < b.date ? 1 : -1))

const stats = imp.repos
  .filter((r) => r.myCommits !== undefined)
  .map((r) => ({
    repo: r.dir,
    remote: r.remote,
    totalCommits: r.totalCommits,
    myCommits: r.myCommits,
    firstCommit: r.firstCommit?.slice(0, 10) ?? null,
    lastCommit: r.lastCommit?.slice(0, 10) ?? null,
    monthly: r.commits.reduce((m, c) => { const k = c.date.slice(0, 7); m[k] = (m[k] ?? 0) + 1; return m }, {}),
    otherContributors: Object.keys(r.contributors)
      .filter((n) => !/wayne/i.test(n))
      // collapse the same person's two git identities
      .map((n) => n.toLowerCase().replace(/[^a-z]/g, ''))
      .filter((n, i, a) => a.indexOf(n) === i)
      .map((n) => Object.keys(r.contributors).find((k) => k.toLowerCase().replace(/[^a-z]/g, '') === n)),
  }))

writeFileSync(join(root, 'content/evidence/commits.json'), JSON.stringify(evidence, null, 2) + '\n')
writeFileSync(join(root, 'content/evidence/repo-stats.json'), JSON.stringify(stats, null, 2) + '\n')
console.log(`Wrote ${evidence.length} evidence records and ${stats.length} repo stats.`)
