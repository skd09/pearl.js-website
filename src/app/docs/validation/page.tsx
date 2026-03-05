import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Validation',
  description: 'Validate requests with FormRequest and Zod in Pearl.js.',
}

export default function ValidationPage() {
  return (
    <>
      <h1>Validation</h1>
      <p>Pearl uses <strong>FormRequest</strong> classes with Zod schemas. Invalid requests are automatically rejected before reaching your controller.</p>

      <h2>Creating a FormRequest</h2>
      <CodeBlock lang="typescript" filename="src/requests/CreatePostRequest.ts" code={`import { FormRequest } from '@pearl-framework/pearl'
import { z } from 'zod'

export class CreatePostRequest extends FormRequest {
  schema = z.object({
    title:     z.string().min(3).max(255),
    body:      z.string().min(10),
    published: z.boolean().optional().default(false),
  })
}`} />

      <h2>Using in a controller</h2>
      <CodeBlock lang="typescript" code={`import { CreatePostRequest } from '../requests/CreatePostRequest.js'

async store(ctx: HttpContext) {
  const data = await new CreatePostRequest().validate(ctx)
  // data is fully typed: { title: string, body: string, published: boolean }

  const [post] = await this.db.db
    .insert(posts)
    .values({ ...data, userId: ctx.auth.user<User>().id })
    .returning()

  ctx.response.status(201).json({ data: post })
}`} />

      <h2>Validation error response</h2>
      <CodeBlock lang="json" code={`{
  "errors": {
    "title": ["String must contain at least 3 character(s)"],
    "body":  ["Required"]
  }
}`} />

      <h2>Common Zod rules</h2>
      <CodeBlock lang="typescript" code={`schema = z.object({
  email: z.string().email('Must be a valid email'),
  age:   z.number().min(18, 'Must be at least 18'),
  role:  z.enum(['admin', 'user', 'guest']),
  tags:  z.array(z.string()).max(5).optional(),
})`} />
    </>
  )
}
