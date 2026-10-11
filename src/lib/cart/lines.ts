export type PrintSize = 'A4' | 'A3' | 'A2'

export type CartLine = {
  artworkId: string
  type: 'original' | 'print'
  size?: PrintSize
  qty: number
}

export const MAX_PRINT_QTY = 10

/** Identifies a line: one per original, one per print size of an artwork */
export const lineKey = (line: Pick<CartLine, 'artworkId' | 'type' | 'size'>) =>
  line.type === 'original' ? `${line.artworkId}:original` : `${line.artworkId}:print:${line.size}`

/** Adds a line. Originals are one of a kind (always qty 1); the same print size merges. */
export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line)
  const existing = lines.find((l) => lineKey(l) === key)
  if (line.type === 'original') {
    return existing ? lines : [...lines, { artworkId: line.artworkId, type: 'original', qty: 1 }]
  }
  if (!line.size) return lines
  if (existing) return setQty(lines, key, existing.qty + line.qty)
  return [...lines, { ...line, qty: clampQty(line.qty) }]
}

export function setQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  return lines.map((l) =>
    lineKey(l) === key && l.type === 'print' ? { ...l, qty: clampQty(qty) } : l,
  )
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((l) => lineKey(l) !== key)
}

const clampQty = (qty: number) => Math.min(MAX_PRINT_QTY, Math.max(1, Math.floor(qty) || 1))
