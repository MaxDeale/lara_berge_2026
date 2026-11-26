import Image from 'next/image'
import Link from 'next/link'
import { barkAt, Branch, LIMB_HEIGHT } from '@/components/Branch'
import type { Sign } from '@/lib/brand'
import { cx } from '@/lib/cx'

type HangingSignProps = {
  /** The painted sign and where it hangs from */
  sign: Sign
  /** Required when the sign is a link; ignored (decorative) otherwise */
  alt?: string
  href?: string
  /** CSS width, e.g. "190px" or "var(--sign-w)" */
  width: string
  /** Negative seconds stagger signs so they don't sway in unison */
  delay?: number
  /** The sign is the first big thing on the page (page titles): load it straight away */
  preload?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * A painted sign hanging from a nail. Sways idly from its string, swings harder on hover.
 * As a link it's announced by its alt text; without `href` it's decorative.
 */
export function HangingSign({
  sign,
  alt = '',
  href,
  width,
  delay = 0,
  preload = false,
  className,
  style,
}: HangingSignProps) {
  const { hang } = sign
  const aspect = sign.image.height / sign.image.width
  const css = {
    ...style,
    width,
    '--sway-delay': `${delay}s`,
    // Swing from the string's top, not the middle of the image
    transformOrigin: `${hang.x * 100}% ${(hang.y / aspect) * 100}%`,
  } as React.CSSProperties
  const classes = cx(
    'block animate-sway hover:animate-swing focus-visible:animate-swing',
    className,
  )
  const img = (
    <Image
      src={sign.image}
      alt={href ? alt : ''}
      preload={preload}
      sizes="(min-width: 768px) 210px, 110px"
      className="block h-auto w-full drop-shadow-[0_10px_10px_rgba(59,53,48,0.18)]"
    />
  )

  if (href) {
    return (
      <Link href={href} className={classes} style={css}>
        {img}
      </Link>
    )
  }
  return (
    <span aria-hidden="true" className={classes} style={css}>
      {img}
    </span>
  )
}

/**
 * Where a sign sits under the limb so its string meets the middle of the bark. The signs row
 * starts right under the limb, so each is pulled up by the limb below the bark at its spot,
 * plus the sign's own string height. All in cqw of the limb's container, so it holds at any width.
 */
function hangStyle(sign: Sign, at: number, width: string): React.CSSProperties {
  const belowBark = (1 - barkAt(at)) * LIMB_HEIGHT
  return {
    gridArea: '1 / 1',
    justifySelf: 'start',
    marginLeft: `calc(${at * 100}cqw - ${width} * ${sign.hang.x})`,
    marginTop: `calc(-${belowBark.toFixed(2)}cqw - ${width} * ${sign.hang.y})`,
  }
}

export type HungSign = Omit<HangingSignProps, 'width' | 'style'> & {
  /** Where along the limb it hangs, as a fraction of the limb's width */
  at: number
}

/** The painted limb with signs hanging from it at given points. Width comes from the parent. */
export function LimbSigns({
  signs,
  signWidth,
  className,
  limbSizes,
}: {
  signs: HungSign[]
  /** CSS width of each sign; may use cqw (the limb's width) */
  signWidth: string
  className?: string
  limbSizes?: string
}) {
  return (
    <div className={cx('@container', className)}>
      <Branch className="relative z-2" sizes={limbSizes} />
      <div className="relative z-1 grid">
        {signs.map(({ at, ...sign }) => (
          <HangingSign
            key={sign.sign.image.src}
            {...sign}
            width={signWidth}
            style={hangStyle(sign.sign, at, signWidth)}
          />
        ))}
      </div>
    </div>
  )
}

type BranchSignProps = {
  sign: Sign
  /** Sign width in px */
  width?: number
  className?: string
}

/** Page-title ornament: the painted limb with one decorative sign hanging from the middle. */
export function BranchSign({ sign, width = 190, className }: BranchSignProps) {
  return (
    <div aria-hidden="true" className={className}>
      <LimbSigns
        className="mx-auto w-[min(560px,96%)]"
        limbSizes="560px"
        signWidth={`${width}px`}
        signs={[{ sign, at: 0.5, preload: true }]}
      />
    </div>
  )
}
