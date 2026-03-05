'use client'
import Link from 'next/link'
import { navLinks } from '@/lib/config'

export function Navbar() {
  return (
    <nav role="navigation" aria-label="Main navigation" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(18px) saturate(180%)',
      background: 'rgba(10,10,15,0.85)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" aria-label="Pearl.js home" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>🦪</span>
          <span style={{ fontWeight: 800, fontSize: '.975rem', letterSpacing: '-.025em', color: 'var(--text)', fontFamily: 'var(--font)' }}>
            Pearl<span style={{ color: 'var(--blue)' }}>.js</span>
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--muted)', border: '1px solid rgba(255,255,255,.07)', padding: '1px 6px', borderRadius: 4 }}>v0.1.3</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.1rem' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined} className="nav-link">
              {link.label}
            </Link>
          ))}
          <Link href="/docs/getting-started" className="nav-cta" style={{ marginLeft: '.5rem' }}>
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}