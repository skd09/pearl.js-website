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
        and manage schema changes with Drizzle Kit migrations.
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
        open the connection (it's async, so it has to happen there). Set{' '}
        <code>runMigrationsOnBoot: true</code> to apply pending migrations automatically on
        startup.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { ServiceProvider, DatabaseManager } from '@pearl-framework/pearl'\nimport { DrizzleAdapter } from '@pearl-framework/database'\n\nexport class AppServiceProvider extends ServiceProvider {\n  register(): void {\n    this.container.singleton(DatabaseManager, () =>\n      new DatabaseManager(new DrizzleAdapter({\n        driver:   'postgres',\n        host:     process.env.DB_HOST     ?? 'localhost',\n        port:     Number(process.env.DB_PORT ?? 5432),\n        user:     process.env.DB_USER     ?? 'postgres',\n        password: process.env.DB_PASSWORD ?? '',\n        database: process.env.DB_NAME     ?? 'my_api',\n        migrationsFolder:    './database/migrations',\n        runMigrationsOnBoot: true,  // apply pending migrations on startup\n      }))\n    )\n  }\n\n  override async boot(): Promise<void> {\n    await this.container.make(DatabaseManager).connect()\n  }\n}`} />

      <h2 id="schema">Defining a schema</h2>
      <p>
        Table definitions live in <code>src/schema/</code>. All column helpers are
        re-exported from <code>@pearl-framework/pearl</code> — no need to import from{' '}
        <code>drizzle-orm</code> directly.
      </p>
      <CodeBlock lang="typescript" filename="src/schema/users.ts" code={`import { pgTable, serial, varchar, text, boolean, timestamp } from '@pearl-framework/pearl'\n\nexport const users = pgTable('users', {\n  id:        serial('id').primaryKey(),\n  name:      varchar('name',  { length: 255 }).notNull(),\n  email:     varchar('email', { length: 255 }).notNull().unique(),\n  password:  text('password').notNull(),\n  active:    boolean('active').default(true),\n  createdAt: timestamp('created_at').defaultNow().notNull(),\n})`} />
      <CodeBlock lang="typescript" filename="src/schema/posts.ts" code={`import { pgTable, serial, text, integer, boolean, timestamp } from '@pearl-framework/pearl'\nimport { users } from './users.js'\n\nexport const posts = pgTable('posts', {\n  id:        serial('id').primaryKey(),\n  title:     text('title').notNull(),\n  content:   text('content').notNull(),\n  published: boolean('published').notNull().default(false),\n  userId:    integer('user_id').references(() => users.id).notNull(),\n  createdAt: timestamp('created_at').defaultNow().notNull(),\n})`} />

      <h2 id="querying">Querying</h2>
      <p>
        Inject <code>DatabaseManager</code> into your controller and access the Drizzle
        instance via <code>db.db</code>. All common Drizzle query operators are re-exported
        from <code>@pearl-framework/pearl</code>.
      </p>
      <CodeBlock lang="typescript" code={`import { eq, and, desc, like } from '@pearl-framework/pearl'\n\n// Select all rows\nconst allPosts = await db.db.select().from(posts)\n\n// Select with filter + sort + limit\nconst recent = await db.db\n  .select()\n  .from(posts)\n  .where(and(eq(posts.published, true), like(posts.title, '%Pearl%')))\n  .orderBy(desc(posts.createdAt))\n  .limit(10)\n\n// Insert and return the new row\nconst [post] = await db.db\n  .insert(posts)\n  .values({ title: 'Hello', content: 'World', userId: 1 })\n  .returning()\n\n// Update\nawait db.db\n  .update(posts)\n  .set({ title: 'Updated' })\n  .where(eq(posts.id, 1))\n\n// Delete\nawait db.db.delete(posts).where(eq(posts.id, 1))`} />

      <h2 id="migrations">Migrations</h2>
      <p>
        Pearl uses Drizzle Kit for migrations. Generate a migration from your schema
        changes, then apply it:
      </p>
      <CodeBlock lang="bash" code={`# Generate a migration from schema changes\nnpx drizzle-kit generate --schema=./src/schema\n\n# Apply pending migrations\nnpx drizzle-kit migrate\n# or via pearl CLI:\npearl migrate`} />
      <p>
        Migrations also run automatically on <code>app.boot()</code> when{' '}
        <code>runMigrationsOnBoot: true</code> is set in your config.
      </p>

      <h2 id="re-exports">Re-exported Drizzle helpers</h2>
      <p>
        These are all available directly from <code>@pearl-framework/pearl</code>:
      </p>
      <CodeBlock lang="typescript" code={`import {\n  // Column types (PostgreSQL)\n  pgTable, serial, varchar, text, boolean,\n  integer, bigserial, timestamp, date, jsonb, uuid,\n\n  // Query operators\n  eq, ne, gt, gte, lt, lte,\n  and, or, not,\n  isNull, isNotNull,\n  inArray, notInArray,\n  like, ilike,\n\n  // Utilities\n  sql, count, asc, desc,\n} from '@pearl-framework/pearl'`} />
    </>
  )
}