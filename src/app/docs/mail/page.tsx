import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Mail',
  description: 'Send emails with Mailable classes in Pearl.js.',
}

export default function MailPage() {
  return (
    <>
      <h1>Mail</h1>
      <p>Pearl's mail system uses <strong>Mailable</strong> classes — compose emails as objects, send them with a <code>Mailer</code>.</p>

      <h2>Creating a Mailable</h2>
      <CodeBlock lang="typescript" filename="src/mail/WelcomeMail.ts" code={`import { Mailable } from '@pearl-framework/pearl'

export class WelcomeMail extends Mailable {
  constructor(private toEmail: string) {
    super()
  }

  build() {
    return this
      .sendTo(this.toEmail)
      .subject('Welcome to our app!')
      .html(\`
        <h1>Welcome!</h1>
        <p>Thanks for signing up. We're glad to have you.</p>
      \`)
  }
}`} />

      <h2>Sending mail</h2>
      <CodeBlock lang="typescript" code={`import { Mailer, LogTransport } from '@pearl-framework/pearl'
import { WelcomeMail } from '../mail/WelcomeMail.js'

const mailer = new Mailer({
  from: { address: 'noreply@myapp.com', name: 'My App' },
  transport: new LogTransport(),  // logs to console in dev
})

await mailer.send(new WelcomeMail('alice@example.com'))`} />

      <h2>Transports</h2>
      <table>
        <thead><tr><th>Transport</th><th>Use case</th></tr></thead>
        <tbody>
          <tr><td><code>LogTransport</code></td><td>Development — logs to console</td></tr>
          <tr><td><code>SmtpTransport</code></td><td>Production — sends via SMTP</td></tr>
        </tbody>
      </table>

      <h2>SMTP transport</h2>
      <CodeBlock lang="typescript" code={`import { SmtpTransport } from '@pearl-framework/pearl'

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
    </>
  )
}
