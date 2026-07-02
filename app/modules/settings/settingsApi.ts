export const settingsApi = {
  getPublic() {
    const { $api } = useNuxtApp()
    return $api<PublicSettings>('/storefront/settings')
  },
}
