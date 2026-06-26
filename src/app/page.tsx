import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, Braces, FolderTree, ShieldCheck, Route, Database, BadgeCheck, Layers, Lock, ArrowUpRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CopyButton } from '@/components/ui/CopyButton'
import { siteConfig } from '@/lib/config'
import { getPearlVersion } from '@/lib/version'

export const metadata: Metadata = {
  title: 'Pearl.js — A batteries-included TypeScript backend framework',
  description: 'Pearl.js gives Node.js developers everything to build an API in one install — routing, auth, validation, queues, mail, and background jobs, fully typed and secure by default. Works with Drizzle and Zod.',
}

/* ── Packages ────────────────────────────────────────── */
// Version is sourced from getPearlVersion() in the page component and applied
// uniformly to every package row — all @pearl-framework/* packages release at
// the same version (linked Changesets).
const packages = [
  { name: 'core',     accent: '#ffffff', desc: 'IoC container, application kernel, service providers' },
  { name: 'http',     accent: '#ffffff', desc: 'HTTP kernel — router, middleware pipeline, request/response' },
  { name: 'auth',     accent: '#ffffff', desc: 'JWT, session, and API token authentication guards' },
  { name: 'database', accent: '#ffffff', desc: 'Drizzle ORM — Postgres, MySQL, SQLite integration' },
  { name: 'validate', accent: '#ffffff', desc: 'Zod-powered FormRequest, validation pipes, error formatting' },
  { name: 'events',   accent: '#ffffff', desc: 'Type-safe event dispatcher, listeners, queued events' },
  { name: 'queue',    accent: '#ffffff', desc: 'BullMQ-powered job dispatching, workers, and retries' },
  { name: 'mail',     accent: '#ffffff', desc: 'Nodemailer-powered mailable classes, transports, queue support' },
  { name: 'testing',  accent: '#ffffff', desc: 'HTTP test client, database helpers, mail fakes, test utilities' },
  { name: 'cli',      accent: '#ffffff', desc: 'CLI for scaffolding — new, serve, make:*' },
  { name: 'pearl',    accent: '#ffffff', desc: 'Meta-package — installs all packages in one command' },
]

/* ── Feature sections ────────────────────────────────── */
const features = [
  {
    Icon: Route,
    tag: 'Routing & Middleware', colour: '#ffffff',
    title: 'Routes. Middleware.\nTyped end-to-end.',
    body: `Define routes with a fully-typed HttpContext — params, query, body, and the authenticated user, all inferred. Apply middleware with a single array: authentication, logging, rate-limiting. No decorators, no magic.`,
    file: 'routes/api.ts',
    code: `import { Router } from '@pearl-framework/http'\nimport { Authenticate } from '@pearl-framework/auth'\n\nconst router = new Router()\n\n// Public\nrouter.get('/health', ctx =>\n  ctx.json({ status: 'ok', ts: Date.now() })\n)\n\n// Params, query, body — all typed\nrouter.get('/posts/:id', async ctx => {\n  const id   = ctx.param('id')\n  const page = ctx.query('page') ?? '1'\n  const post = await db.query.posts\n    .findFirst({ where: eq(posts.id, Number(id)) })\n  return post\n    ? ctx.json(post)\n    : ctx.json({ error: 'Not found' }, 404)\n})\n\n// Protected — Authenticate() is a typed middleware\nrouter.post('/posts', createPost, [Authenticate(auth)])\nrouter.put('/posts/:id',  updatePost, [Authenticate(auth)])`,
    href: '/docs/routing',
  },
  {
    Icon: Database,
    tag: 'Database', colour: '#ffffff',
    title: 'Drizzle ORM.\nBuilt right in.',
    body: `@pearl-framework/database wires Drizzle directly into the IoC container. Define your schema in TypeScript, query with full autocomplete and type safety, and run migrations with pearl migrate. Supports Postgres, MySQL, and SQLite.`,
    file: 'schema/posts.ts',
    code: `import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'\n\nexport const posts = pgTable('posts', {\n  id:        serial('id').primaryKey(),\n  title:     text('title').notNull(),\n  content:   text('content').notNull(),\n  authorId:  integer('author_id').references(() => users.id),\n  status:    text('status', { enum: ['draft','published'] })\n               .notNull().default('draft'),\n  createdAt: timestamp('created_at').defaultNow(),\n})\n\n// Fully typed, full autocomplete\nconst post = await db.query.posts.findFirst({\n  where: eq(posts.id, Number(ctx.param('id'))),\n  with:  { author: true },\n})\n\n// $ pearl migrate`,
    href: '/docs/database',
  },
  {
    Icon: BadgeCheck,
    tag: 'Validation', colour: '#ffffff',
    title: 'Zod validation.\nBefore you see it.',
    body: `Extend FormRequest with a Zod schema. Pearl validates the incoming body before your controller runs — invalid requests get a structured 422 with field-level errors automatically. Nothing leaks through.`,
    file: 'requests/CreatePostRequest.ts',
    code: `import { FormRequest } from '@pearl-framework/validate'\nimport { z } from 'zod'\n\nexport class CreatePostRequest extends FormRequest {\n  schema = z.object({\n    title:   z.string().min(3).max(120),\n    content: z.string().min(10),\n    tags:    z.array(z.string()).max(5).optional(),\n    status:  z.enum(['draft', 'published']).default('draft'),\n  })\n}\n\nasync function createPost(ctx: HttpContext) {\n  const data = await CreatePostRequest.validate(ctx)\n  // data is fully typed: { title: string, content: string, ... }\n  const [post] = await db.insert(posts).values(data).returning()\n  return ctx.json(post, 201)\n}\n\n// Bad input auto-rejected:\n// HTTP 422 { errors: { title: ['Too short'] } }`,
    href: '/docs/validation',
  },
  {
    Icon: Layers,
    tag: 'Queues & Events', colour: '#ffffff',
    title: 'Background jobs.\nDecoupled events.',
    body: `Dispatch slow work to BullMQ Redis workers with one line. Decouple side-effects using typed domain events — fire them from your service, react in dedicated listener classes. No direct imports between layers.`,
    file: 'jobs/SendWelcomeEmailJob.ts',
    code: `import { Job } from '@pearl-framework/queue'\nimport { Event, Listen, emit } from '@pearl-framework/events'\n\nclass SendWelcomeEmailJob extends Job {\n  userId!: number\n\n  async handle() {\n    await Mail.send(new WelcomeMail(this.userId))\n  }\n}\n\nclass UserRegisteredEvent extends Event {\n  constructor(public user: User) { super() }\n}\n\n// Fire from your service\nawait emit(new UserRegisteredEvent(user))\n\n@Listen(UserRegisteredEvent)\nclass OnUserRegistered {\n  async handle({ user }: UserRegisteredEvent) {\n    await Queue.dispatch(\n      Object.assign(new SendWelcomeEmailJob(), { userId: user.id })\n    )\n  }\n}`,
    href: '/docs/queue',
  },
  {
    Icon: Lock,
    tag: 'Security', colour: '#ffffff',
    title: 'Secure by default.\nScaffolded in.',
    body: `Every Pearl app starts with an explicit CORS allow-list, HSTS + CSP + X-Frame-Options headers, a per-IP rate limiter, a 1 MiB request-body cap, and an error handler that returns generic 500s so framework internals never reach clients. \`pearl new\` writes the middleware files into your project — wired in \`server.ts\`, yours to customise.`,
    file: 'src/server.ts',
    code: `import { Router, HttpKernel } from '@pearl-framework/http'\nimport { ErrorHandler } from './middleware/ErrorHandler.js'\nimport { SecurityHeaders } from './middleware/SecurityHeaders.js'\nimport { Cors } from './middleware/Cors.js'\nimport { apiRateLimit } from './middleware/RateLimit.js'\n\nconst router = new Router()\n\n// Order matters — error handler outermost, rate limit innermost\nrouter.use(new ErrorHandler())\nrouter.use(new SecurityHeaders())\nrouter.use(new Cors())\nrouter.use(apiRateLimit)\n\nconst kernel = new HttpKernel({\n  maxBodyBytes:     1024 * 1024,                  // 1 MiB cap\n  onUnhandledError: (err) => apm.report(err),     // never leaks to clients\n})\n\nawait kernel.useRouter(router).listen(3000)`,
    href: '/docs/routing#kernel-options',
  },
]

const m: React.CSSProperties = { fontFamily: 'var(--mono)' }

function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/[^\n]*)/g,
      s => `<em style="color:#6b7280;font-style:normal">${s}</em>`)
}

function CodeWin({ file, fileColour, children }: {
  file: string
  fileColour?: string
  children: React.ReactNode
}) {
  const parts = file.split('/')
  const dir   = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '')
  const fname = parts[parts.length - 1]
  return (
    <div className="code-win">
      <div className="code-win-bar">
        <div className="traffic" aria-hidden="true">
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <span className="code-win-label">
          {dir && <span style={{ color: fileColour ?? 'var(--term-muted)' }}>{dir}</span>}
          {fname}
        </span>
      </div>
      {children}
    </div>
  )
}

export default async function HomePage() {
  const installCmd = 'npm install @pearl-framework/pearl'
  const version = await getPearlVersion()

  return (
    <>
      <Navbar version={version} />

      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="hero-grid"
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '6.5rem 2rem 4.5rem',
            display: 'grid', gridTemplateColumns: '1fr 1.05fr',
            gap: '4.5rem', alignItems: 'center',
          }}
        >
          {/* Left */}
          <div>
            {/* Version badge */}
            <div className="fu" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              padding: '.28rem .85rem', borderRadius: 4,
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              marginBottom: '1.75rem',
            }}>
              <span aria-hidden="true" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)', flexShrink: 0,
              }} />
              <span style={{ ...m, fontSize: '.72rem', color: 'var(--body)', letterSpacing: '.05em' }}>
                v{version} &nbsp;·&nbsp; 11 packages &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>now on npm</span>
              </span>
            </div>

            {/* Headline — tight, two lines */}
            <h1
              id="hero-heading"
              className="fu fu1"
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                fontWeight: 800,
                letterSpacing: '-.04em',
                lineHeight: 1.05,
                color: 'var(--text)',
                marginBottom: '1.25rem',
              }}
            >
              Everything your Node.js API needs,<br />
              <span style={{ color: 'var(--accent)' }}>in one install.</span>
            </h1>

            {/* Subtitle — one tight line */}
            <p className="fu fu2" style={{
              fontSize: '1.05rem', color: 'var(--body)',
              lineHeight: 1.7, marginBottom: '2rem', maxWidth: 500,
            }}>
              Routing, auth, validation, queues, mail, and background jobs — built in, fully typed, and secure by default. Works with Drizzle and Zod, so there&apos;s nothing new to learn.
            </p>

            {/* Install — primary action */}
            <div className="fu fu3" role="region" aria-label="Install Pearl.js" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
                borderRadius: 6,
                padding: '.75rem 1.1rem',
                ...m, fontSize: '.9rem',
                display: 'inline-flex', alignItems: 'center', gap: '.7rem',
                maxWidth: '100%',
              }}>
                <span style={{ color: 'var(--accent)', userSelect: 'none' }}>$</span>
                <code style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', color: 'var(--body)', flex: 1 }}>
                  npm install <span style={{ color: 'var(--accent)' }}>@pearl-framework/pearl</span>
                </code>
                <CopyButton text={installCmd} />
              </div>
            </div>

            {/* CTAs — quieter */}
            <div className="fu fu4" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/docs/getting-started" className="btn btn-primary arrow-link">
                Read the docs <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={siteConfig.github}
                target="_blank" rel="noopener noreferrer"
                style={{
                  ...m, fontSize: '.85rem', color: 'var(--muted)',
                  display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                  transition: 'color .12s',
                }}
                aria-label="View Pearl.js on GitHub (opens in new tab)"
              >
                Star on GitHub
                <ArrowUpRight size={12} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right — slim code window: one clear story */}
          <div className="hero-code fu fu3">
            <figure aria-label="Pearl.js — src/server.ts">
              <CodeWin file="src/server.ts">
                <pre>
                  <code dangerouslySetInnerHTML={{ __html:
`import { Application, HttpKernel, Router,
         AuthManager, Authenticate } from '@pearl-framework/pearl'
import { AppServiceProvider } from './providers/AppServiceProvider.js'

const app = new Application({ root: import.meta.dirname })
app.register(AppServiceProvider)
await app.boot()  <em style="color:#6b7280;font-style:normal">// loads .env + boots providers</em>

const auth   = app.container.make(AuthManager)
const router = new Router()

<em style="color:#6b7280;font-style:normal">// Auth-protected in one line — no manual JWT plumbing</em>
router.get('/me',
  ctx =&gt; ctx.json(ctx.get('auth.user')),
  [Authenticate(auth)],
)

await new HttpKernel().useRouter(router).listen(3000)` }} />
                </pre>
              </CodeWin>
            </figure>
          </div>
        </section>

        {/* ── WHY DEVELOPERS PICK PEARL ────────────────────── */}
        <section
          aria-labelledby="why-heading"
          style={{
            background: 'var(--bg2)',
            borderTop: '1px solid var(--border)',
            padding: '6rem 2rem',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.5rem', maxWidth: 740 }}>
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
                Why developers pick Pearl
              </p>
              <h2
                id="why-heading"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
                  letterSpacing: '-.03em', lineHeight: 1.1,
                  color: 'var(--text)', marginBottom: '1.25rem',
                }}
              >
                Less setup.{' '}
                <span style={{ color: 'var(--accent)' }}>More building.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85 }}>
                Most frameworks leave you to wire everything together yourself. Pearl ships with the pieces already connected — and it works with Drizzle and Zod, so the database and validation parts use tools you may already know. Everything below is something Pearl actually does, with the code to prove it.
              </p>
            </div>

            <div
              className="why-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.25rem',
              }}
            >
              {[
                {
                  Icon: Zap,
                  tag: 'Ship faster',
                  title: 'Day one, not week one.',
                  body: 'npx pearl new my-api scaffolds a complete project — auth routes, validated forms, queue worker, migration setup, .env, hot-reload — already wired. Your first endpoint is minutes away, not "after I pick a router."',
                  proof: 'npx pearl new my-api && pearl serve',
                },
                {
                  Icon: Braces,
                  tag: 'Typed end-to-end',
                  title: 'The compiler is your QA.',
                  body: 'Params, query, body, validated FormRequest input, authenticated user, job payloads, dispatched events — all inferred. Rename a column, the compiler tells you every call site that needs updating.',
                  proof: 'const data = await CreatePostRequest.validate(ctx)\n//    ^^ typed from your Zod schema',
                },
                {
                  Icon: FolderTree,
                  tag: 'Conventions, not decisions',
                  title: 'Where does this go? Already answered.',
                  body: 'Controllers, requests, jobs, listeners, mailables, migrations — each has a home, and the CLI generates the boilerplate. No bikeshedding, no folder-structure committee.',
                  proof: 'pearl make:controller Post --resource',
                },
                {
                  Icon: ShieldCheck,
                  tag: 'Production-ready',
                  title: 'The "for v2" features are already in.',
                  body: 'Rate limiting, retry-with-backoff, dead-letter handling, structured 422/403 errors, algorithm-pinned JWT, prototype-pollution-safe job payloads. The stuff you\'d normally add after the first outage — already there.',
                  proof: 'new RateLimit({ windowMs: 15*60_000, max: 5 })',
                },
              ].map((p, i) => (
                <div
                  key={p.tag}
                  className="why-card"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border2)',
                    borderRadius: 8,
                    padding: '1.75rem',
                    display: 'flex', flexDirection: 'column', gap: '.85rem',
                  }}
                >
                  <span className="icon-tile" aria-hidden="true" style={{ marginBottom: '.25rem' }}>
                    <p.Icon size={18} strokeWidth={1.6} />
                  </span>
                  <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    <span style={{ color: 'var(--bg5)', marginRight: '.55rem' }}>{String(i + 1).padStart(2, '0')}</span>
                    {p.tag}
                  </p>
                  <h3 style={{
                    fontSize: '1.2rem', fontWeight: 700,
                    color: 'var(--text)', lineHeight: 1.3,
                    letterSpacing: '-.01em',
                  }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '.92rem', color: 'var(--body)', lineHeight: 1.7 }}>
                    {p.body}
                  </p>
                  <pre style={{
                    ...m, fontSize: '.78rem',
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '.65rem .85rem',
                    color: 'var(--muted)',
                    overflowX: 'auto',
                    marginTop: '.25rem',
                    whiteSpace: 'pre',
                  }}>
                    <code style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', fontSize: 'inherit' }}>
                      {p.proof}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <section
          aria-label="Features"
          style={{ borderTop: '1px solid var(--border)', padding: '4rem 2rem 2rem' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {features.map((f, i) => (
            <div
              key={f.tag}
              className="feature"
              style={{ gridTemplateColumns: i % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr' }}
            >
              {/* Copy */}
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <span className="icon-tile" aria-hidden="true" style={{ marginBottom: '1rem' }}>
                  <f.Icon size={20} strokeWidth={1.5} />
                </span>
                <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>
                  <span style={{ color: 'var(--bg5)', marginRight: '.55rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  {f.tag}
                </p>
                <h2 style={{
                  fontSize: 'clamp(1.85rem, 3vw, 2.8rem)',
                  fontWeight: 800, letterSpacing: '-.03em',
                  lineHeight: 1.1, marginBottom: '1.5rem',
                }}>
                  {f.title.split('\n').map((line, li) => (
                    <span key={li} style={{ display: 'block', color: li === 0 ? 'var(--text)' : f.colour }}>
                      {line}
                    </span>
                  ))}
                </h2>
                <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85, marginBottom: '2rem' }}>
                  {f.body}
                </p>
                <Link
                  href={f.href}
                  className="arrow-link"
                  style={{
                    ...m,
                    display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                    fontSize: '.85rem', fontWeight: 600,
                    color: f.colour,
                    borderBottom: `1px solid ${f.colour}55`,
                    paddingBottom: '2px',
                    transition: 'border-color .15s',
                  }}
                >
                  Read the docs <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Code */}
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <figure aria-label={`${f.tag} code example`}>
                  <CodeWin file={f.file} fileColour={f.colour}>
                    <pre style={{ fontSize: '.78rem', lineHeight: 1.85 }}>
                      <code dangerouslySetInnerHTML={{ __html: highlight(f.code) }} />
                    </pre>
                  </CodeWin>
                </figure>
              </div>
            </div>
          ))}
          </div>
        </section>

        {/* ── PROJECT STRUCTURE ────────────────────────────── */}
        <section
          aria-labelledby="structure-heading"
          style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '7rem 2rem' }}
        >
          <div
            style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}
            className="hero-grid"
          >
            <div>
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>CLI scaffolding</p>
              <h2
                id="structure-heading"
                style={{ fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: 'var(--text)', marginBottom: '1.5rem' }}
              >
                One command.<br />
                <span style={{ color: 'var(--accent)' }}>Everything generated.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85, marginBottom: '2rem' }}>
                <code>npx pearl new my-api</code> gives you a complete, structured project. <code>.env</code> is created automatically and loaded by Pearl on boot — no dotenv import, no manual wiring.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                {[
                  { c: 'var(--accent)', t: '.env auto-created and loaded on boot — no import needed' },
                  { c: 'var(--blue)',   t: 'IoC container with constructor injection throughout' },
                  { c: 'var(--amber)',  t: 'pearl make:controller, model, job, event, listener, migration' },
                  { c: 'var(--accent)', t: 'pearl serve — hot-reload dev server, zero config' },
                  { c: 'var(--violet)', t: 'pearl migrate — Drizzle migrations from the CLI' },
                ].map(item => (
                  <li key={item.t} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start', fontSize: '.93rem', color: 'var(--body)' }}>
                    <span aria-hidden="true" style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: item.c, flexShrink: 0, marginTop: '.48rem',
                      boxShadow: `0 0 6px ${item.c}`,
                    }} />
                    {item.t}
                  </li>
                ))}
              </ul>
            </div>

            <figure aria-label="Project structure from pearl new my-api">
              <CodeWin file="~ npx pearl new my-api">
                <pre style={{ fontSize: '.8rem', lineHeight: 2.05 }}>
                  <code dangerouslySetInnerHTML={{ __html:
`<span style="color:#6b7280">my-api/</span>
<span style="color:#6e7681">├──</span> <span style="color:#6b7280">src/</span>
<span style="color:#6e7681">│   ├──</span> controllers/      <span style="color:#6b7280"># HTTP handlers</span>
<span style="color:#6e7681">│   ├──</span> schema/           <span style="color:#6b7280"># Drizzle table defs</span>
<span style="color:#6e7681">│   ├──</span> middleware/       <span style="color:#6b7280"># custom middleware</span>
<span style="color:#6e7681">│   ├──</span> jobs/             <span style="color:#6b7280"># BullMQ background jobs</span>
<span style="color:#6e7681">│   ├──</span> events/           <span style="color:#6b7280"># domain events</span>
<span style="color:#6e7681">│   ├──</span> listeners/        <span style="color:#6b7280"># event listeners</span>
<span style="color:#6e7681">│   ├──</span> mail/             <span style="color:#6b7280"># Mailable classes</span>
<span style="color:#6e7681">│   ├──</span> requests/         <span style="color:#6b7280"># Zod FormRequest validation</span>
<span style="color:#6e7681">│   ├──</span> routes/api.ts     <span style="color:#6b7280"># all your routes</span>
<span style="color:#6e7681">│   ├──</span> database/migrations/
<span style="color:#6e7681">│   ├──</span> providers/        <span style="color:#6b7280"># service providers</span>
<span style="color:#6e7681">│   └──</span> <span style="color:#e6edf3">server.ts</span>         <span style="color:#6b7280"># entry point</span>
├── .env                  <span style="color:#6b7280"># auto-created &amp; auto-loaded ✓</span>
<span style="color:#6e7681">├──</span> <span style="color:#e6edf3">package.json</span>
<span style="color:#6e7681">└──</span> <span style="color:#e6edf3">tsconfig.json</span>` }} />
                </pre>
              </CodeWin>
            </figure>
          </div>
        </section>

        {/* ── WHAT PEARL IS FOR ────────────────────────────── */}
        <section
          aria-labelledby="what-heading"
          style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.5rem', maxWidth: 740 }}>
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
                What you&apos;ll ship
              </p>
              <h2
                id="what-heading"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
                  letterSpacing: '-.03em', lineHeight: 1.1,
                  color: 'var(--text)', marginBottom: '1.25rem',
                }}
              >
                From <code style={{ fontSize: '.85em', background: 'var(--bg2)', border: '1px solid var(--border2)', padding: '.05em .35em', borderRadius: 4, color: 'var(--text)' }}>npx pearl new</code> to{' '}
                <span style={{ color: 'var(--accent)' }}>a production API — same afternoon.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85 }}>
                Pick the app type on the left — Pearl supports each one with the primitives on the right. Every item on the right is shipped and ready to use today; you don&apos;t have to pick libraries or wire them together.
              </p>
            </div>

            <div
              className="what-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '4rem' }}
            >
              {/* Left — what you build */}
              <div>
                <p style={{ ...m, fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>
                  What you can build
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  {[
                    { title: 'REST APIs',         desc: 'Typed routes, typed params, typed bodies. JWT or session auth in two lines, validation before the handler runs.' },
                    { title: 'SaaS backends',     desc: 'Queue background jobs to BullMQ, send transactional mail, fire typed domain events — no glue code between layers.' },
                    { title: 'Internal tools',    desc: 'Role-aware controllers, audit-trail events, fast CLI scaffolding for new models, routes, and migrations.' },
                    { title: 'Microservices',     desc: 'Rate-limited endpoints, structured error responses, ORM-agnostic data layer, and a lean container that starts fast.' },
                  ].map(b => (
                    <li
                      key={b.title}
                      style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border2)' }}
                    >
                      <p style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.35rem' }}>{b.title}</p>
                      <p style={{ fontSize: '.86rem', color: 'var(--muted)', lineHeight: 1.7 }}>{b.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — what's already solved */}
              <div>
                <p style={{ ...m, fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>
                  What you skip building
                </p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                  {[
                    { need: 'Validate request bodies',          got: 'Zod-backed FormRequest, typed return' },
                    { need: 'Issue & verify JWTs safely',       got: 'JwtGuard — algorithm pinned, none blocked' },
                    { need: 'Cookie-based sessions',            got: 'SessionGuard with rotation + logout-all' },
                    { need: 'Rate-limit /login & /signup',      got: 'RateLimit middleware, pluggable store' },
                    { need: 'Lock down CORS origins',           got: 'Allow-list middleware, refuses * by design' },
                    { need: 'Set baseline security headers',    got: 'HSTS, CSP, X-Frame-Options scaffolded in' },
                    { need: 'Cap incoming request bodies',      got: 'Built-in 1 MiB limit, override per kernel' },
                    { need: 'Prevent error-message leaks',      got: 'Generic 500s; APM hook for the real cause' },
                    { need: 'Run background jobs',              got: 'BullMQ queue + retry/backoff helpers' },
                    { need: 'Send transactional mail',          got: 'Mailer + SMTP/SES + bulk concurrency' },
                    { need: 'Fire-and-forget domain events',    got: 'Typed dispatcher with onError APM hook' },
                    { need: 'Wire the whole thing together',    got: 'IoC container, providers, one boot()' },
                  ].map(p => (
                    <li
                      key={p.need}
                      className="solved-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        alignItems: 'baseline',
                        gap: '.85rem',
                        fontSize: '.87rem',
                      }}
                    >
                      <span style={{ color: 'var(--muted)' }}>{p.need}</span>
                      <span
                        aria-hidden="true"
                        className="solved-arrow"
                        style={{ ...m, color: 'var(--violet)', fontSize: '.78rem' }}
                      >
                        →
                      </span>
                      <span style={{ color: 'var(--body)' }}>{p.got}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── PACKAGES ─────────────────────────────────────── */}
        <section
          aria-labelledby="packages-heading"
          style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '6rem 2rem' }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '.75rem' }}>What you get</p>
              <h2 id="packages-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: 'var(--text)', marginBottom: '1rem' }}>
                11 packages.{' '}
                <span style={{ color: 'var(--accent)' }}>One install.</span>
              </h2>
              <p style={{ fontSize: '.95rem', color: 'var(--muted)', maxWidth: 500, lineHeight: 1.8 }}>
                <code>@pearl-framework/pearl</code> is a meta-package that pulls in all 11 below. Each is also available individually if you prefer à la carte.
              </p>
            </div>

            <div className="pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.75rem' }}>
              {packages.map(pkg => (
                <div key={pkg.name} className="pkg">
                  <div style={{ marginTop: '.15rem', flexShrink: 0 }}>
                    <span aria-hidden="true" style={{
                      display: 'block', width: 7, height: 7, borderRadius: '50%',
                      background: pkg.accent,
                      boxShadow: `0 0 6px ${pkg.accent}99`,
                    }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem', flexWrap: 'wrap' }}>
                      <span style={{ ...m, fontSize: '.74rem', color: pkg.accent, fontWeight: 500 }}>
                        @pearl/{pkg.name}
                      </span>
                      <span style={{ ...m, fontSize: '.65rem', color: 'var(--muted)', background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>
                        {version}
                      </span>
                    </div>
                    <p style={{ fontSize: '.79rem', color: 'var(--muted)', lineHeight: 1.5 }}>{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          style={{ textAlign: 'center', padding: '9rem 2rem 10rem', position: 'relative', overflow: 'hidden' }}
        >
          {/* Subtle radial glow */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 50% 55% at 50% 105%, rgba(255, 255, 255, 0.05) 0%, transparent 65%)',
          }} />
          {/* Top rule */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '15%', right: '15%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
          }} />

          <p style={{ ...m, fontSize: '.68rem', color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '1.75rem' }}>
            Start building
          </p>
          <h2
            id="cta-heading"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
              fontWeight: 800, letterSpacing: '-.04em',
              lineHeight: 1.06, color: 'var(--text)', marginBottom: '1.5rem',
            }}
          >
            Your next API starts<br />
            <span style={{ color: 'var(--accent)' }}>with one command.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 400, margin: '0 auto 3rem', lineHeight: 1.8 }}>
            <code>npx pearl new my-api</code> scaffolds everything.{' '}
            <code>pearl serve</code> and you&apos;re live.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs/getting-started" className="btn btn-primary arrow-link" style={{ fontSize: '1rem', padding: '.85rem 2.25rem' }}>
              Read the docs <span aria-hidden="true">→</span>
            </Link>
            <Link href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary arrow-link" style={{ fontSize: '1rem', padding: '.85rem 2.25rem' }}>
              View on GitHub
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </section>

      </main>

      <Footer version={version} />
    </>
  )
}