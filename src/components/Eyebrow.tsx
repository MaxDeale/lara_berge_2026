import { cx } from '@/lib/cx'

type EyebrowProps = {
  children: React.ReactNode
  as?: 'p' | 'h2' | 'span' | 'dt' | 'legend'
  /** `tight` is the 0.14em spacing used on field legends and studio notes */
  tracking?: 'wide' | 'tight'
  className?: string
  id?: string
}

/** Small letter-spaced IM Fell English SC label, e.g. "fresh off the easel". */
export function Eyebrow({
  children,
  as: Tag = 'p',
  tracking = 'wide',
  className,
  id,
}: EyebrowProps) {
  return (
    <Tag
      id={id}
      className={cx(
        'm-0 font-sc text-[13px] font-normal text-mauve md:text-[15px]',
        tracking === 'wide' ? 'tracking-[0.18em]' : 'tracking-[0.14em]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
