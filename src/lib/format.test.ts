import { describe, expect, it } from 'vitest'
import { formatZAR } from './format'

const NBSP = ' '

describe('formatZAR', () => {
  it('formats whole rands without decimals', () => {
    expect(formatZAR(0)).toBe('R0')
    expect(formatZAR(45000)).toBe('R450')
    expect(formatZAR(125000)).toBe(`R1${NBSP}250`)
    expect(formatZAR(1250000)).toBe(`R12${NBSP}500`)
    expect(formatZAR(123456700)).toBe(`R1${NBSP}234${NBSP}567`)
  })

  it('shows cents only when they are non-zero', () => {
    expect(formatZAR(125050)).toBe(`R1${NBSP}250,50`)
    expect(formatZAR(99)).toBe('R0,99')
    expect(formatZAR(105)).toBe('R1,05')
  })

  it('keeps the sign for negative amounts', () => {
    expect(formatZAR(-5000)).toBe('-R50')
  })

  it('rejects fractional cents', () => {
    expect(() => formatZAR(10.5)).toThrow(TypeError)
  })
})
