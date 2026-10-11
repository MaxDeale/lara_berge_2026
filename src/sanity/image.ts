import type { SanityImg } from './types'

/** CSS object-position from the hotspot Lara sets in the Studio, so crops keep the subject */
export function objectPosition(
  img: Pick<SanityImg, 'hotspot'> | null | undefined,
  fallback = '50% 50%',
) {
  const h = img?.hotspot
  return h ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : fallback
}

/** Props for <ArtImage> from a queried Sanity image */
export function imageProps(img: SanityImg, alt?: string) {
  return {
    src: img.url,
    alt: alt ?? img.alt ?? '',
    width: img.width,
    height: img.height,
    placeholder: img.lqip ? ('blur' as const) : ('empty' as const),
    blurDataURL: img.lqip,
  }
}
