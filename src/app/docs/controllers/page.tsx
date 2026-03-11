import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Controllers — Pearl.js',
  description: 'Organise route handlers into controller classes in Pearl.js.',
}

export default function ControllersPage() {
  return (
    <>
      <h1>Controllers</h1>
      <p>
        As your app grows, putting all logic directly in route callbacks gets messy.
        A controller groups related handlers into a class, takes its dependencies through
        the constructor, and keeps your routes file focused on just the URL mapping.
      </p>
      <p>
        Controllers are plain TypeScript classes — no decorators, no magic. Register one
        in your service provider and Pearl's IoC container will construct it for you.
      </p>

      <h2 id="generate">Generate a controller</h2>
      <CodeBlock lang="bash" code={`pearl make:controller PostController\n# → src/controllers/PostController.ts\n\n# With all resource methods pre-generated:\npearl make:controller Post --resource`} />

      <h2 id="writing">Writing a controller</h2>
      <p>
        Declare dependencies as constructor arguments. The IoC container resolves and
        injects them — you never call <code>new PostController(...)</code> yourself.
        Note that <code>ctx.request.body</code> is a getter — no parentheses.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/PostController.ts" code={`import type { HttpContext } from '@pearl-framework/pearl'\nimport { DatabaseManager } from '@pearl-framework/pearl'\nimport { eq } from '@pearl-framework/pearl'\nimport { posts } from '../schema/posts.js'\n\nexport class PostController {\n  constructor(private db: DatabaseManager) {}\n\n  // GET /posts\n  async index(ctx: HttpContext) {\n    const all = await this.db.db.select().from(posts)\n    ctx.response.json({ data: all })\n  }\n\n  // GET /posts/:id\n  async show(ctx: HttpContext) {\n    const id = Number(ctx.request.param('id'))\n    const [post] = await this.db.db\n      .select().from(posts).where(eq(posts.id, id))\n    if (!post) return ctx.response.notFound('Post not found')\n    ctx.response.json({ data: post })\n  }\n\n  // POST /posts — requires authentication\n  async store(ctx: HttpContext) {\n    const { title, content } = ctx.request.body as {\n      title: string\n      content: string\n    }\n    const user  = ctx.user()!\n    const [post] = await this.db.db\n      .insert(posts)\n      .values({ title, content, userId: user.id })\n      .returning()\n    ctx.response.created({ data: post })\n  }\n\n  // DELETE /posts/:id — requires authentication\n  async destroy(ctx: HttpContext) {\n    const id = Number(ctx.request.param('id'))\n    await this.db.db.delete(posts).where(eq(posts.id, id))\n    ctx.response.noContent()\n  }\n}`} />

      <h2 id="register">Register in AppServiceProvider</h2>
      <p>
        Bind your controller as a singleton inside <code>register()</code>. Pearl uses
        this to know how to build it when you resolve it from the container.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { PostController } from '../controllers/PostController.js'\n\n// Inside register():\nthis.container.singleton(PostController, () =>\n  new PostController(\n    this.container.make(DatabaseManager)\n  )\n)`} />

      <h2 id="wire-routes">Wire to routes</h2>
      <p>
        Resolve the controller from the container after <code>app.boot()</code>, then pass
        its methods to the router:
      </p>
      <CodeBlock lang="typescript" filename="src/server.ts" code={`const postCtrl = app.container.make(PostController)\nconst guard    = [Authenticate(auth)]\n\nrouter.get('/posts',        (ctx) => postCtrl.index(ctx))\nrouter.get('/posts/:id',    (ctx) => postCtrl.show(ctx))\nrouter.post('/posts',       (ctx) => postCtrl.store(ctx),   guard)\nrouter.delete('/posts/:id', (ctx) => postCtrl.destroy(ctx), guard)`} />

      <h2 id="split-routes">Tip: move routes to their own file</h2>
      <p>
        For larger apps, extract route registration into a dedicated file to keep{' '}
        <code>server.ts</code> clean:
      </p>
      <CodeBlock lang="typescript" filename="src/routes/api.ts" code={`import type { Application } from '@pearl-framework/pearl'\nimport { Router, Authenticate, AuthManager } from '@pearl-framework/pearl'\nimport { PostController } from '../controllers/PostController.js'\n\nexport function registerRoutes(app: Application): Router {\n  const router   = new Router()\n  const auth     = app.container.make(AuthManager)\n  const guard    = [Authenticate(auth)]\n  const postCtrl = app.container.make(PostController)\n\n  router.get('/posts',        (ctx) => postCtrl.index(ctx))\n  router.get('/posts/:id',    (ctx) => postCtrl.show(ctx))\n  router.post('/posts',       (ctx) => postCtrl.store(ctx),   guard)\n  router.delete('/posts/:id', (ctx) => postCtrl.destroy(ctx), guard)\n\n  return router\n}`} />
      <CodeBlock lang="typescript" filename="src/server.ts" code={`import { registerRoutes } from './routes/api.js'\n\n// after app.boot():\nconst router = registerRoutes(app)\nawait new HttpKernel().useRouter(router).listen(3000)`} />
    </>
  )
}