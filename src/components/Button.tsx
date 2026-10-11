import Link, { type LinkProps } from 'next/link'
import { cx } from '@/lib/cx'

type Variant = 'primary' | 'light'
type Size = 'md' | 'lg'

type StyleProps = {
  variant?: Variant
  size?: Size
  /** Full-width, e.g. "Add to cart" and the mobile "Commission a piece" */
  block?: boolean
}

export function buttonClasses({ variant = 'primary', size = 'md', block }: StyleProps = {}) {
  return cx(
    'items-center justify-center gap-2.5 rounded-xs font-display transition-[filter] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60',
    block ? 'flex w-full' : 'inline-flex',
    variant === 'primary' && 'bg-mauve text-white hover:text-white',
    variant === 'light' && 'bg-night-text text-ink hover:text-ink',
    size === 'md' && 'min-h-12 px-[26px] text-xl',
    size === 'lg' && 'min-h-14 px-10 text-[22px]',
  )
}

type ButtonProps = StyleProps & React.ComponentProps<'button'>

/** Primary mauve button. */
export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClasses({ variant, size, block }), className)}
      {...props}
    />
  )
}

type ButtonLinkProps = StyleProps &
  LinkProps &
  Omit<React.ComponentProps<'a'>, keyof LinkProps> & { children: React.ReactNode }

/** A link styled as the primary button. */
export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={cx(buttonClasses({ variant, size, block }), className)} {...props} />
}

type TextLinkProps = LinkProps &
  Omit<React.ComponentProps<'a'>, keyof LinkProps> & {
    children: React.ReactNode
    size?: 'sm' | 'md'
    tone?: 'day' | 'night'
  }

/** Italic IM Fell link, e.g. "all paintings →". Arrows belong in the copy. */
export function TextLink({ size = 'md', tone = 'day', className, ...props }: TextLinkProps) {
  return (
    <Link
      className={cx(
        'inline-flex min-h-11 items-center font-display italic',
        size === 'md' ? 'text-[19px] md:text-xl' : 'text-[17px]',
        tone === 'day' ? 'text-mauve' : 'text-night-accent hover:text-night-text',
        className,
      )}
      {...props}
    />
  )
}

type InlineLinkProps = LinkProps &
  Omit<React.ComponentProps<'a'>, keyof LinkProps> & { children: React.ReactNode }

/** Underlined link inside running text, e.g. "see the painting". */
export function InlineLink({ className, ...props }: InlineLinkProps) {
  return <Link className={cx('border-b border-mauve-pale text-mauve', className)} {...props} />
}

/** Text-only button that looks like a TextLink, e.g. "send another →". */
export function TextButton({
  className,
  type = 'button',
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex min-h-11 items-center border-0 bg-transparent font-display text-[19px] text-mauve italic',
        className,
      )}
      {...props}
    />
  )
}
