'use client'

import { useState } from 'react'
import { ArtImage } from '@/components/ArtImage'
import { Mat } from '@/components/frames'
import { cx } from '@/lib/cx'
import { imageProps, objectPosition } from '@/sanity/image'
import type { SanityImg } from '@/sanity/types'

type View = SanityImg & { label: string }

/** Main image in a mat, with detail thumbnails underneath to switch views. */
export function ProductImages({ views, crop }: { views: View[]; crop: boolean }) {
  const [active, setActive] = useState(0)
  const view = views[active]

  return (
    <div className="flex flex-col gap-[18px]">
      <Mat padding="lg">
        <ArtImage
          key={view.url}
          {...imageProps(view)}
          preload={active === 0}
          sizes="(min-width: 1240px) 620px, (min-width: 768px) 55vw, 92vw"
          className={cx('block w-full animate-fade', crop ? 'aspect-[4/5] object-cover' : 'h-auto')}
          style={crop ? { objectPosition: objectPosition(view) } : undefined}
        />
      </Mat>
      {views.length > 1 && (
        <div role="group" aria-label="Choose a view" className="grid grid-cols-4 gap-3.5">
          {views.map((v, i) => (
            <button
              key={v.url}
              type="button"
              aria-label={v.label}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={cx(
                'overflow-hidden rounded-xs border-2 bg-paper p-0',
                i === active ? 'border-mauve' : 'border-transparent hover:border-hairline-strong',
              )}
            >
              <ArtImage
                {...imageProps(v, '')}
                sizes="140px"
                className="block aspect-square w-full object-cover"
                style={{ objectPosition: objectPosition(v) }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
