import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Authentication — Pearl.js',
  description: 'JWT authentication in Pearl.js — guards, login, token verification.',
}

export default function AuthPage() {
  return (
    <>
      <h1>Authentication</h1>
      <p>
        Pearl uses a <strong>guard-based</strong> auth system. A guard knows how to verify a
        user's identity — the built-in <code>JwtGuard</code> issues and validates Bearer tokens.
        You provide a <code>UserProvider</code> that tells the guard where to look up users in
        your database.
      </p>
      <p>
        Once a guard is registered, protect any route by passing{' '}
        <code>Authenticate(auth)</code> as middleware.
      </p>

      <h2 id="how-it-works">How it works</h2>
      <ol>
        <li>You register a <code>JwtGuard</code> with a <code>UserProvider</code> (your DB logic).</li>
        <li>On login, the guard verifies credentials and issues a signed JWT.</li>
        <li>On subsequent requests, the guard reads the <code>Authorization: Bearer ...</code> header and loads the user.</li>
        <li>Inside a protected handler, <code>ctx.auth.user()</code> returns the authenticated user.</li>
      </ol>

      <h2 id="setup">Setup</h2>
      <p>
        Register the guard inside <code>AppServiceProvider.register()</code>. You need to
        implement two methods in <code>UserProvider</code>: one that finds a user by ID
        (for token verification) and one that finds a user by credentials (for login).
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { JwtGuard, AuthManager, Hash, DatabaseManager } from '@pearl-framework/pearl'
import type { UserProvider } from '@pearl-framework/pearl'
import { eq } from '@pearl-framework/pearl'
import { users } from '../models/User.js'

// Inside register():

this.container.singleton(JwtGuard, () => {
  const db = this.container.make(DatabaseManager)

  // UserProvider tells the guard how to find users in your database
  const userProvider: UserProvider = {
    // Called when verifying a token — loads the user by their ID
    async findById(id: string) {
      const [row] = await db.db
        .select().from(users).where(eq(users.id, Number(id)))
      return row ?? null
    },

    // Called on login — checks email + password
    async findByCredentials(email: string, password: string) {
      const [row] = await db.db
        .select().from(users).where(eq(users.email, email))
      if (!row) return null
      const valid = await Hash.check(password, row.passwordHash)
      return valid ? row : null
    },
  }

  return new JwtGuard(userProvider, {
    secret:    process.env.JWT_SECRET ?? 'change-me',
    expiresIn: '7d',
  })
})

this.container.singleton(AuthManager, () => {
  const manager = new AuthManager()
  manager.register('jwt', this.container.make(JwtGuard))
  manager.setDefault('jwt')
  return manager
})`} />

      <h2 id="auth-controller">Login & register routes</h2>
      <p>
        Create an <code>AuthController</code> with three methods: one to register a new user,
        one to log in and return a token, and one to return the currently authenticated user.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/AuthController.ts" code={`import { Hash, JwtGuard, DatabaseManager } from '@pearl-framework/pearl'
import type { HttpContext } from '@pearl-framework/pearl'
import { users } from '../models/User.js'

export class AuthController {
  constructor(
    private db:    DatabaseManager,
    private guard: JwtGuard,
  ) {}

  // POST /auth/register
  async register(ctx: HttpContext) {
    const { name, email, password } = await ctx.request.json<{
      name: string; email: string; password: string
    }>()
    const passwordHash = await Hash.make(password)
    const [user] = await this.db.db
      .insert(users).values({ name, email, passwordHash }).returning()
    const token = await this.guard.issueToken(String(user.id))
    ctx.response.status(201).json({ token, user })
  }

  // POST /auth/login
  async login(ctx: HttpContext) {
    const { email, password } = await ctx.request.json<{
      email: string; password: string
    }>()
    const user = await this.guard.attempt(email, password)
    if (!user) {
      ctx.response.status(401).json({ error: 'Invalid email or password' })
      return
    }
    const token = await this.guard.issueToken(String(user.id))
    ctx.response.json({ token, user })
  }

  // GET /auth/me  — protected route
  async me(ctx: HttpContext) {
    ctx.response.json({ user: ctx.auth.user() })
  }
}`} />

      <h2 id="protecting-routes">Protecting routes</h2>
      <p>
        Pass <code>Authenticate(auth)</code> in the middleware array for any route that
        requires a logged-in user. Requests without a valid token get a <code>401</code>{' '}
        automatically.
      </p>
      <CodeBlock lang="typescript" filename="src/main.ts" code={`const auth     = app.container.make(AuthManager)
const authCtrl = app.container.make(AuthController)
const guard    = [Authenticate(auth)]

// Public — no token required
router.post('/auth/register', (ctx) => authCtrl.register(ctx))
router.post('/auth/login',    (ctx) => authCtrl.login(ctx))

// Protected — token required
router.get('/auth/me',  (ctx) => authCtrl.me(ctx),    guard)
router.post('/posts',   (ctx) => postCtrl.store(ctx),  guard)`} />

      <h2 id="using-the-token">Using the token</h2>
      <p>
        Send the token in the <code>Authorization</code> header on every protected request:
      </p>
      <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer <your-token>" \\
     http://localhost:3000/auth/me`} />

      <h2 id="password-hashing">Password hashing</h2>
      <p>
        Use the built-in <code>Hash</code> utility — it uses bcrypt under the hood. Never
        store plain-text passwords.
      </p>
      <CodeBlock lang="typescript" code={`import { Hash } from '@pearl-framework/pearl'

// Hash a password before storing
const hash = await Hash.make('my-password')

// Verify a password against the stored hash
const valid = await Hash.check('my-password', hash)  // true
const wrong = await Hash.check('wrong-pass',  hash)  // false`} />
    </>
  )
}