/**
 * Content schemas. All portfolio content is structured data that conforms to
 * these types, so projects and evidence can be added without touching components.
 */

/** How well a claim is supported. Mirrors the evidence classification in the brief. */
export type Verification = 'verified' | 'documented' | 'self-reported' | 'pending'

export type CategoryId =
  | 'healthcare'
  | 'lifestyle'
  | 'hr'
  | 'digital-services'
  | 'conversational-ai'
  | 'research'

export type ProjectStatus = 'live' | 'in-development' | 'proof-of-concept' | 'maintenance' | 'unknown'

/** Whether the project is a major body of work or a smaller contribution. */
export type ContributionScale = 'major' | 'feature' | 'maintenance' | 'research' | 'unassessed'

/** How much of the project is attributable to me, judged from the records. */
export type Attribution = 'lead' | 'primary' | 'shared' | 'minor' | 'unassessed'

export type EvidenceType =
  | 'commit'
  | 'pull-request'
  | 'linear-issue'
  | 'screenshot'
  | 'recording'
  | 'document'
  | 'note'

export type WorkKind =
  | 'feature'
  | 'enhancement'
  | 'integration'
  | 'bugfix'
  | 'refactor'
  | 'security'
  | 'research'

export type WorkArea =
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'integration'
  | 'database'
  | 'ai'
  | 'security'
  | 'design'

export interface Evidence {
  id: string
  type: EvidenceType
  projectId: string
  /** Short human-written statement of what this record shows. */
  title: string
  /** Original record text (e.g. a commit subject). */
  reference?: string
  /** Link to the original record. Null when the record is private or has no URL. */
  url?: string | null
  /** ISO date. */
  date?: string
  /** Repository directory/name, for commits and PRs. */
  repo?: string
  kind?: WorkKind
  area?: WorkArea
  status: Verification
  /** Local image or recording path (under /public/evidence) for media evidence. */
  media?: string
}

export interface Contribution {
  /** What was done, in plain words. */
  text: string
  kind: WorkKind
  area: WorkArea
  status: Verification
  /** IDs of supporting Evidence records. */
  evidenceIds?: string[]
}

export interface ChallengeSolution {
  challenge: string
  solution: string
  status: Verification
}

export interface TimelineEntry {
  /** ISO date (YYYY-MM or YYYY-MM-DD). */
  date: string
  label: string
}

export interface TechTag {
  name: string
  /** Where the association comes from. Technologies are only listed when this is known. */
  basis: 'repo-manifest' | 'commit' | 'self-reported'
}

export interface RepoStat {
  repo: string
  remote: string
  totalCommits: number
  myCommits: number
  firstCommit: string | null
  lastCommit: string | null
  /** My commits per month (YYYY-MM). */
  monthly: Record<string, number>
  otherContributors: string[]
}

/** A field whose value we have not been given yet. Rendered as a visible placeholder. */
export interface Pending {
  pending: true
  /** What we need, phrased as a request to the owner. */
  needed: string
}

export interface Project {
  id: string
  name: string
  category: CategoryId
  /** Sector label shown on cards, e.g. "Healthcare technology". */
  sector: string
  summary: string
  liveUrl?: string
  status: ProjectStatus
  scale: ContributionScale
  attribution: Attribution
  /** My role, only as far as the records support it. */
  role: string
  /** Honest note about who else worked on this. */
  teamNote: string
  contributions: Contribution[]
  challenges: ChallengeSolution[]
  technologies: TechTag[]
  /** Repo directories (keys into repo-stats) that back this project. */
  repos: string[]
  /** Optional hand-written milestones. Dates otherwise derive from repo stats. */
  timeline?: TimelineEntry[]
  businessRelevance: string | Pending
  /** Overall verification of the project entry. */
  verification: Verification
  /** Items we still need from the owner for this project. */
  openQuestions: string[]
}

export interface Capability {
  id: string
  group: string
  summary: string
  /** Projects where this capability is evidenced. */
  projectIds: string[]
  technologies: string[]
  /** Set when evidence for this group is incomplete. Shown as a visible note. */
  pendingNote?: string
}

export interface ChatbotRecord {
  id: string
  name: string
  channel: string
  /** YYYY-MM-DD */
  createdAt: string
  /** Conversations in the bot inbox. Not a count of users. */
  inboxTotal: number
  /** Set when the bot is shown under a specific project instead of the main list. */
  projectId: string | null
}

export interface ResearchItem {
  id: string
  title: string
  projectId?: string
  purpose: string
  approach: string
  valueAndLimits: string
  status: Verification
}
