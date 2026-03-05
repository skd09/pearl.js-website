import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: string
  filename?: string
}

export async function CodeBlock({ code, lang = 'typescript', filename }: CodeBlockProps) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: 'github-dark-dimmed',
  })

  return (
    <div style={{ position: 'relative', margin: '1.25rem 0' }}>
      {filename && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-3)', borderRadius: '12px 12px 0 0',
          padding: '0.5rem 1rem',
          border: '1px solid var(--border)', borderBottomColor: 'transparent',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 1h5l3 3v7H2V1z" stroke="var(--text-3)" strokeWidth="1" fill="none"/>
            <path d="M7 1v3h3" stroke="var(--text-3)" strokeWidth="1" fill="none"/>
          </svg>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
            {filename}
          </span>
        </div>
      )}
      <div
        style={{ borderRadius: filename ? '0 0 12px 12px' : 12, border: '1px solid var(--border)', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .shiki { background: var(--bg-2) !important; padding: 1.25rem 1.5rem; margin: 0; font-size: 0.85rem; line-height: 1.7; overflow-x: auto; }
        .shiki code { background: none !important; border: none !important; padding: 0 !important; color: inherit; font-size: inherit; }
      `}</style>
    </div>
  )
}
