/**
 * Single source of truth for the published Pearl.js version shown across the
 * website (navbar badge, hero meta, packages grid, footer badges).
 *
 * Fetches the latest `@pearl-framework/pearl` version from the npm registry at
 * build time, cached for an hour. Falls back to a hardcoded constant if the
 * registry is unreachable (offline build, npm outage) so the page never breaks.
 */
const FALLBACK_VERSION = '1.1.3'

export async function getPearlVersion(): Promise<string> {
  try {
    const res = await fetch(
      'https://registry.npmjs.org/@pearl-framework/pearl/latest',
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return FALLBACK_VERSION
    const data = (await res.json()) as { version?: unknown }
    return typeof data.version === 'string' ? data.version : FALLBACK_VERSION
  } catch {
    return FALLBACK_VERSION
  }
}
