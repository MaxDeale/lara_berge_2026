import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { Eyebrow } from '@/components/Eyebrow'
import { RichText } from '@/components/RichText'
import { brand } from '@/lib/brand'
import { getFaq } from '@/sanity/queries'
import { FAQ_SECTIONS } from '@/sanity/constants'

export const metadata: Metadata = {
  alternates: { canonical: '/faq' },
  title: 'FAQ',
  description: 'Shipping, returns, prints, originals, commissions and payments: good to know.',
}

export default async function FaqPage() {
  const faq = await getFaq('faq')
  const sections = FAQ_SECTIONS.map((s) => ({
    ...s,
    items: faq.filter((f) => f.section === s.value),
  })).filter((s) => s.items.length > 0)

  return (
    <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-x-[72px] gap-y-10 px-6 pt-12">
      <div className="min-w-0 flex-[1_1_260px] md:sticky md:top-8">
        <Eyebrow className="mb-1">questions &amp; answers</Eyebrow>
        <h1 className="m-0 mb-3.5 font-display text-[42px] leading-[1.02] font-normal md:text-[54px]">
          Good to know
        </h1>
        <nav aria-label="FAQ topics" className="mt-[18px] flex flex-col gap-0.5">
          {sections.map((s) => (
            <a
              key={s.value}
              href={`#${s.value}`}
              className="flex min-h-10 items-center font-display text-xl"
            >
              {s.title}
            </a>
          ))}
        </nav>
        <Image
          src={brand.doodads.catBooks}
          alt=""
          className="mt-10 block h-auto w-[110px] max-md:hidden"
        />
      </div>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-14">
        {sections.map((s, si) => (
          <section
            key={s.value}
            id={s.value}
            aria-labelledby={`${s.value}-h`}
            className="scroll-mt-6"
          >
            <Eyebrow as="h2" id={`${s.value}-h`} tracking="tight" className="mb-1.5 md:text-[17px]">
              {s.title.toLowerCase()}
            </Eyebrow>
            <Accordion>
              {s.items.map((item, i) => (
                <AccordionItem
                  key={item._id}
                  size="faq"
                  summary={item.question}
                  defaultOpen={si === 0 && i === 0}
                >
                  <RichText value={item.answer} />
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
        <p className="m-0 text-ink-soft">
          Still wondering about something?{' '}
          <Link href="/contact" className="border-b border-mauve-pale text-mauve">
            Send Lara a note
          </Link>
        </p>
      </div>
    </div>
  )
}
