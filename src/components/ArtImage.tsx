'use client'

import Image, { type ImageLoader, type ImageProps } from 'next/image'

/**
 * Sanity's image CDN resizes and re-encodes on the fly, so Sanity images skip
 * Next's optimiser and ask the CDN for the exact width instead.
 */
const sanityLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', url.searchParams.get('fit') ?? 'max')
  return url.toString()
}

const isSanity = (src: ImageProps['src']) =>
  typeof src === 'string' && src.startsWith('https://cdn.sanity.io/')

/** `next/image` for artwork and photos, with the Sanity CDN loader applied when needed. */
export function ArtImage(props: ImageProps) {
  // `alt` is always passed through from props, so the lint rule can't see it here.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...props} loader={isSanity(props.src) ? sanityLoader : undefined} />
}
