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
  return (
    <section aria-label="Featured painting" className={className}>
      <div
        className={cx(
          'relative w-full animate-reveal overflow-hidden bg-sand',
          'aspect-[4/5] [--rise-x:20px] [--rise-y:-220px] [clip-path:ellipse(95%_100%_at_50%_0%)]',
          'md:aspect-[16/8] md:max-h-[760px] md:min-h-[360px] md:[--rise-x:36px] md:[--rise-y:-320px] md:[clip-path:ellipse(78%_100%_at_50%_0%)]',
        )}
      >
        <ArtImage
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="(min-width: 1360px) 1312px, 100vw"
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL}
          className={cx('object-cover', motion !== 'still' && 'animate-drift')}
          style={{ objectPosition: image.objectPosition ?? '50% 42%' }}
        />
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
