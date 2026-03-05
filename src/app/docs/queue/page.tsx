import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Queues',
  description: 'Redis-backed background job queues in Pearl.js.',
}

export default function QueuePage() {
  return (
    <>
      <h1>Queues</h1>
      <p>Pearl provides Redis-backed job queues for offloading slow work — email sending, notifications, report generation — to background workers.</p>

      <h2>Setup</h2>
      <CodeBlock lang="typescript" code={`this.container.singleton(QueueManager, () => new QueueManager({
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
  defaultQueue: 'default',
  prefix: 'myapp',
}))`} />

      <h2>Creating a job</h2>
      <CodeBlock lang="typescript" filename="src/jobs/SendWelcomeEmailJob.ts" code={`import { Job } from '@pearl-framework/pearl'
import { Mailer, LogTransport } from '@pearl-framework/pearl'
import { WelcomeMail } from '../mail/WelcomeMail.js'

export class SendWelcomeEmailJob extends Job {
  async handle(payload: { userId: number; email: string }): Promise<void> {
    const mailer = new Mailer({
      from: { address: 'noreply@myapp.com', name: 'My App' },
      transport: new LogTransport(),
    })
    await mailer.send(new WelcomeMail(payload.email))
  }
}`} />

      <h2>Dispatching jobs</h2>
      <CodeBlock lang="typescript" code={`const queue = this.container.make(QueueManager)

await queue.dispatch('default', {
  job:     'SendWelcomeEmailJob',
  payload: { userId: 1, email: 'alice@example.com' },
})`} />

      <h2>With delay</h2>
      <CodeBlock lang="typescript" code={`await queue.dispatch('default', {
  job:     'SendReminderJob',
  payload: { userId: 1 },
  delay:   60 * 60 * 1000,  // 1 hour in ms
})`} />
    </>
  )
}
