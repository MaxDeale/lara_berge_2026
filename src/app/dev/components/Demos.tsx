'use client'

import { useState } from 'react'
import { FilterChips } from '@/components/FilterChips'
import { ChoiceCard } from '@/components/forms/fields'
import { PriceTag } from '@/components/PriceTag'
import { TabPanel, Tabs } from '@/components/Tabs'

export function ChipsDemo() {
  const [originals, setOriginals] = useState<'all' | 'available' | 'sold'>('all')
  const [kind, setKind] = useState<'oil' | 'digital'>('oil')
  return (
    <div className="flex flex-col gap-6">
      <FilterChips
        label="Filter paintings"
        value={originals}
        onChange={setOriginals}
        options={[
          { value: 'all', label: 'All' },
          { value: 'available', label: 'Available' },
          { value: 'sold', label: 'Sold' },
        ]}
      />
      <FilterChips
        label="Type of commission"
        size="lg"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'oil', label: 'Oil painting' },
          { value: 'digital', label: 'Digital illustration' },
        ]}
      />
    </div>
  )
}

export function TabsDemo() {
  const [tab, setTab] = useState('paintings')
  return (
    <div>
      <Tabs
        idBase="demo"
        label="Choose a collection"
        value={tab}
        onValueChange={setTab}
        tabs={[
          { id: 'paintings', label: 'Paintings', sublabel: 'oil on canvas · 3 pieces' },
          { id: 'digital', label: 'Digital illustration', sublabel: 'pixels & ink · 23 pieces' },
        ]}
        className="mb-8"
      />
      <TabPanel idBase="demo" id={tab} key={tab}>
        <p className="text-center text-ink-soft">
          {tab === 'paintings' ? 'The paintings panel.' : 'The digital illustration panel.'}
        </p>
      </TabPanel>
    </div>
  )
}

const SIZES = [
  { size: 'A4', dims: '21 × 30 cm', price: 85000 },
  { size: 'A3', dims: '30 × 42 cm', price: 125000 },
  { size: 'A2', dims: '42 × 59 cm', price: null },
] as const

export function ChoiceDemo() {
  const [option, setOption] = useState('original')
  const [size, setSize] = useState('A3')
  const [delivery, setDelivery] = useState('courier')
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 font-sc text-[15px] tracking-[0.14em] text-mauve">choose</legend>
          <ChoiceCard
            name="option"
            value="original"
            checked={option === 'original'}
            onChange={() => setOption('original')}
            title="The original"
            note="One of a kind · certificate of authenticity"
            aside={<PriceTag cents={450000} />}
          />
          <ChoiceCard
            name="option"
            value="print"
            checked={option === 'print'}
            onChange={() => setOption('print')}
            title="Fine art print"
            note="Signed giclée on archival cotton paper"
            aside={<PriceTag cents={85000} from />}
          />
        </fieldset>
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3 font-sc text-[15px] tracking-[0.14em] text-mauve">
            print size
          </legend>
          <div className="grid grid-cols-3 gap-2.5">
            {SIZES.map((s) => (
              <ChoiceCard
                key={s.size}
                layout="pill"
                name="size"
                value={s.size}
                checked={size === s.size}
                onChange={() => setSize(s.size)}
                title={s.size}
                aside={
                  <>
                    {s.dims} · <PriceTag cents={s.price} />
                  </>
                }
              />
            ))}
          </div>
        </fieldset>
      </div>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-3.5 p-0 font-display text-[26px]">2. Delivery</legend>
        {[
          {
            id: 'courier',
            label: 'Courier, door to door',
            note: 'Anywhere in South Africa · [x to y] working days',
            price: 15000,
          },
          {
            id: 'collect',
            label: 'Collect from the studio',
            note: '[City] · by arrangement',
            price: 0,
          },
          {
            id: 'intl',
            label: 'International shipping',
            note: 'Tracked · [x to y] working days · duties may apply',
            price: null,
          },
        ].map((m) => (
          <ChoiceCard
            key={m.id}
            dot
            name="delivery"
            value={m.id}
            checked={delivery === m.id}
            onChange={() => setDelivery(m.id)}
            title={<span className="text-xl">{m.label}</span>}
            note={m.note}
            aside={
              <span className="font-body text-[17px]">
                {m.price === 0 ? 'Free' : <PriceTag cents={m.price} />}
              </span>
            }
          />
        ))}
        <ChoiceCard
          dot
          disabled
          name="delivery-disabled"
          value="x"
          title={<span className="text-xl">Disabled option</span>}
          note="For an original that has just sold"
        />
      </fieldset>
    </div>
  )
}
