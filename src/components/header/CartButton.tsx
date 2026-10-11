'use client'

import { CartIcon } from '@/components/icons'
import { selectCount, useCart } from '@/lib/cart/store'
import { cx } from '@/lib/cx'

/** Header cart icon with a live item count. Opens the cart drawer. */
export function CartButton({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  const count = useCart(selectCount)
  const openDrawer = useCart((s) => s.openDrawer)
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className={cx(
        'flex items-center justify-center border-0 bg-transparent font-display text-ink hover:text-mauve',
        compact ? 'size-12 gap-0.5 text-base' : 'min-h-11 min-w-11 gap-1.5 text-[19px]',
        className,
      )}
    >
      <CartIcon />
      <span aria-hidden="true">{count}</span>
    </button>
  )
}
