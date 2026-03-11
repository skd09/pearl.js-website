'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '.72rem',
        color: copied ? 'var(--accent)' : 'var(--muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 .25rem',
        transition: 'color .15s',
        letterSpacing: '.04em',
        flexShrink: 0,
      }}
    >
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}