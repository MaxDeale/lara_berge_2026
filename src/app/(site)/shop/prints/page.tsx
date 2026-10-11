import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/Breadcrumb'
import { PrintsGrid } from '@/components/shop/PrintsGrid'
import { or } from '@/lib/artwork'
import { getArtworks, getSettings } from '@/sanity/queries'

export const metadata: Metadata = {
  title: 'Fine art prints',
  description:
    'Signed giclée prints of Lara Berge’s paintings and digital illustrations, in A4, A3 and A2.',
}

export default async function PrintsPage() {
  const [s, artworks] = await Promise.all([getSettings(), getArtworks()])
  const prints = artworks.filter((a) => a.hasPrints)

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-10">
      <Breadcrumb
        className="mb-[18px]"
        items={[{ label: 'Shop', href: '/shop' }, { label: 'Prints' }]}
      />
      <PrintsGrid
        prints={prints}
        heading={
          <div>
            <h1 className="m-0 font-display text-[40px] leading-[1.05] font-normal md:text-[52px]">
              Fine art prints
            </h1>
            <p className="mt-2 mb-0 max-w-[600px] text-ink-soft">
              Giclée prints on {or(s.printPaperName, '[paper name]')} archival cotton paper, each
              one signed by Lara and sent flat in a sturdy envelope.
            </p>
          </div>
        }
        details={
          <ul
            aria-label="Print details"
            className="m-0 mt-7 flex list-none flex-wrap gap-x-10 gap-y-2.5 border-y border-hairline p-0 py-[18px] text-base text-ink-soft"
          >
            <PrintDetails lightfast={s.printLightfast} />
          </ul>
        }
      />
    </div>
  )
}

function PrintDetails({ lightfast }: { lightfast?: string }) {
  return (
    <>
      {[
        'Sizes A4, A3 & A2',
        `Archival inks, ${or(lightfast, '[100+]')} year lightfast`,
        'Signed on the front',
        'Unframed, ready for a standard frame',
      ].map((item) => (
        <li key={item}>
          <span className="text-mauve" aria-hidden="true">
            ✦
          </span>{' '}
          {item}
        </li>
      ))}
    </>
  )
}
