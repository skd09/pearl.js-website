import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/docs/getting-started', '/docs/routing', '/docs/controllers', '/docs/middleware', '/docs/validation', '/docs/database', '/docs/auth', '/docs/events', '/docs/queue', '/docs/mail', '/docs/cli']
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: route === '' ? 1 : route === '/docs/getting-started' ? 0.9 : 0.7,
  }))
}
