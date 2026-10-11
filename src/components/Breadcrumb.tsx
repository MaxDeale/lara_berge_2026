import Link from 'next/link'
import { Fragment } from 'react'
import { cx } from '@/lib/cx'

export type Crumb = { label: string; href?: string }

/** "Shop › Originals › [Title]". The last crumb is the current page. */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cx('text-base text-muted', className)}>
      <ol className="m-0 flex list-none flex-wrap items-baseline gap-x-1.5 p-0">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li>
                {item.href && !last ? (
                  <Link href={item.href} className="border-b border-hairline-strong text-muted">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>{item.label}</span>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="select-none">
                  ›
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
