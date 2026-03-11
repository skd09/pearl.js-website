import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Validation — Pearl.js',
  description: 'Validate request bodies with FormRequest and Zod in Pearl.js.',
}

export default function ValidationPage() {
  return (
    <>
      <h1>Validation</h1>
      <p>
        Pearl validates incoming request bodies using <strong>FormRequest</strong> classes
        backed by{' '}
        <a href="https://zod.dev" target="_blank" rel="noopener noreferrer">Zod</a>.
        Define the shape you expect, call <code>FormRequest.validate(ctx)</code>, and Pearl
        rejects invalid requests with a <code>422</code> automatically — your controller
        never sees bad data.
      </p>

      <h2 id="create-request">Create a FormRequest</h2>
      <p>Generate one with the CLI, then define a Zod schema on the <code>schema</code> property:</p>
      <CodeBlock lang="bash" code={`pearl make:request CreatePostRequest\n# → src/requests/CreatePostRequest.ts`} />
      <CodeBlock lang="typescript" filename="src/requests/CreatePostRequest.ts" code={`import { FormRequest } from '@pearl-framework/pearl'\nimport { z } from 'zod'\n\nexport class CreatePostRequest extends FormRequest {\n  schema = z.object({\n    title:     z.string().min(3).max(255),\n    content:   z.string().min(10),\n    published: z.boolean().optional().default(false),\n  })\n\n  async authorize(): Promise<boolean> {\n    return true  // return false to send a 403 before validation runs\n  }\n}`} />

      <h2 id="using-in-controller">Use in a controller</h2>
      <p>
        Call the static <code>FormRequest.validate(ctx)</code> method. The returned{' '}
        <code>data</code> object is fully typed from your Zod schema — no casting needed.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/PostController.ts" code={`import { CreatePostRequest } from '../requests/CreatePostRequest.js'\n\nasync store(ctx: HttpContext) {\n  // Throws a 422 automatically if validation fails\n  const req = await CreatePostRequest.validate(ctx)\n\n  // req.data is typed: { title: string; content: string; published: boolean }\n  const [post] = await this.db.db\n    .insert(posts)\n    .values({ ...req.data, userId: ctx.user()!.id })\n    .returning()\n\n  ctx.response.created({ data: post })\n}`} />

      <h2 id="validation-pipe">ValidationPipe middleware</h2>
      <p>
        Use <code>ValidationPipe</code> to validate before your handler runs — good for
        keeping handler code clean:
      </p>
      <CodeBlock lang="typescript" code={`import { ValidationPipe } from '@pearl-framework/pearl'\n\nrouter.post('/posts', createPost, [ValidationPipe(CreatePostRequest)])`} />

      <h2 id="error-format">Validation error response</h2>
      <p>
        When validation fails, Pearl automatically returns a{' '}
        <code>422 Unprocessable Entity</code> with this structure:
      </p>
      <CodeBlock lang="json" code={`{\n  "message": "Validation failed",\n  "errors": {\n    "title":   ["String must contain at least 3 character(s)"],\n    "content": ["Required"]\n  }\n}`} />

      <h2 id="authorization">Authorization</h2>
      <p>
        Override <code>authorize()</code> to enforce access control before validation runs.
        Returning <code>false</code> sends a <code>403 Forbidden</code> immediately:
      </p>
      <CodeBlock lang="typescript" filename="src/requests/UpdatePostRequest.ts" code={`export class UpdatePostRequest extends FormRequest {\n  schema = z.object({\n    title:   z.string().min(3).max(255),\n    content: z.string().min(10),\n  })\n\n  async authorize(): Promise<boolean> {\n    const user = this.ctx.user()\n    const post = await Post.find(db, this.ctx.request.param('id'))\n    return post?.userId === user?.id  // only the author can update\n  }\n}`} />

      <h2 id="zod-rules">Common Zod validation rules</h2>
      <CodeBlock lang="typescript" code={`schema = z.object({\n  // Strings\n  name:     z.string().min(2).max(100),\n  email:    z.string().email(),\n  slug:     z.string().regex(/^[a-z0-9-]+$/),\n\n  // Numbers\n  age:      z.number().int().min(18).max(120),\n  price:    z.number().positive(),\n\n  // Enums\n  role:     z.enum(['admin', 'editor', 'viewer']),\n  status:   z.enum(['draft', 'published']).default('draft'),\n\n  // Optional and nullable\n  bio:      z.string().optional(),        // may be absent\n  website:  z.string().url().nullable(),  // may be null\n\n  // Arrays\n  tags:     z.array(z.string()).max(5).optional(),\n  ids:      z.array(z.number().int()).nonempty(),\n\n  // Booleans\n  agree:    z.boolean(),\n  notify:   z.boolean().default(false),\n})`} />

      <h2 id="custom-messages">Custom error messages</h2>
      <CodeBlock lang="typescript" code={`schema = z.object({\n  email:    z.string().email('Please enter a valid email address'),\n  password: z.string().min(8, 'Password must be at least 8 characters'),\n  age:      z.number().min(18, 'You must be 18 or older to sign up'),\n})`} />
    </>
  )
}