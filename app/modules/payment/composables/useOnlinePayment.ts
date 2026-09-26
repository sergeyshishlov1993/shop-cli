import { useSettingsStore } from '~/modules/settings/settingsStore'

/**
 * Единственная точка, решающая, показывать ли онлайн-оплату на витрине (0.1).
 *
 * Пока сервер отдаёт `onlinePaymentEnabled: false` (двойной фиче-флаг на беке),
 * и весь платёжный UI обязан гейтиться этим флагом. По умолчанию — скрыто.
 */
export function useOnlinePayment() {
  const settingsStore = useSettingsStore()
  const isOnlinePaymentEnabled = computed(
    () => settingsStore.settings?.onlinePaymentEnabled === true,
  )
  return { isOnlinePaymentEnabled }
}
