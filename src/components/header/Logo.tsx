import Image from 'next/image'
import { brand } from '@/lib/brand'
import { cx } from '@/lib/cx'

type LogoProps = {
  /** header: desktop masthead · compact: phone header · menu: phone menu · checkout: slim checkout bar */
  size?: 'header' | 'compact' | 'menu' | 'checkout'
  className?: string
}

const IMG = {
  header: 'w-[min(320px,70vw)]',
  compact: 'w-[170px]',
  menu: 'w-[150px]',
  checkout: 'w-[150px] sm:w-[200px]',
} as const

/** Lara's hand-lettered name, with "artworks" set underneath on the header sizes. */
export function Logo({ size = 'header', className }: LogoProps) {
  const wordmark = size === 'header' || size === 'compact'
  return (
    <span className={cx('flex flex-col items-center', className)}>
      <Image
        src={brand.logoName}
        alt=""
        preload={size === 'header' || size === 'compact'}
        sizes="(min-width: 768px) 320px, 170px"
        className={cx('block h-auto', IMG[size])}
      />
      {wordmark && (
        <span
          className={cx(
            'pl-[0.42em] font-sc tracking-[0.42em] text-mauve',
            size === 'header' ? 'mt-0.5 text-[17px]' : 'text-xs',
          )}
        >
          artworks
        </span>
      )}
    </span>
  )
}
