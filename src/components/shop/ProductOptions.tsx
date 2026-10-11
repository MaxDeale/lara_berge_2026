'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Button, ButtonLink, TextLink } from '@/components/Button'
import { ChoiceCard } from '@/components/forms/fields'
import { PriceTag } from '@/components/PriceTag'
import { useCart } from '@/lib/cart/store'
import type { OriginalStatus, PrintSize, PrintVariant } from '@/sanity/types'

type ProductOptionsProps = {
  artworkId: string
  original: { forSale: boolean; price: number | null; status: OriginalStatus } | null
  variants: PrintVariant[]
  dispatchOriginals: string
  dispatchPrints: string
}

/** Original or print, print size, live price and Add to cart. */
export function ProductOptions(props: ProductOptionsProps) {
  return (
    <Suspense fallback={<Options {...props} wantsPrint={false} />}>
      <OptionsFromUrl {...props} />
    </Suspense>
  )
}

function OptionsFromUrl(props: ProductOptionsProps) {
  // Links from the Prints page and "prints of this painting" arrive with ?option=print
  const wantsPrint = useSearchParams().get('option') === 'print'
  return <Options {...props} wantsPrint={wantsPrint} />
}

function Options({
  artworkId,
  original,
  variants,
  dispatchOriginals,
  dispatchPrints,
  wantsPrint,
}: ProductOptionsProps & { wantsPrint: boolean }) {
  const add = useCart((s) => s.add)
  const hasOriginal = !!original?.forSale
  const originalFree = hasOriginal && original.status === 'available'
  const hasPrints = variants.length > 0
  const sizes = variants.map((v) => v.size)

  const [option, setOption] = useState<'original' | 'print'>(() =>
    originalFree && !(wantsPrint && hasPrints) ? 'original' : 'print',
  )
  const [size, setSize] = useState<PrintSize | undefined>(() =>
    sizes.includes('A3') ? 'A3' : sizes[0],
  )
  const variant = variants.find((v) => v.size === size)
  const price = option === 'original' ? original?.price : variant?.price
  const canBuy =
    option === 'original'
      ? originalFree && typeof price === 'number'
      : !!variant && typeof price === 'number'

  if (!originalFree && !hasPrints) {
    return (
      <div className="mt-8 border border-hairline bg-paper p-6">
        <p className="m-0 mb-1 font-display text-[22px]">
          {original?.status === 'sold' ? 'This one has found its home' : 'Not available just now'}
        </p>
        <p className="m-0 mb-4 text-[17px] text-ink-soft">
          Lara can paint something in the same spirit, just for you.
        </p>
        <ButtonLink href="/commissions">Commission something similar</ButtonLink>
      </div>
    )
  }

  return (
    <>
      <fieldset className="m-0 mt-[30px] border-0 p-0">
        <legend className="mb-3 p-0 font-sc text-[15px] tracking-[0.14em] text-mauve">
          choose
        </legend>
        <div className="flex flex-col gap-3">
          {hasOriginal && (
            <ChoiceCard
              name="option"
              value="original"
              checked={option === 'original'}
              disabled={!originalFree}
              onChange={() => setOption('original')}
              title="The original"
              note={
                original.status === 'sold'
                  ? 'Sold · it has found its home'
                  : original.status === 'reserved'
                    ? 'Reserved · someone is checking out right now'
                    : 'One of a kind · certificate of authenticity'
              }
              aside={original.status === 'sold' ? 'Sold' : <PriceTag cents={original.price} />}
            />
          )}
          {hasPrints && (
            <ChoiceCard
              name="option"
              value="print"
              checked={option === 'print'}
              onChange={() => setOption('print')}
              title="Fine art print"
              note="Signed giclée on archival cotton paper"
              aside={<PriceTag cents={minPrice(variants)} from />}
            />
          )}
        </div>
        {hasOriginal && original.status === 'sold' && (
          <p className="mt-3 mb-0 text-base text-muted italic">
            The original has been sold, but signed prints are still available.
          </p>
        )}
      </fieldset>

      {option === 'print' && hasPrints && (
        <fieldset className="m-0 mt-6 border-0 p-0">
          <legend className="mb-3 p-0 font-sc text-[15px] tracking-[0.14em] text-mauve">
            print size
          </legend>
          <div className="grid grid-cols-3 gap-2.5">
            {variants.map((v) => (
              <ChoiceCard
                key={v.size}
                layout="pill"
                name="size"
                value={v.size}
                checked={size === v.size}
                onChange={() => setSize(v.size)}
                title={v.size}
                aside={
                  <>
                    {v.dimensions ?? '[size]'} · <PriceTag cents={v.price} />
                  </>
                }
              />
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-7 flex flex-col gap-3.5 border-t border-hairline pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-ink-soft">
            {option === 'original' ? 'The original painting' : `Signed print · ${size ?? ''}`}
          </span>
          <span aria-live="polite" className="font-display text-[32px]">
            <PriceTag cents={price} />
          </span>
        </div>
        <Button
          block
          size="lg"
          disabled={!canBuy}
          onClick={() =>
            add(
              option === 'original'
                ? { artworkId, type: 'original', qty: 1 }
                : { artworkId, type: 'print', size, qty: 1 },
            )
          }
        >
          Add to cart
        </Button>
        {!canBuy && (
          <p className="m-0 text-[15px] text-muted italic">
            The price is still being decided.{' '}
            <TextLink href="/contact" size="sm" className="min-h-0">
              ask Lara →
            </TextLink>
          </p>
        )}
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-[22px] gap-y-1.5 p-0 text-[15px] text-ink-soft">
          <li>
            ✦{' '}
            {option === 'print'
              ? `Printed & shipped in ${dispatchPrints}`
              : `Ships in ${dispatchOriginals}`}
          </li>
          <li>✦ Packed by hand</li>
          <li>✦ Secure checkout with PayFast</li>
        </ul>
      </div>
    </>
  )
}

function minPrice(variants: PrintVariant[]) {
  const prices = variants.flatMap((v) => (typeof v.price === 'number' ? [v.price] : []))
  return prices.length ? Math.min(...prices) : null
}
