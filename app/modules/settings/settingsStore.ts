export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<PublicSettings | null>(null)
  const loading = ref(false)

  async function fetch() {
    if (settings.value) return
    loading.value = true
    try {
      settings.value = await settingsApi.getPublic()
    }
    finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetch,
  }
})
