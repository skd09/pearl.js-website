import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'JWT and API token authentication in Pearl.js.',
}

export default function AuthPage() {
  return (
    <>
      <h1>Authentication</h1>
      <p>Pearl provides a guard-based auth system. Register a <code>JwtGuard</code> with your own <code>UserProvider</code>, then protect routes with the <code>Authenticate</code> middleware.</p>

      <h2>Setup</h2>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { JwtGuard, AuthManager, Hash, DatabaseManager } from '@pearl-framework/pearl'
import type { UserProvider } from '@pearl-framework/pearl'
import { eq } from '@pearl-framework/pearl'
import { User, users } from '../models/User.js'

// In register():
this.container.singleton(JwtGuard, () => {
  const db = this.container.make(DatabaseManager)

  const userProvider: UserProvider<User> = {
    async findById(id) {
      const [row] = await db.db.select().from(users).where(eq(users.id, Number(id)))
      return row ? new User(row) : null
    },
    async findByCredentials(email, password) {
      const [row] = await db.db.select().from(users).where(eq(users.email, email))
      if (!row) return null
      return await Hash.check(password, row.passwordHash) ? new User(row) : null
    },
  }

  return new JwtGuard<User>(userProvider, {
    secret: process.env.JWT_SECRET ?? 'change-me',
    expiresIn: '7d',
  })
})

this.container.singleton(AuthManager, () => {
  const manager = new AuthManager()
  manager.register('jwt', this.container.make(JwtGuard) as JwtGuard<User>)
  manager.setDefault('jwt')
  return manager
})`} />

      <h2>Login & register</h2>
      <CodeBlock lang="typescript" filename="src/controllers/AuthController.ts" code={`import { Hash, JwtGuard } from '@pearl-framework/pearl'
import type { HttpContext } from '@pearl-framework/pearl'

export class AuthController {
  constructor(private db: DatabaseManager, private guard: JwtGuard<User>) {}

  async register(ctx: HttpContext) {
    const body = await ctx.request.json<{ name: string; email: string; password: string }>()
    const passwordHash = await Hash.make(body.password)
    const [user] = await this.db.db.insert(users).values({ ...body, passwordHash }).returning()
    const token = await this.guard.issueToken(user.id)
    ctx.response.status(201).json({ token, user })
  }

  async login(ctx: HttpContext) {
    const { email, password } = await ctx.request.json<{ email: string; password: string }>()
    const user = await this.guard.attempt(email, password)
    if (!user) { ctx.response.status(401).json({ error: 'Invalid credentials' }); return }
    ctx.response.json({ token: await this.guard.issueToken(user.id), user })
  }

  async me(ctx: HttpContext) {
    ctx.response.json({ user: ctx.auth.user<User>() })
  }
}`} />

      <h2>Protecting routes</h2>
      <CodeBlock lang="typescript" code={`const auth = app.container.make(AuthManager)
const guard = [Authenticate(auth)]

router.post('/auth/register', (ctx) => authCtrl.register(ctx))
router.post('/auth/login',    (ctx) => authCtrl.login(ctx))
router.get('/auth/me',        (ctx) => authCtrl.me(ctx), guard)
router.post('/posts',         (ctx) => postCtrl.store(ctx), guard)`} />

      <h2>Sending the token</h2>
      <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer <your-token>" http://localhost:3000/auth/me`} />

      <h2>Password hashing</h2>
      <CodeBlock lang="typescript" code={`import { Hash } from '@pearl-framework/pearl'

const hash  = await Hash.make('my-password')
const valid = await Hash.check('my-password', hash)  // true`} />
    </>
  )
}
