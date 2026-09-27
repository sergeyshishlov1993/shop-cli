import { describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick, reactive } from 'vue'
import { rules, useFormValidation } from '~/modules/common/composables/useFormValidation'
import RegisterForm from '~/modules/auth/components/RegisterForm.vue'
import LoginForm from '~/modules/auth/components/LoginForm.vue'
import { useAuthStore } from '~/modules/auth/authStore'

describe('rules', () => {
  it('validates common formats', () => {
    expect(rules.required()('  ')).toBeTruthy()
    expect(rules.required()('x')).toBe('')
    expect(rules.email()('a@b')).toBeTruthy()
    expect(rules.email()('a@b.ua')).toBe('')
    expect(rules.phoneUa()('+38 (067) 123-45-67')).toBe('')
    expect(rules.phoneUa()('+38067123')).toBeTruthy()
    expect(rules.minLength(6)('12345')).toBeTruthy()
    expect(rules.maxLength(3)('1234')).toBeTruthy()
    expect(rules.positive()(0)).toBeTruthy()
    expect(rules.positive()('10.5')).toBe('')
    expect(rules.integer()('1.5')).toBeTruthy()
    expect(rules.min(0)(-1)).toBeTruthy()
    expect(rules.max(100)(101)).toBeTruthy()
    expect(rules.slug()('Bad Slug')).toBeTruthy()
    expect(rules.slug()('good-slug-1')).toBe('')
    expect(rules.sameAs(() => 'a')('b')).toBeTruthy()
    // optional fields: empty passes non-required rules
    expect(rules.email()('')).toBe('')
  })
})

describe('useFormValidation', () => {
  it('validates on submit and re-validates on change afterwards', async () => {
    const form = reactive({ email: '', name: '' })
    const v = useFormValidation({
      email: [() => form.email, [rules.required(), rules.email()]],
      name: [() => form.name, [rules.maxLength(3)]],
    })
    form.email = 'bad'
    await nextTick()
    expect(v.errors.email).toBe('') // not shown before submit
    expect(v.validate()).toBe(false)
    expect(v.errors.email).toBe('Невірний формат email')
    form.email = 'ok@mail.com'
    await nextTick()
    expect(v.errors.email).toBe('')
    expect(v.validate()).toBe(true)
  })

  it('maps backend messages to fields and returns the rest', () => {
    const v = useFormValidation({ email: [() => '', []] })
    const rest = v.applyServerErrors({ data: { message: ['email must be an email', 'Something else'] } })
    expect(v.errors.email).toBe('email must be an email')
    expect(rest).toEqual(['Something else'])
  })
})

describe('auth forms', () => {
  it('RegisterForm shows field errors and does not call API', async () => {
    const store = useAuthStore()
    const spy = vi.spyOn(store, 'register').mockResolvedValue(undefined as never)
    const w = await mountSuspended(RegisterForm)
    await w.find('input[type="email"]').setValue('bad-email')
    await w.find('form').trigger('submit')
    const text = w.text()
    expect(text).toContain('Ім\'я обов\'язкове')
    expect(text).toContain('Невірний формат email')
    expect(text).toContain('Пароль обов\'язковий')
    expect(spy).not.toHaveBeenCalled()
  })

  it('LoginForm requires email and password', async () => {
    const w = await mountSuspended(LoginForm)
    await w.find('form').trigger('submit')
    expect(w.text()).toContain('Email обов\'язковий')
    expect(w.findAll('[aria-invalid="true"]').length).toBe(2)
  })
})
