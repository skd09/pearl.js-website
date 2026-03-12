import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ─── Security Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Stop MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Force HTTPS for 1 year
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Control referrer info sent to other sites
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable browser features you don't use
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-inline/eval needed for Next.js
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // Remove the X-Powered-By header (don't advertise Next.js)
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
      // ─── app-ads.txt — must be publicly readable, no caching issues ──────────
      {
        source: '/app-ads.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',  // cache for 1 day
          },
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'www.pearljs.dev' }],
        destination: 'https://pearljs.dev/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig