'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ArtImage } from '@/components/ArtImage'
import { hoverZoom, Mat } from '@/components/frames'
import { TabPanel, Tabs } from '@/components/Tabs'
import { galleryStatus } from '@/lib/artwork'
import { imageProps, objectPosition } from '@/sanity/image'
import type { ArtworkCard } from '@/sanity/types'

type Tab = 'paintings' | 'digital'

type GalleryViewProps = {
  paintings: ArtworkCard[]
  digital: ArtworkCard[]
  /** Empty "[Next painting]" slots shown until there are enough paintings */
  slots: number
}

/** Gallery tabs. The selected tab lives in the URL (?tab=digital) so it can be shared. */
export function GalleryView(props: GalleryViewProps) {
  return (
    <Suspense fallback={<GalleryPanels {...props} tab="paintings" />}>
      <GalleryFromUrl {...props} />
    </Suspense>
  )
}

function GalleryFromUrl(props: GalleryViewProps) {
  const tab: Tab = useSearchParams().get('tab') === 'digital' ? 'digital' : 'paintings'
  return <GalleryPanels {...props} tab={tab} />
}

function GalleryPanels({ paintings, digital, slots, tab }: GalleryViewProps & { tab: Tab }) {
  // Next keeps useSearchParams in sync with history.replaceState, so switching is instant
  const select = (id: string) =>
    window.history.replaceState(null, '', id === 'digital' ? '/gallery?tab=digital' : '/gallery')

  return (
    <>
      <Tabs
        idBase="gallery"
        label="Choose a collection"
        value={tab}
        onValueChange={select}
        className="mb-11"
        tabs={[
          {
            id: 'paintings',
            label: 'Paintings',
            sublabel: `oil on canvas · ${count(paintings.length)}`,
          },
          {
            id: 'digital',
            label: 'Digital illustration',
            sublabel: `pixels & ink · ${count(digital.length)}`,
          },
        ]}
      />
      {tab === 'paintings' ? (
        <TabPanel
          idBase="gallery"
          id="paintings"
          key="paintings"
          className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] items-start gap-x-11 gap-y-14"
        >
          {paintings.map((p) => (
            <article key={p._id} className="flex flex-col gap-3.5">
              <Link
                href={`/gallery/${p.slug}`}
                prefetch
                className="group block"
                aria-label={`View ${p.title} up close`}
              >
                <Mat>
                  <ArtImage
                    {...imageProps(p.image)}
                    sizes="(min-width: 1240px) 370px, (min-width: 768px) 45vw, 90vw"
                    className={`block aspect-[4/5] w-full object-cover ${hoverZoom}`}
                    style={{ objectPosition: objectPosition(p.image) }}
                  />
                </Mat>
              </Link>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h2 className="m-0 font-display text-[25px] leading-[1.2] font-normal">
                    {p.title}
                  </h2>
                  <p className="m-0 text-base text-muted">
                    {p.medium ?? 'Oil on canvas'} · {p.year ?? '[year]'}
                  </p>
                </div>
                <Link
                  href={`/shop/${p.slug}`}
                  className="border-b border-mauve-pale text-base whitespace-nowrap text-mauve"
                >
                  {galleryStatus(p)}
                </Link>
              </div>
            </article>
          ))}
          {Array.from({ length: slots }, (_, i) => (
            <article key={`slot-${i}`} aria-hidden="true" className="flex flex-col gap-3.5">
              <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-chip bg-paper text-[17px] text-muted italic">
                [Next painting]
              </div>
              <div>
                <p className="m-0 font-display text-[25px] leading-[1.2]">[Title]</p>
                <p className="m-0 text-base text-muted">Oil on canvas · [year]</p>
              </div>
            </article>
          ))}
        </TabPanel>
      ) : (
        <TabPanel
          idBase="gallery"
          id="digital"
          key="digital"
          className="columns-[2_150px] gap-3.5 md:columns-[4_230px] md:gap-[22px]"
        >
          {digital.map((d) => (
            <Link
              key={d._id}
              href={`/gallery/${d.slug}`}
              prefetch
              className="group relative mb-3.5 block break-inside-avoid overflow-hidden shadow-tile md:mb-[22px]"
            >
              <ArtImage
                {...imageProps(d.image)}
                sizes="(min-width: 1240px) 280px, (min-width: 768px) 23vw, 48vw"
                className={`block h-auto w-full ${hoverZoom}`}
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[rgba(34,29,26,0.72)] to-transparent px-3.5 pt-7 pb-3 font-display text-lg text-paper italic opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                view up close
              </span>
            </Link>
          ))}
        </TabPanel>
      )}
    </>
  )
}

const count = (n: number) => `${n} ${n === 1 ? 'piece' : 'pieces'}`
