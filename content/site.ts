import type { Capability, CategoryId, ResearchItem, Verification } from '../app/types/content'

export const profile = {
  name: 'Wayne Gift Ludenyi',
  title: 'Full-Stack Software Developer',
  organisation: 'Zuri Health',
  intro:
    'Full-stack developer working across healthcare, lifestyle, HR and digital-services products at Zuri Health and the Play Group. The work spans web and mobile front ends, backend services, API integrations, data models and AI-assisted features.',
  /** Stack from the brief. Per-project technologies come from repository manifests, not from this list. */
  statedStack: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Dart'],
    frameworks: [
      'Vue.js', 'Nuxt.js', 'React', 'Next.js', 'Flutter', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI',
      'Tailwind CSS', 'Pinia', 'GraphQL', 'Prisma', 'PostgreSQL',
    ],
    ai: [
      'OpenAI APIs', 'Google Gemini', 'LangChain', 'AI application development', 'WhatsApp chatbot development',
      'Workflow automation', 'Third-party API integrations',
    ],
  },
}

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'healthcare', label: 'Healthcare Technology', blurb: 'Zuri Health platforms, dashboards and portals.' },
  { id: 'lifestyle', label: 'Relationship and Lifestyle Technology', blurb: 'Temi web, marketing and mobile.' },
  { id: 'hr', label: 'Human Resources Technology', blurb: 'Internal HR tooling.' },
  { id: 'digital-services', label: 'Digital Services', blurb: 'Ordering, subscription and corporate web platforms.' },
  { id: 'conversational-ai', label: 'Conversational AI and Chatbots', blurb: 'WhatsApp virtual-hospital chatbots.' },
  { id: 'research', label: 'Research and Innovation', blurb: 'Proofs of concept and technical research.' },
]

export const verificationLabels: Record<Verification, { label: string; description: string }> = {
  verified: { label: 'Verified', description: 'Directly supported by a git commit or another reliable record.' },
  documented: { label: 'Documented', description: 'Supported by project documentation or other records.' },
  'self-reported': { label: 'Self-reported', description: 'Provided by Wayne and not independently verified.' },
  pending: { label: 'Pending', description: 'Needs clarification or evidence before it can be relied on.' },
}

/** Bots named in the original brief, matched by exact SendPulse name. */
export const featuredBotNames = [
  'Somerset Westview Virtual Hospital',
  'HF Group Virtual Hospital',
  'ICEA LION Virtual Hospital',
]

export const capabilities: Capability[] = [
  {
    id: 'frontend',
    group: 'Frontend Engineering',
    summary:
      'Component-driven web interfaces in Vue/Nuxt and React/Next.js: dashboards, multi-step forms, admin tools, animated marketing sites and responsive layouts.',
    projectIds: ['temi', 'temi-subscriptions', 'play-group-hr', 'byzara', 'bi-zuri-health', 'i3-zuri-health', 'doctors-portal', 'zuri-frontend-poc'],
    technologies: ['Vue', 'Nuxt', 'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
  },
  {
    id: 'localisation',
    group: 'Localisation and multi-market delivery',
    summary:
      'Country detection, English and French dictionaries and country-specific content and compliance sections in the Zuri Health front-end proof of concept.',
    projectIds: ['zuri-frontend-poc'],
    technologies: ['Next.js', 'TypeScript'],
  },
  {
    id: 'backend',
    group: 'Backend Engineering',
    summary:
      'Server endpoints and business logic: order and inventory management, role-based access control, HR leave, notifications, projects and recognition services.',
    projectIds: ['byzara', 'play-group-hr', 'i3-zuri-health', 'temi-subscriptions'],
    technologies: ['Nuxt server routes', 'Prisma', 'FastAPI', 'SQLAlchemy', 'Alembic'],
  },
  {
    id: 'mobile',
    group: 'Mobile Application Development',
    summary: 'Flutter screens and API wiring for the Temi mobile app.',
    projectIds: ['temi'],
    technologies: ['Flutter', 'Dart', 'flutter_bloc'],
  },
  {
    id: 'integration',
    group: 'API and Systems Integration',
    summary:
      'Subscription click tracking and consent redirects, WhatsApp-driven ordering, real-time socket events, push notifications and mobile-to-API integration.',
    projectIds: ['temi-subscriptions', 'byzara', 'doctors-portal', 'play-group-hr', 'temi'],
    technologies: ['WhatsApp', 'Socket.IO', 'Web Push'],
  },
  {
    id: 'ai',
    group: 'AI Application Development',
    summary:
      'Contributed to the HR Assistant in the Play Group HR platform (backend support, failure handling and chat UI fixes).',
    projectIds: ['play-group-hr'],
    technologies: ['OpenAI SDK', 'Google GenAI SDK'],
    pendingNote:
      'The provider actually used by the HR Assistant, and any LangChain or Gemini work, need your confirmation. Only the HR Assistant is evidenced so far.',
  },
  {
    id: 'conversational',
    group: 'Conversational AI',
    summary:
      'WhatsApp virtual-hospital and consumer chatbots on SendPulse, built with a colleague, Kingsley (self-reported). See the Chatbot page.',
    projectIds: [],
    technologies: ['WhatsApp', 'SendPulse'],
  },
  {
    id: 'automation',
    group: 'Automation',
    summary: 'Workflow automation and scheduled processes.',
    projectIds: [],
    technologies: [],
    pendingNote: 'Not yet evidenced. Please supply the automation work you want represented.',
  },
  {
    id: 'data',
    group: 'Database and Data Management',
    summary:
      'Relational data modelling and migration: department data by month and country, Neon Postgres persistence, and patient status and retention tracking.',
    projectIds: ['i3-zuri-health', 'bi-zuri-health', 'byzara'],
    technologies: ['Neon Postgres', 'Prisma', 'SQLite', 'SQLAlchemy'],
  },
  {
    id: 'research',
    group: 'Technical Research and Prototyping',
    summary: 'A multi-country, bilingual front-end proof of concept for Zuri Health.',
    projectIds: ['zuri-frontend-poc'],
    technologies: ['Next.js', 'TypeScript'],
  },
]

export const research: ResearchItem[] = [
  {
    id: 'zuri-frontend-poc',
    title: 'Zuri Health new front end with localisation',
    projectId: 'zuri-frontend-poc',
    purpose:
      'Test whether one front end can serve several Zuri Health markets with country-specific content, compliance sections and more than one language.',
    approach:
      'Next.js with middleware that detects the visitor country, a CountryProvider and CountrySwitcher, and English and French dictionaries. Country-specific content was built for Kenya, Nigeria, Ghana, Zambia and Cameroon, including a Nigeria compliance section.',
    valueAndLimits:
      'Shows a route to a single multi-market site. It is a proof of concept built over about three weeks in May 2026, shared with another developer, and is not stated to be in production.',
    status: 'verified',
  },
]

/**
 * Display order for projects (strongest first). Edit freely: projects not listed go last.
 * Order is a presentation choice and does not change any attribution figures.
 */
export const projectOrder = [
  'i3-zuri-health',
  'bi-zuri-health',
  'byzara',
  'zuri-frontend-poc',
  'play-group-hr',
  'temi',
  'temi-subscriptions',
  'doctors-portal',
  'hema',
  'play',
]
