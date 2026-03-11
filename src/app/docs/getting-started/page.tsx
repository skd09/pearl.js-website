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
        Pearl is a TypeScript framework for Node.js that ships everything you need in one
        install: routing, JWT auth, Drizzle ORM, request validation, BullMQ queues, typed
        events, and mail — all pre-integrated, zero glue required.
      </p>

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li><strong>Node.js</strong> v20 or higher</li>
        <li><strong>TypeScript</strong> v5.4 or higher</li>
        <li><strong>PostgreSQL</strong>, MySQL, or SQLite (for database features)</li>
        <li><strong>Redis</strong> (only needed for queue features)</li>
      </ul>

      <h2 id="scaffold">Scaffold a new project</h2>
      <p>
        The fastest way to get started. One command creates a fully structured project,
        installs dependencies, and generates a <code>.env</code> file for you.
      </p>
      <CodeBlock lang="bash" code={`npx @pearl-framework/cli new my-api\ncd my-api\npearl serve`} />
      <p>
        Your server is now running at <strong>http://localhost:3000</strong>. That's it.
      </p>

      <h2 id="manual">Manual install</h2>
      <p>
        Prefer to wire things up yourself? Install the meta-package — it includes every
        Pearl sub-package in one go:
      </p>
      <CodeBlock lang="bash" code={`npm install @pearl-framework/pearl drizzle-orm zod dotenv`} />

      <h2 id="structure">Project structure</h2>
      <p>After scaffolding, your project looks like this:</p>
      <CodeBlock lang="bash" code={`my-api/\n├── src/\n│   ├── controllers/       # HTTP route handlers\n│   ├── events/            # Domain events\n│   ├── jobs/              # Background jobs\n│   ├── listeners/         # Event listeners\n│   ├── mail/              # Mailable email classes\n│   ├── middleware/        # Custom middleware\n│   ├── schema/            # Drizzle table definitions\n│   ├── providers/\n│   │   └── AppServiceProvider.ts\n│   ├── requests/          # FormRequest validation\n│   └── server.ts          # Entry point\n├── database/\n│   └── migrations/\n├── .env                   # Auto-created and auto-loaded on boot\n├── .env.example\n├── package.json\n└── tsconfig.json`} />

      <h2 id="entry-point">The entry point</h2>
      <p>
        <code>src/server.ts</code> is generated for you by the scaffold. Two important
        things to understand before you change anything:
      </p>
      <ul>
        <li>
          <strong>No <code>import 'dotenv/config'</code> needed.</strong> Pearl loads{' '}
          <code>.env</code> inside <code>app.boot()</code> automatically, before any of
          your service providers run.
        </li>
        <li>
          <strong><code>root: import.meta.dirname</code></strong> tells Pearl where your
          project root is so it can find <code>.env</code> and config files. Don't remove it.
        </li>
      </ul>
      <CodeBlock lang="typescript" filename="src/server.ts" code={`import { Application, HttpKernel, Router } from '@pearl-framework/pearl'\nimport { AppServiceProvider } from './providers/AppServiceProvider.js'\n\nconst app = new Application({ root: import.meta.dirname })\napp.register(AppServiceProvider)\nawait app.boot()  // .env loaded here, all providers booted\n\nconst router = new Router()\n\nrouter.get('/', (ctx) =>\n  ctx.response.json({ message: 'Welcome to Pearl 🦪' })\n)\n\nawait new HttpKernel()\n  .useRouter(router)\n  .listen(Number(process.env.PORT ?? 3000))\n\nconsole.log('🦪 Pearl running on http://localhost:3000')`} />

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
          Do not call <code>make()</code> here — other providers may not have registered yet.
        </li>
        <li>
          <code>boot()</code> — called after all providers are registered and{' '}
          <code>.env</code> is loaded. Safe for async work like opening DB connections.
        </li>
      </ul>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { ServiceProvider, DatabaseManager } from '@pearl-framework/pearl'\n\nexport class AppServiceProvider extends ServiceProvider {\n  register(): void {\n    // Bind DatabaseManager as a singleton — constructed once, reused everywhere\n    this.container.singleton(DatabaseManager, () =>\n      new DatabaseManager({\n        driver:   'postgres',\n        host:     process.env.DB_HOST     ?? 'localhost',\n        port:     Number(process.env.DB_PORT ?? 5432),\n        user:     process.env.DB_USER     ?? 'postgres',\n        password: process.env.DB_PASSWORD ?? '',\n        database: process.env.DB_NAME     ?? 'my_api',\n      })\n    )\n  }\n\n  override async boot(): Promise<void> {\n    // .env is loaded by this point — safe to read env vars and connect\n    await this.container.make(DatabaseManager).connect()\n  }\n}`} />

      <h2 id="env">Environment variables</h2>
      <p>
        The scaffold creates a <code>.env</code> from <code>.env.example</code>. Edit it
        before starting the server:
      </p>
      <CodeBlock lang="bash" filename=".env" code={`APP_NAME=my-api\nPORT=3000\n\n# Database\nDB_HOST=localhost\nDB_PORT=5432\nDB_USER=postgres\nDB_PASSWORD=secret\nDB_NAME=my_api\n\n# Redis — only needed if you use queues\nREDIS_HOST=localhost\nREDIS_PORT=6379\n\n# Generate with: openssl rand -base64 32\nJWT_SECRET=change-this-in-production`} />

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