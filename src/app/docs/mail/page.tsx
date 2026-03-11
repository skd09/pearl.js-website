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
        represents one specific email — its subject, recipient, and body — and send it with
        a <code>Mailer</code>.
      </p>
      <p>
        This makes emails easy to test and easy to reuse across your app.
        Requires <strong>nodemailer v7+</strong> — types are bundled, so{' '}
        <code>@types/nodemailer</code> is not needed.
      </p>

      <h2 id="create-mailable">Create a Mailable</h2>
      <CodeBlock lang="bash" code={`pearl make:mail WelcomeMail\n# → src/mail/WelcomeMail.ts`} />
      <p>
        Implement the <code>build()</code> method and chain the fluent helpers:
      </p>
      <CodeBlock lang="typescript" filename="src/mail/WelcomeMail.ts" code={`import { Mailable } from '@pearl-framework/pearl'\n\nexport class WelcomeMail extends Mailable {\n  constructor(private readonly user: User) {\n    super()\n  }\n\n  build() {\n    return this\n      .sendTo(this.user.email)\n      .from({ name: 'My App', address: 'hi@myapp.com' })\n      .subject(\`Welcome to My App, \${this.user.name}!\`)\n      .html(\`\n        <h1>Hi \${this.user.name}, welcome aboard! 🎉</h1>\n        <p>Thanks for signing up. You're all set to get started.</p>\n        <a href="https://myapp.com/dashboard">Go to your dashboard →</a>\n      \`)\n      .text(\`Hi \${this.user.name}, welcome! Visit https://myapp.com/dashboard\`)\n  }\n}`} />

      <h2 id="sending">Sending mail</h2>
      <CodeBlock lang="typescript" code={`import { Mailer, LogTransport } from '@pearl-framework/pearl'\nimport { WelcomeMail } from '../mail/WelcomeMail.js'\n\nconst mailer = new Mailer(new LogTransport())  // logs to console — great for dev\n\nawait mailer.send(new WelcomeMail(user))`} />

      <h2 id="transports">Transports</h2>
      <table>
        <thead><tr><th>Transport</th><th>When to use it</th></tr></thead>
        <tbody>
          <tr>
            <td><code>LogTransport</code></td>
            <td>Development — prints the full email to the console, nothing is sent</td>
          </tr>
          <tr>
            <td><code>SmtpTransport</code></td>
            <td>Production — sends via any SMTP provider (Postmark, SendGrid, Resend, SES, etc.)</td>
          </tr>
          <tr>
            <td><code>SesTransport</code></td>
            <td>AWS SES — requires <code>@aws-sdk/client-ses</code></td>
          </tr>
          <tr>
            <td><code>ArrayTransport</code></td>
            <td>Testing — captures sent mail in memory so you can assert against it</td>
          </tr>
        </tbody>
      </table>

      <h2 id="smtp">SMTP transport (production)</h2>
      <CodeBlock lang="typescript" code={`import { Mailer, SmtpTransport } from '@pearl-framework/pearl'\n\nconst mailer = new Mailer(\n  new SmtpTransport({\n    host:   process.env.MAIL_HOST!,\n    port:   Number(process.env.MAIL_PORT ?? 587),\n    secure: false,\n    auth: {\n      user: process.env.MAIL_USER!,\n      pass: process.env.MAIL_PASS!,\n    },\n  })\n)`} />
      <CodeBlock lang="bash" filename=".env" code={`MAIL_HOST=smtp.postmarkapp.com\nMAIL_PORT=587\nMAIL_USER=your-api-token\nMAIL_PASS=your-api-token`} />

      <h2 id="attachments">Attachments</h2>
      <CodeBlock lang="typescript" code={`build() {\n  return this\n    .sendTo(this.user.email)\n    .subject('Your invoice')\n    .html('<p>Please find your invoice attached.</p>')\n    .attach({\n      filename:    'invoice.pdf',\n      path:        \`/tmp/invoices/\${this.invoiceId}.pdf\`,\n      contentType: 'application/pdf',\n    })\n}`} />

      <h2 id="testing">Testing with ArrayTransport</h2>
      <p>
        Swap in <code>ArrayTransport</code> in tests to capture sent mail in memory and
        assert against it — no SMTP server needed:
      </p>
      <CodeBlock lang="typescript" code={`import { ArrayTransport, Mailer } from '@pearl-framework/pearl'\n\nconst transport = new ArrayTransport()\nconst mailer    = new Mailer(transport)\n\nawait mailer.send(new WelcomeMail(user))\n\nconst sent = transport.last()\nassert.equal(sent?.subject, \`Welcome to My App, \${user.name}!\`)\nassert.equal(transport.sent.length, 1)\n\ntransport.clear()  // reset between tests`} />

      <h2 id="queue-tip">Tip: always send mail via a queue</h2>
      <p>
        SMTP calls can be slow and fail. Instead of sending in your route handler,
        dispatch a queue job to send in the background:
      </p>
      <CodeBlock lang="typescript" code={`// ❌ Blocks the response — slow and fragile\nawait mailer.send(new WelcomeMail(user.email))\n\n// ✅ Returns immediately — job runs in the background\nconst job = new SendWelcomeEmailJob()\njob.userId = user.id\nawait queue.dispatch(job)`} />
    </>
  )
}