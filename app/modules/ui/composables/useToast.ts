export interface ProductToast {
  image?: string | null
  title: string
  name: string
  meta?: string | null
  price?: number | string | null
  // Посилання замість «До кошика» (напр. «До обраного» → /favorites) та іконка біля заголовка
  link?: { label: string, to: string }
  icon?: string
}

interface Toast {
  id: number
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration: number
  product?: ProductToast
}

let toastId = 0

export function useToast() {
  const toasts = useState<Toast[]>('ui-toasts', () => [])

  function add(variant: Toast['variant'], message: string, duration = 5000, product?: ProductToast) {
    toasts.value.push({ id: ++toastId, message, variant, duration, product })
  }

  const remove = (id: number) => { toasts.value = toasts.value.filter((toast) => toast.id !== id) }

  const success = (message: string, duration?: number) => add('success', message, duration)
  const error = (message: string, duration?: number) => add('error', message, duration)
  const warning = (message: string, duration?: number) => add('warning', message, duration)
  const info = (message: string, duration?: number) => add('info', message, duration)
  const product = (payload: ProductToast, duration?: number) => add('success', payload.title, duration, payload)

  return { toasts, remove, success, error, warning, info, product }
}
