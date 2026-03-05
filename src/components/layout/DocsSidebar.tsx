'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/lib/config'

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      position: 'sticky', top: 60, height: 'calc(100vh - 60px)',
      overflowY: 'auto', padding: '1.5rem 0',
      borderRight: '1px solid var(--border)',
    }}>
      {docsNav.map((section) => (
        <div key={section.title} style={{ marginBottom: '1.5rem', padding: '0 1rem' }}>
          {/* Section heading */}
          <p style={{
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--muted)',
            marginBottom: '0.4rem', paddingLeft: '0.65rem',
          }}>
            {section.title}
          </p>

          {section.items.map((item) => {
            // Only mark active on an EXACT match.
            // Anchor items like /docs/getting-started#installation must match
            // their full href — they are NOT active just because the page path matches.
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-link${active ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </aside>
  )
}