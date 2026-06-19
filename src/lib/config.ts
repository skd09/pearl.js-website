export const siteConfig = {
  name: 'Pearl.js',
  title: 'Pearl.js — The TypeScript Framework That Does It Right',
  description:
    'Pearl.js is a batteries-included TypeScript framework for Node.js. Built with clean architecture, SOLID principles, and developer happiness in mind. Routing, auth, database, queues, mail — all in one.',
  url: 'https://pearljs.dev',
  ogImage: 'https://pearljs.dev/og.png',
  github: 'https://github.com/skd09/pearl.js',
  npm: 'https://www.npmjs.com/package/@pearl-framework/pearl',
  portfolio: 'https://sharvari.dev',
  keywords: [
    'TypeScript framework',
    'Node.js framework',
    'Pearl.js',
    'REST API framework',
    'TypeScript backend',
    'Node.js REST API',
    'TypeScript ORM',
    'JWT authentication TypeScript',
    'Node.js queue',
    'Express alternative TypeScript',
    'Laravel for Node.js',
    'TypeScript web framework',
    'Pearl framework',
  ],
  author: 'Sharvari Divekar',
  twitterHandle: '@SharvariDivekar',
}

export const navLinks = [
  { label: 'Docs', href: '/docs/getting-started' },
  { label: 'GitHub', href: 'https://github.com/skd09/pearl.js', external: true },
  { label: 'npm', href: 'https://www.npmjs.com/package/@pearl-framework/pearl', external: true },
]

/* ── Footer ──────────────────────────────────────────── */
export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

export const footerTagline =
  'A TypeScript framework for Node.js backends. Routing, auth, validation, queues, mail, and events — already integrated.'

export const footerBadges = ['MIT licensed', 'v1.0.0', 'Node 20+', 'TypeScript 5+']

export const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Docs',
    links: [
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'Routing',         href: '/docs/routing' },
      { label: 'Controllers',     href: '/docs/controllers' },
      { label: 'Middleware',      href: '/docs/middleware' },
      { label: 'Validation',      href: '/docs/validation' },
      { label: 'Database',        href: '/docs/database' },
      { label: 'Authentication',  href: '/docs/auth' },
      { label: 'Events',          href: '/docs/events' },
      { label: 'Queues',          href: '/docs/queue' },
      { label: 'Mail',            href: '/docs/mail' },
      { label: 'CLI',             href: '/docs/cli' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub',         href: siteConfig.github,                       external: true },
      { label: 'npm',            href: siteConfig.npm,                          external: true },
      { label: 'Issues',         href: `${siteConfig.github}/issues`,           external: true },
      { label: 'Discussions',    href: `${siteConfig.github}/discussions`,      external: true },
      { label: 'License',        href: `${siteConfig.github}/blob/main/LICENSE`, external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Twitter / X',    href: 'https://twitter.com/SharvariDivekar',   external: true },
      { label: 'Portfolio',      href: siteConfig.portfolio,                    external: true },
      { label: 'Contact',        href: `mailto:hello@sharvari.dev` },
    ],
  },
]

export interface DocsNavItem {
  label: string
  href: string
}

export interface DocsNavSection {
  title: string
  items: DocsNavItem[]
}

/**
 * Pages only — no anchor sub-items. Per-page sections are rendered
 * by `<DocsTOC>` (right rail) reading h2[id]s from the article.
 */
export const docsNav: DocsNavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Core',
    items: [
      { label: 'Routing',     href: '/docs/routing' },
      { label: 'Controllers', href: '/docs/controllers' },
      { label: 'Middleware',  href: '/docs/middleware' },
      { label: 'Validation',  href: '/docs/validation' },
    ],
  },
  {
    title: 'Features',
    items: [
      { label: 'Database',       href: '/docs/database' },
      { label: 'Authentication', href: '/docs/auth' },
      { label: 'Events',         href: '/docs/events' },
      { label: 'Queues',         href: '/docs/queue' },
      { label: 'Mail',           href: '/docs/mail' },
    ],
  },
  {
    title: 'Tooling',
    items: [
      { label: 'CLI', href: '/docs/cli' },
    ],
  },
]
