import Image from 'next/image'
import { brand } from '@/lib/brand'
import { cx } from '@/lib/cx'

/** The painted limb's height as a % of its width (2143 × 434 px) */
export const LIMB_HEIGHT = (434 / 2143) * 100

/**
 * Middle of the bark, as a fraction of the limb's height, measured across its width from the
 * painting. The limb rises from left to right, so signs hang from different heights.
 */
const BARK: [x: number, y: number][] = [
  [0.1, 0.51],
  [0.2, 0.525],
  [0.3, 0.55],
  [0.4, 0.555],
  [0.5, 0.545],
  [0.6, 0.52],
  [0.7, 0.47],
  [0.8, 0.43],
  [0.9, 0.395],
]

/** Bark height (fraction of the limb's height) at `x` (fraction of its width) */
export function barkAt(x: number): number {
  if (x <= BARK[0][0]) return BARK[0][1]
  for (let i = 1; i < BARK.length; i++) {
    const [x1, y1] = BARK[i]
    if (x <= x1) {
      const [x0, y0] = BARK[i - 1]
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return BARK[BARK.length - 1][1]
}

/** Lara's painted limb that the signs hang from. Decorative. */
export function Branch({ className, sizes }: { className?: string; sizes?: string }) {
  return (
    <Image
      src={brand.branch}
      alt=""
      sizes={sizes ?? '(min-width: 1160px) 1112px, 100vw'}
      className={cx('pointer-events-none block h-auto w-full select-none', className)}
    />
  )
}
