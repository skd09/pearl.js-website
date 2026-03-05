import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Routing — Pearl.js',
  description: 'Define routes, read request data, and send responses in Pearl.js.',
}

export default function RoutingPage() {
  return (
    <>
      <h1>Routing</h1>
      <p>
        Pearl's <code>Router</code> gives you a clean, readable API for defining HTTP routes.
        Every handler receives a single <code>ctx</code> argument — your one-stop access point
        for reading the request and writing the response.
      </p>

      <h2 id="basic-routes">Basic routes</h2>
      <p>
        Methods map directly to HTTP verbs. Pass a path string and an async handler function.
      </p>
      <CodeBlock lang="typescript" filename="src/routes/api.ts" code={`import { Router } from '@pearl-framework/pearl'

const router = new Router()

router.get('/posts',        async (ctx) => { /* list posts   */ })
router.post('/posts',       async (ctx) => { /* create post  */ })
router.get('/posts/:id',    async (ctx) => { /* get one post */ })
router.put('/posts/:id',    async (ctx) => { /* replace post */ })
router.patch('/posts/:id',  async (ctx) => { /* update post  */ })
router.delete('/posts/:id', async (ctx) => { /* delete post  */ })

export default router`} />

      <h2 id="params">Route parameters</h2>
      <p>
        Prefix a path segment with <code>:</code> to capture it as a named parameter.
        All params are strings — convert them yourself if you need a number.
      </p>
      <CodeBlock lang="typescript" code={`router.get('/posts/:id', async (ctx) => {
  const id = Number(ctx.request.params.id)  // always a string, cast if needed
  ctx.response.json({ id })
})

// Multiple params work fine
router.get('/users/:userId/posts/:postId', async (ctx) => {
  const { userId, postId } = ctx.request.params
  ctx.response.json({ userId, postId })
})`} />

      <h2 id="query-body">Query strings & request body</h2>
      <p>
        Query string values are on <code>ctx.request.query</code>. For a JSON body,
        call <code>ctx.request.json()</code> and pass a TypeScript type — you get full
        inference on the result.
      </p>
      <CodeBlock lang="typescript" code={`// GET /posts?page=2&limit=10
router.get('/posts', async (ctx) => {
  const page  = ctx.request.query.page  ?? '1'
  const limit = ctx.request.query.limit ?? '20'
  ctx.response.json({ page, limit })
})

// POST /posts  { "title": "Hello", "content": "World" }
router.post('/posts', async (ctx) => {
  const body = await ctx.request.json<{ title: string; content: string }>()
  // body.title and body.content are fully typed
  ctx.response.status(201).json({ data: body })
})`} />

      <h2 id="route-middleware">Route middleware</h2>
      <p>
        Pass an array of middleware functions as the <strong>third argument</strong> to
        protect a route. They run in order before your handler. The built-in{' '}
        <code>Authenticate()</code> middleware checks for a valid Bearer token and rejects
        the request with a <code>401</code> if it's missing or invalid.
      </p>
      <CodeBlock lang="typescript" code={`import { Authenticate, AuthManager } from '@pearl-framework/pearl'

const auth  = app.container.make(AuthManager)
const guard = [Authenticate(auth)]  // define once, reuse anywhere

// These routes require a valid Bearer token
router.post('/posts',       createPost,  guard)
router.delete('/posts/:id', deletePost,  guard)

// On a guarded route, ctx.auth.user() is available and typed
router.get('/me', async (ctx) => {
  const user = ctx.auth.user()
  ctx.response.json({ user })
}, guard)`} />

      <h2 id="global-middleware">Global middleware</h2>
      <p>
        Call <code>router.use()</code> to run middleware on every request. Register your
        error handler first so it wraps all subsequent handlers.
      </p>
      <CodeBlock lang="typescript" code={`router.use(ErrorHandlerMiddleware)  // first — wraps everything
router.use(CorsMiddleware)
router.use(LoggerMiddleware)

// Then register routes...
router.get('/posts', handler)

await new HttpKernel()
  .useRouter(router)
  .listen(3000)`} />

      <h2 id="responses">Response helpers</h2>
      <p>
        <code>ctx.response</code> is chainable. These cover the common cases:
      </p>
      <CodeBlock lang="typescript" code={`ctx.response.json({ data })                        // 200 JSON
ctx.response.status(201).json({ data })            // 201 Created
ctx.response.status(404).json({ error: 'Not found' })
ctx.response.status(422).json({ errors })          // Validation failed
ctx.response.status(204).end()                     // No content (e.g. DELETE)
ctx.response.redirect('/login')                    // Redirect
ctx.response.setHeader('X-Custom', 'value').json({ data })`} />

      <h2 id="reference">HttpContext reference</h2>
      <table>
        <thead>
          <tr><th>Property</th><th>Type</th><th>What it gives you</th></tr>
        </thead>
        <tbody>
          <tr><td><code>ctx.request</code></td><td><code>Request</code></td><td>The incoming HTTP request</td></tr>
          <tr><td><code>ctx.response</code></td><td><code>Response</code></td><td>Builder for the outgoing response</td></tr>
          <tr><td><code>ctx.auth</code></td><td><code>AuthContext</code></td><td>Authenticated user (guarded routes only)</td></tr>
          <tr><td><code>ctx.request.params</code></td><td><code>Record&lt;string, string&gt;</code></td><td>URL parameters like <code>:id</code></td></tr>
          <tr><td><code>ctx.request.query</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Query string values</td></tr>
          <tr><td><code>ctx.request.headers</code></td><td><code>Headers</code></td><td>Incoming request headers</td></tr>
          <tr><td><code>ctx.request.json&lt;T&gt;()</code></td><td><code>Promise&lt;T&gt;</code></td><td>Parsed + typed JSON body</td></tr>
        </tbody>
      </table>
    </>
  )
}