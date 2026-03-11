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
        An event is a plain class that holds data for a moment in time. Generate one:
      </p>
      <CodeBlock lang="bash" code={`pearl make:event UserRegistered\n# → src/events/UserRegisteredEvent.ts`} />
      <CodeBlock lang="typescript" filename="src/events/UserRegisteredEvent.ts" code={`import { Event } from '@pearl-framework/pearl'\n\n// An event is a data carrier — no logic, no dependencies\nexport class UserRegisteredEvent extends Event {\n  constructor(\n    public readonly userId: number,\n    public readonly email:  string,\n  ) { super() }\n}`} />

      <h2 id="create-listener">Create a listener</h2>
      <p>
        A listener extends <code>Listener&lt;T&gt;</code> and implements{' '}
        <code>handle()</code> for one specific event type:
      </p>
      <CodeBlock lang="bash" code={`pearl make:listener SendWelcomeEmail --event UserRegistered\n# → src/listeners/SendWelcomeEmailListener.ts`} />
      <CodeBlock lang="typescript" filename="src/listeners/SendWelcomeEmailListener.ts" code={`import { Listener } from '@pearl-framework/pearl'\nimport { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'\n\nexport class SendWelcomeEmailListener extends Listener<UserRegisteredEvent> {\n  async handle(event: UserRegisteredEvent): Promise<void> {\n    const job = new SendWelcomeEmailJob()\n    job.userId = event.userId\n    await queue.dispatch(job)\n  }\n\n  // Optional — return false to skip this listener silently\n  shouldHandle(event: UserRegisteredEvent): boolean {\n    return event.userId > 0\n  }\n}`} />

      <h2 id="register-listeners">Register listeners</h2>
      <p>
        Wire events to listeners in your service provider using{' '}
        <code>dispatcher.on(EventClass, ListenerClass)</code>. You can attach multiple
        listeners to the same event.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { EventDispatcher } from '@pearl-framework/pearl'\nimport { UserRegisteredEvent } from '../events/UserRegisteredEvent.js'\nimport { SendWelcomeEmailListener } from '../listeners/SendWelcomeEmailListener.js'\nimport { NotifyAdminsListener } from '../listeners/NotifyAdminsListener.js'\n\n// Inside register():\nthis.container.singleton(EventDispatcher, () => {\n  const dispatcher = new EventDispatcher()\n  dispatcher.on(UserRegisteredEvent, SendWelcomeEmailListener)\n  dispatcher.on(UserRegisteredEvent, NotifyAdminsListener)  // multiple listeners ok\n  return dispatcher\n})`} />

      <h2 id="dispatch">Dispatch an event</h2>
      <p>
        Inject <code>EventDispatcher</code> into your service and call{' '}
        <code>dispatch()</code>. All registered listeners run and are awaited:
      </p>
      <CodeBlock lang="typescript" code={`const dispatcher = app.container.make(EventDispatcher)\n\n// Dispatches and awaits all listeners\nawait dispatcher.dispatch(new UserRegisteredEvent(user.id, user.email))\n\n// Fire-and-forget — does not await listeners\ndispatcher.dispatchSync(new UserRegisteredEvent(user.id, user.email))`} />

      <h2 id="tip">Why use events?</h2>
      <p>
        Without events, your registration handler is tightly coupled to every side effect:
      </p>
      <CodeBlock lang="typescript" code={`// Without events — hard to test, hard to change\nawait sendWelcomeEmail(user)\nawait notifyAdmins(user)\nawait trackAnalytics('user.registered', user.id)`} />
      <p>With events, it becomes one line — and each side effect is independently testable:</p>
      <CodeBlock lang="typescript" code={`// With events — clean, decoupled, easy to extend\nawait dispatcher.dispatch(new UserRegisteredEvent(user.id, user.email))`} />
    </>
  )
}