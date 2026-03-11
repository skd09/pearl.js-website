import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Pearl.js — The TypeScript Backend Framework',
  description: 'A batteries-included Node.js framework. Routing, auth, Drizzle ORM, BullMQ queues, events, and mail — 11 packages, one install.',
}

/* ── Real npm packages (from your npm page) ───────────── */
const packages = [
  { name: 'core',     accent: '#60a5fa', desc: 'IoC container, application kernel, service providers',                   ver: '0.2.0' },
  { name: 'http',     accent: '#2dd4bf', desc: 'HTTP kernel — router, middleware pipeline, request/response',             ver: '0.2.0' },
  { name: 'auth',     accent: '#f87171', desc: 'JWT, session, and API token authentication guards',                       ver: '0.2.0' },
  { name: 'database', accent: '#fbbf24', desc: 'Drizzle ORM — Postgres, MySQL, SQLite integration',                      ver: '0.2.0' },
  { name: 'validate', accent: '#a78bfa', desc: 'Zod-powered FormRequest, validation pipes, error formatting',             ver: '0.2.0' },
  { name: 'events',   accent: '#4ade80', desc: 'Type-safe event dispatcher, listeners, queued events',                   ver: '0.2.0' },
  { name: 'queue',    accent: '#4ade80', desc: 'BullMQ-powered job dispatching, workers, and retries',                   ver: '0.2.0' },
  { name: 'mail',     accent: '#2dd4bf', desc: 'Nodemailer-powered mailable classes, transports, queue support',         ver: '0.2.0' },
  { name: 'testing',  accent: '#a78bfa', desc: 'HTTP test client, database helpers, mail fakes, and test utilities',     ver: '0.2.0' },
  { name: 'cli',      accent: '#60a5fa', desc: 'CLI for scaffolding — new, serve, make:*',                               ver: '0.2.0' },
  { name: 'pearl',    accent: '#fbbf24', desc: 'Meta-package — installs all packages above in one command',              ver: '0.2.0' },
]

/* ── Feature sections — full-width alternating layout ── */
const features = [
  {
    tag: 'Routing & Middleware',
    colour: '#60a5fa',
    title: 'Routes. Middleware.\nTyped end-to-end.',
    body: `Define routes with a fully-typed HttpContext — params, query, body, and the authenticated user, all inferred. Apply middleware with a single array: authentication, logging, rate-limiting. No decorators, no magic.`,
    file: 'routes/api.ts',
    code: `import { Router } from '@pearl-framework/http'
import { Authenticate } from '@pearl-framework/auth'

const router = new Router()

// Public
router.get('/health', ctx =>
  ctx.json({ status: 'ok', ts: Date.now() })
)

// Params, query, body — all typed
router.get('/posts/:id', async ctx => {
  const id   = ctx.param('id')
  const page = ctx.query('page') ?? '1'
  const post = await db.query.posts
    .findFirst({ where: eq(posts.id, Number(id)) })
  return post ? ctx.json(post) : ctx.json({ error: 'Not found' }, 404)
})

// Protected — Authenticate() is a typed middleware
router.post('/posts', createPost, [Authenticate(auth)])
router.put('/posts/:id', updatePost, [Authenticate(auth)])

export default router`,
    href: '/docs/routing',
  },
  {
    tag: 'Database',
    colour: '#fbbf24',
    title: 'Drizzle ORM.\nBuilt right in.',
    body: `@pearl-framework/database wires Drizzle directly into the IoC container. Define your schema in TypeScript, query with full autocomplete and type safety, and run migrations with pearl migrate. Supports Postgres, MySQL, and SQLite.`,
    file: 'models/post.ts',
    code: `import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

// Schema — fully typed
export const posts = pgTable('posts', {
  id:        serial('id').primaryKey(),
  title:     text('title').notNull(),
  content:   text('content').notNull(),
  authorId:  integer('author_id').references(() => users.id),
  status:    text('status', { enum: ['draft','published'] })
               .notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
})

// In your controller — fully typed, full autocomplete
const post = await db.query.posts.findFirst({
  where: eq(posts.id, Number(ctx.param('id'))),
  with:  { author: true },
})

// Run migrations from CLI
// $ pearl migrate`,
    href: '/docs/database',
  },
  {
    tag: 'Validation',
    colour: '#a78bfa',
    title: 'Zod validation.\nBefore you see it.',
    body: `Extend FormRequest with a Zod schema. Pearl validates the incoming body before your controller runs — invalid requests get a structured 422 with field-level errors automatically. Nothing leaks through.`,
    file: 'requests/CreatePostRequest.ts',
    code: `import { FormRequest } from '@pearl-framework/validate'
import { z } from 'zod'

export class CreatePostRequest extends FormRequest {
  schema = z.object({
    title:   z.string().min(3).max(120),
    content: z.string().min(10),
    tags:    z.array(z.string()).max(5).optional(),
    status:  z.enum(['draft', 'published']).default('draft'),
  })
}

// In your controller — data is already validated
async function createPost(ctx: HttpContext) {
  const data = await new CreatePostRequest(ctx).validated()
  // data is fully typed: { title: string, content: string, ... }
  const [post] = await db.insert(posts).values(data).returning()
  return ctx.json(post, 201)
}

// Bad input gets auto-rejected with:
// HTTP 422 { errors: { title: ['Too short'] } }`,
    href: '/docs/validation',
  },
  {
    tag: 'Queues & Events',
    colour: '#4ade80',
    title: 'Background jobs.\nDecoupled events.',
    body: `Dispatch slow work to BullMQ Redis workers with one line. Decouple side-effects using typed domain events — fire them from your service, react in dedicated listener classes. No direct imports between layers.`,
    file: 'jobs/SendWelcomeEmailJob.ts',
    code: `import { Job } from '@pearl-framework/queue'
import { Queue } from '@pearl-framework/queue'
import { Event, Listen, emit } from '@pearl-framework/events'

// ── Background Job (BullMQ under the hood) ─────────
class SendWelcomeEmailJob extends Job {
  constructor(public readonly user: User) { super() }

  async handle() {
    await Mail.send(new WelcomeMail(this.user))
  }
}

// ── Domain Event ──────────────────────────────────
class UserRegisteredEvent extends Event {
  constructor(public user: User) { super() }
}

// Fire from your service — no direct imports between layers
await emit(new UserRegisteredEvent(user))

// ── Listener — reacts to the event ───────────────
@Listen(UserRegisteredEvent)
class OnUserRegistered {
  async handle({ user }: UserRegisteredEvent) {
    await Queue.dispatch(new SendWelcomeEmailJob(user))
  }
}`,
    href: '/docs/queue',
  },
]

const m: React.CSSProperties = { fontFamily: 'var(--mono)' }

/* Minimal syntax highlighting — safe, no regex collisions */
function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Single-line comments first
    .replace(/(\/\/[^\n]*)/g,
      s => `<em style="color:#3d4060;font-style:normal">${s}</em>`)
    // Strings
    .replace(/('(?:[^'\\]|\\.)*')/g,
      s => `<span style="color:#fbbf24">${s}</span>`)
    // Keywords
    .replace(/\b(import|export|from|const|let|await|new|async|return|class|extends|public|readonly|default)\b/g,
      k => `<span style="color:#a78bfa">${k}</span>`)
    // Class / type names (PascalCase)
    .replace(/\b([A-Z][a-zA-Z0-9]+)\b/g,
      t => `<span style="color:#93c5fd">${t}</span>`)
    // Numbers
    .replace(/\b(\d+)\b/g,
      n => `<span style="color:#fb923c">${n}</span>`)
    // Method calls
    .replace(/\.([a-z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      (_, m) => `.<span style="color:#2dd4bf">${m}</span>`)
}

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip">Skip to main content</a>
      <Navbar />

      <main id="main-content" style={{ position: 'relative', zIndex: 1 }}>

        {/* ─────────────────────────────────────────────
            HERO
        ───────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="hero-grid"
          style={{ maxWidth: 1200, margin: '0 auto', padding: '9rem 2rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}
        >
          {/* Left */}
          <div>
            {/* Live badge */}
            <div className="fu" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.3rem .9rem', borderRadius: 100, background: 'rgba(96,165,250,.09)', border: '1px solid rgba(96,165,250,.2)', marginBottom: '2rem' }}>
              <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, animation: 'dot-pulse 2.5s ease-in-out infinite' }} />
              <span style={{ ...m, fontSize: '.73rem', color: 'var(--blue2)', letterSpacing: '.04em' }}>v0.2.0 · 11 packages · now on npm</span>
            </div>

            {/* Headline — clean, NO gradient animation */}
            <h1
              id="hero-heading"
              className="fu fu1"
              style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.25rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: 'var(--text)', marginBottom: '1.5rem' }}
            >
              Build TypeScript APIs<br />
              <span style={{ color: 'var(--blue)' }}>without the glue work.</span>
            </h1>

            <p className="fu fu2" style={{ fontSize: '1.1rem', color: 'var(--body)', lineHeight: 1.8, marginBottom: '.85rem' }}>
              Pearl is a <strong style={{ color: 'var(--text)', fontWeight: 600 }}>batteries-included Node.js framework</strong> — routing, JWT auth, Drizzle ORM, request validation, BullMQ queues, typed events, and mail. All wired together. One install.
            </p>
            <p className="fu fu2" style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '2.5rem' }}>
              Stop hunting for compatible libraries. Stop wiring them together. Start shipping.
            </p>

            <div className="fu fu3" style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '2.75rem' }}>
              <Link href="/docs/getting-started" className="btn btn-primary">
                Get started <span aria-hidden="true">→</span>
              </Link>
              <Link href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" aria-label="View Pearl.js on GitHub (opens in new tab)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </Link>
            </div>

            {/* Install */}
            <div className="fu fu4" role="region" aria-label="Install Pearl.js">
              <p style={{ ...m, fontSize: '.67rem', color: 'var(--muted)', marginBottom: '.4rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Install</p>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 9, padding: '.75rem 1.2rem', ...m, fontSize: '.9rem', display: 'inline-flex', alignItems: 'center', gap: '.75rem', transition: 'border-color .2s', cursor: 'text' }}>
                <span aria-hidden="true" style={{ color: 'var(--muted)', userSelect: 'none' }}>$</span>
                <code style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', color: 'var(--body)' }}>
                  npm install <span style={{ color: 'var(--blue)' }}>@pearl-framework/pearl</span>
                </code>
              </div>
            </div>
          </div>

          {/* Right: hero code — interactive hover */}
          <div className="hero-code fu fu3">
            <figure aria-label="Pearl.js — src/main.ts">
              <div className="code-win">
                <div className="code-win-bar">
                  <div className="traffic" aria-hidden="true">
                    <span style={{ background: 'rgba(255,96,96,.7)' }} />
                    <span style={{ background: 'rgba(255,190,96,.7)' }} />
                    <span style={{ background: 'rgba(96,220,96,.7)' }} />
                  </div>
                  <figcaption className="code-win-label">src/main.ts</figcaption>
                </div>
                <pre>
                  <code dangerouslySetInnerHTML={{ __html:
`<em style="color:#3d4060;font-style:normal">// .env is created by \`pearl new\` and loaded inside</em>
<em style="color:#3d4060;font-style:normal">// app.boot() automatically — no dotenv import needed</em>

<span style="color:#a78bfa">import</span> { Application, HttpKernel, Router }
       <span style="color:#a78bfa">from</span> <span style="color:#fbbf24">'@pearl-framework/pearl'</span>
<span style="color:#a78bfa">import</span> { AuthManager, Authenticate }
       <span style="color:#a78bfa">from</span> <span style="color:#fbbf24">'@pearl-framework/pearl'</span>
<span style="color:#a78bfa">import</span> { AppServiceProvider }
       <span style="color:#a78bfa">from</span> <span style="color:#fbbf24">'./providers/AppServiceProvider.js'</span>

<span style="color:#a78bfa">const</span> app = <span style="color:#a78bfa">new</span> <span style="color:#93c5fd">Application</span>({ root: import.meta.dirname })
app.<span style="color:#2dd4bf">register</span>(<span style="color:#93c5fd">AppServiceProvider</span>)
<span style="color:#a78bfa">await</span> app.<span style="color:#2dd4bf">boot</span>()  <em style="color:#3d4060;font-style:normal">// loads .env + boots all providers</em>

<span style="color:#a78bfa">const</span> auth   = app.container.<span style="color:#2dd4bf">make</span>(<span style="color:#93c5fd">AuthManager</span>)
<span style="color:#a78bfa">const</span> router = <span style="color:#a78bfa">new</span> <span style="color:#93c5fd">Router</span>()

<em style="color:#3d4060;font-style:normal">// Public route</em>
router.<span style="color:#2dd4bf">get</span>(<span style="color:#fbbf24">'/health'</span>, ctx =&gt;
  ctx.<span style="color:#2dd4bf">json</span>({ status: <span style="color:#fbbf24">'ok'</span> })
)

<em style="color:#3d4060;font-style:normal">// Protected — Bearer token required</em>
router.<span style="color:#2dd4bf">get</span>(<span style="color:#fbbf24">'/me'</span>, ctx =&gt; ctx.<span style="color:#2dd4bf">json</span>(ctx.<span style="color:#2dd4bf">user</span>()),
  [<span style="color:#2dd4bf">Authenticate</span>(auth)]
)

<span style="color:#a78bfa">await</span> <span style="color:#a78bfa">new</span> <span style="color:#93c5fd">HttpKernel</span>()
  .<span style="color:#2dd4bf">useRouter</span>(router)
  .<span style="color:#2dd4bf">listen</span>(<span style="color:#fb923c">3000</span>)` }} />
                </pre>
              </div>
            </figure>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            PACKAGES — real npm data
        ───────────────────────────────────────────── */}
        <section aria-labelledby="packages-heading" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '6rem 2rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.25rem' }}>
              <p style={{ ...m, fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>What you get</p>
              <h2 id="packages-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: 'var(--text)', marginBottom: '1rem' }}>
                11 packages. <span style={{ color: 'var(--blue)' }}>One install.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 520, lineHeight: 1.8 }}>
                <code>@pearl-framework/pearl</code> is a meta-package that installs all 11 packages below. Each is also available individually if you prefer à la carte.
              </p>
            </div>

            <div className="pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.875rem' }}>
              {packages.map(pkg => (
                <div key={pkg.name} className="pkg">
                  {/* Coloured dot */}
                  <div style={{ marginTop: '.2rem', flexShrink: 0 }}>
                    <span aria-hidden="true" style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: pkg.accent, boxShadow: `0 0 8px ${pkg.accent}` }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem', flexWrap: 'wrap' }}>
                      <span style={{ ...m, fontSize: '.75rem', color: pkg.accent, fontWeight: 500 }}>
                        @pearl-framework/{pkg.name}
                      </span>
                      <span style={{ ...m, fontSize: '.67rem', color: 'var(--muted)', background: 'var(--bg4)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                        {pkg.ver}
                      </span>
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.55 }}>{pkg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            FEATURE SECTIONS — alternating, full code
            NO tiny code snippets inside small cards
        ───────────────────────────────────────────── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 0' }}>
          {features.map((f, i) => (
            <div key={f.tag} className="feature" style={{ gridTemplateColumns: i % 2 === 0 ? '1fr 1.15fr' : '1.15fr 1fr' }}>

              {/* Copy */}
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <p style={{ ...m, fontSize: '.7rem', color: f.colour, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.9rem', fontWeight: 500 }}>
                  {f.tag}
                </p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.75rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.12, marginBottom: '1.5rem' }}>
                  {f.title.split('\n').map((line, li) => (
                    <span key={li} style={{ display: 'block', color: li === 0 ? 'var(--text)' : f.colour }}>
                      {line}
                    </span>
                  ))}
                </h2>
                <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85, marginBottom: '2rem' }}>
                  {f.body}
                </p>
                <Link href={f.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: f.colour, borderBottom: `1px solid ${f.colour}`, paddingBottom: '2px', opacity: .9, transition: 'opacity .15s' }}>
                  Read the docs <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Full code block — NOT a tiny card snippet */}
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <figure aria-label={`${f.tag} code example`}>
                  <div className="code-win">
                    <div className="code-win-bar">
                      <div className="traffic" aria-hidden="true">
                        <span style={{ background: 'rgba(255,96,96,.6)' }} />
                        <span style={{ background: 'rgba(255,190,96,.6)' }} />
                        <span style={{ background: 'rgba(96,220,96,.6)' }} />
                      </div>
                      <span className="code-win-label">
                        <span style={{ color: f.colour }}>{f.file.split('/')[0]}/</span>{f.file.split('/').slice(1).join('/')}
                      </span>
                    </div>
                    <pre style={{ fontSize: '.78rem', lineHeight: 1.85 }}>
                      <code dangerouslySetInnerHTML={{ __html: highlight(f.code) }} />
                    </pre>
                  </div>
                </figure>
              </div>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────
            PROJECT STRUCTURE
        ───────────────────────────────────────────── */}
        <section aria-labelledby="structure-heading" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '6rem 2rem 7rem' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }} className="hero-grid">

            <div>
              <p style={{ ...m, fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>CLI scaffolding</p>
              <h2 id="structure-heading" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.75rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.12, color: 'var(--text)', marginBottom: '1.5rem' }}>
                One command.<br />
                <span style={{ color: 'var(--amber)' }}>Everything generated.</span>
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.85, marginBottom: '2rem' }}>
                <code>npx pearl new my-api</code> gives you a complete, structured project. The <code>.env</code> is created automatically and loaded by Pearl on boot — no dotenv import, no manual setup.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                {[
                  { c: 'var(--green)',  t: '.env auto-created and loaded on boot — no import needed' },
                  { c: 'var(--blue)',   t: 'IoC container with constructor injection throughout' },
                  { c: 'var(--amber)',  t: 'pearl make:controller, model, job, event, listener, migration' },
                  { c: 'var(--teal)',   t: 'pearl serve — hot-reload dev server, zero config' },
                  { c: 'var(--violet)', t: 'pearl migrate — Drizzle migrations from the CLI' },
                ].map(item => (
                  <li key={item.t} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start', fontSize: '.95rem', color: 'var(--body)' }}>
                    <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: item.c, flexShrink: 0, marginTop: '.45rem', boxShadow: `0 0 8px ${item.c}` }} />
                    {item.t}
                  </li>
                ))}
              </ul>
            </div>

            <figure aria-label="Project structure from pearl new my-api">
              <div className="code-win">
                <div className="code-win-bar">
                  <div className="traffic" aria-hidden="true">
                    <span style={{ background: 'rgba(255,96,96,.6)' }} />
                    <span style={{ background: 'rgba(255,190,96,.6)' }} />
                    <span style={{ background: 'rgba(96,220,96,.6)' }} />
                  </div>
                  <figcaption className="code-win-label">my-api/ — npx pearl new my-api</figcaption>
                </div>
                <pre style={{ fontSize: '.8rem', lineHeight: 2 }}>
                  <code dangerouslySetInnerHTML={{ __html:
`<span style="color:#fbbf24">my-api/</span>
<span style="color:#3d4060">├──</span> <span style="color:#fbbf24">src/</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#fb923c">controllers/</span>     <span style="color:#3d4060"># HTTP handlers</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#60a5fa">models/</span>          <span style="color:#3d4060"># Drizzle schemas</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#a78bfa">middleware/</span>      <span style="color:#3d4060"># custom middleware</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#4ade80">jobs/</span>            <span style="color:#3d4060"># BullMQ background jobs</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#4ade80">events/</span>          <span style="color:#3d4060"># domain events</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#4ade80">listeners/</span>       <span style="color:#3d4060"># event listeners</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#f87171">mail/</span>            <span style="color:#3d4060"># Mailable classes</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#a78bfa">requests/</span>        <span style="color:#3d4060"># Zod FormRequest validation</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#fb923c">routes/api.ts</span>    <span style="color:#3d4060"># all your routes</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#60a5fa">database/migrations/</span>
<span style="color:#3d4060">│   ├──</span> <span style="color:#a78bfa">providers/</span>       <span style="color:#3d4060"># service providers</span>
<span style="color:#3d4060">│   └──</span> <span style="color:#f1f1f4">main.ts</span>          <span style="color:#3d4060"># entry point</span>
<span style="color:#4ade80">├── .env</span>                 <span style="color:#3d4060"># auto-created &amp; auto-loaded ✓</span>
<span style="color:#3d4060">├──</span> <span style="color:#f1f1f4">package.json</span>
<span style="color:#3d4060">└──</span> <span style="color:#f1f1f4">tsconfig.json</span>` }} />
                </pre>
              </div>
            </figure>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            CTA
        ───────────────────────────────────────────── */}
        <section aria-labelledby="cta-heading" style={{ textAlign: 'center', padding: '8rem 2rem 9rem', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 65% 50% at 50% 100%, rgba(96,165,250,.07) 0%, rgba(45,212,191,.04) 40%, transparent 65%)' }} />
          <p style={{ ...m, fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Start building</p>
          <h2 id="cta-heading" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.75rem)', fontWeight: 800, letterSpacing: '-.035em', lineHeight: 1.07, color: 'var(--text)', marginBottom: '1.5rem' }}>
            Your next API starts<br />
            <span style={{ color: 'var(--blue)' }}>with one command.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: 440, margin: '0 auto 3rem' }}>
            <code>npx pearl new my-api</code> scaffolds everything. <code>pearl serve</code> and you&apos;re live.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/docs/getting-started" className="btn btn-primary" style={{ fontSize: '1rem', padding: '.85rem 2.25rem', animation: 'glow 3s ease-in-out infinite' }}>
              Read the docs <span aria-hidden="true">→</span>
            </Link>
            <Link href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '.85rem 2.25rem' }}>
              View on GitHub
            </Link>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            FOOTER
        ───────────────────────────────────────────── */}
        <footer role="contentinfo" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div className="foot-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 2rem 3.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem' }}>

            <div className="foot-brand">
              <Link href="/" aria-label="Pearl.js home" style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.25rem' }}>
                {/* <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>🦪</span> */}
                <img src="/logo.svg" width={28} height={28} alt="Pearl.js" style={{ display: 'block' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-.025em', color: 'var(--text)' }}>
                  Pearl<span style={{ color: 'var(--blue)' }}>.js</span>
                </span>
              </Link>
              <p style={{ fontSize: '.875rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 290, marginBottom: '1.5rem' }}>
                A batteries-included TypeScript framework for Node.js — 11 packages, one install, zero glue.
              </p>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {['MIT', 'v0.2.0', 'Node ≥ 20', 'TypeScript 5+', '11 packages'].map(t => (
                  <span key={t} style={{ ...m, fontSize: '.67rem', color: 'var(--muted)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '.2rem .6rem', borderRadius: 5 }}>{t}</span>
                ))}
              </div>
            </div>

            <nav aria-label="Documentation links">
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--body)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 600 }}>Docs</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[['Getting Started','/docs/getting-started'],['Routing','/docs/routing'],['Authentication','/docs/auth'],['Database','/docs/database'],['Validation','/docs/validation'],['Events','/docs/events'],['Queues','/docs/queue'],['Mail','/docs/mail'],['CLI','/docs/cli']].map(([l,h]) => (
                  <li key={l}><Link href={h} className="foot-link">{l}</Link></li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Project links">
              <p style={{ ...m, fontSize: '.68rem', color: 'var(--body)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 600 }}>Project</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[{l:'GitHub',h:siteConfig.github,ext:true},{l:'npm',h:siteConfig.npm,ext:true},{l:'Changelog',h:'#'},{l:'License',h:'#'}].map(item => (
                  <li key={item.l}>
                    <Link href={item.h} target={item.ext?'_blank':undefined} rel={item.ext?'noopener noreferrer':undefined} aria-label={item.ext?`${item.l} (opens in new tab)`:undefined} className="foot-link">
                      {item.l}
                      {item.ext && <svg aria-hidden="true" width="9" height="9" viewBox="0 0 12 12" fill="none" style={{opacity:.4}}><path d="M2 2h8v8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
            <p style={{ ...m, fontSize: '.77rem', color: 'var(--muted)' }}>© {new Date().getFullYear()} Pearl.js. MIT License.</p>
            <p style={{ fontSize: '.77rem', color: 'var(--muted)' }}>
              Built with ❤️ by{' '}
              <Link href={siteConfig.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--body)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Sharvari Divekar
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}