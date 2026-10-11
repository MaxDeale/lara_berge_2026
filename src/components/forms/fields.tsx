import { cx } from '@/lib/cx'

export const controlClasses =
  'w-full rounded-xs border border-hairline-strong bg-paper px-3.5 py-3 font-body text-lg text-ink placeholder:text-muted/80 focus:border-mauve focus:shadow-field focus:outline-none aria-invalid:border-mauve'

type FieldProps = {
  label: React.ReactNode
  htmlFor: string
  error?: string
  hint?: React.ReactNode
  /** Spans the full row in two-column form grids */
  wide?: boolean
  className?: string
  children: React.ReactNode
}

/** Label, control, hint and error message, wired together for screen readers. */
export function Field({ label, htmlFor, error, hint, wide, className, children }: FieldProps) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-1.5', wide && 'col-span-full', className)}>
      <label htmlFor={htmlFor} className="text-base text-ink-soft">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="m-0 text-[15px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="m-0 text-[15px] text-mauve italic">
          {error}
        </p>
      )}
    </div>
  )
}

/** aria props for a control inside <Field>, so its hint or error is announced */
export function describedBy(id: string, { error, hint }: { error?: string; hint?: unknown }) {
  return {
    id,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  }
}

export function TextInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cx(controlClasses, className)} {...props} />
}

export function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cx(
        controlClasses,
        'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%236E5268%27%20stroke-width=%271.5%27%20stroke-linecap=%27round%27%3E%3Cpath%20d=%27M6%209l6%206%206-6%27/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10',
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cx(controlClasses, 'resize-y', className)} {...props} />
}

type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'> & { label: React.ReactNode }

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cx('flex items-start gap-2.5 text-base text-ink-soft', className)}>
      <input type="checkbox" className="mt-[3px] size-5 shrink-0 accent-mauve" {...props} />
      <span>{label}</span>
    </label>
  )
}

/**
 * Honeypot for spam bots: hidden from people and assistive tech, left empty by humans.
 * The server rejects any submission where it's filled in.
 */
export function Honeypot({ name = 'website' }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name={name} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}

type ChoiceCardProps = Omit<React.ComponentProps<'input'>, 'type' | 'size' | 'title'> & {
  title: React.ReactNode
  note?: React.ReactNode
  /** Right-hand detail, usually a price */
  aside?: React.ReactNode
  /** `card` (option and delivery cards) or `pill` (print sizes) */
  layout?: 'card' | 'pill'
  /** Shows a radio dot, as on the checkout delivery options */
  dot?: boolean
}

/**
 * A selectable card backed by a real radio input: Original vs print, print size,
 * delivery method. Group them with a <fieldset> and a shared `name`.
 */
export function ChoiceCard({
  title,
  note,
  aside,
  layout = 'card',
  dot = false,
  className,
  ...input
}: ChoiceCardProps) {
  return (
    <label
      className={cx(
        'group relative flex rounded-[3px] border-[1.5px] border-hairline-strong bg-transparent text-ink transition-colors',
        'hover:border-muted has-checked:border-ink has-checked:bg-paper',
        'has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-mauve',
        'has-disabled:cursor-not-allowed has-disabled:opacity-55',
        layout === 'card' &&
          'min-h-16 items-center gap-3.5 px-[18px] py-3.5 md:min-h-[72px] md:px-5 md:py-4',
        layout === 'pill' && 'min-h-16 flex-col items-center justify-center px-2 text-center',
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...input} />
      {dot && (
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-mauve"
        >
          <span className="size-2.5 rounded-full bg-transparent group-has-checked:bg-mauve" />
        </span>
      )}
      <span className={cx('flex flex-col', layout === 'card' && 'flex-1')}>
        <span
          className={cx(
            'font-display',
            layout === 'card' ? 'text-xl md:text-[22px]' : 'text-[21px]',
          )}
        >
          {title}
        </span>
        {note && <span className="text-sm text-muted md:text-[15px]">{note}</span>}
      </span>
      {aside && (
        <span
          className={cx(
            layout === 'card' ? 'font-display text-xl md:text-[22px]' : 'text-sm text-muted',
          )}
        >
          {aside}
        </span>
      )}
    </label>
  )
}
