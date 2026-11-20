import { ArtImage } from '@/components/ArtImage'
import type { FrameImage } from '@/components/frames'
import { cx } from '@/lib/cx'

export type HeroMotion = 'drift-fireflies' | 'drift' | 'still'

// [left %, bottom %, delay s, duration s]
const MOTES_DESKTOP = [
  [12, 8, 0, 9],
  [22, 20, 2.4, 11],
  [33, 4, 5.1, 9],
  [47, 14, 1.2, 12],
  [58, 6, 3.6, 9],
  [69, 22, 6.3, 10],
  [78, 10, 0.8, 13],
  [88, 18, 4.4, 9],
] as const
const MOTES_PHONE = [
  [14, 10, 0, 8],
  [36, 4, 2.6, 8],
  [58, 16, 1.2, 10],
  [80, 8, 4, 8],
] as const

function Motes({
  motes,
  className,
}: {
  motes: ReadonlyArray<readonly number[]>
  className: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-0 motion-reduce:hidden', className)}
    >
      {motes.map(([left, bottom, delay, duration]) => (
        <span
          key={`${left}-${bottom}`}
          className="absolute size-1.5 animate-rise rounded-full bg-[radial-gradient(circle,#FFF6C8_0%,#F4D77A_45%,rgba(244,215,122,0)_72%)] shadow-[0_0_10px_3px_rgba(250,224,140,0.55)] md:size-[7px] md:shadow-[0_0_12px_4px_rgba(250,224,140,0.55)]"
          style={{
            left: `${left}%`,
            bottom: `${bottom}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      ))}
    </div>
  )
}

type HeroProps = {
  image: FrameImage & { objectPosition?: string }
  /** Set by Lara in Sanity (siteSettings.heroMotion) */
  motion?: HeroMotion
  /** Title and link line shown under the image */
  caption?: React.ReactNode
  className?: string
}

/**
 * The featured painting: blurs into focus, drifts and zooms slowly, fireflies rise
 * through it, and the bottom edge curves away.
 */
export function Hero({ image, motion = 'drift-fireflies', caption, className }: HeroProps) {
  const ratio = image.width && image.height ? image.width / image.height : undefined
  // A tall piece in the wide desktop box would be cropped to a sliver by object-cover, so on
  // desktop show most of it, centred over a soft blur of its own colours.
  const tall = ratio !== undefined && ratio < 1
  const drifts = motion !== 'still'

  // The tall backdrop uses the same sizes, so the browser fetches one file for both layers
  const sizes = '(min-width: 1360px) 1312px, 100vw'

  const art = (
    <ArtImage
      src={image.src}
      alt={image.alt}
      fill
      preload
      sizes={sizes}
      placeholder={image.blurDataURL ? 'blur' : 'empty'}
      blurDataURL={image.blurDataURL}
      className={cx('object-cover', drifts && !tall && 'animate-drift')}
      style={{ objectPosition: image.objectPosition ?? '50% 42%' }}
    />
  )

  return (
    <section aria-label="Featured painting" className={className}>
      <div
        className={cx(
          'relative w-full animate-reveal overflow-hidden bg-sand',
          'aspect-[4/5] [--rise-x:20px] [--rise-y:-220px] [clip-path:ellipse(95%_100%_at_50%_0%)]',
          'md:aspect-[16/8] md:max-h-[760px] md:min-h-[360px] md:[--rise-x:36px] md:[--rise-y:-320px] md:[clip-path:ellipse(78%_100%_at_50%_0%)]',
        )}
      >
        {tall ? (
          <>
            {/* Desktop backdrop: the painting itself, cropped wide and blurred. Hidden (and,
                being lazy, never fetched) on phones. */}
            <ArtImage
              src={image.src}
              alt=""
              fill
              sizes={sizes}
              className="scale-125 object-cover blur-2xl brightness-[0.8] max-md:hidden"
              style={{ objectPosition: image.objectPosition ?? '50% 42%' }}
            />
            {/* Phone: the box is nearly as tall as the art, so it fills it (cover).
                Desktop: the art stands a third taller than the box (antler tips to snow),
                centred, its edges feathered into the backdrop. */}
            <div
              className={cx(
                'absolute inset-0',
                'md:inset-auto md:top-[-12%] md:left-1/2 md:h-[133%] md:-translate-x-1/2',
                'md:[mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]',
              )}
              style={{ aspectRatio: ratio }}
            >
              <div
                className={cx('absolute inset-0', drifts && 'animate-drift md:animate-drift-soft')}
              >
                {art}
              </div>
            </div>
          </>
        ) : (
          art
        )}
        {motion === 'drift-fireflies' && (
          <>
            <Motes motes={MOTES_PHONE} className="md:hidden" />
            <Motes motes={MOTES_DESKTOP} className="max-md:hidden" />
          </>
        )}
      </div>
      {caption && (
        <div className="mt-3 animate-fadeup-late text-center md:mt-[18px]">{caption}</div>
      )}
    </section>
  )
}
