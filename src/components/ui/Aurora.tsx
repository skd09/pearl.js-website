/**
 * Aurora — a subtle animated gradient backdrop inspired by reactbits.dev.
 *
 * Three soft blobs of accent-color light drift across the page, mixed via
 * `mix-blend-mode: screen` so they brighten only the dark background and
 * never compete with content. Pure CSS — no canvas, no WebGL, no JS.
 * Disabled entirely under `prefers-reduced-motion: reduce`.
 *
 * Mount once in `RootLayout` and it appears behind every page.
 */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora-blob aurora-blob-1" />
      <span className="aurora-blob aurora-blob-2" />
      <span className="aurora-blob aurora-blob-3" />
    </div>
  )
}
