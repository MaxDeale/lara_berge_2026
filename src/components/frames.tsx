import type { StaticImageData } from 'next/image'
import { ArtImage } from '@/components/ArtImage'
import { cx } from '@/lib/cx'

/** Add to an image inside a hoverable `group` to get the gentle zoom from the designs. */
export const hoverZoom =
  'transition-transform duration-600 ease-story group-hover:scale-[1.03] motion-reduce:group-hover:scale-100'

type MatProps = {
  children: React.ReactNode
  /** xs 10px (phone cards) · sm 12px · md 14px (default) · lg 22px (product page) */
  padding?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

/** A painting sitting in a paper mat. */
export function Mat({ children, padding = 'md', className }: MatProps) {
  return (
    <div
      className={cx(
        'overflow-hidden bg-paper',
        padding === 'xs' && 'p-2.5 shadow-mat-sm',
        padding === 'sm' && 'p-3 shadow-mat',
        padding === 'md' && 'p-2.5 shadow-mat-sm md:p-3.5 md:shadow-mat',
        padding === 'lg' && 'p-3.5 shadow-arch md:p-[22px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Arched frame with a 10px paper border, used on About and the Shop doors. */
export function ArchFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'overflow-hidden rounded-arch border-10 border-paper bg-sand shadow-arch',
        className,
      )}
    >
      {children}
    </div>
  )
}

export type FrameImage = {
  src: string | StaticImageData
  alt: string
  width?: number
  height?: number
  blurDataURL?: string
}

type PrintOnTableProps = {
  image: FrameImage
  sizes?: string
  className?: string
}

/** A print as a sheet of paper lying on a table. Lifts when its parent `group` is hovered. */
export function PrintOnTable({
  image,
  sizes = '(min-width: 768px) 25vw, 50vw',
  className,
}: PrintOnTableProps) {
  return (
    <div
      className={cx(
        'flex aspect-[1/1.1] items-center justify-center bg-table p-5 md:p-7',
        className,
      )}
    >
      <div className="flex max-h-full max-w-full bg-white p-[7%] shadow-paper transition-[transform,box-shadow] duration-500 ease-story group-hover:-translate-y-1.5 group-hover:-rotate-[0.6deg] group-hover:shadow-paper-lift">
        <ArtImage
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL}
          className="block h-auto max-h-[230px] w-auto max-w-full"
        />
      </div>
    </div>
  )
}
