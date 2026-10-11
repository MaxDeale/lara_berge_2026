import { describe, expect, it } from 'vitest'
import { addLine, lineKey, MAX_PRINT_QTY, removeLine, setQty, type CartLine } from './lines'

const original: CartLine = { artworkId: 'a', type: 'original', qty: 1 }
const printA3: CartLine = { artworkId: 'a', type: 'print', size: 'A3', qty: 1 }

describe('cart lines', () => {
  it('keeps originals at qty 1 and never duplicates them', () => {
    let lines = addLine([], { ...original, qty: 5 })
    lines = addLine(lines, original)
    expect(lines).toEqual([{ artworkId: 'a', type: 'original', qty: 1 }])
    expect(setQty(lines, lineKey(original), 3)[0].qty).toBe(1)
  })

  it('merges the same print size and keeps sizes separate', () => {
    let lines = addLine([], printA3)
    lines = addLine(lines, printA3)
    lines = addLine(lines, { ...printA3, size: 'A4' })
    expect(lines.map((l) => [l.size, l.qty])).toEqual([
      ['A3', 2],
      ['A4', 1],
    ])
  })

  it('clamps print quantities', () => {
    const lines = addLine([], printA3)
    expect(setQty(lines, lineKey(printA3), 0)[0].qty).toBe(1)
    expect(setQty(lines, lineKey(printA3), 99)[0].qty).toBe(MAX_PRINT_QTY)
  })

  it('ignores prints without a size and removes by key', () => {
    expect(addLine([], { artworkId: 'a', type: 'print', qty: 1 })).toEqual([])
    const lines = addLine(addLine([], original), printA3)
    expect(removeLine(lines, lineKey(original))).toEqual([printA3])
  })
})
