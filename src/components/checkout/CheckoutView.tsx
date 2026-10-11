'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useActionState, useEffect, useRef, useState, useTransition } from 'react'
import {
  cancelledAtPayfast,
  placeOrder,
  quoteCheckout,
  type CheckoutQuote,
  type PlaceOrderState,
} from '@/app/actions/checkout'
import { ArtImage } from '@/components/ArtImage'
import { Button } from '@/components/Button'
import {
  Checkbox,
  ChoiceCard,
  describedBy,
  Field,
  Select,
  TextArea,
  TextInput,
} from '@/components/forms/fields'
import { LockIcon } from '@/components/icons'
import { PriceTag } from '@/components/PriceTag'
import { brand } from '@/lib/brand'
import { useCart } from '@/lib/cart/store'
import { useCartHydrated } from '@/lib/cart/useCartHydrated'
import { cx } from '@/lib/cx'
import type { DeliveryMethod } from '@/lib/orders/schema'
import { imageProps, objectPosition } from '@/sanity/image'

const COUNTRIES = [
  'United Kingdom',
  'United States',
  'Australia',
  'Canada',
  'Ireland',
  'New Zealand',
  'Germany',
  'Netherlands',
  'France',
  'Namibia',
  'Botswana',
]

const initial: PlaceOrderState = { status: 'idle' }

export function CheckoutView({ collectionArea }: { collectionArea: string }) {
  return (
    <Suspense fallback={null}>
      <Checkout collectionArea={collectionArea} />
    </Suspense>
  )
}

function Checkout({ collectionArea }: { collectionArea: string }) {
  const hydrated = useCartHydrated()
  const lines = useCart((s) => s.lines)
  const cancelledOrder = useSearchParams().get('cancelled')
  const [method, setMethod] = useState<DeliveryMethod>('courier')
  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [quoting, startQuote] = useTransition()
  const [state, action, pending] = useActionState(placeOrder, initial)
  const [country, setCountry] = useState('')
  const payfastForm = useRef<HTMLFormElement>(null)
  const e = state.errors ?? {}

  // Back from PayFast's cancel button: release the reservation now rather than in 30 minutes
  useEffect(() => {
    if (cancelledOrder) void cancelledAtPayfast(cancelledOrder)
  }, [cancelledOrder])

  // Re-price on the server whenever the cart or delivery method changes
  const cartKey = JSON.stringify(lines)
  useEffect(() => {
    if (!hydrated || lines.length === 0) return
    startQuote(async () => {
      const q = await quoteCheckout(lines, method)
      setQuote('error' in q ? null : q)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartKey stands in for lines
  }, [hydrated, cartKey, method])

  // The order is created: hand over to PayFast
  useEffect(() => {
    if (state.status === 'redirect') payfastForm.current?.submit()
  }, [state])

  if (!hydrated) return <div className="min-h-[60vh]" />

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
        <Image src={brand.doodads.galCat} alt="" className="mx-auto h-auto w-[120px]" />
        <h1 className="mt-4 mb-2 font-display text-4xl font-normal">Your cart is empty</h1>
        {cancelledOrder && (
          <p className="m-0 mb-3 text-ink-soft">
            Your payment was cancelled and nothing was charged.
          </p>
        )}
        <Link href="/shop" className="text-mauve italic">
          wander the shop →
        </Link>
      </div>
    )
  }

  const needsAddress = method !== 'collect'
  const blocked = !!quote?.problems.length || quote?.total === null

  return (
    <div className="mx-auto flex max-w-[1180px] flex-wrap-reverse items-start gap-x-16 gap-y-10 px-4 pt-11 pb-20 md:px-6">
      <form
        id="checkout-form"
        action={action}
        noValidate
        className="flex min-w-0 flex-[999_1_560px] flex-col gap-10"
      >
        <h1 className="m-0 font-display text-[38px] leading-[1.05] font-normal md:text-[46px]">
          Checkout
        </h1>
        {cancelledOrder && (
          <p
            role="status"
            className="m-0 border border-hairline bg-paper px-[18px] py-4 text-base text-ink-soft"
          >
            Your payment was cancelled and nothing was charged. Your cart is still here whenever
            you&apos;re ready.
          </p>
        )}
        <input type="hidden" name="cart" value={cartKey} />
        <input type="hidden" name="method" value={method} />

        <fieldset className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-[22px] gap-y-[18px] border-0 p-0">
          <legend className="mb-3.5 p-0 font-display text-[26px]">1. Your details</legend>
          <Field label="First name" htmlFor="co-first" error={e.firstName}>
            <TextInput
              {...describedBy('co-first', { error: e.firstName })}
              name="firstName"
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Last name" htmlFor="co-last" error={e.lastName}>
            <TextInput
              {...describedBy('co-last', { error: e.lastName })}
              name="lastName"
              autoComplete="family-name"
              required
            />
          </Field>
          <Field label="Email address" htmlFor="co-email" error={e.email}>
            <TextInput
              {...describedBy('co-email', { error: e.email })}
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Phone (for the courier)" htmlFor="co-phone" error={e.phone}>
            <TextInput
              {...describedBy('co-phone', { error: e.phone })}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
            />
          </Field>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3.5 p-0 font-display text-[26px]">2. Delivery</legend>
          <div className="flex flex-col gap-2.5">
            {(['courier', 'collect', 'international'] as const).map((m) => {
              const rate = quote?.rates[m]
              const defaults = {
                courier: [
                  'Courier, door to door',
                  'Anywhere in South Africa · [x to y] working days',
                ],
                collect: ['Collect from the studio', `${collectionArea} · by arrangement`],
                international: [
                  'International shipping',
                  'Tracked · [x to y] working days · duties may apply',
                ],
              }[m]
              return (
                <ChoiceCard
                  key={m}
                  dot
                  name="delivery"
                  value={m}
                  checked={method === m}
                  onChange={() => setMethod(m)}
                  title={<span className="text-xl">{rate?.label || defaults[0]}</span>}
                  note={rate?.note || defaults[1]}
                  aside={
                    <span className="font-body text-[17px]">
                      {m === 'collect' ? 'Free' : <PriceTag cents={rate?.price ?? null} />}
                    </span>
                  }
                />
              )
            })}
          </div>

          {needsAddress ? (
            <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-[22px] gap-y-[18px]">
              <Field label="Street address" htmlFor="co-a1" wide error={e.line1}>
                <TextInput
                  {...describedBy('co-a1', { error: e.line1 })}
                  name="line1"
                  autoComplete="address-line1"
                  required
                />
              </Field>
              <Field label="Suburb" htmlFor="co-sub" error={e.suburb}>
                <TextInput
                  {...describedBy('co-sub', { error: e.suburb })}
                  name="suburb"
                  autoComplete="address-level3"
                />
              </Field>
              <Field label="City" htmlFor="co-city" error={e.city}>
                <TextInput
                  {...describedBy('co-city', { error: e.city })}
                  name="city"
                  autoComplete="address-level2"
                  required
                />
              </Field>
              <Field
                label={method === 'international' ? 'State / region' : 'Province'}
                htmlFor="co-prov"
                error={e.province}
              >
                <TextInput
                  {...describedBy('co-prov', { error: e.province })}
                  name="province"
                  autoComplete="address-level1"
                />
              </Field>
              <Field label="Postal code" htmlFor="co-zip" error={e.postalCode}>
                <TextInput
                  {...describedBy('co-zip', { error: e.postalCode })}
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                />
              </Field>
              {method === 'courier' ? (
                <Field label="Country" htmlFor="co-country" wide>
                  <TextInput
                    id="co-country"
                    value="South Africa"
                    readOnly
                    aria-readonly
                    className="text-muted"
                  />
                </Field>
              ) : (
                <>
                  <Field label="Country" htmlFor="co-country" wide error={e.country}>
                    <Select
                      {...describedBy('co-country', { error: e.country })}
                      name="country"
                      autoComplete="country-name"
                      value={country}
                      onChange={(ev) => setCountry(ev.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Choose a country
                      </option>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                      <option value="Other">Other…</option>
                    </Select>
                  </Field>
                  {country === 'Other' && (
                    <Field label="Which country?" htmlFor="co-country-other" wide>
                      <TextInput
                        id="co-country-other"
                        name="countryOther"
                        autoComplete="country-name"
                        required
                      />
                    </Field>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="mt-[18px] mb-0 border border-hairline bg-paper px-[18px] py-4 text-base text-ink-soft">
              Lara will email you to arrange a collection time in {collectionArea}.
            </p>
          )}
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3.5 p-0 font-display text-[26px]">3. Anything else?</legend>
          <Field label="A note for Lara (gift message, delivery tips)" htmlFor="co-note">
            <TextArea id="co-note" name="notes" rows={3} maxLength={1000} />
          </Field>
          <Checkbox
            name="gift"
            className="mt-3.5"
            label="This is a gift, please leave the price out of the parcel"
          />
        </fieldset>

        {/* On small screens the pay button sits under the form, after the summary */}
        <PayButton
          pending={pending}
          disabled={blocked || quoting || !quote}
          className="md:hidden"
        />
        {state.status === 'error' && state.message && (
          <p role="alert" className="m-0 text-mauve italic md:hidden">
            {state.message}
          </p>
        )}
      </form>

      <aside
        aria-labelledby="sum-h"
        className="min-w-0 flex-[1_1_360px] border border-hairline bg-paper p-6 md:sticky md:top-6 md:p-7"
      >
        <h2 id="sum-h" className="m-0 mb-4 font-display text-[28px] font-normal">
          Order summary
        </h2>
        <div aria-busy={quoting} className={cx('transition-opacity', quoting && 'opacity-60')}>
          <ul className="m-0 flex list-none flex-col gap-4 border-b border-hairline p-0 pb-[18px]">
            {(quote?.lines ?? []).map((l) => (
              <li key={l.key} className="flex items-center gap-3.5">
                {l.image ? (
                  <ArtImage
                    {...imageProps(l.image, '')}
                    sizes="64px"
                    className="aspect-[4/5] w-16 flex-none object-cover shadow-thumb"
                    style={{ objectPosition: objectPosition(l.image) }}
                  />
                ) : (
                  <span className="aspect-[4/5] w-16 flex-none bg-sand" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-display text-[19px] leading-tight">{l.title}</p>
                  <p className="m-0 text-sm text-muted">{l.label}</p>
                </div>
                <PriceTag cents={l.lineTotal} className="text-base" />
              </li>
            ))}
            {!quote && <li className="text-base text-muted italic">Working out your total…</li>}
          </ul>
          {!!quote?.problems.length && (
            <div role="alert" className="mt-4 text-base text-mauve">
              {quote.problems.map((p) => (
                <p key={p} className="m-0 mb-1 italic">
                  {p}
                </p>
              ))}
              <button
                type="button"
                onClick={() => useCart.getState().openDrawer()}
                className="border-0 bg-transparent p-0 text-mauve underline"
              >
                Open your cart
              </button>
            </div>
          )}
          <dl className="m-0 mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[17px]">
            <dt>Subtotal</dt>
            <dd className="m-0 text-right">
              <PriceTag cents={quote?.subtotal ?? null} />
            </dd>
            <dt>{quote?.shippingLabel ?? 'Shipping'}</dt>
            <dd className="m-0 text-right">
              {quote?.shipping === 0 ? 'Free' : <PriceTag cents={quote?.shipping ?? null} />}
            </dd>
            <dt className="border-t border-hairline pt-2.5 font-display text-2xl">Total</dt>
            <dd className="m-0 border-t border-hairline pt-2.5 text-right font-display text-2xl">
              <PriceTag cents={quote?.total ?? null} />
            </dd>
          </dl>
        </div>
        <PayButton
          pending={pending}
          disabled={blocked || quoting || !quote}
          className="mt-[22px] max-md:hidden"
          form="checkout-form"
        />
        {state.status === 'error' && state.message && (
          <p role="alert" className="mt-3 mb-0 text-base text-mauve italic max-md:hidden">
            {state.message}
          </p>
        )}
        <p className="mt-3.5 mb-0 text-[15px] text-ink-soft">
          You&apos;ll pay on PayFast&apos;s secure page by card, Instant EFT, SnapScan or Zapper,
          then come straight back here.
        </p>
        <p className="mt-3 mb-0 text-sm text-muted">
          By paying you agree to the{' '}
          <Link href="/terms" className="text-mauve underline">
            terms
          </Link>{' '}
          and{' '}
          <Link href="/faq#payments" className="text-mauve underline">
            returns policy
          </Link>
          .
        </p>
      </aside>

      {state.status === 'redirect' && state.redirect && (
        <form
          ref={payfastForm}
          method="post"
          action={state.redirect.action}
          className="sr-only"
          aria-hidden
        >
          {state.redirect.fields.map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <noscript>
            <button type="submit">Continue to PayFast</button>
          </noscript>
        </form>
      )}
    </div>
  )
}

function PayButton({
  pending,
  disabled,
  className,
  form,
}: {
  pending: boolean
  disabled: boolean
  className?: string
  form?: string
}) {
  return (
    <Button
      type="submit"
      size="lg"
      block
      disabled={pending || disabled}
      // The summary's button sits outside the <form> and points at it by id
      form={form}
      className={cx('min-h-[58px]', className)}
    >
      <LockIcon size={18} /> {pending ? 'Taking you to PayFast…' : 'Pay with PayFast'}
    </Button>
  )
}
