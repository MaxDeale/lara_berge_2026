import { Suspense } from 'react'
import { Lightbox } from '@/components/gallery/Lightbox'
import { getLightboxCollection, lightboxStaticParams } from '@/components/gallery/lightboxData'

export const generateStaticParams = lightboxStaticParams

/** Opened from the gallery (or the home strip): the viewer over the page you came from. */
export default function GalleryPieceModal({ params }: PageProps<'/gallery/[slug]'>) {
  return (
    <Suspense fallback={<div aria-hidden="true" className="fixed inset-0 z-50 bg-night/90" />}>
      <PieceModal params={params} />
    </Suspense>
  )
}

async function PieceModal({ params }: { params: PageProps<'/gallery/[slug]'>['params'] }) {
  const { items, index } = await getLightboxCollection((await params).slug)
  return <Lightbox items={items} startIndex={index} mode="modal" />
}
