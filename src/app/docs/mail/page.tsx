import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Mail — Pearl.js',
  description: 'Send emails with Mailable classes in Pearl.js.',
}

export default function MailPage() {
  return (
    <>
      <h1>Mail</h1>
      <p>
        Pearl's mail system is built around <strong>Mailable</strong> classes. Instead of
        calling a mailer function directly with a pile of arguments, you create a class that
        represents one specific email — its subject, recipient, and HTML body — and send it
        with a <code>Mailer</code>.
      </p>
      <p>
        This makes emails easy to test (just instantiate the class) and easy to reuse across
        your app.
      </p>

      <h2 id="create-mailable">Create a Mailable</h2>
      <CodeBlock lang="bash" code={`pearl make:mail WelcomeMail
# → src/mail/WelcomeMail.ts`} />
      <p>
        Implement the <code>build()</code> method to configure the email. Chain{' '}
        <code>.sendTo()</code>, <code>.subject()</code>, and <code>.html()</code>:
      </p>
      <CodeBlock lang="typescript" filename="src/mail/WelcomeMail.ts" code={`import { Mailable } from '@pearl-framework/pearl'

export class WelcomeMail extends Mailable {
  constructor(private recipientEmail: string) {
    super()
  }

  build() {
    return this
      .sendTo(this.recipientEmail)
      .subject('Welcome to My App!')
      .html(\`
        <h1>Welcome aboard! 🎉</h1>
        <p>Thanks for signing up. You're all set to get started.</p>
        <p><a href="https://myapp.com/dashboard">Go to your dashboard →</a></p>
      \`)
  }
}`} />

      <h2 id="sending">Sending mail</h2>
      <p>
        Create a <code>Mailer</code> with a transport and call <code>.send()</code>. During
        development, use <code>LogTransport</code> — it prints the email to your console
        instead of actually sending it:
      </p>
      <CodeBlock lang="typescript" code={`import { Mailer, LogTransport } from '@pearl-framework/pearl'
import { WelcomeMail } from '../mail/WelcomeMail.js'

const mailer = new Mailer({
  from:      { address: 'noreply@myapp.com', name: 'My App' },
  transport: new LogTransport(),  // logs to console — great for dev
})

await mailer.send(new WelcomeMail('alice@example.com'))`} />

      <h2 id="transports">Transports</h2>
      <table>
        <thead><tr><th>Transport</th><th>When to use it</th></tr></thead>
        <tbody>
          <tr>
            <td><code>LogTransport</code></td>
            <td>Development — prints the email to the console, nothing is sent</td>
          </tr>
          <tr>
            <td><code>SmtpTransport</code></td>
            <td>Production — sends via any SMTP provider (Postmark, SendGrid, SES, etc.)</td>
          </tr>
        </tbody>
      </table>

      <h2 id="smtp">SMTP transport (production)</h2>
      <p>
        Switch to <code>SmtpTransport</code> in production. Read credentials from{' '}
        <code>.env</code>:
      </p>
      <CodeBlock lang="typescript" code={`import { Mailer, SmtpTransport } from '@pearl-framework/pearl'

const mailer = new Mailer({
  from: { address: 'noreply@myapp.com', name: 'My App' },
  transport: new SmtpTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  }),
})`} />
      <p>Add the following variables to your <code>.env</code>:</p>
      <CodeBlock lang="bash" filename=".env" code={`MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USER=your-api-token
MAIL_PASS=your-api-token`} />

      <h2 id="queue-tip">Tip: always send mail via a queue</h2>
      <p>
        SMTP calls can be slow and fail. Instead of sending directly in your route handler,
        dispatch a queue job to send the email in the background:
      </p>
      <CodeBlock lang="typescript" code={`// Don't do this in a route handler — it's slow and blocks the response
await mailer.send(new WelcomeMail(user.email))

// Do this instead — returns immediately, job runs in the background
await queue.dispatch('default', {
  job:     'SendWelcomeEmailJob',
  payload: { email: user.email },
})`} />
    </>
  )
}