interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'warning'
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

  function settle(result: boolean) {
    state.value.resolve?.(result)
    state.value.isOpen = false
    state.value.resolve = null
  }

  const accept = () => settle(true)
  const cancel = () => settle(false)

  return { state, confirm, accept, cancel }
}
