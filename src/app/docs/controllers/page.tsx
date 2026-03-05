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
      <CodeBlock lang="bash" code={`pearl make:controller PostController
# → src/controllers/PostController.ts`} />

      <h2 id="writing">Writing a controller</h2>
      <p>
        Declare dependencies as constructor arguments. The IoC container resolves and
        injects them — you never call <code>new PostController(...)</code> yourself.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/PostController.ts" code={`import type { HttpContext } from '@pearl-framework/pearl'
import { DatabaseManager } from '@pearl-framework/pearl'
import { eq } from '@pearl-framework/pearl'
import { posts } from '../models/Post.js'

export class PostController {
  // DatabaseManager is injected automatically by the IoC container
  constructor(private db: DatabaseManager) {}

  // GET /posts
  async index(ctx: HttpContext) {
    const all = await this.db.db.select().from(posts)
    ctx.response.json({ data: all })
  }

  // GET /posts/:id
  async show(ctx: HttpContext) {
    const id = Number(ctx.request.params.id)
    const [post] = await this.db.db
      .select().from(posts).where(eq(posts.id, id))
    if (!post) {
      ctx.response.status(404).json({ error: 'Post not found' })
      return
    }
    ctx.response.json({ data: post })
  }

  // POST /posts — requires authentication
  async store(ctx: HttpContext) {
    const { title, content } = await ctx.request.json<{
      title: string
      content: string
    }>()
    const user  = ctx.auth.user<User>()
    const [post] = await this.db.db
      .insert(posts)
      .values({ title, content, userId: user.id })
      .returning()
    ctx.response.status(201).json({ data: post })
  }

  // DELETE /posts/:id — requires authentication
  async destroy(ctx: HttpContext) {
    const id = Number(ctx.request.params.id)
    await this.db.db.delete(posts).where(eq(posts.id, id))
    ctx.response.status(204).end()
  }
}`} />

      <h2 id="register">Register in AppServiceProvider</h2>
      <p>
        Bind your controller as a singleton inside <code>register()</code>. Pearl uses
        this to know how to build it when you resolve it from the container.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { PostController } from '../controllers/PostController.js'

// Inside register():
this.container.singleton(PostController, () =>
  new PostController(
    this.container.make(DatabaseManager)
  )
)`} />

      <h2 id="wire-routes">Wire to routes</h2>
      <p>
        Resolve the controller from the container after <code>app.boot()</code>, then pass
        its methods to the router:
      </p>
      <CodeBlock lang="typescript" filename="src/main.ts" code={`const postCtrl = app.container.make(PostController)
const guard    = [Authenticate(auth)]

router.get('/posts',        (ctx) => postCtrl.index(ctx))
router.get('/posts/:id',    (ctx) => postCtrl.show(ctx))
router.post('/posts',       (ctx) => postCtrl.store(ctx),   guard)
router.delete('/posts/:id', (ctx) => postCtrl.destroy(ctx), guard)`} />

      <h2 id="split-routes">Tip: move routes to their own file</h2>
      <p>
        For larger apps, extract route registration into a dedicated file to keep{' '}
        <code>main.ts</code> clean:
      </p>
      <CodeBlock lang="typescript" filename="src/routes/api.ts" code={`import type { Application } from '@pearl-framework/pearl'
import { Router, Authenticate, AuthManager } from '@pearl-framework/pearl'
import { PostController } from '../controllers/PostController.js'

export function registerRoutes(app: Application): Router {
  const router   = new Router()
  const auth     = app.container.make(AuthManager)
  const guard    = [Authenticate(auth)]
  const postCtrl = app.container.make(PostController)

  router.get('/posts',        (ctx) => postCtrl.index(ctx))
  router.get('/posts/:id',    (ctx) => postCtrl.show(ctx))
  router.post('/posts',       (ctx) => postCtrl.store(ctx),   guard)
  router.delete('/posts/:id', (ctx) => postCtrl.destroy(ctx), guard)

  return router
}`} />
      <CodeBlock lang="typescript" filename="src/main.ts" code={`import { registerRoutes } from './routes/api.js'

// after app.boot():
const router = registerRoutes(app)
await new HttpKernel().useRouter(router).listen(3000)`} />
    </>
  )
}