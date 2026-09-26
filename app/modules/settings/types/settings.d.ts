interface StoreTheme {
  backgroundColor: string
  surfaceColor: string
  textColor: string
  primaryColor: string
  primarySoftColor: string
  primaryStrongColor: string
  backgroundMediaType: 'NONE' | 'IMAGE' | 'VIDEO'
  backgroundMediaUrl: string
  backgroundMediaPosition: string
  backgroundMediaOpacity: string
}

interface PublicSettings {
  storePhone: string | null
  storeEmail: string | null
  storeAddress: string | null
  socialLinksJson: Record<string, string> | null
  currency: string
  themeJson: StoreTheme | null
  // Онлайн-оплата (0.1). Скрыта фиче-флагом; на витрине по умолчанию false.
  onlinePaymentEnabled?: boolean
  // Повернення: тумблер блоку та строк (днів після доставки)
  returnsEnabled?: boolean
  returnWindowDays?: number
}
