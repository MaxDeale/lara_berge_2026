const whole = new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })
const withCents = new Intl.NumberFormat('en-ZA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats an integer amount of ZAR cents for display, e.g. 125000 -> "R1 250".
 * Uses en-ZA grouping (a non-breaking space) and only shows cents when they are non-zero.
 */
export function formatZAR(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`formatZAR expects integer cents, got ${cents}`)
  }
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const rands = abs / 100
  const body = abs % 100 === 0 ? whole.format(rands) : withCents.format(rands)
  return `${sign}R${body}`
}
