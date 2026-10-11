import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Accordion, AccordionItem } from '@/components/Accordion'
import { ArtworkCard } from '@/components/ArtworkCard'
import { Breadcrumb } from '@/components/Breadcrumb'
import { TextLink } from '@/components/Button'
import { Eyebrow } from '@/components/Eyebrow'
import { RichText } from '@/components/RichText'
import { ProductImages } from '@/components/shop/ProductImages'
import { ProductOptions } from '@/components/shop/ProductOptions'
import { or } from '@/lib/artwork'
import { artworkJsonLd, JsonLd, ogImage } from '@/lib/seo'
import { getArtwork, getArtworks, getSettings } from '@/sanity/queries'

export async function generateStaticParams() {
  const artworks = await getArtworks()
  return artworks.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<'/shop/[slug]'>): Promise<Metadata> {
  const artwork = await getArtwork((await params).slug)
  if (!artwork) return {}
  return {
    title: artwork.title,
    description:
      artwork.image.alt ??
      `${artwork.kind === 'digital' ? 'Digital illustration' : 'Oil painting'} by Lara Berge`,
    alternates: { canonical: `/shop/${artwork.slug}` },
    openGraph: { type: 'website', images: [ogImage(artwork.image)!] },
  }
}

/**
 * Every artwork is prerendered (generateStaticParams), so the page is awaited directly: wrapping
 * it in <Suspense> made the content stream in after a skeleton and shifted the layout. Links to
 * artworks use prefetch, so client navigations still arrive instantly.
 */
export const instant = false

export default async function ArtworkPage({ params }: PageProps<'/shop/[slug]'>) {
  const { slug } = await params
  const [artwork, all, s] = await Promise.all([getArtwork(slug), getArtworks(), getSettings()])
  if (!artwork) notFound()

  const isPainting = artwork.kind === 'painting'
  const views = [
    { ...artwork.image, label: isPainting ? 'Full painting' : 'Full illustration' },
    ...(artwork.detailImages ?? []).map((d, i) => ({ ...d, label: d.label ?? `Detail ${i + 1}` })),
  ]
  const others = all.filter((a) => a._id !== artwork._id)
  const related = [
    ...others.filter((a) => a.kind === artwork.kind),
    ...others.filter((a) => a.kind !== artwork.kind),
  ].slice(0, 3)
  const dispatchOriginals = or(s.dispatchOriginals, '[x] working days')
  const dispatchPrints = or(s.dispatchPrints, '[x] working days')
  const medium = artwork.medium ?? (isPainting ? 'Oil on canvas' : 'Digital illustration')

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-10">
      <JsonLd data={artworkJsonLd(artwork)} />
      <Breadcrumb
        className="mb-[26px]"
        items={[
          { label: 'Shop', href: '/shop' },
          isPainting
            ? { label: 'Originals', href: '/shop/originals' }
            : { label: 'Prints', href: '/shop/prints' },
          { label: artwork.title },
        ]}
      />

      <div className="flex flex-wrap items-start gap-x-[72px] gap-y-12">
        <section aria-label="Images" className="flex min-w-0 flex-[1_1_560px] flex-col gap-[18px]">
          <ProductImages views={views} crop={isPainting} />
          {isPainting && (
            <p className="m-0 text-[15px] text-muted italic">
              Photographed in daylight. Colours may shift a little from screen to screen.
            </p>
          )}
        </section>

        <section aria-labelledby="title-h" className="min-w-0 flex-[1_1_420px]">
          <Eyebrow className="mb-1">
            {isPainting ? 'oil painting' : 'digital illustration'} · {artwork.year ?? '[year]'}
          </Eyebrow>
          <h1
            id="title-h"
            className="m-0 font-display text-[40px] leading-[1.05] font-normal md:text-[54px]"
          >
            {artwork.title}
          </h1>
          <p className="mt-2 mb-0 text-[17px] text-muted">
            {isPainting
              ? `${medium} · ${or(artwork.dimensions, '[W × H cm]')} · signed on the back`
              : `${medium} · signed fine art prints`}
          </p>
          {artwork.description?.length ? (
            <RichText value={artwork.description} className="mt-[22px] text-ink-soft" />
          ) : null}

          <ProductOptions
            artworkId={artwork._id}
            original={
              isPainting && artwork.original?.forSale
                ? {
                    forSale: true,
                    price: artwork.original.price ?? null,
                    status: artwork.original.status ?? 'available',
                  }
                : null
            }
            variants={artwork.variants ?? []}
            dispatchOriginals={dispatchOriginals}
            dispatchPrints={dispatchPrints}
          />

          <Accordion className="mt-[30px]">
            {isPainting ? (
              <AccordionItem summary="About the painting" defaultOpen>
                <p>
                  {medium}, {or(artwork.dimensions, '[W × H × D cm]')}. Varnished for protection,
                  sides painted, and wired so it&apos;s ready to hang straight out of the box.
                  Arrives with a signed certificate of authenticity.
                </p>
              </AccordionItem>
            ) : (
              <AccordionItem summary="About the print" defaultOpen>
                <p>
                  {or(s.printPaperName, '[Paper name]')}, a{' '}
                  {or(s.printPaperDetails, '[weight] gsm archival cotton paper')}, printed with
                  pigment inks that last {or(s.printLightfast, '[100+]')} years out of direct
                  sunlight. Signed by Lara, and unframed so it fits a standard A-size frame.
                </p>
              </AccordionItem>
            )}
            <AccordionItem summary="Shipping & packaging">
              <p>
                {isPainting
                  ? 'Originals are wrapped in glassine, corner-protected and boxed, then couriered with tracking.'
                  : 'Prints travel flat between rigid board, and are couriered with tracking.'}{' '}
                South Africa: {or(s.deliverySA, '[x to y] working days')}. International:{' '}
                {or(s.deliveryInternational, '[x to y] working days')}, duties may apply.
              </p>
            </AccordionItem>
            {isPainting && (
              <AccordionItem summary="Caring for an oil painting">
                <p>
                  Hang it out of direct sunlight and away from damp walls. Dust gently with a soft,
                  dry brush. Never use water or cleaning sprays.
                </p>
              </AccordionItem>
            )}
          </Accordion>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="more-h" className="mt-24 md:mt-[120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 id="more-h" className="m-0 font-display text-[30px] font-normal md:text-4xl">
              You might also love
            </h2>
            <TextLink
              href={isPainting ? '/shop/originals' : '/shop/prints'}
              className="md:text-[19px]"
            >
              {isPainting ? 'all originals →' : 'all prints →'}
            </TextLink>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-10">
            {related.map((a) => (
              <ArtworkCard
                key={a._id}
                artwork={a}
                size="md"
                headingLevel="p"
                sizes="(min-width: 1240px) 360px, (min-width: 768px) 30vw, 90vw"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
