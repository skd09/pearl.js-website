import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Middleware',
  description: 'Write and apply middleware in Pearl.js.',
}

export default function MiddlewarePage() {
  return (
    <>
      <h1>Middleware</h1>
      <p>Middleware are async functions that run before your route handlers. They can modify the request, short-circuit the response, or pass control to the next handler.</p>

      <h2>Writing middleware</h2>
      <CodeBlock lang="typescript" filename="src/middleware/LoggerMiddleware.ts" code={`import type { HttpContext, NextFunction } from '@pearl-framework/pearl'

export async function LoggerMiddleware(ctx: HttpContext, next: NextFunction) {
  const start = Date.now()
  await next()
  console.log(\`\${ctx.request.method} \${ctx.request.url} \${Date.now() - start}ms\`)
}`} />

      <h2>Short-circuiting</h2>
      <CodeBlock lang="typescript" code={`export async function RequireApiKey(ctx: HttpContext, next: NextFunction) {
  const key = ctx.request.headers.get('x-api-key')
  if (key !== process.env.API_KEY) {
    ctx.response.status(401).json({ error: 'Unauthorized' })
    return  // don't call next()
  }
  await next()
}`} />

      <h2>CORS middleware</h2>
      <CodeBlock lang="typescript" filename="src/middleware/CorsMiddleware.ts" code={`export async function CorsMiddleware(ctx: HttpContext, next: NextFunction) {
  ctx.response.setHeader('Access-Control-Allow-Origin', '*')
  ctx.response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  ctx.response.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (ctx.request.method === 'OPTIONS') {
    ctx.response.status(204).end()
    return
  }
  await next()
}`} />

      <h2>Error handler middleware</h2>
      <CodeBlock lang="typescript" filename="src/middleware/ErrorHandlerMiddleware.ts" code={`import { ValidationException } from '@pearl-framework/pearl'

export async function ErrorHandlerMiddleware(ctx: HttpContext, next: NextFunction) {
  try {
    await next()
  } catch (err) {
    if (err instanceof ValidationException) {
      ctx.response.status(422).json({ errors: err.errors })
      return
    }
    console.error(err)
    ctx.response.status(500).json({ error: 'Internal server error' })
  }
}`} />

      <h2>Applying middleware</h2>
      <CodeBlock lang="typescript" code={`// Global — all routes
router.use(ErrorHandlerMiddleware)
router.use(CorsMiddleware)
router.use(LoggerMiddleware)

// Per-route
router.post('/posts', handler, [Authenticate(auth), RequireApiKey])`} />
    </>
  )
}
