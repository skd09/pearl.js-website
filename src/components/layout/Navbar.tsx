'use client'
import Link from 'next/link'
import { useState } from 'react'
import { navLinks, siteConfig } from '@/lib/config'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      background: 'rgba(13,17,23,0.92)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* <span style={{ fontSize: '1.4rem' }}>🦪</span> */}
          <img src="/icon.png" width={28} height={28} alt="Pearl.js"/>
          <span style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Pearl<span style={{ color: 'var(--accent)' }}>.js</span>
          </span>
          <span style={{
            fontSize: '0.62rem', fontFamily: 'var(--mono)', color: 'var(--muted)',
            border: '1px solid var(--border2)', padding: '1px 6px', borderRadius: 4, marginLeft: 2,
          }}>
            v0.2.0
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {link.label}
              {link.external && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2h8v8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </Link>
          ))}
          <Link href="/docs/getting-started" className="nav-cta" style={{ marginLeft: '0.5rem' }}>
            Get started →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {open
              ? <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              : <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '1rem 1.5rem' }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '0.6rem 0', color: 'var(--body)', fontSize: '0.9rem', borderBottom: '1px solid var(--border)' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}