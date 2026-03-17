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
  { label: 'Routing', href: '/docs/routing' },
  { label: 'Database', href: '/docs/database' },
  { label: 'Auth', href: '/docs/auth' },
  { label: 'GitHub', href: 'https://github.com/skd09/pearl.js', external: true },
  { label: 'npm', href: 'https://www.npmjs.com/package/@pearl-framework/pearl', external: true },
]

export const docsNav = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs/getting-started' },
      { label: 'Installation', href: '/docs/getting-started#manual' },
      { label: 'Quick Start', href: '/docs/getting-started#scaffold' },
    ],
  },
  {
    title: 'Core',
    items: [
      { label: 'Routing', href: '/docs/routing' },
      { label: 'Controllers', href: '/docs/controllers' },
      { label: 'Middleware', href: '/docs/middleware' },
      { label: 'Validation', href: '/docs/validation' },
    ],
  },
  {
    title: 'Features',
    items: [
      { label: 'Database', href: '/docs/database' },
      { label: 'Authentication', href: '/docs/auth' },
      { label: 'Events', href: '/docs/events' },
      { label: 'Queues', href: '/docs/queue' },
      { label: 'Mail', href: '/docs/mail' },
    ],
  },
  {
    title: 'Tooling',
    items: [
      { label: 'CLI', href: '/docs/cli' },
    ],
  },
]
