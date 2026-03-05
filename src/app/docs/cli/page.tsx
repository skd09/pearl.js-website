import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'CLI — Pearl.js',
  description: 'Scaffold projects and generate code with the Pearl CLI.',
}

export default function CliPage() {
  return (
    <>
      <h1>CLI</h1>
      <p>
        The Pearl CLI scaffolds new projects and generates boilerplate files so you can skip
        the repetitive setup and focus on your application logic. Every generated file follows
        the same conventions — correctly placed, correctly named, ready to fill in.
      </p>

      <h2 id="install">Install</h2>
      <p>
        Use it via <code>npx</code> without installing, or install globally to use{' '}
        <code>pearl</code> as a command:
      </p>
      <CodeBlock lang="bash" code={`# No install needed
npx pearl new my-api

# Or install globally
npm install -g @pearl-framework/cli
pearl new my-api`} />

      <h2 id="commands">Commands</h2>
      <table>
        <thead><tr><th>Command</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td><code>pearl new &lt;name&gt;</code></td><td>Scaffold a complete new project</td></tr>
          <tr><td><code>pearl serve</code></td><td>Start a hot-reload dev server</td></tr>
          <tr><td><code>pearl migrate</code></td><td>Run pending SQL migrations</td></tr>
          <tr><td><code>pearl make:controller &lt;Name&gt;</code></td><td>Generate a controller class</td></tr>
          <tr><td><code>pearl make:model &lt;Name&gt;</code></td><td>Generate a model with Drizzle schema</td></tr>
          <tr><td><code>pearl make:middleware &lt;Name&gt;</code></td><td>Generate a middleware function</td></tr>
          <tr><td><code>pearl make:request &lt;Name&gt;</code></td><td>Generate a FormRequest validation class</td></tr>
          <tr><td><code>pearl make:event &lt;Name&gt;</code></td><td>Generate an event class</td></tr>
          <tr><td><code>pearl make:listener &lt;Name&gt;</code></td><td>Generate a listener class</td></tr>
          <tr><td><code>pearl make:job &lt;Name&gt;</code></td><td>Generate a background job class</td></tr>
          <tr><td><code>pearl make:mail &lt;Name&gt;</code></td><td>Generate a Mailable email class</td></tr>
          <tr><td><code>pearl make:migration &lt;name&gt;</code></td><td>Generate a timestamped SQL migration file</td></tr>
        </tbody>
      </table>

      <h2 id="new-project">Scaffold a new project</h2>
      <p>
        <code>pearl new</code> creates a full project structure, installs dependencies, and
        generates a <code>.env</code> from <code>.env.example</code>:
      </p>
      <CodeBlock lang="bash" code={`npx pearl new my-api
cd my-api

# Edit .env with your database and Redis credentials
# then start the dev server:
pearl serve`} />

      <h2 id="generators">Generator examples</h2>
      <p>
        All generators follow the same pattern — PascalCase name, correct directory,
        correct file extension:
      </p>
      <CodeBlock lang="bash" code={`pearl make:controller PostController
# → src/controllers/PostController.ts

pearl make:model Post
# → src/models/Post.ts  (includes Drizzle schema)

pearl make:request CreatePostRequest
# → src/requests/CreatePostRequest.ts

pearl make:event UserRegisteredEvent
# → src/events/UserRegisteredEvent.ts

pearl make:listener SendWelcomeEmailListener
# → src/listeners/SendWelcomeEmailListener.ts

pearl make:job SendWelcomeEmailJob
# → src/jobs/SendWelcomeEmailJob.ts

pearl make:mail WelcomeMail
# → src/mail/WelcomeMail.ts

pearl make:migration create_posts_table
# → database/migrations/20260101_create_posts_table.sql`} />

      <h2 id="serve">Dev server</h2>
      <p>
        <code>pearl serve</code> starts your app with hot reload — any change to a{' '}
        <code>.ts</code> file restarts the server automatically:
      </p>
      <CodeBlock lang="bash" code={`pearl serve
# 🦪 Pearl running on http://localhost:3000
# Watching for changes...`} />
    </>
  )
}