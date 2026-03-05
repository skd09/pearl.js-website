import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Getting Started — Pearl.js',
  description: 'Install Pearl.js and build your first TypeScript API in minutes.',
}

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Pearl is a batteries-included TypeScript framework for Node.js. One install gives
        you routing, JWT auth, Drizzle ORM, request validation, BullMQ queues, typed events,
        and mail — all wired together, zero glue required.
      </p>

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li><strong>Node.js</strong> v18 or higher</li>
        <li><strong>TypeScript</strong> v5.4 or higher</li>
        <li><strong>PostgreSQL</strong>, MySQL, or SQLite (for database features)</li>
        <li><strong>Redis</strong> (only needed for queue features)</li>
      </ul>

      <h2 id="scaffold">Scaffold a new project</h2>
      <p>
        The fastest way to get started. One command creates a fully structured project,
        installs dependencies, and generates a <code>.env</code> file for you.
      </p>
      <CodeBlock lang="bash" code={`npx pearl new my-api
cd my-api
pearl serve`} />
      <p>
        Your server is now running at <strong>http://localhost:3000</strong>. That's it.
      </p>

      <h2 id="manual">Manual install</h2>
      <p>
        Prefer to wire things up yourself? Install the meta-package — it includes every
        Pearl sub-package in one go:
      </p>
      <CodeBlock lang="bash" code={`npm install @pearl-framework/pearl`} />

      <h2 id="structure">Project structure</h2>
      <p>After scaffolding, your project looks like this:</p>
      <CodeBlock lang="bash" code={`my-api/
├── src/
│   ├── controllers/       # HTTP route handlers
│   ├── events/            # Domain events
│   ├── jobs/              # Background jobs
│   ├── listeners/         # Event listeners
│   ├── mail/              # Mailable email classes
│   ├── middleware/        # Custom middleware
│   ├── models/            # Drizzle ORM schemas
│   ├── providers/
│   │   └── AppServiceProvider.ts
│   ├── requests/          # FormRequest validation
│   ├── routes/
│   │   └── api.ts
│   └── main.ts            # Entry point
├── database/
│   └── migrations/
├── .env                   # Auto-created and auto-loaded on boot
├── .env.example
├── package.json
└── tsconfig.json`} />

      <h2 id="entry-point">The entry point</h2>
      <p>
        <code>src/main.ts</code> is generated for you by the scaffold. Two important things
        to understand before you change anything:
      </p>
      <ul>
        <li>
          <strong>No <code>import 'dotenv/config'</code> needed.</strong> Pearl calls{' '}
          <code>loadDotenv(root)</code> inside <code>app.boot()</code> automatically. Your{' '}
          <code>.env</code> is loaded before any of your service providers run.
        </li>
        <li>
          <strong><code>root: import.meta.dirname</code></strong> tells Pearl where your
          project root is so it can find <code>.env</code> and config files. Don't remove it.
        </li>
      </ul>
      <CodeBlock lang="typescript" filename="src/main.ts" code={`import { Application, HttpKernel, Router } from '@pearl-framework/pearl'
import { AppServiceProvider } from './providers/AppServiceProvider.js'

// Passing the current directory as root.
// Pearl will find and load .env automatically — no dotenv import needed.
const app = new Application({ root: import.meta.dirname })
app.register(AppServiceProvider)
await app.boot()  // .env loaded here, all providers booted

const router = new Router()

router.get('/', ctx =>
  ctx.response.json({ message: 'Welcome to Pearl 🦪' })
)

await new HttpKernel()
  .useRouter(router)
  .listen(Number(process.env.PORT ?? 3000))

console.log('🦪 Pearl running on http://localhost:3000')`} />

      <h2 id="service-providers">Service providers</h2>
      <p>
        A <strong>service provider</strong> is where you register services into Pearl's IoC
        container — your database, auth guards, queue manager, and anything else your app
        needs. The scaffold generates one at{' '}
        <code>src/providers/AppServiceProvider.ts</code>.
      </p>
      <p>Each provider has two lifecycle methods:</p>
      <ul>
        <li>
          <code>register()</code> — bind services into the container. Must be synchronous.
          Runs before <code>.env</code> is loaded, so don't do async work here.
        </li>
        <li>
          <code>boot()</code> — called after all providers are registered and{' '}
          <code>.env</code> is loaded. Safe for async work like opening DB connections.
        </li>
      </ul>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { ServiceProvider, DatabaseManager } from '@pearl-framework/pearl'

export class AppServiceProvider extends ServiceProvider {
  register(): void {
    // Bind DatabaseManager as a singleton — built once, reused everywhere
    this.container.singleton(DatabaseManager, () =>
      new DatabaseManager({
        driver:   'postgres',
        host:     process.env.DB_HOST     ?? 'localhost',
        port:     Number(process.env.DB_PORT ?? 5432),
        user:     process.env.DB_USER     ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME     ?? 'my_api',
      })
    )
  }

  override async boot(): Promise<void> {
    // .env is loaded by this point — safe to read env vars and connect
    await this.container.make(DatabaseManager).connect()
  }
}`} />

      <h2 id="env">Environment variables</h2>
      <p>
        The scaffold creates a <code>.env</code> from <code>.env.example</code>. Edit it
        before starting the server:
      </p>
      <CodeBlock lang="bash" filename=".env" code={`APP_NAME=my-api
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=my_api

# Redis — only needed if you use queues
REDIS_HOST=localhost
REDIS_PORT=6379

# Change this to a long random string in production
JWT_SECRET=change-this-in-production`} />

      <h2 id="next-steps">Next steps</h2>
      <ul>
        <li>Define your first <a href="/docs/routing">routes</a></li>
        <li>Organise handlers into <a href="/docs/controllers">controllers</a></li>
        <li>Set up your <a href="/docs/database">database schema</a> with Drizzle ORM</li>
        <li>Add <a href="/docs/auth">JWT authentication</a></li>
        <li>Validate incoming requests with <a href="/docs/validation">FormRequest</a></li>
        <li>Offload slow work to <a href="/docs/queue">background queues</a></li>
      </ul>
    </>
  )
}