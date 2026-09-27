import { nextTick, reactive, ref, watch, type Ref } from 'vue'

/** Returns an error message, or '' when valid. */
export type Rule = (value: unknown) => string

const isEmpty = (v: unknown) => v === null || v === undefined || (typeof v === 'string' ? !v.trim() : Array.isArray(v) && !v.length)
const toNum = (v: unknown) => (v === '' || v === null || v === undefined ? NaN : Number(v))

export const rules = {
  required: (msg = 'Обовʼязкове поле'): Rule => v => (isEmpty(v) ? msg : ''),
  email: (msg = 'Невірний формат email'): Rule => v => (isEmpty(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? '' : msg),
  phoneUa: (msg = 'Введіть номер у форматі +380XXXXXXXXX'): Rule => v => (isEmpty(v) || /^380\d{9}$/.test(String(v).replace(/\D/g, '')) ? '' : msg),
  minLength: (n: number, msg = `Мінімум ${n} символів`): Rule => v => (isEmpty(v) || String(v).trim().length >= n ? '' : msg),
  maxLength: (n: number, msg = `Максимум ${n} символів`): Rule => v => (isEmpty(v) || String(v).length <= n ? '' : msg),
  number: (msg = 'Введіть число'): Rule => v => (isEmpty(v) || Number.isFinite(toNum(v)) ? '' : msg),
  integer: (msg = 'Введіть ціле число'): Rule => v => (isEmpty(v) || Number.isInteger(toNum(v)) ? '' : msg),
  min: (n: number, msg = `Мінімальне значення ${n}`): Rule => v => (isEmpty(v) || toNum(v) >= n ? '' : msg),
  max: (n: number, msg = `Максимальне значення ${n}`): Rule => v => (isEmpty(v) || toNum(v) <= n ? '' : msg),
  positive: (msg = 'Значення має бути більше 0'): Rule => v => (isEmpty(v) || toNum(v) > 0 ? '' : msg),
  pattern: (re: RegExp, msg = 'Невірний формат'): Rule => v => (isEmpty(v) || re.test(String(v)) ? '' : msg),
  slug: (msg = 'Лише латиниця в нижньому регістрі, цифри та дефіс'): Rule => rules.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, msg),
  url: (msg = 'Невірне посилання'): Rule => v => (isEmpty(v) || /^(https?:\/\/|\/)\S+$/.test(String(v).trim()) ? '' : msg),
  sameAs: (other: () => unknown, msg = 'Значення не збігаються'): Rule => v => (isEmpty(v) || v === other() ? '' : msg),
}

type Getter = () => unknown

/**
 * Tiny form validation. `fields` maps a field key to [getter, rules].
 * Errors are shown on submit; after the first submit each field re-validates on change.
 */
export function useFormValidation<K extends string>(
  fields: Record<K, [Getter, Rule[]]> | (() => Record<K, [Getter, Rule[]]>),
  root?: Ref<HTMLElement | { $el?: HTMLElement } | null | undefined>,
) {
  const get = () => (typeof fields === 'function' ? fields() : fields)
  const keys = Object.keys(get()) as K[]
  const errors = reactive(Object.fromEntries(keys.map(k => [k, '']))) as Record<K, string>
  const submitted = ref(false)

  function validateField(key: K): boolean {
    const entry = get()[key]
    if (!entry) return true
    const [getter, fieldRules] = entry
    const value = getter()
    errors[key] = fieldRules.map(r => r(value)).find(Boolean) ?? ''
    return !errors[key]
  }

  function focusFirstInvalid() {
    if (typeof document === 'undefined') return
    void nextTick(() => {
      const r = root?.value
      const scope = ((r && ('$el' in r ? r.$el : r)) || document) as ParentNode
      const el = scope.querySelector?.<HTMLElement>('[aria-invalid="true"]')
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
      el?.focus?.({ preventScroll: true })
    })
  }

  function validate(): boolean {
    submitted.value = true
    const ok = keys.map(validateField).every(Boolean)
    if (!ok) focusFirstInvalid()
    return ok
  }

  function reset() {
    submitted.value = false
    keys.forEach(k => (errors[k] = ''))
  }

  /** Validate a field on blur (only if it has a value or form was submitted). */
  function touch(key: K) {
    const entry = get()[key]
    if (submitted.value || (entry && !isEmpty(entry[0]()))) validateField(key)
  }

  /**
   * Maps backend 400 messages (class-validator "field must ...") onto fields.
   * Returns messages that could not be mapped (show them in a toast).
   */
  function applyServerErrors(error: unknown): string[] {
    const data = (error as { data?: { message?: string | string[] } } | null)?.data
    const raw = data?.message
    const messages = Array.isArray(raw) ? raw : raw ? [raw] : []
    const rest: string[] = []
    for (const msg of messages) {
      const key = keys.find(k => new RegExp(`^${k}\\b`).test(msg))
      if (key) errors[key] = msg
      else rest.push(msg)
    }
    if (rest.length < messages.length) focusFirstInvalid()
    return rest
  }

  for (const k of keys) {
    watch(() => get()[k]?.[0](), () => { if (submitted.value) validateField(k) }, { deep: true })
  }

  return { errors, validate, validateField, touch, reset, applyServerErrors, submitted }
}
