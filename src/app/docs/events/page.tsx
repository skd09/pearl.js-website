import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Events — Pearl.js',
  description: 'Type-safe event dispatching and listeners in Pearl.js.',
}

export default function EventsPage() {
  return (
    <>
      <h1>Events</h1>
      <p>
        Events let you decouple side effects from your core business logic. Instead of
        calling a mailer, a queue, and an analytics tracker directly inside your service,
        you fire a single event and let listeners react to it independently.
      </p>
      <p>
        This makes each piece easier to test, easier to change, and prevents your core
        logic from knowing about things it shouldn't care about.
      </p>

      <h2 id="create-event">Create an event</h2>
      <p>
        An event is a plain TypeScript class that holds the data for that moment in time.
        Generate one with the CLI:
      </p>
      <CodeBlock lang="bash" code={`pearl make:event UserRegisteredEvent
# → src/events/UserRegisteredEvent.ts`} />
      <CodeBlock lang="typescript" filename="src/events/UserRegisteredEvent.ts" code={`// An event is just a data carrier — no logic, no dependencies
export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email:  string,
  ) {}
}`} />

      <h2 id="create-listener">Create a listener</h2>
      <p>
        A listener reacts to one event. Generate one with the CLI:
      </p>
      <CodeBlock lang="bash" code={`pearl make:listener SendWelcomeEmailListener
# → src/listeners/SendWelcomeEmailListener.ts`} />
      <CodeBlock lang="typescript" filename="src/listeners/SendWelcomeEmailListener.ts" code={`import { QueueManager } from '@pearl-framework/pearl'
import { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'

export class SendWelcomeEmailListener {
  constructor(private queue: QueueManager) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    // Dispatch to a background worker so the response isn't delayed
    await this.queue.dispatch('default', {
      job:     'SendWelcomeEmailJob',
      payload: { userId: event.userId, email: event.email },
    })
  }
}`} />

      <h2 id="register-listeners">Register listeners</h2>
      <p>
        Wire events to listeners in your service provider. Each call to{' '}
        <code>dispatcher.on(EventClass, handler)</code> subscribes a listener to that event.
        You can attach multiple listeners to the same event.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { EventDispatcher, QueueManager } from '@pearl-framework/pearl'
import { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'
import { SendWelcomeEmailListener } from '../listeners/SendWelcomeEmailListener.js'

// Inside register():
this.container.singleton(EventDispatcher, () => {
  const queue      = this.container.make(QueueManager)
  const dispatcher = new EventDispatcher()

  // When UserRegisteredEvent fires, call this listener
  dispatcher.on(UserRegisteredEvent, async (event) => {
    await new SendWelcomeEmailListener(queue).handle(event)
  })

  // You can attach multiple listeners to the same event
  // dispatcher.on(UserRegisteredEvent, async (event) => { ... })

  return dispatcher
})`} />

      <h2 id="dispatch">Dispatch an event</h2>
      <p>
        Resolve the <code>EventDispatcher</code> from the container (or inject it into a
        service) and call <code>dispatcher.dispatch()</code>:
      </p>
      <CodeBlock lang="typescript" code={`// In a controller or service:
const dispatcher = app.container.make(EventDispatcher)

// Fire the event — all registered listeners run
await dispatcher.dispatch(new UserRegisteredEvent(user.id, user.email))

// Your service is done. The listeners handle the side effects.`} />

      <h2 id="tip">Why use events?</h2>
      <p>
        Without events, your registration handler might look like this — tightly coupled
        to every side effect:
      </p>
      <CodeBlock lang="typescript" code={`// Without events — hard to test, hard to change
await sendWelcomeEmail(user)
await notifySlack(user)
await trackAnalytics('user.registered', user.id)`} />
      <p>With events, it becomes one line — and each side effect is independently testable:</p>
      <CodeBlock lang="typescript" code={`// With events — clean, decoupled, easy to extend
await dispatcher.dispatch(new UserRegisteredEvent(user.id, user.email))`} />
    </>
  )
}