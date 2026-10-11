import Link from 'next/link'
import { Eyebrow } from '@/components/Eyebrow'
import { RichText } from '@/components/RichText'
import { getLegalPage } from '@/sanity/queries'

/** Terms and Privacy: plain text from Sanity, laid out like the FAQ column. */
export async function LegalPage({
  slug,
  fallbackTitle,
}: {
  slug: 'terms' | 'privacy'
  fallbackTitle: string
}) {
  const page = await getLegalPage(slug)
  return (
    <div className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-x-[72px] gap-y-10 px-6 pt-12">
      <div className="min-w-0 flex-[1_1_260px]">
        <Eyebrow className="mb-1">the small print</Eyebrow>
        <h1 className="m-0 font-display text-[42px] leading-[1.02] font-normal md:text-[54px]">
          {page?.title ?? fallbackTitle}
        </h1>
      </div>
      <div className="min-w-0 flex-[999_1_560px] border-t border-hairline pt-6">
        <RichText value={page?.body} className="max-w-[640px] text-lg text-ink-soft [&_ul]:my-4" />
        <p className="mt-10 mb-0 text-ink-soft">
          Questions?{' '}
          <Link href="/contact" className="border-b border-mauve-pale text-mauve">
            Send Lara a note
          </Link>
        </p>
      </div>
    </div>
  )
}
