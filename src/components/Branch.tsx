import Image from 'next/image'
import { brand } from '@/lib/brand'
import { cx } from '@/lib/cx'

// Leaf shapes and their centre veins, copied from the designs.
const LEAF = {
  l: { blade: 'M0 0C7-9 22-10 32 0C22 10 7 9 0 0Z', vein: 'M3 0H27' },
  s: { blade: 'M0 0C6-8 19-9 28 0C19 9 6 8 0 0Z', vein: 'M3 0H24' },
} as const

const FILL = { a: 'fill-leaf', b: 'fill-leaf-dark', c: 'fill-leaf-light' } as const

/** [x, y, rotation, size, colour, rustle delay in seconds (omit for a still leaf)] */
type Leaf = [number, number, number, keyof typeof LEAF, keyof typeof FILL, number?]
type Berry = [number, number, number]

type BranchArt = {
  viewBox: string
  bark: string
  twigs: string[]
  grain?: string
  knot?: [number, number, number]
  leaves: Leaf[]
  berries: Berry[]
}

// Page titles: the short branch a single sign hangs from (Gallery, About, Contact, Shop)
const SHORT: BranchArt = {
  viewBox: '0 0 560 110',
  bark: 'M-6 44 C 90 38, 180 54, 280 48 C 380 42, 470 36, 552 28 L 554 32 C 470 44, 380 54, 280 58 C 180 64, 90 54, -6 60 Z',
  twigs: ['M140 50 C 150 32, 168 24, 190 18', 'M380 48 C 392 66, 410 76, 434 80'],
  grain: 'M30 52 q26 -4 52 0 M230 56 q30 -4 60 -1 M450 46 q24 -3 48 0',
  leaves: [
    [190, 18, -25, 'l', 'a', 0],
    [178, 23, -100, 'l', 'b'],
    [164, 30, -150, 's', 'c'],
    [434, 80, 20, 'l', 'a'],
    [418, 78, 108, 's', 'c', -2],
    [90, 48, -60, 's', 'b'],
    [112, 55, 65, 'l', 'a'],
    [316, 46, -55, 'l', 'b', -1],
    [336, 52, -125, 's', 'a'],
    [548, 30, -20, 's', 'c'],
  ],
  berries: [
    [402, 66, 4.2],
    [410, 72, 3.6],
  ],
}

function BranchSvg({ art, className }: { art: BranchArt; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={art.viewBox}
      className={cx('block h-auto overflow-visible', className)}
      focusable="false"
    >
      {art.twigs.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          className="stroke-twig"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}
      <path
        d={art.bark}
        className="fill-bark stroke-bark-outline"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {art.grain && (
        <path d={art.grain} fill="none" stroke="#4E3B2E" strokeWidth="1.2" strokeLinecap="round" />
      )}
      {art.knot && <circle cx={art.knot[0]} cy={art.knot[1]} r={art.knot[2]} fill="#4E3B2E" />}
      <g className="stroke-leaf-vein" strokeWidth="1.2" strokeLinejoin="round">
        {art.leaves.map(([x, y, rotate, size, colour, rustle]) => {
          const leaf = (
            <>
              <path d={LEAF[size].blade} className={FILL[colour]} />
              <path d={LEAF[size].vein} fill="none" />
            </>
          )
          return (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate})`}>
              {rustle === undefined ? (
                leaf
              ) : (
                <g className="rustle" style={rustle ? { animationDelay: `${rustle}s` } : undefined}>
                  {leaf}
                </g>
              )}
            </g>
          )
        })}
      </g>
      {art.berries.length > 0 && (
        <g className="fill-berry" stroke="#4E3B4A" strokeWidth="1">
          {art.berries.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
    </svg>
  )
}

type BranchProps = {
  /** `wide` is Lara's painted limb for the Home signs, `short` the drawn branch for page titles */
  variant: 'wide' | 'short'
  className?: string
}

/** Leafy branch that hanging signs hang from. Decorative. */
export function Branch({ variant, className }: BranchProps) {
  if (variant === 'short') {
    return <BranchSvg art={SHORT} className={className} />
  }
  return (
    <Image
      src={brand.branch}
      alt=""
      sizes="(min-width: 1160px) 1112px, 100vw"
      className={cx('pointer-events-none block h-auto w-full select-none', className)}
    />
  )
}
