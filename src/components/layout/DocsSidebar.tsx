'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/lib/config'

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="docs-sidebar">
      {docsNav.map((section) => (
        <div key={section.title} className="sb-section">
          <p className="sb-section-title">{section.title}</p>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-link${pathname === item.href ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  )
}
