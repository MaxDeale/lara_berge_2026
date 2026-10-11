import { cx } from '@/lib/cx'

type AccordionProps = { children: React.ReactNode; className?: string }

/** A stack of AccordionItems with a rule on top. */
export function Accordion({ children, className }: AccordionProps) {
  return <div className={cx('border-t border-hairline', className)}>{children}</div>
}

type AccordionItemProps = {
  summary: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  /** `product` for the painting page, `faq` for the larger FAQ rows */
  size?: 'product' | 'faq'
  id?: string
}

/** One question or section, built on native <details> so it works without JavaScript. */
export function AccordionItem({
  summary,
  children,
  defaultOpen,
  size = 'product',
  id,
}: AccordionItemProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cx('accordion border-b border-hairline', size === 'product' && 'py-1')}
    >
      <summary
        className={cx(
          'font-display after:text-2xl',
          size === 'product' && 'min-h-[52px] text-[21px]',
          size === 'faq' && 'min-h-[60px] py-1.5 text-xl md:text-[22px] md:after:text-[26px]',
        )}
      >
        {summary}
      </summary>
      <div
        className={cx(
          'text-ink-soft [&_a]:border-b [&_a]:border-mauve-pale [&_a]:text-mauve [&_p]:m-0 [&_p+p]:mt-3',
          size === 'product' && 'mt-1 mb-[18px] text-[17px]',
          size === 'faq' && 'mb-5 max-w-[640px] text-lg',
        )}
      >
        {children}
      </div>
    </details>
  )
}
