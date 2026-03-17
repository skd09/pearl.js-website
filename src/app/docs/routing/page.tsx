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
        Methods map directly to HTTP verbs. Pass a path string and a handler function.
      </p>
      <CodeBlock lang="typescript" filename="src/server.ts" code={`import { Router } from '@pearl-framework/pearl'\n\nconst router = new Router()\n\nrouter.get('/posts',        async (ctx) => { /* list posts   */ })\nrouter.post('/posts',       async (ctx) => { /* create post  */ })\nrouter.get('/posts/:id',    async (ctx) => { /* get one post */ })\nrouter.put('/posts/:id',    async (ctx) => { /* replace post */ })\nrouter.patch('/posts/:id',  async (ctx) => { /* update post  */ })\nrouter.delete('/posts/:id', async (ctx) => { /* delete post  */ })`} />

      <h2 id="params">Route parameters</h2>
      <p>
        Prefix a path segment with <code>:</code> to capture it as a named parameter.
        Read it with <code>ctx.request.param('name')</code> — params are always strings,
        so cast to a number if needed.
      </p>
      <CodeBlock lang="typescript" code={`router.get('/posts/:id', async (ctx) => {\n  const id = Number(ctx.request.param('id'))  // always a string — cast if needed\n  ctx.response.json({ id })\n})\n\n// Multiple params work fine\nrouter.get('/users/:userId/posts/:postId', async (ctx) => {\n  const userId = ctx.request.param('userId')\n  const postId = ctx.request.param('postId')\n  ctx.response.json({ userId, postId })\n})`} />

      <h2 id="query-body">Query strings & request body</h2>
      <p>
        Read query string values with <code>ctx.request.query(key, default?)</code>.
        Read the parsed JSON body via the <code>ctx.request.body</code> getter — it's a
        getter, not a method, so no parentheses.
      </p>
      <CodeBlock lang="typescript" code={`// GET /posts?page=2&limit=10\nrouter.get('/posts', async (ctx) => {\n  const page  = ctx.request.query('page',  '1')\n  const limit = ctx.request.query('limit', '20')\n  ctx.response.json({ page, limit })\n})\n\n// POST /posts  { \"title\": \"Hello\", \"content\": \"World\" }\nrouter.post('/posts', async (ctx) => {\n  const { title, content } = ctx.request.body as { title: string; content: string }\n  ctx.response.created({ title, content })\n})`} />

      <h2 id="route-middleware">Route middleware</h2>
      <p>
        Pass an array of middleware functions as the <strong>third argument</strong> to
        protect a route. They run in order before your handler. The built-in{' '}
        <code>Authenticate()</code> middleware checks for a valid Bearer token and rejects
        the request with a <code>401</code> if it's missing or invalid.
      </p>
      <CodeBlock lang="typescript" code={`import { Authenticate, AuthManager } from '@pearl-framework/pearl'\n\nconst auth  = app.container.make(AuthManager)\nconst guard = [Authenticate(auth)]  // define once, reuse anywhere\n\n// These routes require a valid Bearer token\nrouter.post('/posts',       createPost,  guard)\nrouter.delete('/posts/:id', deletePost,  guard)\n\n// On a guarded route, ctx.get('auth.user') returns the authenticated user\nrouter.get('/me', async (ctx) => {\n  ctx.response.json(ctx.get('auth.user'))\n}, guard)`} />

      <h2 id="route-groups">Route groups</h2>
      <p>
        Group routes under a shared prefix to keep your router organised:
      </p>
      <CodeBlock lang="typescript" code={`router.group('/api/v1', (r) => {\n  r.group('/posts', (r) => {\n    r.get('/',    listPosts)\n    r.post('/',   createPost, guard)\n    r.get('/:id', getPost)\n  })\n\n  r.group('/users', (r) => {\n    r.get('/:id', getUser)\n  })\n})`} />

      <h2 id="global-middleware">Global middleware</h2>
      <p>
        Call <code>kernel.useMiddleware()</code> to run middleware on every request.
        Register your error handler first so it wraps all subsequent handlers.
      </p>
      <CodeBlock lang="typescript" code={`await new HttpKernel()\n  .useMiddleware([ErrorHandlerMiddleware, CorsMiddleware, LoggerMiddleware])\n  .useRouter(router)\n  .listen(3000)`} />

      <h2 id="responses">Response helpers</h2>
      <p>
        <code>ctx.response</code> is chainable. These cover the common cases:
      </p>
      <CodeBlock lang="typescript" code={`ctx.response.json({ data })                  // 200 JSON\nctx.response.created({ data })               // 201 Created\nctx.response.noContent()                     // 204 No Content\nctx.response.status(400).json({ message: 'Bad input' })  // 400\nctx.response.unauthorized()                  // 401\nctx.response.forbidden()                     // 403\nctx.response.notFound('Not found')           // 404\nctx.response.redirect('/login')              // 302 Redirect\nctx.response.status(418).json({ im: 'a teapot' })  // custom status`} />

      <h2 id="reference">HttpContext reference</h2>
      <table>
        <thead>
          <tr><th>Property / Method</th><th>Type</th><th>What it gives you</th></tr>
        </thead>
        <tbody>
          <tr><td><code>ctx.request.body</code></td><td><code>unknown</code></td><td>Parsed JSON request body (getter)</td></tr>
          <tr><td><code>ctx.request.param(key)</code></td><td><code>string</code></td><td>URL parameter value e.g. <code>:id</code></td></tr>
          <tr><td><code>ctx.request.query(key, default?)</code></td><td><code>string</code></td><td>Query string value</td></tr>
          <tr><td><code>ctx.request.header(key)</code></td><td><code>string | undefined</code></td><td>Incoming request header</td></tr>
          <tr><td><code>ctx.request.method</code></td><td><code>string</code></td><td>HTTP method</td></tr>
          <tr><td><code>ctx.request.url</code></td><td><code>string</code></td><td>Full request URL</td></tr>
          <tr><td><code>ctx.request.ip()</code></td><td><code>string</code></td><td>Client IP address</td></tr>
          <tr><td><code>ctx.response</code></td><td><code>Response</code></td><td>Builder for the outgoing response</td></tr>
          <tr><td><code>ctx.get('auth.user')</code></td><td><code>AuthUser | undefined</code></td><td>Authenticated user (guarded routes)</td></tr>
        </tbody>
      </table>
    </>
  )
}