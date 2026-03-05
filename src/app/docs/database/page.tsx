import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Database — Pearl.js',
  description: 'Connect to Postgres, MySQL, or SQLite with Drizzle ORM in Pearl.js.',
}

export default function DatabasePage() {
  return (
    <>
      <h1>Database</h1>
      <p>
        Pearl uses{' '}
        <a href="https://orm.drizzle.team" target="_blank" rel="noopener noreferrer">
          Drizzle ORM
        </a>{' '}
        under the hood, wrapped in a <code>DatabaseManager</code> that lives in Pearl's IoC
        container. Define tables as TypeScript, query with full type safety and autocomplete,
        and manage schema changes with plain SQL migrations.
      </p>

      <h2 id="drivers">Supported databases</h2>
      <table>
        <thead><tr><th>Database</th><th>Driver package</th><th>Config value</th></tr></thead>
        <tbody>
          <tr><td>PostgreSQL</td><td><code>pg</code></td><td><code>driver: 'postgres'</code></td></tr>
          <tr><td>MySQL</td><td><code>mysql2</code></td><td><code>driver: 'mysql'</code></td></tr>
          <tr><td>SQLite</td><td><code>better-sqlite3</code></td><td><code>driver: 'sqlite'</code></td></tr>
        </tbody>
      </table>

      <h2 id="setup">Setup</h2>
      <p>
        Register <code>DatabaseManager</code> in your service provider. In{' '}
        <code>register()</code> you define the connection config; in <code>boot()</code> you
        actually open the connection (it's async, so it has to happen there).
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { ServiceProvider, DatabaseManager } from '@pearl-framework/pearl'

export class AppServiceProvider extends ServiceProvider {
  register(): void {
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
    // .env is loaded by now — safe to connect
    await this.container.make(DatabaseManager).connect()
  }
}`} />

      <h2 id="schema">Defining a schema</h2>
      <p>
        Each table is a TypeScript file in <code>src/models/</code>. Use the Drizzle column
        builders re-exported from <code>@pearl-framework/pearl</code>. The scaffold generates
        a <code>User</code> model for you:
      </p>
      <CodeBlock lang="typescript" filename="src/models/User.ts" code={`import { pgTable, serial, varchar, timestamp } from '@pearl-framework/pearl'

export const users = pgTable('users', {
  id:           serial('id').primaryKey(),
  name:         varchar('name',          { length: 255 }).notNull(),
  email:        varchar('email',         { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
})`} />
      <p>Add your own models alongside it:</p>
      <CodeBlock lang="typescript" filename="src/models/Post.ts" code={`import { pgTable, serial, text, integer, boolean, timestamp } from '@pearl-framework/pearl'
import { users } from './User.js'

export const posts = pgTable('posts', {
  id:        serial('id').primaryKey(),
  title:     text('title').notNull(),
  content:   text('content').notNull(),
  published: boolean('published').notNull().default(false),
  userId:    integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})`} />

      <h2 id="querying">Querying</h2>
      <p>
        Inject <code>DatabaseManager</code> into your controller (or resolve it from the
        container). Access the Drizzle instance via <code>db.db</code>.
      </p>
      <CodeBlock lang="typescript" code={`import { eq } from '@pearl-framework/pearl'

// The db here comes from constructor injection in a controller,
// or: const db = app.container.make(DatabaseManager)

// Select all rows
const allPosts = await db.db.select().from(posts)

// Select one row by id
const [post] = await db.db
  .select().from(posts).where(eq(posts.id, 1))

// Insert and get the new row back
const [newPost] = await db.db
  .insert(posts)
  .values({ title: 'Hello', content: 'World', userId: 1 })
  .returning()

// Update
await db.db
  .update(posts)
  .set({ title: 'Updated' })
  .where(eq(posts.id, 1))

// Delete
await db.db.delete(posts).where(eq(posts.id, 1))`} />

      <h2 id="migrations">Migrations</h2>
      <p>
        Pearl uses plain SQL migration files. Generate a new file with the CLI — it's
        timestamped and placed in <code>database/migrations/</code>:
      </p>
      <CodeBlock lang="bash" code={`pearl make:migration create_posts_table
# → database/migrations/20260101_create_posts_table.sql`} />
      <p>Write your SQL in the generated file:</p>
      <CodeBlock lang="sql" filename="database/migrations/20260101_create_posts_table.sql" code={`CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL      PRIMARY KEY,
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  published  BOOLEAN     NOT NULL DEFAULT FALSE,
  user_id    INTEGER     NOT NULL REFERENCES users(id),
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);`} />
      <p>
        Run migrations directly against your database using <code>psql</code> or your
        preferred migration tool. Pearl does not auto-run migrations on boot.
      </p>
    </>
  )
}