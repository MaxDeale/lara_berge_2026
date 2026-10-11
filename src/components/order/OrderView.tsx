'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { orderStatus } from '@/app/actions/checkout'
import { ArtImage } from '@/components/ArtImage'
import { ButtonLink, TextLink } from '@/components/Button'
import { CheckIcon, StarIcon } from '@/components/icons'
import { PriceTag } from '@/components/PriceTag'
import { brand } from '@/lib/brand'
import { useCart } from '@/lib/cart/store'
import { useCartHydrated } from '@/lib/cart/useCartHydrated'
import { imageProps } from '@/sanity/image'

type Status = 'pending' | 'paid' | 'failed' | 'cancelled' | 'shipped'

type OrderViewProps = {
  orderId: string
  initialStatus: Status
  reference: string
  firstName: string
  email: string
  total: number
  collect: boolean
  dispatch: string
  instagram?: string
  items: Array<{
    title: string
    label: string
    total: number
    image: { url: string; lqip?: string; width: number; height: number } | null
  }>
}

const POLL_MS = 2500
const POLL_FOR_MS = 120_000

/** Paid, failed, cancelled, or still confirming while PayFast's notification arrives. */
export function OrderView(props: OrderViewProps) {
  const [status, setStatus] = useState<Status>(props.initialStatus)
  const [gaveUp, setGaveUp] = useState(false)
  const hydrated = useCartHydrated()
  const clear = useCart((s) => s.clear)

  // PayFast usually notifies us within seconds of the shopper returning
  useEffect(() => {
    if (status !== 'pending') return
    const started = Date.now()
    const timer = setInterval(async () => {
      const next = await orderStatus(props.orderId).catch(() => null)
      if (next && next !== 'pending') setStatus(next)
      else if (Date.now() - started > POLL_FOR_MS) setGaveUp(true)
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [status, props.orderId])

  // Paid: the cart's job is done
  useEffect(() => {
    if (hydrated && (status === 'paid' || status === 'shipped')) clear()
  }, [hydrated, status, clear])

  if (status === 'pending') return <Confirming gaveUp={gaveUp} reference={props.reference} />
  if (status === 'failed' || status === 'cancelled')
    return <NotPaid cancelled={status === 'cancelled'} />
  return <Paid {...props} shipped={status === 'shipped'} />
}

function Confirming({ gaveUp, reference }: { gaveUp: boolean; reference: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-[620px] px-6 pt-20 pb-10 text-center"
    >
      <div aria-hidden="true" className="relative mx-auto w-[150px]">
        <Image src={brand.doodads.greyCat} alt="" className="cat mx-auto block h-auto w-[120px]" />
        <StarIcon className="absolute top-0 -left-1.5 size-[22px] animate-twinkle text-star" />
        <StarIcon className="absolute top-10 -right-1 size-4 animate-twinkle text-star [animation-delay:-1.2s]" />
      </div>
      <p className="mt-5 mb-1 font-sc text-[15px] tracking-[0.18em] text-mauve">
        order {reference}
      </p>
      <h1 className="m-0 mb-3 font-display text-[36px] leading-[1.05] font-normal md:text-[46px]">
        {gaveUp ? 'Still waiting to hear from PayFast' : 'Confirming your payment…'}
      </h1>
      <p className="m-0 text-ink-soft">
        {gaveUp
          ? "This is taking longer than usual. If you paid, you'll get an email as soon as it comes through, so there's no need to pay again. You're welcome to ask Lara."
          : 'Just a moment while PayFast lets us know. Please keep this page open.'}
      </p>
      {gaveUp && (
        <div className="mt-7">
          <TextLink href="/contact">ask Lara for help →</TextLink>
        </div>
      )}
    </div>
  )
}

function NotPaid({ cancelled }: { cancelled: boolean }) {
  return (
    <div className="mx-auto max-w-[760px] animate-pop px-6 pt-14 text-center">
      <Image src={brand.doodads.galCat} alt="" className="cat mx-auto block h-auto w-[140px]" />
      <h1 className="mt-5 mb-3 font-display text-[38px] leading-[1.05] font-normal md:text-[50px]">
        {cancelled ? 'The payment was cancelled' : "The payment didn't go through"}
      </h1>
      <p className="mx-auto mt-0 mb-7 max-w-[500px] text-ink-soft">
        Nothing was charged, and your cart is still saved. You can try again, or pick a different
        payment method on PayFast.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-[26px] gap-y-3">
        <ButtonLink href="/checkout">Try again</ButtonLink>
        <TextLink href="/contact" className="md:text-[19px]">
          ask Lara for help →
        </TextLink>
      </div>
    </div>
  )
}

function Paid({
  reference,
  firstName,
  email,
  total,
  items,
  collect,
  dispatch,
  instagram,
  shipped,
}: OrderViewProps & { shipped: boolean }) {
  const steps = [
    { title: 'Order placed', note: 'today', done: true },
    {
      title: collect ? 'Ready to collect' : 'Wrapped by hand',
      note: `within ${dispatch}`,
      done: shipped,
    },
    {
      title: collect ? 'Collected' : 'On its way',
      note: collect ? 'Lara will email you' : 'tracking link by email',
      done: shipped,
    },
  ]
  return (
    <div className="mx-auto max-w-[760px] animate-pop px-6 pt-14 text-center">
      <div aria-hidden="true" className="relative mx-auto w-[170px]">
        <Image src={brand.doodads.greyCat} alt="" className="cat mx-auto block h-auto w-[140px]" />
        <StarIcon className="absolute top-0 -left-1.5 size-[22px] animate-twinkle text-star" />
        <StarIcon className="absolute top-10 -right-1 size-4 animate-twinkle text-star [animation-delay:-1.2s]" />
      </div>
      <p className="mt-5 mb-1 font-sc text-[15px] tracking-[0.18em] text-mauve">
        payment received · order {reference}
      </p>
      <h1 className="m-0 mb-3 font-display text-[40px] leading-[1.05] font-normal md:text-[54px]">
        Thank you, {firstName}!
      </h1>
      <p className="mx-auto my-0 max-w-[520px] text-ink-soft">
        Your little world has found a home. A receipt is on its way to {email}, and Lara will send a
        note when your parcel leaves the studio.
      </p>

      <ol className="m-0 mt-12 grid list-none grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 p-0">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col items-center gap-1.5">
            <span
              aria-hidden="true"
              className={
                s.done
                  ? 'flex size-[52px] items-center justify-center rounded-full bg-mauve text-white'
                  : 'flex size-[52px] items-center justify-center rounded-full border-[1.5px] border-mauve font-display text-[22px] text-mauve'
              }
            >
              {s.done ? <CheckIcon /> : ['i', 'ii', 'iii'][i]}
            </span>
            <span className="font-display text-[21px]">
              {s.title}
              {s.done && <span className="sr-only"> (done)</span>}
            </span>
            <span className="text-[15px] text-muted">{s.note}</span>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-12 max-w-[520px] border border-hairline bg-paper px-5 py-[22px] text-left md:px-[26px]">
        {items.map((i, n) => (
          <div
            key={n}
            className="flex items-center gap-3.5 border-b border-hairline py-3 first:pt-0"
          >
            {i.image ? (
              <ArtImage
                {...imageProps(i.image, '')}
                sizes="54px"
                className="aspect-[4/5] w-[54px] flex-none object-cover"
              />
            ) : (
              <span className="aspect-[4/5] w-[54px] flex-none bg-sand" />
            )}
            <span className="flex-1 font-display text-[19px]">
              {i.title} <span className="font-body text-sm text-muted">· {i.label}</span>
            </span>
            <PriceTag cents={i.total} />
          </div>
        ))}
        <div className="flex justify-between pt-3 font-display text-[22px]">
          <span>Total paid</span>
          <PriceTag cents={total} />
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-[26px] gap-y-3">
        <ButtonLink href="/gallery">Back to the gallery</ButtonLink>
        {instagram && (
          <a
            href={instagram}
            rel="noopener"
            className="inline-flex min-h-11 items-center font-display text-[19px] text-mauve italic"
          >
            follow along on Instagram →
          </a>
        )}
      </div>
    </div>
  )
}
