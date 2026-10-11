import type { Metadata } from 'next'
import { ArtImage } from '@/components/ArtImage'
import { Breadcrumb } from '@/components/Breadcrumb'
import { CommissionKindProvider, KindCards } from '@/components/commissions/CommissionKind'
import { Eyebrow } from '@/components/Eyebrow'
import { CommissionForm } from '@/components/forms/CommissionForm'
import { RichText } from '@/components/RichText'
import { or } from '@/lib/artwork'
import { imageProps, objectPosition } from '@/sanity/image'
import { getFaq, getSettings } from '@/sanity/queries'
import type { SanityImg } from '@/sanity/types'

export const metadata: Metadata = {
  title: 'Commissions',
  description:
    'Commission an oil painting or a digital illustration from Lara Berge. Tell her your idea for a quote and a first sketch.',
}

export default async function CommissionsPage() {
  const [s, faq] = await Promise.all([getSettings(), getFaq('commissions')])
  const deposit =
    typeof s.commissionDepositPercent === 'number' ? `${s.commissionDepositPercent}` : '[50]'
  const replyDays = or(s.commissionReplyDays, '[x] working days')

  const steps = [
    ['Share your idea', 'Fill in the form with your story, size, budget and any reference photos.'],
    [
      'Quote & sketch',
      `Lara replies within ${replyDays} with a price, a timeline and a rough sketch.`,
    ],
    [
      'Secure your spot',
      `Pay a ${deposit}% deposit through a secure PayFast link, and the painting begins.`,
    ],
    [
      'Painted & delivered',
      "Progress photos along the way, the balance on completion, then it's wrapped and sent.",
    ],
  ]

  return (
    <CommissionKindProvider>
      <section className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-16 gap-y-12 px-6 pt-12">
        <div className="min-w-0 flex-[1_1_460px]">
          <Breadcrumb
            className="mb-[18px]"
            items={[{ label: 'Shop', href: '/shop' }, { label: 'Commissions' }]}
          />
          <Eyebrow className="mb-1">made just for you</Eyebrow>
          <h1 className="m-0 mb-[18px] font-display text-[46px] leading-[1.02] font-normal md:text-[60px]">
            Commissions
          </h1>
          <p className="m-0 mb-3.5 text-lg text-ink-soft md:text-xl">
            Your cat as a tiny forest wizard. The cottage you grew up in, glowing at dusk. A gift
            for someone who already has everything except their own little world.
          </p>
          <p className="m-0 text-ink-soft">
            Lara paints commissions in oil, and draws them digitally too. Tell her your idea below
            and she&apos;ll come back with a quote and a first sketch.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative h-[340px] min-w-0 flex-[1_1_420px] md:h-[460px]"
        >
          <Polaroid
            image={s.commissionOilImage}
            label="in oil"
            className="top-2.5 left-[4%] w-[54%] -rotate-3"
          />
          <Polaroid
            image={s.commissionDigitalImage}
            label="or digital"
            className="top-[70px] right-[2%] w-1/2 rotate-[4deg] md:top-[90px]"
          />
        </div>
      </section>

      <section aria-labelledby="kinds-h" className="mx-auto max-w-[1180px] px-6 pt-20 md:pt-24">
        <h2
          id="kinds-h"
          className="m-0 mb-7 text-center font-display text-[32px] font-normal md:text-[38px]"
        >
          Two ways to commission
        </h2>
        <KindCards
          cards={[
            {
              kind: 'oil',
              title: 'Oil painting',
              from: s.commissionOilFrom ?? null,
              text: 'A one-of-a-kind painting on canvas, signed, varnished and ready to hang.',
              facts: [
                or(s.commissionOilTurnaround, '[x to y] weeks'),
                `sizes ${or(s.commissionOilSizes, '[A4] to [size]')}`,
                'progress photos',
              ],
            },
            {
              kind: 'digital',
              title: 'Digital illustration',
              from: s.commissionDigitalFrom ?? null,
              text: 'A detailed illustration delivered as a high-resolution file, with an optional signed print.',
              facts: [
                or(s.commissionDigitalTurnaround, '[x to y] weeks'),
                'personal use licence',
                `${or(s.commissionDigitalRounds, '[2]')} rounds of tweaks`,
              ],
            },
          ]}
        />
      </section>

      <section aria-labelledby="steps-h" className="mx-auto max-w-[1180px] px-6 pt-20 md:pt-24">
        <h2
          id="steps-h"
          className="m-0 mb-9 text-center font-display text-[32px] font-normal md:text-[38px]"
        >
          How it works
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-7 gap-y-8 p-0">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="flex flex-col gap-1.5 border-t border-dashed border-mauve-pale pt-[18px]"
            >
              <span aria-hidden="true" className="font-display text-[40px] leading-none text-mauve">
                {i + 1}
              </span>
              <h3 className="m-0 font-display text-2xl font-normal">{title}</h3>
              <p className="m-0 text-[17px] text-ink-soft">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="form-h" className="mx-auto max-w-[860px] px-6 pt-24 md:pt-[110px]">
        <CommissionForm
          oilSizes={
            s.commissionOilSizeOptions?.length
              ? s.commissionOilSizeOptions
              : [
                  'Small, about [30 × 40 cm]',
                  'Medium, about [40 × 50 cm]',
                  'Large, about [60 × 80 cm]',
                  'Something else',
                ]
          }
          budgets={
            s.commissionBudgetOptions?.length
              ? s.commissionBudgetOptions
              : ['R[range 1]', 'Not sure yet']
          }
          replyDays={replyDays}
        />
      </section>

      {faq.length > 0 && (
        <section aria-labelledby="cfaq-h" className="mx-auto max-w-[860px] px-6 pt-20 md:pt-24">
          <h2
            id="cfaq-h"
            className="m-0 mb-[18px] font-display text-[28px] font-normal md:text-[32px]"
          >
            Good to know
          </h2>
          <dl className="m-0 grid gap-5">
            {faq.map((item) => (
              <div key={item._id}>
                <dt className="font-display text-[22px]">{item.question}</dt>
                <dd className="mt-0.5 mb-0 ml-0 text-[17px] text-ink-soft">
                  <RichText value={item.answer} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </CommissionKindProvider>
  )
}

function Polaroid({
  image,
  label,
  className,
}: {
  image?: SanityImg | null
  label: string
  className: string
}) {
  return (
    <div className={`absolute bg-paper p-3 pb-10 shadow-polaroid ${className}`}>
      {image ? (
        <ArtImage
          {...imageProps(image, '')}
          sizes="(min-width: 768px) 300px, 50vw"
          className="block aspect-[4/5] w-full object-cover"
          style={{ objectPosition: objectPosition(image, '50% 20%') }}
        />
      ) : (
        <div className="aspect-[4/5] bg-sand" />
      )}
      <span className="absolute bottom-2 left-3.5 font-display text-lg text-ink-soft italic">
        {label}
      </span>
    </div>
  )
}
