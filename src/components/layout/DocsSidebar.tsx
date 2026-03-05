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
          <p style={{
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-3)',
            marginBottom: '0.5rem', paddingLeft: '0.5rem',
          }}>
            {section.title}
          </p>
          {section.items.map((item) => {
            const active = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0])
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block', padding: '0.35rem 0.5rem', borderRadius: 5,
                  fontSize: '0.875rem',
                  color: active ? 'var(--pearl)' : 'var(--text-2)',
                  background: active ? 'var(--pearl-glow)' : 'transparent',
                  borderLeft: active ? '2px solid var(--pearl)' : '2px solid transparent',
                  paddingLeft: active ? '0.75rem' : '0.5rem',
                  transition: 'all 0.15s', marginBottom: 2,
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-3)' } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent' } }}
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
