import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Middleware — Pearl.js',
  description: 'Write and apply middleware in Pearl.js.',
}

export default function MiddlewarePage() {
  return (
    <>
      <h1>Middleware</h1>
      <p>
        Middleware are async functions that run before your route handlers. They receive the
        same <code>ctx</code> plus a <code>next</code> function. Call <code>await next()</code>{' '}
        to continue to the next middleware (or the route handler). Don't call it to stop the
        request early — for example, to reject an unauthorized request.
      </p>
      <p>
        Every middleware has the signature:{' '}
        <code>(ctx: HttpContext, next: NextFunction) =&gt; Promise&lt;void&gt;</code>
      </p>

      <h2 id="writing">Writing middleware</h2>
      <p>
        A simple request logger — runs after the handler returns so it can log the duration:
      </p>
      <CodeBlock lang="typescript" filename="src/middleware/LoggerMiddleware.ts" code={`import type { HttpContext, NextFunction } from '@pearl-framework/pearl'

export async function LoggerMiddleware(ctx: HttpContext, next: NextFunction) {
  const start = Date.now()
  await next()  // run the handler
  const ms = Date.now() - start
  console.log(\`\${ctx.request.method} \${ctx.request.url} \${ms}ms\`)
}`} />

      <h2 id="short-circuit">Short-circuiting (blocking requests)</h2>
      <p>
        Return early without calling <code>next()</code> to stop the request. The handler
        and any subsequent middleware won't run:
      </p>
      <CodeBlock lang="typescript" filename="src/middleware/RequireApiKey.ts" code={`import type { HttpContext, NextFunction } from '@pearl-framework/pearl'

export async function RequireApiKey(ctx: HttpContext, next: NextFunction) {
  const key = ctx.request.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    // Stop here — don't call next()
    ctx.response.status(401).json({ error: 'Invalid or missing API key' })
    return
  }
  await next()
}`} />

      <h2 id="cors">Built-in: CORS</h2>
      <p>
        Pearl ships a configurable <code>Cors</code> middleware. Register it globally so it
        also answers preflight <code>OPTIONS</code> requests for any route:
      </p>
      <CodeBlock lang="typescript" code={`import { Cors } from '@pearl-framework/pearl'\n\nrouter.use(new Cors({\n  origin:      ['https://app.example.com'], // string | string[] | (origin) => boolean | true | false\n  methods:     ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true,\n  maxAge:      600,\n}))`} />
      <p>
        Defaults to allowing any origin (<code>*</code>). With <code>credentials</code> enabled,
        the specific request origin is echoed instead of <code>*</code> (per the CORS spec) and
        a <code>Vary: Origin</code> header is added.
      </p>

      <h2 id="error-handler">Error handler middleware</h2>
      <p>
        Register this first (before other middleware) so it wraps every handler. It catches
        any thrown error and returns a structured JSON response:
      </p>
      <CodeBlock lang="typescript" filename="src/middleware/ErrorHandlerMiddleware.ts" code={`import type { HttpContext, NextFunction } from '@pearl-framework/pearl'
import { ValidationException } from '@pearl-framework/pearl'

export async function ErrorHandlerMiddleware(ctx: HttpContext, next: NextFunction) {
  try {
    await next()
  } catch (err) {
    // Validation errors from FormRequest get a 422
    if (err instanceof ValidationException) {
      ctx.response.status(422).json({ errors: err.errors })
      return
    }
    // Everything else is a 500
    console.error(err)
    ctx.response.status(500).json({ error: 'Internal server error' })
  }
}`} />

      <h2 id="rate-limit">Built-in: rate limiting</h2>
      <p>
        Pearl ships a <code>RateLimit</code> middleware out of the box — fixed window,
        per-key, with <code>X-RateLimit-*</code> and <code>Retry-After</code> headers
        on 429 responses. The default store is in-memory; swap in a Redis-backed
        store for multi-process deployments.
      </p>
      <CodeBlock lang="typescript" code={`import { RateLimit } from '@pearl-framework/pearl'\n\n// Global — 100 requests per minute per IP\nrouter.use(new RateLimit({ windowMs: 60_000, max: 100 }))\n\n// Per-route — tight limit on the login endpoint\nrouter.post('/auth/login', loginHandler, [\n  new RateLimit({\n    windowMs: 15 * 60_000,\n    max:      5,\n    message:  'Too many login attempts. Try again in 15 minutes.',\n  }),\n])`} />
      <p>
        Customize the key (e.g. per-user instead of per-IP) by passing{' '}
        <code>keyGenerator</code>:
      </p>
      <CodeBlock lang="typescript" code={`new RateLimit({\n  windowMs: 60_000,\n  max:      30,\n  keyGenerator: (ctx) => {\n    const user = ctx.get<{ id: number }>('auth.user')\n    return user ? \`u:\${user.id}\` : \`ip:\${ctx.request.header('x-forwarded-for') ?? 'unknown'}\`\n  },\n})`} />
      <p>
        For multi-process deployments, implement <code>RateLimitStore</code> against
        Redis and pass it via the <code>store</code> option — the same middleware then
        rate-limits consistently across every instance.
      </p>

      <h3 id="named-limiters">Named rate limiters</h3>
      <p>
        Define limiters once and apply them by name on routes with <code>throttle()</code>:
      </p>
      <CodeBlock lang="typescript" code={`import { RateLimiter, throttle } from '@pearl-framework/pearl'\n\n// Optional — share counters across processes (defaults to in-memory)\nRateLimiter.useStore(redisStore)\n\nRateLimiter.for('login', () => ({ windowMs: 15 * 60_000, max: 5 }))\nRateLimiter.for('api',   (ctx) => ({ windowMs: 60_000, max: 60, key: ctx.get<{ id: number }>('auth.user')?.id?.toString() }))\n\nrouter.post('/auth/login', loginHandler, [throttle('login')])\nrouter.get('/feed',        feedHandler,  [throttle('api')])`} />

      <h2 id="applying">Applying middleware</h2>
      <p>
        Use <code>router.use()</code> for global middleware (runs on every request) and pass
        an array as the third route argument for per-route middleware:
      </p>
      <CodeBlock lang="typescript" code={`// Global middleware — runs on every request, in order
router.use(ErrorHandlerMiddleware)  // register first — wraps everything
router.use(new Cors())
router.use(LoggerMiddleware)

// Per-route — only runs on this route
router.post('/posts', createPost, [Authenticate(auth)])

// Stack multiple per-route middleware
router.post('/admin/posts', createPost, [Authenticate(auth), RequireApiKey])`} />
    </>
  )
}