export const SITE_NAME = 'Lara Berge Artworks'

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export const instagramUrl = (handle?: string | null) =>
  handle?.trim() ? `https://www.instagram.com/${handle.trim().replace(/^@/, '')}/` : undefined
