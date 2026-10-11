'use client'

import { cx } from '@/lib/cx'

export type ChipOption<T extends string> = { value: T; label: string }

type FilterChipsProps<T extends string> = {
  options: ReadonlyArray<ChipOption<T>>
  value: T
  onChange: (value: T) => void
  label: string
  /** `md` for list filters, `lg` for the commission type toggle */
  size?: 'md' | 'lg'
  className?: string
}

/** Pill toggles, e.g. All / Available / Sold. Exactly one is pressed. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: FilterChipsProps<T>) {
  return (
    <div role="group" aria-label={label} className={cx('flex flex-wrap gap-2.5', className)}>
      {options.map((option) => {
        const pressed = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(option.value)}
            className={cx(
              'border font-body transition-colors',
              size === 'md' && 'min-h-11 rounded-[22px] px-[18px] text-base',
              size === 'lg' && 'min-h-[46px] rounded-[23px] px-5 text-[17px]',
              pressed
                ? 'border-ink bg-ink text-paper'
                : 'border-chip bg-transparent text-ink hover:border-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
