import { discountPercent, formatPrice, formatSold, installmentValue } from './format'

describe('format', () => {
  it('formats prices in ARS style', () => {
    expect(formatPrice(1249999)).toBe('$ 1.249.999')
    expect(formatPrice(0)).toBe('$ 0')
  })

  it('calculates discount percent', () => {
    expect(discountPercent(75, 100)).toBe(25)
    expect(discountPercent(100)).toBe(0)
    expect(discountPercent(120, 100)).toBe(0)
  })

  it('rounds installments up', () => {
    expect(installmentValue(100, 3)).toBe(34)
    expect(installmentValue(100, 0)).toBe(100)
  })

  it('formats sold counts', () => {
    expect(formatSold(4800)).toBe('+4mil vendidos')
    expect(formatSold(350)).toBe('+300 vendidos')
    expect(formatSold(12)).toBe('12 vendidos')
  })
})
