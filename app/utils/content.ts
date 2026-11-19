import { projects as rawProjects } from '~~/content/projects'
import { categories, capabilities, featuredBotNames, profile, projectOrder, research, verificationLabels } from '~~/content/site'
import commitsJson from '~~/content/evidence/commits.json'
import { manualEvidence } from '~~/content/evidence/media'
import botJson from '~~/content/evidence/chatbots.json'
import repoStatsJson from '~~/content/evidence/repo-stats.json'
import type { Attribution, ChatbotRecord, Evidence, Project, RepoStat } from '~/types/content'

export { categories, capabilities, featuredBotNames, profile, research, verificationLabels }

const rank = (id: string) => { const i = projectOrder.indexOf(id); return i === -1 ? 999 : i }
export const projects: Project[] = [...rawProjects].sort((a, b) => rank(a.id) - rank(b.id))

export const botRetrievedAt: string = botJson.retrievedAt
export const botScope: string = botJson.scope
export const bots = botJson.bots as ChatbotRecord[]
export const botsForProject = (id: string) => bots.filter((b) => b.projectId === id)
export const unassignedBots = bots.filter((b) => !b.projectId)

export const allEvidence: Evidence[] = [...(commitsJson as Evidence[]), ...manualEvidence]
export const repoStats = repoStatsJson as RepoStat[]

const evidenceById = new Map(allEvidence.map((e) => [e.id, e]))
const projectById = new Map(projects.map((p) => [p.id, p]))

export const getProject = (id: string): Project | undefined => projectById.get(id)
export const getEvidence = (id: string): Evidence | undefined => evidenceById.get(id)
export const evidenceForProject = (id: string): Evidence[] => allEvidence.filter((e) => e.projectId === id)
export const evidenceForIds = (ids: string[] = []): Evidence[] =>
  ids.map((i) => evidenceById.get(i)).filter((e): e is Evidence => !!e)
export const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id

const aliases: Record<string, string> = {
  tinegacollins: 'Collins Tinega',
  frankomondi: 'Frank Omondi',
  frankzuri: 'Frank Omondi (Zuri account)',
  fidelisaboke: 'Fidel Isaboke',
}
export const prettyName = (n: string) => aliases[n.toLowerCase().replace(/[^a-z]/g, '')] ?? n

export interface ProjectStats {
  mine: number
  total: number
  share: number
  first: string | null
  last: string | null
  others: string[]
  repos: RepoStat[]
}

export function statsForProject(p: Project): ProjectStats {
  const repos = repoStats.filter((r) => p.repos.includes(r.repo))
  const mine = repos.reduce((s, r) => s + r.myCommits, 0)
  const total = repos.reduce((s, r) => s + r.totalCommits, 0)
  const firsts = repos.map((r) => r.firstCommit).filter((d): d is string => !!d).sort()
  const lasts = repos.map((r) => r.lastCommit).filter((d): d is string => !!d).sort()
  const others = [...new Set(repos.flatMap((r) => r.otherContributors).map(prettyName))]
  return { mine, total, share: total ? mine / total : 0, first: firsts[0] ?? null, last: lasts.at(-1) ?? null, others, repos }
}

export const attributionLabels: Record<Attribution, string> = {
  lead: 'Lead',
  primary: 'Primary contributor',
  shared: 'Shared contribution',
  minor: 'Minor contribution',
  unassessed: 'Not yet assessed',
}

export const statusLabels: Record<Project['status'], string> = {
  live: 'Live',
  'in-development': 'In development',
  'proof-of-concept': 'Proof of concept',
  maintenance: 'Maintenance',
  unknown: 'Status to confirm',
}

export const scaleLabels: Record<Project['scale'], string> = {
  major: 'Major project',
  feature: 'Feature contribution',
  maintenance: 'Maintenance',
  research: 'Research / proof of concept',
  unassessed: 'Not yet assessed',
}

export const kindLabels: Record<string, string> = {
  feature: 'Feature',
  enhancement: 'Enhancement',
  integration: 'Integration',
  bugfix: 'Bug fix',
  refactor: 'Refactor',
  security: 'Security',
  research: 'Research',
}

export const areaLabels: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  mobile: 'Mobile',
  integration: 'Integration',
  database: 'Database',
  ai: 'AI',
  security: 'Security',
  design: 'Design',
}

export function formatDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—'
  const d = new Date(iso.length === 7 ? `${iso}-01` : iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', opts)
}

export const formatMonth = (iso: string) => formatDate(iso, { month: 'short', year: '2-digit' })

/** My commits per month across the repositories behind the documented projects. */
export function monthlyActivity(projectId?: string): { month: string; count: number }[] {
  const scope = projectId ? projects.filter((p) => p.id === projectId) : projects
  const repoNames = new Set(scope.flatMap((p) => p.repos))
  const totals: Record<string, number> = {}
  for (const r of repoStats) {
    if (!repoNames.has(r.repo)) continue
    for (const [m, n] of Object.entries(r.monthly)) totals[m] = (totals[m] ?? 0) + n
  }
  const months = Object.keys(totals).sort()
  if (!months.length) return []
  const out: { month: string; count: number }[] = []
  const [sy, sm] = months[0]!.split('-').map(Number) as [number, number]
  const [ey, em] = months.at(-1)!.split('-').map(Number) as [number, number]
  for (let y = sy, m = sm; y < ey || (y === ey && m <= em); m === 12 ? (y++, (m = 1)) : m++) {
    const k = `${y}-${String(m).padStart(2, '0')}`
    out.push({ month: k, count: totals[k] ?? 0 })
  }
  return out
}

export const overview = (list: Project[] = projects) => {
  const ids = new Set(list.map((p) => p.id))
  return {
    projectCount: list.length,
    pendingProjects: list.filter((p) => p.verification === 'pending').length,
    sectors: new Set(list.map((p) => p.category)).size,
    repos: new Set(list.flatMap((p) => p.repos)).size,
    evidenceCount: allEvidence.filter((e) => ids.has(e.projectId)).length,
    contributionCount: list.reduce((s, p) => s + p.contributions.length, 0),
  }
}

/** My commits per month for one project, summed across its repositories. */
export function monthlyForProject(p: Project): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of repoStats) {
    if (!p.repos.includes(r.repo)) continue
    for (const [m, n] of Object.entries(r.monthly)) out[m] = (out[m] ?? 0) + n
  }
  return out
}

/** Continuous list of YYYY-MM from the first to the last month with activity in any of the projects. */
export function monthRange(list: Project[]): string[] {
  const keys = list.flatMap((p) => Object.keys(monthlyForProject(p))).sort()
  if (!keys.length) return []
  const [sy, sm] = keys[0]!.split('-').map(Number) as [number, number]
  const [ey, em] = keys.at(-1)!.split('-').map(Number) as [number, number]
  const out: string[] = []
  for (let y = sy, m = sm; y < ey || (y === ey && m <= em); m === 12 ? (y++, (m = 1)) : m++) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return out
}

/** Curated evidence for a project in a given month. */
export const workInMonth = (projectId: string, month: string): Evidence[] =>
  allEvidence.filter((e) => e.projectId === projectId && e.date?.startsWith(month))

/** Intensity bucket (0 = none) used for shading and the legend. */
export const intensity = (n: number) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4)
export const intensityLabels = ['No commits', '1–2 commits', '3–5 commits', '6–10 commits', '11 or more commits']
