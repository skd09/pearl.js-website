import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'OpenAPI — Pearl.js',
  description: 'Generate an OpenAPI 3.1 document and Swagger UI from your Pearl.js routes.',
}

export default function OpenApiPage() {
  return (
    <>
      <h1>OpenAPI</h1>
      <p>
        Express and Fastify leave you maintaining a spec by hand, next to the validation
        that actually runs — and the two drift. Pearl already knows the method, the path,
        the path parameters, and (through <code>ValidationPipe</code>) the Zod schema
        gating the request. The document is derived from all of that, so it cannot disagree
        with your validation.
      </p>

      <h2 id="getting-started">Getting started</h2>
      <CodeBlock lang="bash" code={`npm install @pearl-framework/openapi`} />
      <CodeBlock lang="typescript" filename="src/server.ts" code={`import { serveOpenApi } from '@pearl-framework/pearl'

router.post('/users', createUser, [ValidationPipe(CreateUserRequest)])
router.get('/users/:id', showUser)

// Register AFTER your routes
serveOpenApi(router, {
  info: { title: 'My API', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com' }],
})`} />
      <p>That serves the document at <code>/openapi.json</code> and Swagger UI at <code>/docs</code>.</p>
      <CodeBlock lang="typescript" code={`serveOpenApi(router, { info, uiPath: false })          // JSON only
serveOpenApi(router, { info, documentPath: '/spec' })  // different path`} />
      <p>
        The UI loads Swagger from a CDN rather than vendoring about a megabyte of assets
        into the package, so the page needs network access to that CDN.
      </p>

      <h2 id="derived">What gets derived</h2>
      <CodeBlock lang="typescript" code={`class UpdateUserRequest extends FormRequest {
  readonly schema = z.object({
    id:    z.string(),
    name:  z.string().optional(),
    email: z.string().email(),
  })
}

router.put('/users/:id', updateUser, [ValidationPipe(UpdateUserRequest)])`} />
      <p>
        You get <code>PUT /users/{'{id}'}</code> with <code>id</code> as a required path
        parameter, <code>name</code> and <code>email</code> in the request body
        (<code>email</code> required), a <code>200</code>, and the <code>422</code> shape
        the framework actually returns when validation fails.
      </p>
      <p>
        <code>FormRequest.resolveInput</code> merges body, query and route params into one
        object, so a single schema covers all three. The generator splits them back apart:
      </p>
      <table>
        <thead><tr><th>Where a field lands</th><th>Rule</th></tr></thead>
        <tbody>
          <tr><td>Path parameter</td><td>The route declares it (<code>:id</code>)</td></tr>
          <tr><td>Request body</td><td>Any remaining field, on <code>POST</code>/<code>PUT</code>/<code>PATCH</code></td></tr>
          <tr><td>Query parameter</td><td>Any remaining field, on every other method</td></tr>
        </tbody>
      </table>
      <p>
        A path parameter is always marked required, even if the schema says{' '}
        <code>.optional()</code> — the route cannot match without it.{' '}
        <code>HEAD</code> and <code>OPTIONS</code> are excluded by default.
      </p>

      <h2 id="describe">Adding what a schema cannot express</h2>
      <p>Summaries, tags and extra responses are the only things you write by hand:</p>
      <CodeBlock lang="typescript" code={`import { describeRoute } from '@pearl-framework/pearl'

describeRoute('POST', '/users', {
  summary: 'Create a user',
  tags: ['Users'],
  responses: {
    '409': { description: 'Email already taken', schema: { type: 'object' } },
  },
})

describeRoute('GET', '/legacy/report', { deprecated: true })
describeRoute('POST', '/internal/reindex', { hidden: true })   // omitted entirely`} />
      <p>Use the router&apos;s path (<code>/users/:id</code>), not the OpenAPI form.</p>

      <h2 id="build-step">Building the document yourself</h2>
      <CodeBlock lang="typescript" code={`import { generateOpenApiDocument } from '@pearl-framework/pearl'

const document = generateOpenApiDocument(router, {
  info: { title: 'My API', version: '1.0.0' },
  excludePaths: ['/internal/metrics'],
})

await writeFile('openapi.json', JSON.stringify(document, null, 2))`} />
      <p>
        Useful in a build step feeding a client generator or an API gateway, with no UI
        served at runtime.
      </p>

      <h2 id="exposure">A note on exposure</h2>
      <p>
        The document reflects whatever the router holds, including routes you may not want
        advertised. Use <code>excludePaths</code>, or{' '}
        <code>describeRoute(..., {'{ hidden: true }'})</code>, and put <code>/docs</code>{' '}
        behind auth if the API is not meant to be publicly discoverable.
      </p>
    </>
  )
}
