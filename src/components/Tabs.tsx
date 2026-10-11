'use client'

import { useRef } from 'react'
import { cx } from '@/lib/cx'

export type TabItem = { id: string; label: string; sublabel?: string }

type TabsProps = {
  tabs: TabItem[]
  value: string
  onValueChange: (id: string) => void
  /** Prefix for tab and panel ids, unique on the page */
  idBase: string
  label: string
  className?: string
}

export const tabId = (idBase: string, id: string) => `${idBase}-tab-${id}`
export const panelId = (idBase: string, id: string) => `${idBase}-panel-${id}`

const Swash = () => (
  <svg aria-hidden="true" width="120" height="8" viewBox="0 0 60 6" className="mt-1.5">
    <path
      d="M1 4 C 12 1, 22 6, 32 3 S 50 1, 59 3"
      fill="none"
      stroke="var(--color-mauve)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * Big serif tabs with a hand-drawn swash under the selected one (Gallery).
 * Follows the WAI-ARIA tabs pattern: arrow keys, Home and End move between tabs.
 */
export function Tabs({ tabs, value, onValueChange, idBase, label, className }: TabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = tabs.length - 1
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    refs.current[next]?.focus()
    onValueChange(tabs[next].id)
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        'flex flex-wrap justify-center gap-x-8 gap-y-2 border-b border-hairline md:gap-x-14',
        className,
      )}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={tabId(idBase, tab.id)}
            aria-selected={selected}
            aria-controls={panelId(idBase, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="flex min-h-12 flex-col items-center gap-0.5 border-0 bg-transparent px-1.5 pt-2.5 pb-4 font-display text-ink"
          >
            <span className="text-[26px] leading-[1.1] md:text-[30px]">{tab.label}</span>
            {tab.sublabel && (
              <span className="font-body text-[15px] text-muted">{tab.sublabel}</span>
            )}
            {selected ? <Swash /> : <span className="h-3.5" />}
          </button>
        )
      })}
    </div>
  )
}

type TabPanelProps = {
  idBase: string
  id: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ idBase, id, children, className }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelId(idBase, id)}
      aria-labelledby={tabId(idBase, id)}
      tabIndex={0}
      className={cx('animate-fadeup focus-visible:outline-offset-8', className)}
    >
      {children}
    </div>
  )
}
