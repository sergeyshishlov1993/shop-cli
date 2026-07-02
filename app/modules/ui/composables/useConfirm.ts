interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions
  resolve: ((value: boolean) => void) | null
}

export function useConfirm() {
  const state = useState<ConfirmState>('ui-confirm', () => ({
    isOpen: false,
    options: {
      title: '',
      message: '',
      confirmText: 'Підтвердити',
      cancelText: 'Скасувати',
      variant: 'primary',
    },
    resolve: null,
  }))

  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        options: {
          confirmText: 'Підтвердити',
          cancelText: 'Скасувати',
          variant: 'primary',
          ...options,
        },
        resolve,
      }
    })
  }

  function accept() {
    state.value.resolve?.(true)
    state.value.isOpen = false
    state.value.resolve = null
  }

  function cancel() {
    state.value.resolve?.(false)
    state.value.isOpen = false
    state.value.resolve = null
  }

  return { state, confirm, accept, cancel }
}
