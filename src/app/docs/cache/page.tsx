import type { Metadata } from 'next'
import { CodeBlock } from '@/components/ui/CodeBlock'

export const metadata: Metadata = {
  title: 'Cache — Pearl.js',
  description: 'Key/value caching with in-memory and Redis stores in Pearl.js.',
}

export default function CachePage() {
  return (
    <>
      <h1>Cache</h1>
      <p>
        A cache with two stores out of the box: <code>MemoryStore</code> for a single
        process, and <code>RedisStore</code> when values must be shared across workers or
        survive a restart. Serialization is handled for you, so values round-trip as the
        shape you stored.
      </p>

      <h2 id="getting-started">Getting started</h2>
      <CodeBlock lang="bash" code={`npm install @pearl-framework/cache
npm install ioredis   # only for RedisStore`} />
      <CodeBlock lang="typescript" code={`import { Cache, MemoryStore } from '@pearl-framework/pearl'

const cache = new Cache(new MemoryStore(), { ttlSeconds: 300 })

await cache.put('plan:free', { seats: 3 })
const plan = await cache.get<{ seats: number }>('plan:free')`} />

      <h2 id="remember">remember</h2>
      <p>The pattern worth reaching for — return the cached value, or compute it once:</p>
      <CodeBlock lang="typescript" code={`const user = await cache.remember(\`user:\${id}\`, () => db.findUser(id), 600)`} />
      <p>
        A <code>null</code> result is cached too. That matters: a lookup that legitimately
        finds nothing would otherwise re-run on every request — the hot path caching exists
        to protect. Use <code>has()</code> when you need to tell a cached{' '}
        <code>null</code> from a miss. If the factory throws, nothing is cached and the
        error propagates.
      </p>

      <h2 id="api">API</h2>
      <table>
        <thead><tr><th>Method</th><th>Behaviour</th></tr></thead>
        <tbody>
          <tr><td><code>get&lt;T&gt;(key)</code></td><td>Value, or <code>undefined</code> when absent</td></tr>
          <tr><td><code>has(key)</code></td><td>Distinguishes a cached <code>null</code> from a miss</td></tr>
          <tr><td><code>put(key, value, ttl?)</code></td><td>Store, using the default TTL when omitted</td></tr>
          <tr><td><code>remember(key, factory, ttl?)</code></td><td>Cached value, else compute and cache</td></tr>
          <tr><td><code>rememberForever(key, factory)</code></td><td>As above with no expiry</td></tr>
          <tr><td><code>pull&lt;T&gt;(key)</code></td><td>Read, then remove</td></tr>
          <tr><td><code>forget(key)</code> / <code>flush()</code></td><td>Remove one key / everything</td></tr>
          <tr><td><code>increment(key, by?, ttl?)</code></td><td>Atomic; returns the new value</td></tr>
          <tr><td><code>decrement(key, by?, ttl?)</code></td><td>Atomic; returns the new value</td></tr>
        </tbody>
      </table>

      <h2 id="stores">Stores</h2>
      <h3 id="memory">MemoryStore</h3>
      <CodeBlock lang="typescript" code={`new MemoryStore({ maxEntries: 10_000 })  // default`} />
      <p>
        Bounded on purpose. An unbounded process-local cache is a memory leak for any key
        space you do not control — user ids, URLs, search terms — so once{' '}
        <code>maxEntries</code> is reached the entry closest to expiry is evicted,
        preferring expiring entries over ones stored without a TTL.
      </p>

      <h3 id="redis">RedisStore</h3>
      <CodeBlock lang="typescript" code={`import Redis from 'ioredis'
import { RedisStore } from '@pearl-framework/pearl'

const store = new RedisStore(new Redis(process.env.REDIS_URL!), { prefix: 'myapp:cache:' })`} />
      <p>
        The prefix keeps keys from colliding with other users of the same database and
        scopes <code>flush()</code> so it cannot delete another application&apos;s data.{' '}
        <code>flush()</code> uses <code>SCAN</code>, not <code>KEYS</code> — the latter
        blocks the server for the length of the keyspace.
      </p>

      <h2 id="rate-limiting">Distributed rate limiting</h2>
      <p>
        The rate-limit store bundled with the HTTP package is process-local, so behind more
        than one worker each process keeps its own counters and the effective limit becomes{' '}
        <code>max × processes</code>. <code>CacheRateLimitStore</code> fixes that:
      </p>
      <CodeBlock lang="typescript" code={`import { RateLimiter, CacheRateLimitStore, RedisStore } from '@pearl-framework/pearl'

RateLimiter.useStore(new CacheRateLimitStore(new RedisStore(redis)))`} />
      <p>
        The window is fixed from the first hit rather than sliding — the TTL is applied only
        by the increment that creates the key, so a caller who keeps hitting the endpoint
        still gets a reset.
      </p>

      <h2 id="provider">Service provider</h2>
      <CodeBlock lang="typescript" filename="src/providers/AppCacheServiceProvider.ts" code={`import { CacheServiceProvider, RedisStore } from '@pearl-framework/pearl'
import type { CacheServiceConfig } from '@pearl-framework/pearl'

export class AppCacheServiceProvider extends CacheServiceProvider {
  protected config: CacheServiceConfig = {
    store: new RedisStore(new Redis(process.env.REDIS_URL!)),
    ttlSeconds: 300,
  }
}`} />
      <CodeBlock lang="typescript" code={`const cache = app.container.make(Cache)`} />
    </>
  )
}
