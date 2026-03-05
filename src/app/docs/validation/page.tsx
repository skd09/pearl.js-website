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
        Define the shape you expect, call <code>.validate(ctx)</code>, and Pearl rejects
        invalid requests with a <code>422</code> automatically — your controller never
        sees bad data.
      </p>

      <h2 id="create-request">Create a FormRequest</h2>
      <p>Generate one with the CLI, then define a Zod schema on the <code>schema</code> property:</p>
      <CodeBlock lang="bash" code={`pearl make:request CreatePostRequest
# → src/requests/CreatePostRequest.ts`} />
      <CodeBlock lang="typescript" filename="src/requests/CreatePostRequest.ts" code={`import { FormRequest } from '@pearl-framework/pearl'
import { z } from 'zod'

export class CreatePostRequest extends FormRequest {
  schema = z.object({
    title:     z.string().min(3).max(255),
    content:   z.string().min(10),
    published: z.boolean().optional().default(false),
  })
}`} />

      <h2 id="using-in-controller">Use in a controller</h2>
      <p>
        Instantiate the request and call <code>.validate(ctx)</code>. The returned{' '}
        <code>data</code> object is fully typed from your Zod schema — no casting needed.
      </p>
      <CodeBlock lang="typescript" filename="src/controllers/PostController.ts" code={`import { CreatePostRequest } from '../requests/CreatePostRequest.js'

async store(ctx: HttpContext) {
  // Throws a 422 automatically if validation fails
  const data = await new CreatePostRequest().validate(ctx)

  // data is typed: { title: string; content: string; published: boolean }
  const [post] = await this.db.db
    .insert(posts)
    .values({ ...data, userId: ctx.auth.user().id })
    .returning()

  ctx.response.status(201).json({ data: post })
}`} />

      <h2 id="error-format">Validation error response</h2>
      <p>
        When validation fails, Pearl automatically returns a <code>422 Unprocessable
        Entity</code> with this JSON structure — no extra code needed on your end:
      </p>
      <CodeBlock lang="json" code={`{
  "errors": {
    "title":   ["String must contain at least 3 character(s)"],
    "content": ["Required"]
  }
}`} />

      <h2 id="zod-rules">Common Zod validation rules</h2>
      <p>
        Zod is very expressive. Here are the patterns you'll reach for most often:
      </p>
      <CodeBlock lang="typescript" code={`schema = z.object({
  // Strings
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  slug:     z.string().regex(/^[a-z0-9-]+$/),

  // Numbers
  age:      z.number().int().min(18).max(120),
  price:    z.number().positive(),

  // Enums
  role:     z.enum(['admin', 'editor', 'viewer']),
  status:   z.enum(['draft', 'published']).default('draft'),

  // Optional and nullable
  bio:      z.string().optional(),        // may be absent
  website:  z.string().url().nullable(),  // may be null

  // Arrays
  tags:     z.array(z.string()).max(5).optional(),
  ids:      z.array(z.number().int()).nonempty(),

  // Booleans
  agree:    z.boolean(),
  notify:   z.boolean().default(false),
})`} />

      <h2 id="custom-messages">Custom error messages</h2>
      <p>
        Pass a message string to any Zod method to override the default error text:
      </p>
      <CodeBlock lang="typescript" code={`schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age:      z.number().min(18, 'You must be 18 or older to sign up'),
})`} />
    </>
  )
}