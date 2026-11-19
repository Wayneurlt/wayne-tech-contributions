import type { Evidence } from '../../app/types/content'

/**
 * Manually supplied evidence: screenshots, screen recordings, Linear issues,
 * pull requests and documents. Add records here; they appear automatically on the
 * project and evidence pages. Files for media go in public/evidence/<project-id>/.
 *
 * Example:
 * {
 *   id: 'byzara-roles-screenshot',
 *   type: 'screenshot',
 *   projectId: 'byzara',
 *   title: 'Roles & Access page (no customer data visible)',
 *   media: '/evidence/byzara/roles-access.png',
 *   date: '2026-11-17',
 *   status: 'self-reported',
 * }
 */
export const manualEvidence: Evidence[] = []
