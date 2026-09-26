/**
 * Украинские формы множественного числа: 1 товар, 2 товари, 5 товарів.
 */
export function pluralUk(count: number, one: string, few: string, many: string): string {
  const absolute = Math.abs(count) % 100
  const lastDigit = absolute % 10

  if (absolute > 10 && absolute < 20) return many
  if (lastDigit > 1 && lastDigit < 5) return few
  if (lastDigit === 1) return one

  return many
}

export function formatProductCount(count: number | null | undefined): string {
  const value = count ?? 0

  return `${value} ${pluralUk(value, 'товар', 'товари', 'товарів')}`
}
