interface UsePhoneMaskReturn {
  onInput: (event: Event) => string
  onKeydown: (event: KeyboardEvent) => void
  format: (value: string) => string
  unmask: (value: string) => string
}

export function usePhoneMask(): UsePhoneMaskReturn {
  const template = '+38 (0__) ___-__-__'
  const digitSlots = [6, 7, 10, 11, 12, 14, 15, 17, 18]

  function extractDigits(value: string): string {
    const raw = value.replace(/\D/g, '')
    if (raw.startsWith('380')) return raw.slice(3, 12)
    if (raw.startsWith('80')) return raw.slice(2, 11)
    if (raw.startsWith('0')) return raw.slice(1, 10)
    return raw.slice(0, 9)
  }

  function format(value: string): string {
    const digits = extractDigits(value)
    if (!digits.length) return ''

    const chars = template.split('')
    let digitIndex = 0

    for (const slot of digitSlots) {
      if (digitIndex < digits.length) {
        chars[slot] = digits[digitIndex]
        digitIndex++
      } else {
        chars[slot] = '_'
      }
    }

    const lastFilledSlot = digitSlots[digits.length - 1]
    if (lastFilledSlot !== undefined) {
      return chars.slice(0, lastFilledSlot + 1).join('')
    }

    return '+38 (0'
  }

  function unmask(value: string): string {
    const digits = extractDigits(value)
    if (!digits.length) return ''
    return `380${digits}`
  }

  function onInput(event: Event): string {
    const input = event.target as HTMLInputElement
    const formatted = format(input.value)
    input.value = formatted

    const rawDigits = extractDigits(formatted)
    const nextSlotIndex = rawDigits.length < digitSlots.length ? digitSlots[rawDigits.length] : undefined
    if (nextSlotIndex !== undefined) {
      input.setSelectionRange(nextSlotIndex, nextSlotIndex)
    } else {
      input.setSelectionRange(formatted.length, formatted.length)
    }

    return formatted
  }

  function onKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement
    const cursorPos = input.selectionStart ?? 0

    if (event.key === 'Backspace') {
      event.preventDefault()
      const digits = extractDigits(input.value)
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1)
        const formatted = newDigits.length ? format(newDigits) : ''
        input.value = formatted

        const nextSlot = newDigits.length < digitSlots.length ? digitSlots[newDigits.length] : formatted.length
        input.setSelectionRange(nextSlot, nextSlot)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }

    if (event.key === 'Delete') {
      event.preventDefault()
    }

    if (event.key.length === 1 && !/\d/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
    }
  }

  return { onInput, onKeydown, format, unmask }
}
