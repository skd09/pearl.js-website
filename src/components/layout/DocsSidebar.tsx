'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { docsNav } from '@/lib/config'

export function DocsSidebar() {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    // Set initial hash on mount
    setHash(window.location.hash)

    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Also reset hash when navigating to a new page
  useEffect(() => {
    setHash(window.location.hash)
  }, [pathname])

  // Use IntersectionObserver to update hash as user scrolls
  useEffect(() => {
    const headings = document.querySelectorAll('h2[id]')
    if (!headings.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHash(`#${entry.target.id}`)
            break
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [pathname])

  const isActive = (href: string) => {
    const [hrefPath, hrefHash] = href.split('#')
    const fullHref = hrefHash ? `${hrefPath}#${hrefHash}` : hrefPath

    // Anchor link — must match both pathname and hash
    if (hrefHash) {
      return pathname === hrefPath && hash === `#${hrefHash}`
    }

    // Plain page link — active if pathname matches and no hash is active
    // (unless this is the base page and no other anchor link matches)
    const pageHasActiveAnchor = docsNav
      .flatMap((s) => s.items)
      .some((item) => {
        const [p, h] = item.href.split('#')
        return h && pathname === p && hash === `#${h}`
      })

    if (pageHasActiveAnchor) return false
    return pathname === hrefPath
  }

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
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--muted)',
            marginBottom: '0.4rem', paddingLeft: '0.65rem',
          }}>
            {section.title}
          </p>

          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-link${isActive(item.href) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  )
}
