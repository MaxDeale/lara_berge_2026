import { createClient, type QueryParams } from 'next-sanity'
import { cacheLife, cacheTag } from 'next/cache'
import { apiVersion, dataset, projectId } from './env'

// Server only: these tokens are not NEXT_PUBLIC, so they're undefined in the browser anyway.

/** Reads published content. The dataset is private, so this needs a Viewer token. */
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Pages are cached by Next and refreshed by the Sanity webhook, so go straight to the API
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN,
})

/** Writes orders, reservations and commission requests. Never import into client code. */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

/** Document types used as cache tags; the revalidate webhook clears them by `_type`. */
export type ContentTag = 'artwork' | 'siteSettings' | 'faqItem' | 'legalPage'

/**
 * Cached content query. Results are part of each page's static shell and stay cached until
 * Lara publishes a change, when /api/revalidate clears the matching tags.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams,
  tags: ContentTag[],
): Promise<T> {
  'use cache'
  cacheLife('max')
  cacheTag(...tags)
  return readClient.fetch<T>(query, params)
}
