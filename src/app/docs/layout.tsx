import { Navbar } from '@/components/layout/Navbar'
import { DocsSidebar } from '@/components/layout/DocsSidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', paddingTop: 60 }}>
        <DocsSidebar />
        <main style={{ flex: 1, minWidth: 0, padding: '3rem 3rem 5rem' }}>
          <article className="prose">{children}</article>
        </main>
      </div>
    </>
  )
}