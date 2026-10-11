import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import { Branch } from '@/components/Branch'
import { cx } from '@/lib/cx'

type HangingSignProps = {
  /** The painted sign. A prop so Lara's Digital, Prints and Commissions signs can drop in. */
  image: StaticImageData
  /** Required when the sign is a link; ignored (decorative) otherwise */
  alt?: string
  href?: string
  /** CSS width, e.g. "clamp(150px, 18vw, 210px)" */
  width: string
  /** Negative seconds stagger signs so they don't sway in unison */
  delay?: number
  /** The sign is the first big thing on the page (page titles): load it straight away */
  preload?: boolean
  className?: string
}

/**
 * A painted sign hanging from a nail. Sways idly, swings harder on hover.
 * As a link it's announced by its alt text; without `href` it's decorative.
 */
export function HangingSign({
  image,
  alt = '',
  href,
  width,
  delay = 0,
  preload = false,
  className,
}: HangingSignProps) {
  const style = { width, '--sway-delay': `${delay}s` } as React.CSSProperties
  const classes = cx(
    'block origin-[50%_3%] animate-sway hover:animate-swing focus-visible:animate-swing',
    className,
  )
  const img = (
    <Image
      src={image}
      alt={href ? alt : ''}
      preload={preload}
      sizes={`(min-width: 768px) 210px, 110px`}
      className="block h-auto w-full drop-shadow-[0_10px_10px_rgba(59,53,48,0.18)]"
    />
  )

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {img}
      </Link>
    )
  }
  return (
    <span aria-hidden="true" className={classes} style={style}>
      {img}
    </span>
  )
}

type BranchSignProps = {
  image: StaticImageData
  /** Sign width in px */
  width?: number
  className?: string
}

/** Page-title ornament: the short branch with one decorative sign hanging under it. */
export function BranchSign({ image, width = 190, className }: BranchSignProps) {
  return (
    <div aria-hidden="true" className={className}>
      <Branch variant="short" className="relative z-2 mx-auto w-[min(520px,92%)]" />
      {/* Overlap scales with the branch so the sign's string always meets the bark */}
      <div className="relative z-1 -mt-[min(40px,7%)] flex justify-center">
        <HangingSign image={image} width={`${width}px`} preload />
      </div>
    </div>
  )
}
