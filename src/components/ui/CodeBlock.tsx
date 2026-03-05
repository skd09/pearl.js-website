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
    <div className="code-win" style={{ margin: '1.5rem 0' }}>
      {/* Title bar — traffic lights + optional filename */}
      <div className="code-win-bar">
        <div className="traffic" aria-hidden="true">
          <span style={{ background: 'rgba(255,96,96,0.7)' }} />
          <span style={{ background: 'rgba(255,190,96,0.7)' }} />
          <span style={{ background: 'rgba(96,220,96,0.7)' }} />
        </div>

        {filename ? (
          <span className="code-win-label">
            {filename.includes('/') ? (
              <>
                <span style={{ color: 'var(--teal)' }}>
                  {filename.slice(0, filename.lastIndexOf('/') + 1)}
                </span>
                {filename.slice(filename.lastIndexOf('/') + 1)}
              </>
            ) : (
              <span style={{ color: 'var(--teal)' }}>{filename}</span>
            )}
          </span>
        ) : (
          <span className="code-win-label" style={{ opacity: 0.25 }}>···</span>
        )}
      </div>

      {/* Shiki output — pre inside .code-win gets border/radius stripped by globals */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}