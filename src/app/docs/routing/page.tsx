import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Routing',
  description: 'Define routes, use middleware, and handle HTTP requests in Pearl.js.',
}

export default function RoutingPage() {
  return (
    <>
      <h1>Routing</h1>
      <p>Pearl's <code>Router</code> provides an expressive API for defining HTTP routes. Each route handler receives an <code>HttpContext</code> with typed request and response objects.</p>

      <h2>Basic routes</h2>
      <CodeBlock lang="typescript" code={`import { Router } from '@pearl-framework/pearl'

const router = new Router()

router.get('/posts',       async (ctx) => { /* ... */ })
router.post('/posts',      async (ctx) => { /* ... */ })
router.put('/posts/:id',   async (ctx) => { /* ... */ })
router.patch('/posts/:id', async (ctx) => { /* ... */ })
router.delete('/posts/:id',async (ctx) => { /* ... */ })`} />

      <h2>Route parameters</h2>
      <CodeBlock lang="typescript" code={`router.get('/posts/:id', async (ctx) => {
  const id = ctx.request.params.id
  ctx.response.json({ id })
})`} />

      <h2>Query strings & body</h2>
      <CodeBlock lang="typescript" code={`router.get('/search', async (ctx) => {
  const q = ctx.request.query.q
  ctx.response.json({ results: [] })
})

router.post('/posts', async (ctx) => {
  const body = await ctx.request.json<{ title: string }>()
  ctx.response.status(201).json({ title: body.title })
})`} />

      <h2>Route middleware</h2>
      <CodeBlock lang="typescript" code={`import { Authenticate, AuthManager } from '@pearl-framework/pearl'

const auth = app.container.make(AuthManager)

router.post('/posts', async (ctx) => {
  const user = ctx.auth.user()
  // ...
}, [Authenticate(auth)])`} />

      <h2>Global middleware</h2>
      <CodeBlock lang="typescript" code={`router.use(LoggerMiddleware)
router.use(CorsMiddleware)
router.use(ErrorHandlerMiddleware)

const kernel = new HttpKernel()
kernel.useRouter(router)
await kernel.listen(3000)`} />

      <h2>Response helpers</h2>
      <CodeBlock lang="typescript" code={`ctx.response.json({ data })
ctx.response.status(201).json({ data })
ctx.response.status(204).end()
ctx.response.redirect('/new-path')
ctx.response.status(404).json({ error: 'Not found' })`} />

      <h2>HttpContext reference</h2>
      <table>
        <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>ctx.request</code></td><td><code>Request</code></td><td>Incoming HTTP request</td></tr>
          <tr><td><code>ctx.response</code></td><td><code>Response</code></td><td>Outgoing HTTP response</td></tr>
          <tr><td><code>ctx.auth</code></td><td><code>AuthContext</code></td><td>Authenticated user</td></tr>
          <tr><td><code>ctx.request.params</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Route parameters</td></tr>
          <tr><td><code>ctx.request.query</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Query string values</td></tr>
        </tbody>
      </table>
    </>
  )
}
