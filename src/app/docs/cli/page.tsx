import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'CLI',
  description: 'Use the Pearl CLI to scaffold and generate code.',
}

export default function CliPage() {
  return (
    <>
      <h1>CLI</h1>
      <p>The Pearl CLI scaffolds new projects and generates boilerplate so you can focus on your application logic.</p>

      <h2>Installation</h2>
      <CodeBlock lang="bash" code={`# Use via npx (no install required)
npx @pearl-framework/cli new my-app

# Or install globally
npm install -g @pearl-framework/cli
pearl new my-app`} />

      <h2>Commands</h2>
      <table>
        <thead><tr><th>Command</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>pearl new &lt;name&gt;</code></td><td>Scaffold a new Pearl app</td></tr>
          <tr><td><code>pearl make:controller &lt;Name&gt;</code></td><td>Generate a controller</td></tr>
          <tr><td><code>pearl make:model &lt;Name&gt;</code></td><td>Generate a model + schema</td></tr>
          <tr><td><code>pearl make:middleware &lt;Name&gt;</code></td><td>Generate middleware</td></tr>
          <tr><td><code>pearl make:request &lt;Name&gt;</code></td><td>Generate a FormRequest</td></tr>
          <tr><td><code>pearl make:event &lt;Name&gt;</code></td><td>Generate an event class</td></tr>
          <tr><td><code>pearl make:listener &lt;Name&gt;</code></td><td>Generate a listener</td></tr>
          <tr><td><code>pearl make:job &lt;Name&gt;</code></td><td>Generate a queue job</td></tr>
          <tr><td><code>pearl make:mail &lt;Name&gt;</code></td><td>Generate a Mailable</td></tr>
          <tr><td><code>pearl make:migration &lt;name&gt;</code></td><td>Generate a SQL migration</td></tr>
        </tbody>
      </table>

      <h2>Scaffolding a new app</h2>
      <CodeBlock lang="bash" code={`npx @pearl-framework/cli new my-blog-api
cd my-blog-api
cp .env.example .env   # configure your DB + Redis
npm run dev`} />

      <h2>Generator examples</h2>
      <CodeBlock lang="bash" code={`pearl make:controller UserController
# → src/controllers/UserController.ts

pearl make:model Post
# → src/models/Post.ts (with drizzle schema)

pearl make:job SendEmailJob
# → src/jobs/SendEmailJob.ts

pearl make:migration add_published_to_posts
# → database/migrations/<timestamp>_add_published_to_posts.sql`} />
    </>
  )
}
