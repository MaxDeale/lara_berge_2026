import Link from 'next/link'
import { PortableText, type PortableTextBlock, type PortableTextComponents } from 'next-sanity'
import { cx } from '@/lib/cx'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#'
      const className = 'border-b border-mauve-pale text-mauve'
      return href.startsWith('/') ? (
        <Link href={href} className={className}>
          {children}
        </Link>
      ) : (
        <a href={href} className={className} rel="noopener">
          {children}
        </a>
      )
    },
  },
  list: { bullet: ({ children }) => <ul className="list-disc pl-6">{children}</ul> },
}

/** Lara's rich text from Sanity: paragraphs, emphasis, bullets and links. */
export function RichText({
  value,
  className,
}: {
  value?: PortableTextBlock[]
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={cx('[&_p]:m-0 [&_p+p]:mt-[18px]', className)}>
      <PortableText value={value} components={components} />
    </div>
  )
}
