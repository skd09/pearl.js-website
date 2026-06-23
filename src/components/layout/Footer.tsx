import Link from 'next/link'
import { footerBadges, footerSections, footerTagline, siteConfig } from '@/lib/config'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }

export function Footer({ version }: { version: string }) {
  // Splice the live version badge into the second slot, between "MIT licensed"
  // and the static rest, so the visual order matches the legacy footer.
  const badges = [footerBadges[0], `v${version}`, ...footerBadges.slice(1)]
  return (
    <footer
      role="contentinfo"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', position: 'relative', zIndex: 1 }}
    >
      <div
        className="foot-grid"
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '4.5rem 2rem 3.5rem',
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem',
        }}
      >
        {/* Brand */}
        <div className="foot-brand">
          <Link
            href="/"
            aria-label="Pearl.js home"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.25rem' }}
          >
            <img src="/logo.svg" width={26} height={26} alt="Pearl.js" style={{ display: 'block' }} />
            <span style={{ ...mono, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.02em', color: 'var(--text)' }}>
              Pearl<span style={{ color: 'var(--accent)' }}>.js</span>
            </span>
          </Link>
          <p style={{ fontSize: '.875rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 300, marginBottom: '1.5rem' }}>
            {footerTagline}
          </p>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {badges.map((t) => (
              <span
                key={t}
                style={{
                  ...mono, fontSize: '.65rem', color: 'var(--muted)',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  padding: '.2rem .55rem', borderRadius: 3,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {footerSections.map((section) => (
          <nav key={section.title} aria-label={`${section.title} links`}>
            <p style={{ ...mono, fontSize: '.67rem', color: 'var(--body)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1.25rem', fontWeight: 600 }}>
              {section.title}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    aria-label={link.external ? `${link.label} (opens in new tab)` : undefined}
                    className="foot-link"
                  >
                    {link.label}
                    {link.external && (
                      <svg aria-hidden="true" width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ opacity: .4 }}>
                        <path d="M2 2h8v8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          maxWidth: 1200, margin: '0 auto',
          padding: '1.4rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '.75rem',
        }}
      >
        <p style={{ ...mono, fontSize: '.75rem', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} Pearl.js — released under the MIT License.
        </p>
        <p style={{ ...mono, fontSize: '.75rem', color: 'var(--muted)' }}>
          Designed &amp; built by{' '}
          <Link
            href={siteConfig.portfolio}
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border2)', paddingBottom: '1px', transition: 'border-color .12s' }}
          >
            {siteConfig.author}
          </Link>
        </p>
      </div>
    </footer>
  )
}
