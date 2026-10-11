import Link from 'next/link'
import { ArtImage } from '@/components/ArtImage'
import { hoverZoom, Mat } from '@/components/frames'
import { cardStatus } from '@/lib/artwork'
import { cx } from '@/lib/cx'
import { imageProps, objectPosition } from '@/sanity/image'
import type { ArtworkCard as Artwork } from '@/sanity/types'

type ArtworkCardProps = {
  artwork: Artwork
  /** `lg` home and gallery cards, `md` "You might also love", `sm` phone carousel */
  size?: 'sm' | 'md' | 'lg'
  headingLevel?: 'h2' | 'h3' | 'p'
  sizes?: string
  className?: string
}

/** A painting in its paper mat with its title and status underneath, linking to its shop page. */
export function ArtworkCard({
  artwork,
  size = 'lg',
  headingLevel: Heading = 'h3',
  sizes = '(min-width: 1120px) 340px, (min-width: 768px) 45vw, 90vw',
  className,
}: ArtworkCardProps) {
  const status = cardStatus(artwork)
  return (
    <article
      className={cx(
        'group relative flex flex-col',
        size === 'lg' ? 'gap-3.5' : 'gap-2.5 md:gap-3',
        className,
      )}
    >
      <Mat padding={size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'xs'}>
        <ArtImage
          {...imageProps(artwork.image)}
          sizes={sizes}
          className={cx('block aspect-[4/5] w-full object-cover', hoverZoom)}
          style={{ objectPosition: objectPosition(artwork.image) }}
        />
      </Mat>
      <div>
        <Heading
          className={cx(
            'm-0 font-display font-normal',
            size === 'lg' && 'text-[21px] leading-[1.2] md:text-[25px]',
            size === 'md' && 'text-[23px]',
            size === 'sm' && 'text-[21px]',
          )}
        >
          {/* The whole card is clickable through this link */}
          <Link
            href={`/shop/${artwork.slug}`}
            prefetch
            className="text-ink group-hover:text-mauve after:absolute after:inset-0"
          >
            {artwork.title}
          </Link>
        </Heading>
        <p className={cx('m-0 text-muted', size === 'lg' ? 'text-sm md:text-base' : 'text-[15px]')}>
          {status.italic && <em>{status.italic}</em>}
          {status.text}
        </p>
      </div>
    </article>
  )
}
