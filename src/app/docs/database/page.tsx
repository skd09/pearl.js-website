import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Database',
  description: 'Connect to Postgres, MySQL, or SQLite with Drizzle ORM in Pearl.js.',
}

export default function DatabasePage() {
  return (
    <>
      <h1>Database</h1>
      <p>Pearl uses <a href="https://orm.drizzle.team" target="_blank" rel="noopener noreferrer">Drizzle ORM</a> via <code>DatabaseManager</code>. Define schemas, run SQL migrations, and query with a fully typed ORM.</p>

      <h2>Configuration</h2>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { ServiceProvider, DatabaseManager } from '@pearl-framework/pearl'

export class AppServiceProvider extends ServiceProvider {
  register(): void {
    this.container.singleton(DatabaseManager, () => new DatabaseManager({
      driver:   'postgres',
      host:     process.env.DB_HOST     ?? 'localhost',
      port:     Number(process.env.DB_PORT ?? 5432),
      user:     process.env.DB_USER     ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME     ?? 'myapp',
    }))
  }

  override async boot(): Promise<void> {
    await this.container.make(DatabaseManager).connect()
  }
}`} />

      <h2>Supported drivers</h2>
      <table>
        <thead><tr><th>Driver</th><th>Package</th><th>Config key</th></tr></thead>
        <tbody>
          <tr><td>PostgreSQL</td><td><code>pg</code></td><td><code>driver: 'postgres'</code></td></tr>
          <tr><td>MySQL</td><td><code>mysql2</code></td><td><code>driver: 'mysql'</code></td></tr>
          <tr><td>SQLite</td><td><code>better-sqlite3</code></td><td><code>driver: 'sqlite'</code></td></tr>
        </tbody>
      </table>

      <h2>Defining a schema</h2>
      <CodeBlock lang="typescript" filename="src/models/User.ts" code={`import { pgTable, serial, varchar, timestamp } from '@pearl-framework/pearl'

export const users = pgTable('users', {
  id:           serial('id').primaryKey(),
  name:         varchar('name', { length: 255 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
})`} />

      <h2>Querying</h2>
      <CodeBlock lang="typescript" code={`import { eq } from '@pearl-framework/pearl'

const db = this.container.make(DatabaseManager)

// Select all
const all = await db.db.select().from(users)

// Select by id
const [user] = await db.db.select().from(users).where(eq(users.id, 1))

// Insert
const [newUser] = await db.db
  .insert(users)
  .values({ name: 'Alice', email: 'alice@example.com', passwordHash: '...' })
  .returning()

// Update
await db.db.update(users).set({ name: 'Alice Smith' }).where(eq(users.id, 1))

// Delete
await db.db.delete(users).where(eq(users.id, 1))`} />

      <h2>Migrations</h2>
      <CodeBlock lang="bash" code={`npx pearl make:migration create_users_table`} />
      <CodeBlock lang="sql" filename="database/migrations/20260101_create_users_table.sql" code={`CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);`} />
      <p>Run migrations manually against your database — Pearl does not auto-run migrations on boot.</p>
    </>
  )
}
