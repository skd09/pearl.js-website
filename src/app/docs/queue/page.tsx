import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Queues — Pearl.js',
  description: 'Run background jobs with Redis-backed queues in Pearl.js.',
}

export default function QueuePage() {
  return (
    <>
      <h1>Queues</h1>
      <p>
        Queues let you offload slow or unreliable work — sending emails, processing uploads,
        generating reports — to a background worker so your HTTP response returns immediately.
        Pearl's queue system is powered by{' '}
        <a href="https://docs.bullmq.io" target="_blank" rel="noopener noreferrer">BullMQ</a>{' '}
        and backed by Redis.
      </p>

      <h2 id="setup">Setup</h2>
      <p>
        Register <code>QueueManager</code> in your service provider:
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { QueueManager } from '@pearl-framework/pearl'\n\n// Inside register():\nthis.container.singleton(QueueManager, () =>\n  new QueueManager({\n    connection: {\n      host: process.env.REDIS_HOST ?? 'localhost',\n      port: Number(process.env.REDIS_PORT ?? 6379),\n    },\n    workers: [\n      { queue: 'default', concurrency: 5 },\n      { queue: 'mail',    concurrency: 2 },\n    ],\n  })\n)`} />

      <h2 id="create-job">Create a job</h2>
      <p>Generate one with the CLI:</p>
      <CodeBlock lang="bash" code={`pearl make:job SendWelcomeEmailJob\n# → src/jobs/SendWelcomeEmailJob.ts`} />
      <p>
        <strong>Important:</strong> Job payload must be plain public properties — not
        constructor arguments. The worker reconstructs jobs using <code>new JobClass()</code>{' '}
        and then restores data via <code>Object.assign</code>. Constructor arguments are
        lost after serialization.
      </p>
      <CodeBlock lang="typescript" filename="src/jobs/SendWelcomeEmailJob.ts" code={`import { Job } from '@pearl-framework/pearl'\n\nexport class SendWelcomeEmailJob extends Job {\n  readonly queue   = 'mail'\n  get tries()      { return 3 }\n  get retryDelay() { return 2_000 }  // ms — doubles on each retry\n\n  // ✅ Payload as plain properties\n  userId!: number\n\n  async handle(): Promise<void> {\n    const user = await User.find(db, this.userId)\n    if (!user) return\n    await mailer.send(new WelcomeMail(user))\n  }\n\n  async failed(error: Error): Promise<void> {\n    // Called when all retry attempts are exhausted\n    console.error(\`SendWelcomeEmailJob failed for user \${this.userId}:\`, error.message)\n  }\n}`} />

      <h2 id="dispatch">Dispatch a job</h2>
      <p>
        Resolve <code>QueueManager</code> from the container and call{' '}
        <code>dispatch()</code>. The job runs in a background worker — your route handler
        returns immediately:
      </p>
      <CodeBlock lang="typescript" code={`const queue = app.container.make(QueueManager)\n\n// Dispatch immediately\nconst job = new SendWelcomeEmailJob()\njob.userId = user.id\nawait queue.dispatch(job)\n\n// Dispatch with a delay (runs in 5 seconds)\nawait queue.dispatchAfter(job, 5_000)\n\n// Dispatch multiple jobs at once\nawait queue.dispatchBulk([\n  Object.assign(new SendWelcomeEmailJob(), { userId: 1 }),\n  Object.assign(new SendWelcomeEmailJob(), { userId: 2 }),\n])`} />

      <h2 id="multiple-queues">Multiple queues</h2>
      <p>
        Set <code>readonly queue</code> on a job to route it to a dedicated worker.
        Use this to isolate slow or high-priority work:
      </p>
      <CodeBlock lang="typescript" code={`// High-priority — 10 concurrent workers\nexport class ProcessPayment extends Job {\n  readonly queue = 'critical'\n  paymentId!: number\n  async handle() { /* ... */ }\n}\n\n// Low-priority — 1 worker\nexport class GenerateReport extends Job {\n  readonly queue = 'reports'\n  reportId!: number\n  async handle() { /* ... */ }\n}`} />
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`workers: [\n  { queue: 'default',  concurrency: 5  },\n  { queue: 'critical', concurrency: 10 },\n  { queue: 'reports',  concurrency: 1  },\n]`} />

      <h2 id="custom-options">Custom BullMQ options</h2>
      <p>
        Override <code>jobOptions</code> on a job class for full control over BullMQ
        options — backoff strategy, priority, retention, and more:
      </p>
      <CodeBlock lang="typescript" code={`import type { JobsOptions } from 'bullmq'\n\nexport class ProcessReport extends Job {\n  readonly queue = 'reports'\n  reportId!: number\n\n  get jobOptions(): JobsOptions {\n    return {\n      attempts:         5,\n      backoff:          { type: 'fixed', delay: 30_000 },\n      removeOnComplete: true,\n      removeOnFail:     false,  // keep failed jobs for inspection\n      priority:         10,\n    }\n  }\n\n  async handle(): Promise<void> {\n    await generateReport(this.reportId)\n  }\n}`} />
    </>
  )
}