import type { Metadata } from 'next'
import Image from 'next/image'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { ArtImage } from '@/components/ArtImage'
import { buttonClasses, ButtonLink, TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { ArchFrame } from '@/components/frames'
import { brand } from '@/lib/brand'
import { imageProps, objectPosition } from '@/sanity/image'
import { getSettings } from '@/sanity/queries'

// DRAFT (Nov 2026): a first pass at the Classes page while Lara settles the details.
// Everything in [brackets] still needs her real answer. Once it's settled, this copy should
// move into Sanity (a "Classes" group in Settings) so she can edit it herself.

/** Lara's Preply tutor profile. Until it's set, the button shows a placeholder. */
const PREPLY_URL: string | null = null

export const metadata: Metadata = {
  alternates: { canonical: '/classes' },
  title: 'Classes',
  description:
    'Painting and illustration classes with Lara Berge, online through Preply or as private lessons.',
}

const WAYS = [
  {
    id: 'preply',
    eyebrow: 'online',
    title: 'Lessons on Preply',
    text: 'One-to-one video lessons, booked and paid for through Preply. Pick a time that suits you, and we can start with a trial lesson.',
    facts: ['one-to-one', '[50] minute lessons', 'from R[price] / [$price]'],
  },
  {
    id: 'private',
    eyebrow: 'online or in person',
    title: 'Private classes',
    text: 'Lessons planned around you: a single session, a short course, or a small group of friends. Online, or in person in [area].',
    facts: ['one-to-one or small groups', '[length]', 'from R[price]'],
  },
] as const

const TOPICS = [
  ['Oil painting', 'From your first brushstroke to glazing, blending and that warm glow.'],
  ['Digital illustration', 'Drawing and painting with a stylus in [Procreate / Photoshop].'],
  ['Characters & creatures', 'Witches, fauns, cats in armchairs: bringing your own ideas to life.'],
  ['Colour & light', 'Choosing a palette, and painting light that seems to come from inside.'],
] as const

const STEPS = [
  ['Say hello', "Tell me what you'd like to learn and how much you've done before."],
  ['Plan it', 'We agree on a time, a topic and what you will need to have ready.'],
  ['Paint together', 'I show, you try, and we work through it side by side.'],
  ['Keep going', 'Little exercises to practise until the next lesson.'],
] as const

const QUESTIONS = [
  [
    'Do I need any experience?',
    'Not at all. Complete beginners are very welcome, and so are artists who want to try something new.',
  ],
  ['Who are the classes for?', '[Adults and teens from [age]. Ask me about younger children.]'],
  [
    'What will I need?',
    "[A short list of materials for oil painting, or a tablet and stylus for digital.] I'll send you a list before the first lesson.",
  ],
  ['What languages do you teach in?', '[English and Afrikaans?]'],
] as const

export default async function ClassesPage() {
  const s = await getSettings()

  return (
    <>
      <section className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-20 gap-y-12 px-6 pt-12">
        <div className="min-w-0 flex-[1_1_460px]">
          <Eyebrow className="mb-1">learn with me</Eyebrow>
          <h1 className="m-0 mb-[18px] font-display text-[46px] leading-[1.02] font-normal md:text-[60px]">
            Classes
          </h1>
          <p className="m-0 mb-3.5 text-lg text-ink-soft md:text-xl">
            Whether you&apos;ve never held a paintbrush or you want to bring your own little worlds
            to life, I&apos;d love to teach you.
          </p>
          <p className="m-0 mb-7 text-ink-soft">
            I teach oil painting and digital illustration, online through Preply or in private
            classes planned around you.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <PreplyButton />
            <TextLink href="/contact">ask about private classes →</TextLink>
          </div>
        </div>
        <div className="min-w-0 flex-[0_1_380px]">
          <ArchFrame>
            {s.aboutPhoto ? (
              <ArtImage
                {...imageProps(s.aboutPhoto)}
                sizes="(min-width: 768px) 380px, 90vw"
                preload
                className="block aspect-[3/4] w-full object-cover"
                style={{ objectPosition: objectPosition(s.aboutPhoto) }}
              />
            ) : (
              <div className="aspect-[3/4]" />
            )}
          </ArchFrame>
        </div>
      </section>

      <section aria-labelledby="ways-h" className="mx-auto max-w-[1120px] px-6 pt-20 md:pt-24">
        <h2
          id="ways-h"
          className="m-0 mb-7 text-center font-display text-[32px] font-normal md:text-[38px]"
        >
          Two ways to learn
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          {WAYS.map((way) => (
            <article
              key={way.id}
              className="flex flex-col gap-2.5 rounded-[3px] border-[1.5px] border-hairline-strong bg-paper px-6 py-6 md:px-8 md:py-[30px]"
            >
              <Eyebrow tracking="tight">{way.eyebrow}</Eyebrow>
              <h3 className="m-0 font-display text-[26px] font-normal md:text-[30px]">
                {way.title}
              </h3>
              <p className="m-0 text-[17px] text-ink-soft">{way.text}</p>
              <p className="m-0 flex flex-wrap gap-x-[18px] gap-y-1.5 text-[15px] text-muted">
                {way.facts.map((f) => (
                  <span key={f}>✦ {f}</span>
                ))}
              </p>
              <div className="mt-2">
                {way.id === 'preply' ? (
                  <PreplyButton />
                ) : (
                  <ButtonLink href="/contact">Get in touch</ButtonLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="topics-h" className="mx-auto max-w-[1120px] px-6 pt-20 md:pt-24">
        <div className="flex flex-wrap items-end gap-x-14 gap-y-8">
          <Image
            src={brand.doodads.catBooks}
            alt=""
            className="cat block h-auto w-[120px] flex-none max-md:hidden"
          />
          <div className="min-w-0 flex-[1_1_600px]">
            <h2 id="topics-h" className="m-0 mb-6 font-display text-[32px] font-normal md:text-4xl">
              What we can work on
            </h2>
            <dl className="m-0 grid gap-x-10 gap-y-7 border-t border-hairline pt-[26px] sm:grid-cols-2">
              {TOPICS.map(([title, text]) => (
                <div key={title}>
                  <dt className="font-display text-[22px]">{title}</dt>
                  <dd className="mt-1 mb-0 ml-0 text-ink-soft">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-h" className="mx-auto max-w-[1120px] px-6 pt-20 md:pt-24">
        <h2
          id="steps-h"
          className="m-0 mb-9 text-center font-display text-[32px] font-normal md:text-[38px]"
        >
          How a class works
        </h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-7 gap-y-8 p-0">
          {STEPS.map(([title, text], i) => (
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

      <section aria-labelledby="qs-h" className="mx-auto max-w-[860px] px-6 pt-20 md:pt-24">
        <h2 id="qs-h" className="m-0 mb-6 font-display text-[32px] font-normal md:text-[38px]">
          Good to know
        </h2>
        <Accordion>
          {QUESTIONS.map(([q, a]) => (
            <AccordionItem key={q} summary={q} size="faq">
              <p>{a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section aria-labelledby="cta-h" className="mx-auto mt-20 max-w-[1120px] px-6 md:mt-[110px]">
        <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-y border-hairline py-14">
          <div className="flex-[1_1_420px]">
            <h2
              id="cta-h"
              className="m-0 mb-2 font-display text-[30px] leading-[1.15] font-normal md:text-4xl"
            >
              Ready to pick up a brush?
            </h2>
            <p className="m-0 text-ink-soft">
              Send me a note with what you&apos;d like to learn, and we&apos;ll find a time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/contact">Say hello</ButtonLink>
            <TextLink href="/commissions">or commission a piece →</TextLink>
          </div>
        </div>
      </section>
    </>
  )
}

function PreplyButton() {
  if (!PREPLY_URL) {
    return (
      <span className="inline-flex min-h-12 items-center rounded-[2px] border border-dashed border-chip px-[26px] font-display text-xl text-muted">
        [Preply profile link]
      </span>
    )
  }
  return (
    <a href={PREPLY_URL} rel="noopener" className={buttonClasses()}>
      Book on Preply
    </a>
  )
}
