import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'
import ReviewMediaPicker from '~/modules/review/components/ReviewMediaPicker.vue'
import BToast from '~/modules/ui/components/BToast/BToast.vue'
import BRadio from '~/modules/ui/components/BRadio/BRadio.vue'
import { useToast } from '~/modules/ui/composables/useToast'

const file = (name: string, type = 'image/png') => new File(['x'], name, { type })

describe('ReviewMediaPicker', () => {
  beforeAll(() => {
    let n = 0
    URL.createObjectURL = vi.fn(() => `blob:${++n}`)
    URL.revokeObjectURL = vi.fn()
  })

  async function mountPicker(max: number, initial: File[] = []) {
    const wrapper = await mountSuspended(ReviewMediaPicker, {
      props: {
        max,
        'modelValue': initial,
        'onUpdate:modelValue': (v: File[]) => wrapper.setProps({ modelValue: v }),
      },
    })
    return wrapper
  }

  async function pick(wrapper: Awaited<ReturnType<typeof mountPicker>>, files: File[]) {
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: files, configurable: true })
    await input.trigger('change')
  }

  it('adds picked files up to max', async () => {
    const wrapper = await mountPicker(3, [file('a.png')])
    await pick(wrapper, [file('b.mp4', 'video/mp4')])
    const model = wrapper.emitted('update:modelValue')!.at(-1)![0] as File[]
    expect(model.map(f => f.name)).toEqual(['a.png', 'b.mp4'])
    expect(wrapper.emitted('error')).toBeUndefined()
    expect(wrapper.findAll('img')).toHaveLength(1)
    expect(wrapper.findAll('video')).toHaveLength(1)
  })

  it('emits error and truncates when over max; hides add button at max', async () => {
    const wrapper = await mountPicker(2, [file('a.png')])
    await pick(wrapper, [file('b.png'), file('c.png')])
    expect(wrapper.emitted('error')![0]).toEqual(['Можна додати не більше 2 файлів'])
    const model = wrapper.emitted('update:modelValue')!.at(-1)![0] as File[]
    expect(model.map(f => f.name)).toEqual(['a.png', 'b.png'])
    expect(wrapper.text()).not.toContain('Додати')
  })

  it('removes a file', async () => {
    const wrapper = await mountPicker(3, [file('a.png'), file('b.png')])
    await wrapper.find('button[aria-label="Прибрати файл"]').trigger('click')
    const model = wrapper.emitted('update:modelValue')!.at(-1)![0] as File[]
    expect(model.map(f => f.name)).toEqual(['b.png'])
  })
})

describe('BToast', () => {
  afterEach(() => {
    useToast().toasts.value = []
    vi.useRealTimers()
  })

  it('applies color class per variant', async () => {
    const wrapper = await mountSuspended(BToast)
    const t = useToast()
    t.success('ok'); t.error('bad'); t.warning('hm'); t.info('fyi')
    await nextTick()
    const classes = [...document.body.querySelectorAll('[role="status"]')].map(el => el.className)
    expect(classes[0]).toContain('bg-emerald-600')
    expect(classes[1]).toContain('bg-red-600')
    expect(classes[2]).toContain('bg-amber-400')
    expect(classes[3]).toContain('bg-sky-600')
    wrapper.unmount()
  })

  it('auto-dismisses after duration', async () => {
    const wrapper = await mountSuspended(BToast)
    vi.useFakeTimers()
    const t = useToast()
    t.info('bye', 1000)
    await nextTick()
    expect(t.toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(999)
    expect(t.toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(t.toasts.value).toHaveLength(0)
    wrapper.unmount()
  })
})

describe('BRadio card', () => {
  const base = { name: 'pay', value: 'card', label: 'Карта', hint: 'Visa', variant: 'card' as const }

  it('shows checked styles when modelValue matches', async () => {
    const wrapper = await mountSuspended(BRadio, { props: { ...base, modelValue: 'card' } })
    const label = wrapper.find('label')
    expect(label.classes()).toEqual(expect.arrayContaining(['border-primary-500', 'bg-primary-50', 'rounded-xl']))
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.text()).toContain('Visa')
  })

  it('unchecked styles and emits value on change', async () => {
    const wrapper = await mountSuspended(BRadio, { props: { ...base, modelValue: 'cash' } })
    expect(wrapper.find('label').classes()).toContain('border-secondary-200')
    await wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([['card']])
  })
})
