// object-position из точки фокуса (0..1). Дефолт — центр.
export function focalPosition(focalX?: number | null, focalY?: number | null): string {
  const x = Math.round((focalX ?? 0.5) * 100)
  const y = Math.round((focalY ?? 0.5) * 100)
  return `${x}% ${y}%`
}

// CSS-змінні з точками фокуса для десктопа/планшета/телефона; застосовує клас .focal-media (main.css).
export function focalVars(slide: {
  focalX?: number | null, focalY?: number | null
  focalXTablet?: number | null, focalYTablet?: number | null
  focalXMobile?: number | null, focalYMobile?: number | null
}): Record<string, string> {
  return {
    '--focal-desktop': focalPosition(slide.focalX, slide.focalY),
    '--focal-tablet': focalPosition(slide.focalXTablet ?? slide.focalX, slide.focalYTablet ?? slide.focalY),
    '--focal-mobile': focalPosition(slide.focalXMobile ?? slide.focalX, slide.focalYMobile ?? slide.focalY),
  }
}
