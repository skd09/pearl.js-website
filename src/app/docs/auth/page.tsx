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
        <code>Authenticate(auth)</code> as middleware. Inside the handler,{' '}
        <code>ctx.get('auth.user')</code> returns the authenticated user.
      </p>

      <h2 id="how-it-works">How it works</h2>
      <ol>
        <li>You register a <code>JwtGuard</code> with a <code>UserProvider</code> (your DB logic).</li>
        <li>On login, the guard verifies credentials and issues a signed JWT.</li>
        <li>On subsequent requests, the guard reads the <code>Authorization: Bearer ...</code> header and loads the user.</li>
        <li>Inside a protected handler, <code>ctx.get('auth.user')</code> returns the authenticated user.</li>
      </ol>

      <h2 id="setup">Setup</h2>
      <p>
        Implement <code>UserProvider</code> with two methods — one to find a user by ID
        (for token verification) and one to find a user by credentials (for login). Then
        register the guard inside <code>AppServiceProvider.register()</code>.
      </p>
      <CodeBlock lang="typescript" filename="src/providers/AppServiceProvider.ts" code={`import { JwtGuard, AuthManager, Hash, DatabaseManager } from '@pearl-framework/pearl'\nimport type { UserProvider } from '@pearl-framework/pearl'\nimport { eq } from '@pearl-framework/pearl'\nimport { users } from '../schema/users.js'\n\n// Inside register():\n\nthis.container.singleton(JwtGuard, () => {\n  const db = this.container.make(DatabaseManager)\n\n  const userProvider: UserProvider = {\n    // Called when verifying a token — loads the user by their ID\n    async findById(id: string) {\n      const [row] = await db.db\n        .select().from(users).where(eq(users.id, Number(id)))\n      return row ?? null\n    },\n\n    // Called on login — checks email + password\n    async findByCredentials(email: string, password: string) {\n      const [row] = await db.db\n        .select().from(users).where(eq(users.email, email))\n      if (!row) return null\n      return await Hash.check(password, row.password) ? row : null\n    },\n  }\n\n  return new JwtGuard(userProvider, {\n    secret:    process.env.JWT_SECRET!,  // min 32 chars — use: openssl rand -base64 32\n    expiresIn: '7d',\n  })\n})\n\nthis.container.singleton(AuthManager, () => {\n  const manager = new AuthManager()\n  manager.register('jwt', this.container.make(JwtGuard))\n  manager.setDefault('jwt')\n  return manager\n})`} />

      <h2 id="auth-controller">Login & register routes</h2>
      <p>
        Create an <code>AuthController</code> with register, login, and me methods.
        Note that <code>ctx.request.body</code> is a getter — no parentheses.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/AuthController.ts" code={`import { Hash, JwtGuard, DatabaseManager } from '@pearl-framework/pearl'\nimport type { HttpContext } from '@pearl-framework/pearl'\nimport { users } from '../schema/users.js'\n\nexport class AuthController {\n  constructor(\n    private db:    DatabaseManager,\n    private guard: JwtGuard,\n  ) {}\n\n  // POST /auth/register\n  async register(ctx: HttpContext) {\n    const { name, email, password } = ctx.request.body as {\n      name: string; email: string; password: string\n    }\n    const [user] = await (this.db.adapter as DrizzleAdapter).db\n      .insert(users)\n      .values({ name, email, password: await Hash.make(password) })\n      .returning()\n    const token = await this.guard.issueToken(String(user.id))\n    ctx.response.created({ token, user })\n  }\n\n  // POST /auth/login\n  async login(ctx: HttpContext) {\n    const { email, password } = ctx.request.body as {\n      email: string; password: string\n    }\n    const user = await this.guard.attempt(email, password)\n    if (!user) return ctx.response.unauthorized('Invalid email or password')\n    const token = await this.guard.issueToken(String(user.id))\n    ctx.response.json({ token, user })\n  }\n\n  // GET /auth/me  — protected route\n  async me(ctx: HttpContext) {\n    ctx.response.json(ctx.get('auth.user'))\n  }\n}`} />

      <h2 id="protecting-routes">Protecting routes</h2>
      <p>
        Pass <code>Authenticate(auth)</code> in the middleware array for any route that
        requires a logged-in user. Requests without a valid token get a <code>401</code>{' '}
        automatically.
      </p>
      <CodeBlock lang="typescript" filename="src/server.ts" code={`const auth     = app.container.make(AuthManager)\nconst authCtrl = app.container.make(AuthController)\nconst guard    = [Authenticate(auth)]\n\n// Public — no token required\nrouter.post('/auth/register', (ctx) => authCtrl.register(ctx))\nrouter.post('/auth/login',    (ctx) => authCtrl.login(ctx))\n\n// Protected — valid Bearer token required\nrouter.get('/auth/me',  (ctx) => authCtrl.me(ctx),    guard)\nrouter.post('/posts',   (ctx) => postCtrl.store(ctx),  guard)`} />

      <h2 id="using-the-token">Using the token</h2>
      <p>
        Send the token in the <code>Authorization</code> header on every protected request:
      </p>
      <CodeBlock lang="bash" code={`curl -H "Authorization: Bearer <your-token>" \\\n     http://localhost:3000/auth/me`} />

      <h2 id="optional-auth">Optional auth</h2>
      <p>
        Use <code>OptionalAuth(auth)</code> when a route should work for both guests and
        authenticated users. <code>ctx.get('auth.user')</code> returns the user if a valid token is
        present, or <code>null</code> if not — no 401 is sent.
      </p>
      <CodeBlock lang="typescript" code={`import { OptionalAuth } from '@pearl-framework/pearl'\n\nrouter.get('/feed', async (ctx) => {\n  const user = ctx.get('auth.user')  // AuthUser | null\n  ctx.response.json(buildFeed(user))\n}, [OptionalAuth(auth)])`} />

      <h2 id="password-hashing">Password hashing</h2>
      <p>
        Use the built-in <code>Hash</code> utility — bcrypt under the hood. Never store
        plain-text passwords.
      </p>
      <CodeBlock lang="typescript" code={`import { Hash } from '@pearl-framework/pearl'\n\n// Hash before storing\nconst hash = await Hash.make('my-password')\n\n// Verify against a stored hash\nconst valid = await Hash.check('my-password', hash)  // true\nconst wrong = await Hash.check('wrong-pass',  hash)  // false`} />

      <h2 id="security">Security notes</h2>
      <ul>
        <li>
          <strong>Algorithm pinning</strong> — <code>jwt.verify()</code> is called with an
          explicit <code>algorithms</code> allowlist. This prevents algorithm confusion
          attacks where an attacker switches the token's algorithm to bypass verification.
        </li>
        <li>
          <strong><code>none</code> algorithm blocked</strong> — passing{' '}
          <code>algorithm: 'none'</code> throws at construction time.
        </li>
        <li>
          <strong>Secret strength</strong> — use a minimum of 32 random characters.
          Generate one with <code>openssl rand -base64 32</code>.
        </li>
      </ul>
    </>
  )
}