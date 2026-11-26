export const SITE_NAME = 'Lara Berge Artworks'

/**
 * Oil paintings are hidden everywhere for now (Nov 2026), while Lara finishes and photographs
 * them. Turning this back on restores them in Sanity queries, the Gallery tab, Home, the Shop
 * originals and prints. Nothing is deleted from Sanity.
 */
export const SHOW_PAINTINGS = false

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const instagramUrl = (handle?: string | null) =>
  handle?.trim() ? `https://www.instagram.com/${handle.trim().replace(/^@/, '')}/` : undefined
