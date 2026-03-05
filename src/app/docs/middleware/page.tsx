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

      <h2 id="cors">CORS middleware</h2>
      <p>
        Handle CORS headers and preflight <code>OPTIONS</code> requests:
      </p>
      <CodeBlock lang="typescript" filename="src/middleware/CorsMiddleware.ts" code={`import type { HttpContext, NextFunction } from '@pearl-framework/pearl'

export async function CorsMiddleware(ctx: HttpContext, next: NextFunction) {
  ctx.response.setHeader('Access-Control-Allow-Origin',  '*')
  ctx.response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  ctx.response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  // Preflight requests end here
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status(204).end()
    return
  }

  await next()
}`} />

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

      <h2 id="applying">Applying middleware</h2>
      <p>
        Use <code>router.use()</code> for global middleware (runs on every request) and pass
        an array as the third route argument for per-route middleware:
      </p>
      <CodeBlock lang="typescript" code={`// Global middleware — runs on every request, in order
router.use(ErrorHandlerMiddleware)  // register first — wraps everything
router.use(CorsMiddleware)
router.use(LoggerMiddleware)

// Per-route — only runs on this route
router.post('/posts', createPost, [Authenticate(auth)])

// Stack multiple per-route middleware
router.post('/admin/posts', createPost, [Authenticate(auth), RequireApiKey])`} />
    </>
  )
}