'use client'

import { Flex, Text, TextInput } from '@sanity/ui'
import { useCallback, useState } from 'react'
import { set, unset, type NumberInputProps } from 'sanity'

const toRands = (cents: number | undefined) =>
  typeof cents === 'number' ? String(cents / 100) : ''

/**
 * Prices are stored as integer cents, but Lara types rands: "1250" saves as 125000.
 * Accepts "1 250", "1250", "1250.50" and "1250,50".
 */
export function RandsInput(props: NumberInputProps) {
  const { value, onChange, elementProps, readOnly } = props
  const [text, setText] = useState(toRands(value))

  // Keep the box in sync when the value changes elsewhere (another editor, a revert),
  // without clobbering a half-typed amount in the box
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    if (parse(text) !== value) setText(toRands(value))
  }

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value
      setText(next)
      if (next.trim() === '') {
        onChange(unset())
        return
      }
      const cents = parse(next)
      if (cents !== undefined) onChange(set(cents))
    },
    [onChange],
  )

  return (
    <Flex align="center" gap={2}>
      <Text size={2} muted>
        R
      </Text>
      <div style={{ flex: 1 }}>
        <TextInput
          {...elementProps}
          value={text}
          onChange={handleChange}
          inputMode="decimal"
          readOnly={readOnly}
          placeholder="e.g. 1250"
        />
      </div>
    </Flex>
  )
}

function parse(input: string): number | undefined {
  const cleaned = input.replace(/[\sR]/g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return undefined
  return Math.round(Number(cleaned) * 100)
}
