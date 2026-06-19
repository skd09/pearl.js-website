'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Heading {
  id: string
  text: string
}

/**
 * "On this page" right rail. Reads h2[id] elements from the current article,
 * highlights the section currently in view via IntersectionObserver, and
 * scrolls to it on click.
 *
 * Hidden when the page has fewer than 2 sections — no point showing a TOC
 * for a single-heading page.
 */
export function DocsTOC() {
  const pathname = usePathname()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Collect h2[id]s from the active article
  useEffect(() => {
    const collected: Heading[] = []
    document.querySelectorAll<HTMLHeadingElement>('.prose h2[id]').forEach((h) => {
      collected.push({ id: h.id, text: h.textContent ?? '' })
    })
    setHeadings(collected)
    setActiveId(collected[0]?.id ?? '')
  }, [pathname])

  // Track which heading is currently in view
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first intersecting heading nearest the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) {
    return <aside className="docs-toc" aria-hidden="true" />
  }

  return (
    <aside className="docs-toc" aria-label="On this page">
      <p className="docs-toc-title">On this page</p>
      <ul className="docs-toc-list">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`docs-toc-link${activeId === h.id ? ' active' : ''}`}
              onClick={() => setActiveId(h.id)}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
