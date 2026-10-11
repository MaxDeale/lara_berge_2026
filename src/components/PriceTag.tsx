import { formatZAR } from '@/lib/format'
import { cx } from '@/lib/cx'

type PriceTagProps = {
  /** ZAR cents. `null` shows the "R[price]" placeholder until Lara sets a price. */
  cents: number | null | undefined
  from?: boolean
  className?: string
}

export function PriceTag({ cents, from, className }: PriceTagProps) {
  const amount = typeof cents === 'number' ? formatZAR(cents) : 'R[price]'
  return (
    <span className={cx('whitespace-nowrap', className)}>
      {from && 'from '}
      {amount}
    </span>
  )
}
