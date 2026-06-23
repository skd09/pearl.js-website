import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DocsSidebar } from '@/components/layout/DocsSidebar'
import { DocsTOC } from '@/components/layout/DocsTOC'
import { getPearlVersion } from '@/lib/version'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const version = await getPearlVersion()
  return (
    <>
      <Navbar version={version} />
      <div
        className="docs-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: '248px minmax(0, 1fr) 220px',
          maxWidth: 1320,
          margin: '0 auto',
          minHeight: 'calc(100vh - 60px)',
          paddingTop: 60,
        }}
      >
        <DocsSidebar />
        <main style={{ minWidth: 0, padding: '3rem 3.5rem 5rem' }}>
          <article className="prose">{children}</article>
        </main>
        <DocsTOC />
      </div>
      <Footer version={version} />
    </>
  )
}
