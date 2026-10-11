'use client'

import { createContext, useContext, useState } from 'react'
import { PriceTag } from '@/components/PriceTag'
import { cx } from '@/lib/cx'

export type Kind = 'oil' | 'digital'

const KindContext = createContext<{ kind: Kind; setKind: (k: Kind) => void } | null>(null)

/** Shares the oil/digital choice between the "Two ways" cards and the form further down. */
export function CommissionKindProvider({ children }: { children: React.ReactNode }) {
  const [kind, setKind] = useState<Kind>('oil')
  return <KindContext value={{ kind, setKind }}>{children}</KindContext>
}

export function useCommissionKind() {
  const ctx = useContext(KindContext)
  if (!ctx) throw new Error('useCommissionKind must be used inside <CommissionKindProvider>')
  return ctx
}

type KindCard = {
  kind: Kind
  title: string
  from: number | null
  text: string
  facts: string[]
}

export function KindCards({ cards }: { cards: KindCard[] }) {
  const { kind, setKind } = useCommissionKind()
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
      {cards.map((card) => {
        const on = card.kind === kind
        return (
          <button
            key={card.kind}
            type="button"
            aria-pressed={on}
            onClick={() => setKind(card.kind)}
            className={cx(
              'flex flex-col gap-2.5 rounded-[3px] border-[1.5px] px-6 py-6 text-left font-body text-ink transition-colors md:px-8 md:py-[30px]',
              on
                ? 'border-ink bg-paper'
                : 'border-hairline-strong bg-transparent hover:border-muted',
            )}
          >
            <span className="flex w-full items-baseline justify-between gap-3">
              <span className="font-display text-[26px] md:text-[30px]">{card.title}</span>
              <span className="text-[17px]">
                <PriceTag cents={card.from} from />
              </span>
            </span>
            <span className="text-[17px] text-ink-soft">{card.text}</span>
            <span className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-[15px] text-muted">
              {card.facts.map((f) => (
                <span key={f}>✦ {f}</span>
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}
