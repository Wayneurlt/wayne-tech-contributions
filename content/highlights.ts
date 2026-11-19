/**
 * Curated key contributions shown on the Overview and in the PDF. Each entry points at a project and at evidence ids
 * (<repo>-<sha7>) in content/evidence/commits.json. Numbers are computed on the page
 * from repo stats, never typed here. Edit the lines to change emphasis.
 */
export const highlights = {
  headline:
    'Full-stack developer delivering web, mobile, data and AI-assisted features across Zuri Health and the Play Group.',
  top: [
    {
      projectId: 'i3-zuri-health',
      line: 'Neon Postgres data model by month and country, the i3 Biannual Report calculation, and the admin area for data entry and export.',
      proof: ['stats-dashboard-0877064', 'stats-dashboard-bdef046', 'stats-dashboard-f039bf2'],
    },
    {
      projectId: 'bi-zuri-health',
      line: 'The impact explorer front end and monthly patient status and retention tracking with its database.',
      proof: ['bi-dashboard-5894c6b', 'bi-dashboard-166e80d'],
    },
    {
      projectId: 'byzara',
      line: 'Order and inventory administration, a WhatsApp pay-per-order flow and role-based access control. Shared project.',
      proof: ['byzara_v3-ebca212', 'byzara_v3-ce8839c', 'byzara_v3-bf0e96c', 'byzara_v3-56d6825'],
    },
    {
      projectId: 'zuri-frontend-poc',
      line: 'Multi-country, bilingual front-end proof of concept: country detection and English and French localisation for five markets. Shared project.',
      proof: ['ZuriHealthFrontend-b881441', 'ZuriHealthFrontend-d9a7d0d', 'ZuriHealthFrontend-ae8d6fd'],
    },
    {
      projectId: 'play-group-hr',
      line: 'Leave and records, push notifications, projects and recognition, plus work on the HR Assistant. Shared project.',
      proof: ['hr-backend-d0c52a1', 'hr-frontend-dbfc0a6', 'hr-backend-300157f'],
    },
    {
      projectId: 'temi',
      line: 'Two generations of the web front end and screens in the Flutter mobile app. Shared project.',
      proof: ['temi_v1-e5970fb', 'Temi_v2-177d811', 'temi-app-21b01dc'],
    },
  ],
}
