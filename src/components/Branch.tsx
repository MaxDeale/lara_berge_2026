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

// Home: the long branch the three signs hang from (Main.dc.html)
const WIDE: BranchArt = {
  viewBox: '0 0 1200 140',
  bark: 'M-10 58 C 120 50, 240 64, 380 58 C 520 52, 640 44, 780 52 C 900 59, 1020 50, 1150 42 C 1170 40, 1185 36, 1196 30 L 1199 34 C 1188 42, 1172 47, 1150 49 C 1030 58, 905 66, 780 60 C 650 53, 525 62, 385 70 C 245 77, 120 66, -10 76 Z',
  twigs: [
    'M130 70 C 140 90, 160 102, 186 106',
    'M300 62 C 310 42, 330 30, 352 22',
    'M560 56 C 575 76, 600 88, 628 92',
    'M905 56 C 920 36, 945 26, 970 20',
  ],
  grain:
    'M40 67 q30 -4 60 0 M220 68 q40 -5 80 -1 M520 59 q30 -4 60 0 M840 59 q24 -3 48 0 M1040 53 q20 -3 40 0',
  knot: [436, 64, 3.5],
  leaves: [
    [352, 22, -20, 'l', 'a', 0],
    [340, 27, -100, 'l', 'b'],
    [326, 34, -150, 's', 'c'],
    [215, 61, -62, 's', 'b'],
    [238, 68, 70, 'l', 'a', -2],
    [186, 106, 15, 'l', 'c'],
    [170, 103, 100, 's', 'b'],
    [462, 64, 55, 's', 'a'],
    [474, 60, -68, 'l', 'b', -1],
    [628, 92, 20, 'l', 'a'],
    [612, 90, 110, 's', 'c'],
    [700, 50, -50, 'l', 'b', -3],
    [724, 54, -125, 's', 'a'],
    [970, 20, -30, 'l', 'c', -1.5],
    [956, 24, -100, 'l', 'b'],
    [942, 31, -160, 's', 'a'],
    [1040, 54, 62, 's', 'c'],
    [1062, 49, -42, 'l', 'a'],
    [1188, 33, -25, 's', 'b', -2.5],
  ],
  berries: [
    [596, 80, 4.5],
    [605, 86, 4],
    [594, 90, 3.5],
    [1012, 62, 4.5],
    [1020, 68, 3.8],
  ],
}

// Home on a phone: a shorter branch for three small signs (MobileHome.dc.html)
const WIDE_PHONE: BranchArt = {
  viewBox: '0 0 560 110',
  bark: 'M-6 44 C 90 38, 180 54, 280 48 C 380 42, 470 36, 566 28 L 566 34 C 470 44, 380 54, 280 58 C 180 64, 90 54, -6 60 Z',
  twigs: ['M140 50 C 150 32, 168 24, 190 18'],
  leaves: [
    [190, 18, -25, 'l', 'a', 0],
    [176, 24, -110, 'l', 'b'],
    [316, 46, -55, 'l', 'b', -1],
    [450, 42, 60, 's', 'c'],
    [60, 48, -60, 's', 'a'],
  ],
  berries: [],
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
  /** `wide` for the Home signs (switches to the phone drawing below 768px), `short` for page titles */
  variant: 'wide' | 'short'
  className?: string
}

/** Hand-drawn leafy branch that hanging signs hang from. Decorative. */
export function Branch({ variant, className }: BranchProps) {
  if (variant === 'short') {
    return <BranchSvg art={SHORT} className={className} />
  }
  return (
    <>
      <BranchSvg art={WIDE_PHONE} className={cx('w-full md:hidden', className)} />
      <BranchSvg art={WIDE} className={cx('w-full max-md:hidden', className)} />
    </>
  )
}
