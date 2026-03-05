import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Getting Started',
  description: 'Install Pearl.js and scaffold your first TypeScript API in under a minute.',
}

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>Pearl.js is a batteries-included TypeScript framework for Node.js. One package gives you routing, authentication, database, queues, mail, events, and a CLI — all with clean architecture baked in.</p>

      <h2 id="installation">Installation</h2>
      <p>The fastest way to start is with the CLI:</p>
      <CodeBlock lang="bash" code={`npx @pearl-framework/cli new my-app\ncd my-app\nnpm run dev`} />

      <p>Or install manually:</p>
      <CodeBlock lang="bash" code={`npm install @pearl-framework/pearl drizzle-orm zod dotenv`} />

      <h2 id="requirements">Requirements</h2>
      <ul>
        <li><strong>Node.js</strong> v18 or higher</li>
        <li><strong>TypeScript</strong> v5.4 or higher</li>
        <li><strong>PostgreSQL</strong>, MySQL, or SQLite (for database features)</li>
        <li><strong>Redis</strong> (for queue features)</li>
      </ul>

      <h2 id="quick-start">Quick Start</h2>
      <p>After scaffolding, your project looks like this:</p>
      <CodeBlock lang="bash" filename="project structure" code={`my-app/
├── config/
├── database/
│   └── migrations/
├── src/
│   ├── controllers/
│   ├── events/
│   ├── jobs/
│   ├── listeners/
│   ├── mail/
│   ├── middleware/
│   ├── models/
│   ├── providers/
│   │   └── AppServiceProvider.ts
│   ├── requests/
│   └── server.ts
├── .env
└── package.json`} />

      <CodeBlock lang="typescript" filename="src/server.ts" code={`import 'dotenv/config'
import { Application } from '@pearl-framework/pearl'
import { Router, HttpKernel } from '@pearl-framework/pearl'
import { AppServiceProvider } from './providers/AppServiceProvider.js'

const app = new Application()
app.register(AppServiceProvider)
await app.boot()

const router = new Router()

router.get('/', async (ctx) => {
  ctx.response.json({ message: 'Welcome to Pearl 🦪' })
})

const kernel = new HttpKernel()
kernel.useRouter(router)
await kernel.listen(Number(process.env.PORT ?? 3000))
console.log('🦪 Pearl running on http://localhost:3000')`} />

      <h2 id="environment">Environment</h2>
      <CodeBlock lang="bash" filename=".env" code={`APP_NAME=my-app
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=my-app

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=change-this-to-a-long-random-secret`} />

      <h2 id="next-steps">Next steps</h2>
      <ul>
        <li>Learn how to define <a href="/docs/routing">routes and handle requests</a></li>
        <li>Set up your <a href="/docs/database">database schema</a> with Drizzle ORM</li>
        <li>Add <a href="/docs/auth">JWT authentication</a> in minutes</li>
      </ul>
    </>
  )
}
