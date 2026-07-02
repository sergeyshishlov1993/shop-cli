interface Toast {
  id: number
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

let toastId = 0

export function useToast() {
  const toasts = useState<Toast[]>('ui-toasts', () => [])

  function add(variant: Toast['variant'], message: string, duration = 5000) {
    const id = ++toastId
    toasts.value.push({ id, message, variant, duration })
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function success(message: string, duration?: number) {
    add('success', message, duration)
  }

  function error(message: string, duration?: number) {
    add('error', message, duration)
  }

  function warning(message: string, duration?: number) {
    add('warning', message, duration)
  }

  function info(message: string, duration?: number) {
    add('info', message, duration)
  }

  return { toasts, remove, success, error, warning, info }
}
