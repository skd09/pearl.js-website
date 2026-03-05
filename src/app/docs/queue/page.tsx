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
        Register <code>QueueManager</code> in your service provider. You only need Redis
        running — no other config required:
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { QueueManager } from '@pearl-framework/pearl'

// Inside register():
this.container.singleton(QueueManager, () =>
  new QueueManager({
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
    defaultQueue: 'default',
    prefix:       'my-api',  // namespaces your queue keys in Redis
  })
)`} />

      <h2 id="create-job">Create a job</h2>
      <p>
        A job is a class with a <code>handle()</code> method that receives the payload you
        dispatch. Generate one with the CLI:
      </p>
      <CodeBlock lang="bash" code={`pearl make:job SendWelcomeEmailJob
# → src/jobs/SendWelcomeEmailJob.ts`} />
      <CodeBlock lang="typescript" filename="src/jobs/SendWelcomeEmailJob.ts" code={`import { Job } from '@pearl-framework/pearl'
import { Mailer, SmtpTransport } from '@pearl-framework/pearl'
import { WelcomeMail } from '../mail/WelcomeMail.js'

export class SendWelcomeEmailJob extends Job {
  async handle(payload: { userId: number; email: string }): Promise<void> {
    const mailer = new Mailer({
      from:      { address: 'noreply@myapp.com', name: 'My App' },
      transport: new SmtpTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      }),
    })
    await mailer.send(new WelcomeMail(payload.email))
  }
}`} />

      <h2 id="dispatch">Dispatch a job</h2>
      <p>
        Call <code>queue.dispatch()</code> with the queue name, job class name, and payload.
        The job runs asynchronously in a background worker — your route handler returns
        immediately:
      </p>
      <CodeBlock lang="typescript" code={`const queue = app.container.make(QueueManager)

await queue.dispatch('default', {
  job:     'SendWelcomeEmailJob',
  payload: { userId: user.id, email: user.email },
})

// Returns immediately — job runs in the background`} />

      <h2 id="delay">Delayed jobs</h2>
      <p>
        Pass a <code>delay</code> in milliseconds to schedule a job to run in the future:
      </p>
      <CodeBlock lang="typescript" code={`// Run 1 hour from now
await queue.dispatch('default', {
  job:     'SendReminderJob',
  payload: { userId: user.id },
  delay:   60 * 60 * 1000,
})

// Run in 24 hours
await queue.dispatch('default', {
  job:     'SendFollowUpJob',
  payload: { userId: user.id },
  delay:   24 * 60 * 60 * 1000,
})`} />

      <h2 id="retries">Retries</h2>
      <p>
        Jobs that throw an error are automatically retried by BullMQ. Configure the number
        of attempts when dispatching:
      </p>
      <CodeBlock lang="typescript" code={`await queue.dispatch('default', {
  job:      'ProcessPaymentJob',
  payload:  { orderId: 42 },
  attempts: 3,  // try up to 3 times before marking as failed
})`} />
    </>
  )
}