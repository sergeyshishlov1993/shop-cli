export function formatPrice(amount: number | null | undefined): string {
  const value = Number(amount ?? 0)

  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: 0,
  }).format(value) + ' ₴'
}
