import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Controllers',
  description: 'Organise route handlers into controller classes in Pearl.js.',
}

export default function ControllersPage() {
  return (
    <>
      <h1>Controllers</h1>
      <p>Controllers group related route handlers into a single class. Generate one with the CLI and register it as a singleton in your service provider.</p>

      <h2>Generating a controller</h2>
      <CodeBlock lang="bash" code={`npx pearl make:controller PostController`} />

      <h2>A basic controller</h2>
      <CodeBlock lang="typescript" filename="src/controllers/PostController.ts" code={`import type { HttpContext } from '@pearl-framework/pearl'
import { DatabaseManager } from '@pearl-framework/pearl'
import { posts } from '../models/Post.js'
import { eq } from '@pearl-framework/pearl'

export class PostController {
  constructor(private db: DatabaseManager) {}

  async index(ctx: HttpContext) {
    const all = await this.db.db.select().from(posts)
    ctx.response.json({ data: all })
  }

  async show(ctx: HttpContext) {
    const id = Number(ctx.request.params.id)
    const [post] = await this.db.db.select().from(posts).where(eq(posts.id, id))
    if (!post) { ctx.response.status(404).json({ error: 'Not found' }); return }
    ctx.response.json({ data: post })
  }

  async store(ctx: HttpContext) {
    const body = await ctx.request.json<{ title: string; body: string }>()
    const user = ctx.auth.user<User>()
    const [post] = await this.db.db
      .insert(posts)
      .values({ title: body.title, body: body.body, userId: user.id })
      .returning()
    ctx.response.status(201).json({ data: post })
  }

  async destroy(ctx: HttpContext) {
    const id = Number(ctx.request.params.id)
    await this.db.db.delete(posts).where(eq(posts.id, id))
    ctx.response.status(204).end()
  }
}`} />

      <h2>Registering in AppServiceProvider</h2>
      <CodeBlock lang="typescript" code={`this.container.singleton(PostController, () =>
  new PostController(this.container.make(DatabaseManager))
)`} />

      <h2>Wiring to routes</h2>
      <CodeBlock lang="typescript" code={`const posts = app.container.make(PostController)
const guard  = [Authenticate(auth)]

router.get('/posts',        (ctx) => posts.index(ctx))
router.get('/posts/:id',    (ctx) => posts.show(ctx))
router.post('/posts',       (ctx) => posts.store(ctx),   guard)
router.delete('/posts/:id', (ctx) => posts.destroy(ctx), guard)`} />
    </>
  )
}
