import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Cookies — Pearl.js',
  description: 'Read and write cookies, including signed cookies, in Pearl.js.',
}

export default function CookiesPage() {
  return (
    <>
      <h1>Cookies</h1>
      <p>
        Reading cookies needs no setup. Writing them applies secure defaults:{' '}
        <code>HttpOnly</code>, <code>SameSite=Lax</code>, and <code>Path=/</code>.
      </p>

      <h2 id="reading">Reading</h2>
      <CodeBlock lang="typescript" code={`router.get('/prefs', async (ctx) => {
  const theme = ctx.request.cookie('theme')   // string | undefined
  const all   = ctx.request.cookies           // { theme: 'dark', … }

  ctx.response.ok({ theme, count: Object.keys(all).length })
})`} />
      <p>
        When a request repeats a cookie name, the <strong>first</strong> occurrence wins.
        Browsers send the most specific cookie first, so preferring the last would let a
        cookie planted on a sibling subdomain override the host&apos;s own.
      </p>

      <h2 id="writing">Writing</h2>
      <CodeBlock lang="typescript" code={`ctx.response.cookie('theme', 'dark', { maxAge: 31_536_000 })
ctx.response.cookie('banner_seen', '1', { httpOnly: false })  // readable by script
ctx.response.clearCookie('stale_flag')`} />
      <p>
        Each cookie gets its own <code>Set-Cookie</code> header, so queuing several on one
        response works as expected.
      </p>
      <p>
        <code>secure</code> defaults to <strong>false</strong> so local http development
        works — set it to <code>true</code> in every deployed environment.{' '}
        <code>sameSite: &apos;none&apos;</code> throws unless <code>secure</code> is also
        set, because browsers silently drop that combination rather than erroring.
      </p>

      <h2 id="signed">Signed cookies</h2>
      <p>
        Signing makes tampering detectable. Use it for any value a client must not be able
        to forge, such as a session id. Give the kernel a secret first:
      </p>
      <CodeBlock lang="typescript" filename="src/server.ts" code={`new HttpKernel({ router, cookieSecret: process.env.COOKIE_SECRET })`} />
      <CodeBlock lang="typescript" code={`ctx.response.cookie('sid', sessionId, { signed: true, secure: true })

const sid = ctx.request.signedCookie('sid')`} />
      <p>
        <code>signedCookie()</code> returns <code>undefined</code> when the cookie is
        absent, unsigned, or tampered with — a forged value is indistinguishable from a
        missing one, so there is no branch for an attacker to probe. Signing is HMAC-SHA256
        with a timing-safe comparison.
      </p>

      <h2 id="sessions">Cookie-backed sessions</h2>
      <p>
        For authentication, use the session middleware from{' '}
        <code>@pearl-framework/auth</code> rather than wiring cookies by hand — it signs
        the session cookie, resolves it into <code>ctx.get(&apos;auth.user&apos;)</code>,
        and re-issues the cookie when the guard rotates the id.
      </p>
      <CodeBlock lang="typescript" code={`import { SessionGuard, session, startSession, endSession, rotateSessionCookie } from '@pearl-framework/pearl'

const sessions = new SessionGuard(userProvider, store, {
  rotateOnUse: true,
  onRotate:    rotateSessionCookie(),
})

router.use(session(sessions))
router.get('/me', meHandler, [session(sessions, { required: true })])`} />
    </>
  )
}
