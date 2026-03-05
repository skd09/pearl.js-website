import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Async event dispatching and listeners in Pearl.js.',
}

export default function EventsPage() {
  return (
    <>
      <h1>Events</h1>
      <p>Pearl's event system lets you decouple side effects from your core logic using typed event classes and async listeners.</p>

      <h2>Creating an event</h2>
      <CodeBlock lang="typescript" filename="src/events/UserRegisteredEvent.ts" code={`export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
  ) {}
}`} />

      <h2>Creating a listener</h2>
      <CodeBlock lang="typescript" filename="src/listeners/SendWelcomeEmailListener.ts" code={`import { QueueManager } from '@pearl-framework/pearl'
import { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'

export class SendWelcomeEmailListener {
  constructor(private queue: QueueManager) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.queue.dispatch('default', {
      job:     'SendWelcomeEmailJob',
      payload: { userId: event.userId, email: event.email },
    })
  }
}`} />

      <h2>Registering listeners</h2>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { EventDispatcher } from '@pearl-framework/pearl'
import { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'
import { SendWelcomeEmailListener } from '../listeners/SendWelcomeEmailListener.js'

this.container.singleton(EventDispatcher, () => {
  const queue      = this.container.make(QueueManager)
  const dispatcher = new EventDispatcher()

  dispatcher.on(UserRegisteredEvent, async (event) => {
    await new SendWelcomeEmailListener(queue).handle(event)
  })

  return dispatcher
})`} />

      <h2>Dispatching events</h2>
      <CodeBlock lang="typescript" code={`const dispatcher = this.container.make(EventDispatcher)
await dispatcher.dispatch(new UserRegisteredEvent(user.id, user.email))`} />
    </>
  )
}
