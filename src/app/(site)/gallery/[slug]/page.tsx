import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Lightbox } from '@/components/gallery/Lightbox'
import { getLightboxCollection, lightboxStaticParams } from '@/components/gallery/lightboxData'

export const generateStaticParams = lightboxStaticParams

export async function generateMetadata({
  params,
}: PageProps<'/gallery/[slug]'>): Promise<Metadata> {
  const { current } = await getLightboxCollection((await params).slug)
  return {
    title: current.title,
    description: current.image.alt,
    alternates: { canonical: `/gallery/${current.slug}` },
  }
}

/** Direct visit to a piece: the same viewer, closing back to the gallery. */
export default function GalleryPiecePage({ params }: PageProps<'/gallery/[slug]'>) {
  return (
    <Suspense fallback={<div aria-hidden="true" className="fixed inset-0 z-50 bg-night" />}>
      <Piece params={params} />
    </Suspense>
  )
}

async function Piece({ params }: { params: PageProps<'/gallery/[slug]'>['params'] }) {
  const { items, index, current } = await getLightboxCollection((await params).slug)
  return (
    <>
      <h1 className="sr-only">{current.title}</h1>
      <Lightbox items={items} startIndex={index} mode="page" />
    </>
  )
}
