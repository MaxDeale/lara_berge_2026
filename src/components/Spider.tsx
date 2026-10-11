import Image, { type StaticImageData } from 'next/image'
import { cx } from '@/lib/cx'

type SpiderProps = {
  /** Lara's own spider drawing. Until it arrives, the stand-in SVG is drawn. */
  src?: string | StaticImageData
  /** Thread length in px */
  thread?: number
  /** Spider width in px */
  size?: number
  /** `dangle` bobs gently (header, menu). `drop` lowers in on its thread, then swings (404). */
  motion?: 'dangle' | 'drop'
  /** The 404 spider has little eyes */
  eyes?: boolean
  className?: string
}

/** A spider hanging on a thread. Purely decorative. */
export function Spider({
  src,
  thread = 128,
  size = 34,
  motion = 'dangle',
  eyes = false,
  className,
}: SpiderProps) {
  const body = src ? (
    <Image src={src} alt="" width={size} height={size} className="-mt-1 block h-auto" />
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="var(--color-spider)"
      strokeWidth={size > 40 ? 1.5 : 1.6}
      strokeLinecap="round"
      className={size > 40 ? '-mt-1.5' : '-mt-1'}
    >
      <path d="M17 18c-6-6-11-6-14-3M16 22c-7-2-11 0-14 5M16 26c-6 2-9 6-10 11M18 29c-3 3-4 6-4 9" />
      <path d="M23 18c6-6 11-6 14-3M24 22c7-2 11 0 14 5M24 26c6 2 9 6 10 11M22 29c3 3 4 6 4 9" />
      <circle cx="20" cy="14" r="4" fill="var(--color-spider)" />
      <ellipse cx="20" cy="24" rx="6" ry="7.5" fill="var(--color-spider)" />
      {eyes && (
        <>
          <circle cx="18.6" cy="13.2" r="0.9" fill="var(--color-cream)" stroke="none" />
          <circle cx="21.4" cy="13.2" r="0.9" fill="var(--color-cream)" stroke="none" />
        </>
      )}
    </svg>
  )

  const strand = (
    <div className="flex flex-col items-center">
      <div className="w-px bg-thread" style={{ height: thread }} />
      {body}
    </div>
  )

  if (motion === 'drop') {
    return (
      <div aria-hidden="true" className={cx('pointer-events-none animate-descend', className)}>
        <div className="origin-top animate-pendulum">{strand}</div>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cx('pointer-events-none origin-top animate-dangle', className)}
    >
      {strand}
    </div>
  )
}
