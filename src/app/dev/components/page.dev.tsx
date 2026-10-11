// Dev-only component showcase. `.dev.tsx` pages are routes only outside production (next.config.ts).
import '../../globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { ArtImage } from '@/components/ArtImage'
import { Branch } from '@/components/Branch'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Button, ButtonLink, InlineLink, TextButton, TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { Footer } from '@/components/footer/Footer'
import { FileDrop } from '@/components/forms/FileDrop'
import {
  Checkbox,
  describedBy,
  Field,
  Select,
  TextArea,
  TextInput,
} from '@/components/forms/fields'
import { ArchFrame, hoverZoom, Mat, PrintOnTable } from '@/components/frames'
import { BranchSign, HangingSign } from '@/components/HangingSign'
import { Header } from '@/components/header/Header'
import { Hero, type HeroMotion } from '@/components/Hero'
import { LockIcon } from '@/components/icons'
import { PriceTag } from '@/components/PriceTag'
import { Spider } from '@/components/Spider'
import { brand } from '@/lib/brand'
import { CartHydrator } from '@/lib/cart/CartHydrator'
import { ChipsDemo, ChoiceDemo, TabsDemo } from './Demos'
import cottage from '../../../../design/assets/cottage.jpg'
import firefly from '../../../../design/assets/firefly.jpg'
import lantern from '../../../../design/assets/lantern.jpg'
import laraPhoto from '../../../../design/assets/lara-photo.jpg'
import octopus from '../../../../design/assets/illus-39.jpg'
import stag from '../../../../design/assets/illus-1.jpg'

export const metadata: Metadata = { title: 'Components', robots: { index: false } }

const COLOURS = [
  ['cream', '#F6F2EA'],
  ['paper', '#FBF9F4'],
  ['ink', '#3B3530'],
  ['ink-soft', '#4E4640'],
  ['muted', '#6F655D'],
  ['mauve', '#6E5268'],
  ['mauve-light', '#9C7F94'],
  ['mauve-pale', '#C9B6C3'],
  ['hairline', '#E1D8CB'],
  ['hairline-strong', '#D6CCBE'],
  ['bark', '#7A5E48'],
  ['bark-outline', '#3B2E25'],
  ['leaf', '#8E9B6B'],
  ['leaf-dark', '#74835A'],
  ['leaf-light', '#A7B087'],
  ['leaf-vein', '#45512F'],
  ['berry', '#8C6A86'],
  ['night', '#231E1B'],
] as const

function Section({
  title,
  children,
  note,
}: {
  title: string
  children: React.ReactNode
  note?: string
}) {
  return (
    <section className="border-t border-hairline py-14">
      <div className="mx-auto max-w-[1240px] px-6">
        <h2 className="m-0 font-display text-[32px] font-normal">{title}</h2>
        {note && <p className="mt-1 mb-0 text-base text-muted">{note}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

const MOTIONS: HeroMotion[] = ['drift-fireflies', 'drift', 'still']

export default function ComponentsPage() {
  return (
    <div className="overflow-x-clip pb-24">
      <CartHydrator />
      <div className="mx-auto max-w-[1240px] px-6 pt-10">
        <Eyebrow>dev only · not in production builds</Eyebrow>
        <h1 className="m-0 font-display text-[52px] leading-[1.05] font-normal">Components</h1>
        <p className="text-ink-soft">
          Every shared component from Phase 1, against the approved screens. Resize to 390, 768,
          1280 and 1440 wide. Turn on reduced motion in your OS to check that everything holds
          still.
        </p>
      </div>

      <Section
        title="Header"
        note="Below 768px it becomes hamburger, logo and cart. The menu traps focus and closes on Escape."
      >
        <div className="-mx-6 border border-dashed border-chip">
          <Header />
        </div>
      </Section>

      <Section title="Colour">
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-6">
          {COLOURS.map(([name, hex]) => (
            <li key={name} className="text-[15px]">
              <span
                className="block h-16 rounded-xs border border-hairline"
                style={{ background: hex }}
              />
              <span className="mt-1 block font-display text-lg">{name}</span>
              <span className="text-muted">{hex}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-5">
          <Eyebrow>fresh off the easel · IM Fell English SC</Eyebrow>
          <p className="m-0 font-display text-[clamp(36px,5vw,58px)] leading-[1.08]">
            Small enchanted worlds, <em className="text-mauve">painted by hand</em>
          </p>
          <p className="m-0 font-display text-[40px] leading-[1.1]">
            New paintings · IM Fell English 40
          </p>
          <p className="m-0 font-display text-[25px]">[Title] · IM Fell English 25</p>
          <p className="m-0 max-w-[560px] text-xl text-ink-soft">
            Alegreya body 20: Lanterns that float in the dark, fireflies cupped in careful hands,
            and crooked cottages at the end of the path.
          </p>
          <p className="m-0 text-base text-muted">Alegreya meta 16 · Oil on canvas · 2026</p>
        </div>
      </Section>

      <Section title="Buttons and links">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink href="/commissions">Commission a piece</ButtonLink>
          <Button size="lg">Send my idea</Button>
          <Button size="lg" className="min-h-[58px]">
            <LockIcon size={18} /> Pay with PayFast
          </Button>
          <Button disabled>Disabled</Button>
          <TextLink href="/gallery">all paintings →</TextLink>
          <TextLink href="/gallery" size="sm">
            all →
          </TextLink>
          <TextButton>send another →</TextButton>
          <span className="text-base text-muted">
            Oil on canvas · [size] · <InlineLink href="/shop">see the painting</InlineLink>
          </span>
        </div>
        <div className="mt-6 max-w-[460px]">
          <Button block size="lg">
            Add to cart
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6 bg-night p-6">
          <ButtonLink href="/shop" variant="light">
            Order a print
          </ButtonLink>
          <TextLink href="/commissions" tone="night">
            commission something similar →
          </TextLink>
        </div>
      </Section>

      <Section title="Eyebrow, Breadcrumb, PriceTag">
        <div className="flex flex-col gap-5">
          <Eyebrow>made just for you</Eyebrow>
          <Breadcrumb
            items={[
              { label: 'Shop', href: '/shop' },
              { label: 'Originals', href: '/shop/originals' },
              { label: '[Title]' },
            ]}
          />
          <p className="m-0 flex flex-wrap gap-6 font-display text-[22px]">
            <PriceTag cents={125000} />
            <PriceTag cents={125050} />
            <PriceTag cents={85000} from />
            <PriceTag cents={null} />
            <PriceTag cents={1250000} className="text-[32px]" />
          </p>
        </div>
      </Section>

      <Section title="Spider" note="Takes an src, so Lara's drawing can replace the stand-in.">
        <div className="flex h-[360px] items-start gap-24">
          <Spider />
          <Spider thread={150} size={30} />
          <Spider motion="drop" thread={240} size={60} eyes />
        </div>
      </Section>

      <Section
        title="Branch and HangingSign"
        note="Home uses the wide branch with link signs; page titles use the short branch."
      >
        <div className="mx-auto max-w-[1160px]">
          <Branch variant="wide" className="relative z-2" />
          <div className="relative z-1 -mt-[26px] flex justify-around px-2 md:-mt-[58px] md:flex-wrap md:justify-center md:gap-x-[9%] md:gap-y-6 md:px-0">
            <HangingSign
              image={brand.signs.gallery}
              alt="Gallery"
              href="/gallery"
              width="clamp(104px, 18vw, 210px)"
              delay={-1.5}
            />
            <HangingSign
              image={brand.signs.shop}
              alt="Shop"
              href="/shop"
              width="clamp(104px, 18vw, 210px)"
              delay={-3.2}
              className="md:mt-2.5"
            />
            <HangingSign
              image={brand.signs.about}
              alt="About"
              href="/about"
              width="clamp(104px, 18vw, 210px)"
              delay={-4.6}
              className="md:mt-0.5"
            />
          </div>
        </div>
        <div className="mt-20 grid gap-16 sm:grid-cols-2">
          <BranchSign image={brand.signs.gallery} />
          <BranchSign image={brand.signs.shop} />
          <BranchSign image={brand.signs.about} />
          <BranchSign image={brand.signs.contact} width={200} />
        </div>
      </Section>

      <Section
        title="Hero"
        note="Motion is set in Sanity: drift + fireflies, drift only, or still."
      >
        <div className="flex flex-col gap-16">
          {MOTIONS.map((motion) => (
            <div key={motion}>
              <Eyebrow className="mb-3">{motion}</Eyebrow>
              <Hero
                motion={motion}
                image={{
                  src: cottage,
                  alt: 'Oil painting of a crooked pink cottage with copper roofs in a sunlit forest clearing',
                }}
                caption={
                  <>
                    <p className="m-0 font-display text-[22px] italic">[Painting title]</p>
                    <p className="m-0 text-base text-muted">
                      Oil on canvas · [size] ·{' '}
                      <InlineLink href="/shop">see the painting</InlineLink>
                    </p>
                  </>
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Mat, ArchFrame, PrintOnTable">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-start gap-10">
          <a href="#" className="group flex flex-col gap-3.5">
            <Mat>
              <ArtImage
                src={firefly}
                alt="Woman cradling a glowing firefly"
                sizes="300px"
                className={`block aspect-[4/5] w-full object-cover ${hoverZoom}`}
              />
            </Mat>
            <span>
              <span className="block font-display text-[25px]">[Title]</span>
              <span className="text-base text-muted">
                Original R[price] · prints available · Mat md
              </span>
            </span>
          </a>
          <Mat padding="lg">
            <ArtImage
              src={lantern}
              alt="Woman holding a floating lantern"
              sizes="300px"
              className="block aspect-[4/5] w-full object-cover object-top"
            />
          </Mat>
          <ArchFrame>
            <ArtImage
              src={laraPhoto}
              alt="Lara smiling among green leaves"
              sizes="400px"
              className="block aspect-[3/4] w-full object-cover"
            />
          </ArchFrame>
          <a href="#" className="group flex flex-col gap-3.5">
            <PrintOnTable image={{ src: octopus, alt: 'Print of an octopus holding a lantern' }} />
            <span className="font-display text-[23px]">[Title]</span>
          </a>
          <a href="#" className="group">
            <PrintOnTable image={{ src: stag, alt: 'Print of a stag with glowing antlers' }} />
          </a>
        </div>
      </Section>

      <Section title="FilterChips and Tabs">
        <ChipsDemo />
        <div className="mt-12">
          <TabsDemo />
        </div>
      </Section>

      <Section title="Accordion" note="Native <details>: works without JavaScript.">
        <div className="grid gap-12 md:grid-cols-2">
          <Accordion>
            <AccordionItem summary="About the painting" defaultOpen>
              <p>
                Oil on [canvas / board], [W × H × D cm]. Varnished for protection, sides painted,
                and wired so it&apos;s ready to hang.
              </p>
            </AccordionItem>
            <AccordionItem summary="Shipping & packaging">
              <p>
                Originals are wrapped in glassine, corner-protected and boxed, then couriered with
                tracking.
              </p>
            </AccordionItem>
          </Accordion>
          <Accordion>
            <AccordionItem size="faq" summary="Do you ship outside South Africa?" defaultOpen>
              <p>
                Yes, almost everywhere. International parcels are tracked and usually arrive in [x
                to y] working days.
              </p>
            </AccordionItem>
            <AccordionItem size="faq" summary="Can I collect in person?">
              <p>Yes, collection from [suburb, City] is free.</p>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      <Section title="Form fields">
        <form
          className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-6 gap-y-[22px]"
          action="#"
        >
          <Field label="Your name" htmlFor="d-name">
            <TextInput {...describedBy('d-name', {})} autoComplete="name" />
          </Field>
          <Field
            label="Email address"
            htmlFor="d-email"
            error="That email doesn't look quite right."
          >
            <TextInput
              {...describedBy('d-email', { error: 'x' })}
              type="email"
              defaultValue="lara@"
            />
          </Field>
          <Field label="What's it about?" htmlFor="d-topic" wide>
            <Select {...describedBy('d-topic', {})}>
              <option>A painting or print</option>
              <option>Help with an order</option>
              <option>A commission</option>
            </Select>
          </Field>
          <Field
            label="Your message"
            htmlFor="d-msg"
            wide
            hint="Lara usually replies within [1 to 2 working days]."
          >
            <TextArea
              {...describedBy('d-msg', { hint: true })}
              rows={4}
              placeholder="Who or what is in it, the mood, colours you love…"
            />
          </Field>
          <FileDrop
            name="references"
            hint="Pets, places, people, mood pictures · up to [5] images"
          />
          <Checkbox
            className="col-span-full"
            defaultChecked
            label="Lara may share the finished piece on her website and Instagram"
          />
        </form>
        <div className="mt-12">
          <ChoiceDemo />
        </div>
      </Section>

      <Section title="Doodads">
        <div className="flex flex-wrap items-end gap-10">
          {Object.entries(brand.doodads).map(([name, img]) => (
            <figure key={name} className="m-0 text-center text-[15px] text-muted">
              <Image src={img} alt="" className="h-auto w-[110px]" />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section
        title="Footer"
        note="The cat sits on the rule; Contact, Commissions and the order page leave it off."
      >
        <div className="-mx-6 border border-dashed border-chip">
          <Footer cat instagramUrl="#" />
        </div>
      </Section>
    </div>
  )
}
