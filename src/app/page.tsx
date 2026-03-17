import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { CopyButton } from '@/components/ui/CopyButton'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Pearl.js — The TypeScript Backend Framework',
  description: 'A batteries-included Node.js framework. Routing, auth, Drizzle ORM, BullMQ queues, events, and mail — 11 packages, one install.',
}

/* ── Packages ────────────────────────────────────────── */
const packages = [
  { name: 'core',     accent: '#58a6ff', desc: 'IoC container, application kernel, service providers',            ver: '1.0.0' },
  { name: 'http',     accent: '#00e5a0', desc: 'HTTP kernel — router, middleware pipeline, request/response',     ver: '1.0.0' },
  { name: 'auth',     accent: '#f85149', desc: 'JWT, session, and API token authentication guards',               ver: '1.0.0' },
  { name: 'database', accent: '#d29922', desc: 'Drizzle ORM — Postgres, MySQL, SQLite integration',              ver: '1.0.0' },
  { name: 'validate', accent: '#bc8cff', desc: 'Zod-powered FormRequest, validation pipes, error formatting',    ver: '1.0.0' },
  { name: 'events',   accent: '#00e5a0', desc: 'Type-safe event dispatcher, listeners, queued events',           ver: '1.0.0' },
  { name: 'queue',    accent: '#f77f00', desc: 'BullMQ-powered job dispatching, workers, and retries',           ver: '1.0.0' },
  { name: 'mail',     accent: '#79c0ff', desc: 'Nodemailer-powered mailable classes, transports, queue support', ver: '1.0.0' },
  { name: 'testing',  accent: '#bc8cff', desc: 'HTTP test client, database helpers, mail fakes, test utilities', ver: '1.0.0' },
  { name: 'cli',      accent: '#58a6ff', desc: 'CLI for scaffolding — new, serve, make:*',                      ver: '1.0.0' },
  { name: 'pearl',    accent: '#d29922', desc: 'Meta-package — installs all packages in one command',            ver: '1.0.0' },
]

/* ── Feature sections ────────────────────────────────── */
const features = [
  {
    tag: 'Routing & Middleware', colour: '#58a6ff',
    title: 'Routes. Middleware.\nTyped end-to-end.',
    body: `Define routes with a fully-typed HttpContext — params, query, body, and the authenticated user, all inferred. Apply middleware with a single array: authentication, logging, rate-limiting. No decorators, no magic.`,
    file: 'routes/api.ts',
    code: `import { Router } from '@pearl-framework/http'\nimport { Authenticate } from '@pearl-framework/auth'\n\nconst router = new Router()\n\n// Public\nrouter.get('/health', ctx =>\n  ctx.json({ status: 'ok', ts: Date.now() })\n)\n\n// Params, query, body — all typed\nrouter.get('/posts/:id', async ctx => {\n  const id   = ctx.param('id')\n  const page = ctx.query('page') ?? '1'\n  const post = await db.query.posts\n    .findFirst({ where: eq(posts.id, Number(id)) })\n  return post\n    ? ctx.json(post)\n    : ctx.json({ error: 'Not found' }, 404)\n})\n\n// Protected — Authenticate() is a typed middleware\nrouter.post('/posts', createPost, [Authenticate(auth)])\nrouter.put('/posts/:id',  updatePost, [Authenticate(auth)])`,
    href: '/docs/routing',
  },
  {
    tag: 'Database', colour: '#d29922',
    title: 'Drizzle ORM.\nBuilt right in.',
    body: `@pearl-framework/database wires Drizzle directly into the IoC container. Define your schema in TypeScript, query with full autocomplete and type safety, and run migrations with pearl migrate. Supports Postgres, MySQL, and SQLite.`,
    file: 'schema/posts.ts',
    code: `import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'\n\nexport const posts = pgTable('posts', {\n  id:        serial('id').primaryKey(),\n  title:     text('title').notNull(),\n  content:   text('content').notNull(),\n  authorId:  integer('author_id').references(() => users.id),\n  status:    text('status', { enum: ['draft','published'] })\n               .notNull().default('draft'),\n  createdAt: timestamp('created_at').defaultNow(),\n})\n\n// Fully typed, full autocomplete\nconst post = await db.query.posts.findFirst({\n  where: eq(posts.id, Number(ctx.param('id'))),\n  with:  { author: true },\n})\n\n// $ pearl migrate`,
    href: '/docs/database',
  },
  {
    tag: 'Validation', colour: '#bc8cff',
    title: 'Zod validation.\nBefore you see it.',
    body: `Extend FormRequest with a Zod schema. Pearl validates the incoming body before your controller runs — invalid requests get a structured 422 with field-level errors automatically. Nothing leaks through.`,
    file: 'requests/CreatePostRequest.ts',
    code: `import { FormRequest } from '@pearl-framework/validate'\nimport { z } from 'zod'\n\nexport class CreatePostRequest extends FormRequest {\n  schema = z.object({\n    title:   z.string().min(3).max(120),\n    content: z.string().min(10),\n    tags:    z.array(z.string()).max(5).optional(),\n    status:  z.enum(['draft', 'published']).default('draft'),\n  })\n}\n\nasync function createPost(ctx: HttpContext) {\n  const data = await CreatePostRequest.validate(ctx)\n  // data is fully typed: { title: string, content: string, ... }\n  const [post] = await db.insert(posts).values(data).returning()\n  return ctx.json(post, 201)\n}\n\n// Bad input auto-rejected:\n// HTTP 422 { errors: { title: ['Too short'] } }`,
    href: '/docs/validation',
  },
  {
    tag: 'Queues & Events', colour: '#00e5a0',
    title: 'Background jobs.\nDecoupled events.',
    body: `Dispatch slow work to BullMQ Redis workers with one line. Decouple side-effects using typed domain events — fire them from your service, react in dedicated listener classes. No direct imports between layers.`,
    file: 'jobs/SendWelcomeEmailJob.ts',
    code: `import { Job } from '@pearl-framework/queue'\nimport { Event, Listen, emit } from '@pearl-framework/events'\n\nclass SendWelcomeEmailJob extends Job {\n  userId!: number\n\n  async handle() {\n    await Mail.send(new WelcomeMail(this.userId))\n  }\n}\n\nclass UserRegisteredEvent extends Event {\n  constructor(public user: User) { super() }\n}\n\n// Fire from your service\nawait emit(new UserRegisteredEvent(user))\n\n@Listen(UserRegisteredEvent)\nclass OnUserRegistered {\n  async handle({ user }: UserRegisteredEvent) {\n    await Queue.dispatch(\n      Object.assign(new SendWelcomeEmailJob(), { userId: user.id })\n    )\n  }\n}`,
    href: '/docs/queue',
  },
]

const m: React.CSSProperties = { fontFamily: 'var(--mono)' }

function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/[^\n]*)/g,
      s => `<em style="color:#8b949e;font-style:normal">${s}</em>`)
    .replace(/('(?:[^'\\]|\\.)*')/g,
      s => `<span style="color:#a5d6ff">${s}</span>`)
    .replace(/\b(import|export|from|const|let|await|new|async|return|class|extends|public|readonly|default)\b/g,
      k => `<span style="color:#ff7b72">${k}</span>`)
    .replace(/\b([A-Z][a-zA-Z0-9]+)\b/g,
      t => `<span style="color:#79c0ff">${t}</span>`)
    .replace(/\b(\d+)\b/g,
      n => `<span style="color:#d29922">${n}</span>`)
    .replace(/\.([a-z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      (_, mm) => `.<span style="color:#00e5a0">${mm}</span>`)
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

export default function HomePage() {
  const installCmd = 'npm install @pearl-framework/pearl'

  return (
    <>
      <a href="#main-content" className="skip">Skip to main content</a>
      <Navbar />

      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="hero-grid"
          style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '8rem 2rem 5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '5rem', alignItems: 'center',
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
              marginBottom: '2.25rem',
            }}>
              <span aria-hidden="true" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)', flexShrink: 0,
                animation: 'dot-pulse 2.5s ease-in-out infinite',
              }} />
              <span style={{ ...m, fontSize: '.72rem', color: 'var(--body)', letterSpacing: '.05em' }}>
                v1.0.0 &nbsp;·&nbsp; 11 packages &nbsp;·&nbsp; <span style={{ color: 'var(--accent)' }}>now on npm</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="fu fu1"
              style={{
                fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
                fontWeight: 800,
                letterSpacing: '-.04em',
                lineHeight: 1.08,
                color: 'var(--text)',
                marginBottom: '1.75rem',
              }}
            >
              Build TypeScript APIs<br />
              <span style={{ color: 'var(--accent)' }}>without the glue work.</span>
            </h1>

            <p className="fu fu2" style={{
              fontSize: '1.05rem', color: 'var(--body)',
              lineHeight: 1.8, marginBottom: '2.75rem', maxWidth: 480,
            }}>
              Pearl is a <strong style={{ color: 'var(--text)', fontWeight: 600 }}>batteries-included Node.js framework</strong> — routing, JWT auth, Drizzle ORM, Zod validation, BullMQ queues, typed events, and mail. All wired together. One install.
            </p>

            {/* CTAs */}
            <div className="fu fu3" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link href="/docs/getting-started" className="btn btn-primary">
                Get started <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={siteConfig.github}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary"
                aria-label="View Pearl.js on GitHub (opens in new tab)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </Link>
            </div>

            {/* Install — copy button is the only client island */}
            <div className="fu fu4" role="region" aria-label="Install Pearl.js">
              <p style={{ ...m, fontSize: '.65rem', color: 'var(--muted)', marginBottom: '.5rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>Install</p>
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
                borderRadius: 6,
                padding: '.65rem 1rem',
                ...m, fontSize: '.88rem',
                display: 'inline-flex', alignItems: 'center', gap: '.6rem',
                maxWidth: '100%',
              }}>
                <span style={{ color: 'var(--accent)', userSelect: 'none' }}>$</span>
                <code style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', color: 'var(--body)', flex: 1 }}>
                  npm install{' '}
                  <span style={{ color: 'var(--accent)' }}>@pearl-framework/pearl</span>
                </code>
                <CopyButton text={installCmd} />
              </div>
            </div>
          </div>

          {/* Right — hero code window */}
          <div className="hero-code fu fu3">
            <figure aria-label="Pearl.js — src/server.ts">
              <CodeWin file="src/server.ts">
                <pre>
                  <code dangerouslySetInnerHTML={{ __html:
`<em style="color:#8b949e;font-style:normal">// .env is created by \`pearl new\` and loaded inside</em>
<em style="color:#8b949e;font-style:normal">// app.boot() automatically — no dotenv import needed</em>

<span style="color:#ff7b72">import</span> { <span style="color:#79c0ff">Application</span>, <span style="color:#79c0ff">HttpKernel</span>, <span style="color:#79c0ff">Router</span> }
       <span style="color:#ff7b72">from</span> <span style="color:#a5d6ff">'@pearl-framework/pearl'</span>
<span style="color:#ff7b72">import</span> { <span style="color:#79c0ff">AuthManager</span>, <span style="color:#79c0ff">Authenticate</span> }
       <span style="color:#ff7b72">from</span> <span style="color:#a5d6ff">'@pearl-framework/pearl'</span>
<span style="color:#ff7b72">import</span> { <span style="color:#79c0ff">AppServiceProvider</span> }
       <span style="color:#ff7b72">from</span> <span style="color:#a5d6ff">'./providers/AppServiceProvider.js'</span>

<span style="color:#ff7b72">const</span> app = <span style="color:#ff7b72">new</span> <span style="color:#79c0ff">Application</span>({ root: import.meta.dirname })
app.<span style="color:#00e5a0">register</span>(<span style="color:#79c0ff">AppServiceProvider</span>)
<span style="color:#ff7b72">await</span> app.<span style="color:#00e5a0">boot</span>()  <em style="color:#8b949e;font-style:normal">// loads .env + boots all providers</em>

<span style="color:#ff7b72">const</span> auth   = app.container.<span style="color:#00e5a0">make</span>(<span style="color:#79c0ff">AuthManager</span>)
<span style="color:#ff7b72">const</span> router = <span style="color:#ff7b72">new</span> <span style="color:#79c0ff">Router</span>()

<em style="color:#8b949e;font-style:normal">// Public route</em>
router.<span style="color:#00e5a0">get</span>(<span style="color:#a5d6ff">'/health'</span>, ctx =&gt;
  ctx.<span style="color:#00e5a0">json</span>({ status: <span style="color:#a5d6ff">'ok'</span> })
)

<em style="color:#8b949e;font-style:normal">// Protected — Bearer token required</em>
router.<span style="color:#00e5a0">get</span>(<span style="color:#a5d6ff">'/me'</span>, ctx =&gt; ctx.<span style="color:#00e5a0">json</span>(ctx.<span style="color:#00e5a0">get</span>(<span style="color:#a5d6ff">'auth.user'</span>)),
  [<span style="color:#00e5a0">Authenticate</span>(auth)]
)

<span style="color:#ff7b72">await</span> <span style="color:#ff7b72">new</span> <span style="color:#79c0ff">HttpKernel</span>()
  .<span style="color:#00e5a0">useRouter</span>(router)
  .<span style="color:#00e5a0">listen</span>(<span style="color:#d29922">3000</span>)` }} />
                </pre>
              </CodeWin>
            </figure>
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
                        {pkg.ver}
                      </span>
                    </div>
                    <p style={{ fontSize: '.79rem', color: 'var(--muted)', lineHeight: 1.5 }}>{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 0' }}>
          {features.map((f, i) => (
            <div
              key={f.tag}
              className="feature"
              style={{ gridTemplateColumns: i % 2 === 0 ? '1fr 1.2fr' : '1.2fr 1fr' }}
            >
              {/* Copy */}
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <p style={{ ...m, fontSize: '.68rem', color: f.colour, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 500 }}>
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
`<span style="color:#8b949e">my-api/</span>
<span style="color:#6e7681">├──</span> <span style="color:#8b949e">src/</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#f85149">controllers/</span>      <span style="color:#8b949e"># HTTP handlers</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#79c0ff">schema/</span>           <span style="color:#8b949e"># Drizzle table defs</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#d29922">middleware/</span>       <span style="color:#8b949e"># custom middleware</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#00e5a0">jobs/</span>             <span style="color:#8b949e"># BullMQ background jobs</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#00e5a0">events/</span>           <span style="color:#8b949e"># domain events</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#00e5a0">listeners/</span>        <span style="color:#8b949e"># event listeners</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#bc8cff">mail/</span>             <span style="color:#8b949e"># Mailable classes</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#d29922">requests/</span>         <span style="color:#8b949e"># Zod FormRequest validation</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#f85149">routes/api.ts</span>     <span style="color:#8b949e"># all your routes</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#79c0ff">database/migrations/</span>
<span style="color:#6e7681">│   ├──</span> <span style="color:#d29922">providers/</span>        <span style="color:#8b949e"># service providers</span>
<span style="color:#6e7681">│   └──</span> <span style="color:#e6edf3">server.ts</span>         <span style="color:#8b949e"># entry point</span>
<span style="color:#00e5a0">├── .env</span>                  <span style="color:#8b949e"># auto-created &amp; auto-loaded ✓</span>
<span style="color:#6e7681">├──</span> <span style="color:#e6edf3">package.json</span>
<span style="color:#6e7681">└──</span> <span style="color:#e6edf3">tsconfig.json</span>` }} />
                </pre>
              </CodeWin>
            </figure>
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
            background: 'radial-gradient(ellipse 50% 55% at 50% 105%, rgba(0,229,160,.06) 0%, transparent 65%)',
          }} />
          {/* Top rule */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: '15%', right: '15%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,229,160,.35), transparent)',
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
            <Link href="/docs/getting-started" className="btn btn-primary" style={{ fontSize: '1rem', padding: '.85rem 2.25rem' }}>
              Read the docs <span aria-hidden="true">→</span>
            </Link>
            <Link href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '.85rem 2.25rem' }}>
              View on GitHub
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer role="contentinfo" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div
            className="foot-grid"
            style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 2rem 3.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem' }}
          >
            {/* Brand */}
            <div className="foot-brand">
              <Link href="/" aria-label="Pearl.js home" style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.25rem' }}>
                <img src="/logo.svg" width={26} height={26} alt="Pearl.js" style={{ display: 'block' }} />
                <span style={{ ...m, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.02em', color: 'var(--text)' }}>
                  Pearl<span style={{ color: 'var(--accent)' }}>.js</span>
                </span>
              </Link>
              <p style={{ fontSize: '.875rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 280, marginBottom: '1.5rem' }}>
                A batteries-included TypeScript framework for Node.js — 11 packages, one install, zero glue.
              </p>
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                {['MIT', 'v1.0.0', 'Node ≥ 20', 'TypeScript 5+'].map(t => (
                  <span key={t} style={{ ...m, fontSize: '.65rem', color: 'var(--muted)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '.2rem .55rem', borderRadius: 3 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Docs nav */}
            <nav aria-label="Documentation links">
              <p style={{ ...m, fontSize: '.67rem', color: 'var(--body)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 600 }}>Docs</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                {[
                  ['Getting Started', '/docs/getting-started'],
                  ['Routing',         '/docs/routing'],
                  ['Authentication',  '/docs/auth'],
                  ['Database',        '/docs/database'],
                  ['Validation',      '/docs/validation'],
                  ['Events',          '/docs/events'],
                  ['Queues',          '/docs/queue'],
                  ['Mail',            '/docs/mail'],
                  ['CLI',             '/docs/cli'],
                ].map(([l, h]) => (
                  <li key={l}><Link href={h} className="foot-link">{l}</Link></li>
                ))}
              </ul>
            </nav>

            {/* Project nav */}
            <nav aria-label="Project links">
              <p style={{ ...m, fontSize: '.67rem', color: 'var(--body)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 600 }}>Project</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                {[
                  { l: 'GitHub',    h: siteConfig.github,    ext: true },
                  { l: 'npm',       h: siteConfig.npm,       ext: true },
                  { l: 'Changelog', h: '#',                  ext: false },
                  { l: 'License',   h: '#',                  ext: false },
                ].map(item => (
                  <li key={item.l}>
                    <Link
                      href={item.h}
                      target={item.ext ? '_blank' : undefined}
                      rel={item.ext ? 'noopener noreferrer' : undefined}
                      aria-label={item.ext ? `${item.l} (opens in new tab)` : undefined}
                      className="foot-link"
                    >
                      {item.l}
                      {item.ext && (
                        <svg aria-hidden="true" width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ opacity: .4 }}>
                          <path d="M2 2h8v8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid var(--border)',
            maxWidth: 1200, margin: '0 auto',
            padding: '1.4rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '.75rem',
          }}>
            <p style={{ ...m, fontSize: '.75rem', color: 'var(--muted)' }}>
              © {new Date().getFullYear()} Pearl.js. MIT License.
            </p>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
              Built with ❤️ by{' '}
              <Link
                href={siteConfig.portfolio}
                target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--body)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Sharvari Divekar
              </Link>
            </p>
          </div>
        </footer>

      </main>
    </>
  )
}