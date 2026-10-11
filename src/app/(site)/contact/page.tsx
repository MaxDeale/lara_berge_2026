import type { Metadata } from 'next'
import Image from 'next/image'
import { TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { ContactForm } from '@/components/forms/ContactForm'
import { BranchSign } from '@/components/HangingSign'
import { or } from '@/lib/artwork'
import { brand } from '@/lib/brand'
import { instagramUrl } from '@/lib/site'
import { getSettings } from '@/sanity/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  title: 'Contact',
  description: 'Questions about a painting, an order or a collaboration? Send Lara a note.',
}

export default async function ContactPage() {
  const s = await getSettings()
  const insta = instagramUrl(s.instagramHandle)
  const linkClass = 'border-b border-mauve-pale font-display text-[22px] text-ink md:text-2xl'

  return (
    <>
      <section className="mx-auto max-w-[760px] px-6 pt-9 text-center">
        <BranchSign image={brand.signs.contact} width={200} />
        <h1 className="mt-[30px] mb-2 font-display text-[36px] leading-[1.1] font-normal md:text-[44px]">
          Send a little note
        </h1>
        <p className="mx-auto my-0 max-w-[520px] text-ink-soft">
          Questions about a painting, an order, a collaboration, or just to say hi. Letters by owl
          also accepted.
        </p>
      </section>

      <section className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-x-[72px] gap-y-12 px-6 pt-16">
        <div className="min-w-0 flex-[1_1_540px]">
          <ContactForm replyTime={or(s.replyTime, '[1 to 2 working days]')} />
        </div>

        <aside className="relative flex min-w-0 flex-[1_1_300px] flex-col gap-[30px]">
          <div>
            <Eyebrow as="h2" tracking="tight" className="mb-1.5 md:text-base">
              write directly
            </Eyebrow>
            {s.contactEmail ? (
              <a href={`mailto:${s.contactEmail}`} className={linkClass}>
                {s.contactEmail}
              </a>
            ) : (
              <span className={linkClass}>hello@[domain]</span>
            )}
          </div>
          <div>
            <Eyebrow as="h2" tracking="tight" className="mb-1.5 md:text-base">
              follow along
            </Eyebrow>
            {insta ? (
              <a href={insta} rel="noopener" className={linkClass}>
                @{s.instagramHandle}
              </a>
            ) : (
              <span className={linkClass}>@[instagram handle]</span>
            )}
            <p className="mt-1.5 mb-0 text-base text-muted">
              Works in progress, studio cats, and first looks at new paintings.
            </p>
          </div>
          <div className="border border-hairline bg-paper px-6 py-[22px]">
            <h2 className="m-0 mb-1.5 font-display text-2xl font-normal">Planning a commission?</h2>
            <p className="m-0 mb-2.5 text-[17px] text-ink-soft">
              The commission form asks all the right questions, so Lara can quote you faster.
            </p>
            <TextLink href="/commissions" className="md:text-[19px]">
              go to commissions →
            </TextLink>
          </div>
          <Image
            src={brand.doodads.tree}
            alt=""
            className="-mt-2.5 block h-auto w-[120px] self-end"
          />
        </aside>
      </section>
    </>
  )
}
