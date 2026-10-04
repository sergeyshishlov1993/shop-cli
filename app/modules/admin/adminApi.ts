import { getAccessToken } from '~/plugins/api'
import type { getFileUrl } from '~/modules/common/helpers/fileUrl'
import type { ReturnCustomer, ReturnDetail, ReturnStatus, ReturnSummary } from '~/modules/returns/returns'
export type AdminProductType = 'CLOTHING' | 'SHOES' | 'ACCESSORY'
export type AdminOrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'

export interface AdminCategory {
  id: number
  name: string
  slug: string
  parentId: number | null
  productType: AdminProductType | null
  isActive: boolean
  sortOrder: number
  deletedAt: string | null
  children?: AdminCategory[]
  imageFileId?: number | null
  imageFile?: AdminProductMedia['file'] | null
  focalX?: number
  focalY?: number
  focalXTablet?: number
  focalYTablet?: number
  focalXMobile?: number
  focalYMobile?: number
}

export interface AdminWearWithItem {
  id: number
  name: string
  slug: string
  price: number
  mainImage: { id: number, s3Key: string, s3KeyThumb: string | null } | null
}

export interface AdminProduct {
  id: number
  hoverVideoFileId?: number | null
  name: string
  slug: string
  description: string | null
  productType: AdminProductType
  categoryId: number
  category: Pick<AdminCategory, 'id' | 'name' | 'slug'>
  brand: string | null
  season: string | null
  material: string | null
  basePrice: number
  oldPrice: number | null
  purchaseCost: number | null
  isActive: boolean
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  createdAt: string
  updatedAt: string
  _count?: { variants: number, media: number }
}

export interface AdminUploadedFile {
  id: number
  url: string
  fileType: 'IMAGE' | 'VIDEO'
  previewId?: number
  previewUrl?: string
}

export interface AdminProductMedia {
  id: number
  mediaType: 'IMAGE' | 'VIDEO'
  isMain: boolean
  isHover?: boolean
  sortOrder: number
  focalX?: number
  focalY?: number
  externalUrl?: string | null
  file: {
    id: number
    s3Key: string
    s3KeyThumb: string | null
    s3KeyMedium: string | null
    s3KeyLarge: string | null
    fileType: 'IMAGE' | 'VIDEO'
    originalName: string
  } | null
}

export interface AdminColor { id: number, name: string, hexCode: string | null, isActive: boolean }
export interface AdminSize { id: number, name: string, sizeType: 'CLOTHING' | 'SHOES' | 'ACCESSORY', sortOrder: number, isActive: boolean }
export interface AdminVariant {
  id: number
  sku: string
  barcode?: string | null
  sizeId: number | null
  colorId: number | null
  size: AdminSize | null
  color: AdminColor | null
  price: number | null
  stockQty: number
  reservedQty: number
  isActive: boolean
}

export interface AdminUser {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  personalDiscountPercent: number
  ordersCount: number
  totalSpent: number
  createdAt: string
  deliveryProfiles?: unknown[]
  orders?: AdminOrder[]
  averageOrderAmount?: number
}

export interface AdminReview {
  id: number
  parentId: number | null
  depth: number
  rating: number | null
  text: string
  media: { id: number, mediaType: 'IMAGE' | 'VIDEO', file: Parameters<typeof getFileUrl>[0] }[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  product: { id: number, name: string, slug: string }
  user: { id: number, email: string, firstName: string | null, lastName: string | null }
  replies?: AdminReview[]
}

export interface AdminFeedback {
  id: number
  name: string
  email: string | null
  phone: string | null
  message: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  deletedAt: string | null
}

export interface AdminHeroSlide {
  id: number
  title: string
  subtitle: string | null
  buttonText: string | null
  buttonLink: string | null
  mediaFileId: number
  mediaType: 'IMAGE' | 'VIDEO'
  isActive: boolean
  sortOrder: number
  focalX?: number
  focalY?: number
  focalXTablet?: number
  focalYTablet?: number
  focalXMobile?: number
  focalYMobile?: number
  mediaFile?: AdminProductMedia['file']
}

export interface AdminPromoBlock {
  id: number
  type: 'NEW' | 'HIT' | 'SEASONAL' | 'CUSTOM'
  title: string
  isActive: boolean
  sortOrder: number
  products?: Array<{ id: number, productId: number, sortOrder: number, product: AdminProduct }>
  imageFileId?: number | null
  imageFile?: AdminProductMedia['file'] | null
  focalX?: number
  focalY?: number
  focalXTablet?: number
  focalYTablet?: number
  focalXMobile?: number
  focalYMobile?: number
}

export interface AdminPageContent {
  id: number
  slug: 'about' | 'delivery'
  title: string
  contentJson: Record<string, unknown> | null
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
}

export interface AdminProductInput {
  name: string
  slug: string
  description?: string
  productType: AdminProductType
  categoryId: number
  brand?: string
  season?: string
  material?: string
  basePrice: number
  oldPrice?: number
  purchaseCost?: number
  isActive: boolean
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  hoverVideoFileId?: number | null
}

export interface AdminCategoryInput {
  name: string
  slug: string
  parentId?: number | null
  productType?: AdminProductType | null
  isActive: boolean
  sortOrder: number
  imageFileId?: number | null
  focalX?: number
  focalY?: number
  focalXTablet?: number
  focalYTablet?: number
  focalXMobile?: number
  focalYMobile?: number
}

interface Paginated<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

interface PeriodMetrics {
  ordersCount: number
  deliveredCount: number
  revenue: number
  costOfGoods: number
  grossProfit: number
  averageCheck: number
  changePercent?: number
}

export interface ReportQuery { dateFrom: string, dateTo: string, orderStatuses?: string[] }

export interface ReportSummary {
  revenue: number
  costOfGoods: number
  grossProfit: number
  expenses: number
  netProfit: number
  ordersCount: number
  averageOrderValue: number
  topProducts: Array<{ productName: string, revenue: number, quantity: number }>
}

export interface ReportDay { date: string, revenue: number, cost: number, grossProfit: number, expenses: number, netProfit: number, ordersCount: number }
export interface ReportCategory { categoryId: number | null, categoryName: string, revenue: number, cost: number, grossProfit: number, ordersCount: number, itemsSold: number }
export interface ReportProduct { productId: number | null, productName: string, sku: string, revenue: number, cost: number, grossProfit: number, itemsSold: number, marginPercent: number }
export interface ReportExpenseCategory { category: string, totalAmount: number, count: number }

export interface AdminDashboard {
  today: PeriodMetrics
  week: PeriodMetrics
  month: PeriodMetrics
  financials: {
    revenue: number
    costOfGoods: number
    grossProfit: number
    expenses: number
    netProfit: number
  }
  pendingActions: {
    newOrders: number
    pendingReviews: number
    newFeedback: number
    lowStockVariants: number
  }
  orderStatuses: Record<AdminOrderStatus, number>
  topProducts: Array<{ productName: string, quantity: number, revenue: number }>
  recentOrders: AdminOrder[]
}

export interface AdminOrder {
  id: number
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerEmail?: string | null
  status: AdminOrderStatus
  archivedAt?: string | null
  totalAmount: number
  createdAt: string
  subtotal?: number
  discountAmount?: number
  deliveryAmount?: number
  totalCost?: number
  grossProfit?: number
  netProfit?: number
  deliveryProvider?: string | null
  city?: string | null
  warehouse?: string | null
  addressLine?: string | null
  items?: AdminOrderItem[]
  internalComment?: string | null
  trackingNumber?: string | null
  statusHistory?: Array<{ id: number, oldStatus: AdminOrderStatus | null, newStatus: AdminOrderStatus, note: string | null, createdAt: string }>
}

export interface AdminOrderItem {
  id: number
  productVariantId: number | null
  productName: string
  categoryName: string | null
  productType: string
  sku: string
  sizeName: string | null
  colorName: string | null
  salePrice: number
  purchaseCost: number
  quantity: number
  lineRevenue: number
  lineCost: number
  lineProfit: number
}

export interface AdminTrackingInfo {
  ttn: string
  statusCode: string
  statusDescription: string
  orderStatus?: AdminOrderStatus
  statusChanged?: boolean
}

export interface AdminExpense {
  id: number
  title: string
  type: ExpenseType
  amount: number
  expenseDate: string
  note: string | null
  createdAt: string
}

export interface AdminSettings {
  returnsEnabled?: boolean
  returnWindowDays?: number
  id: number
  storePhone: string | null
  storeEmail: string | null
  storeAddress: string | null
  defaultLowStockThreshold: number
  currency: string
  telegramAdminChatId: string | null
  socialLinksJson: Record<string, string> | null
  seoDefaultsJson: Record<string, string> | null
  themeJson: StoreTheme | null
  hasNovaPoshtaApiKey: boolean
  hasTelegramBotToken?: boolean
  updatedAt: string
}

export interface AdminNotificationSettings {
  telegramBotToken: string | null
  hasTelegramBotToken: boolean
  telegramChatId: string | null
  notifyOnNewOrder: boolean
  notifyOnNewReview: boolean
  notifyOnNewFeedback: boolean
  notifyOnLowStock: boolean
}

export interface AdminCoupon {
  id: number
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  minSubtotal: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

export interface CreateCouponDto {
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  minSubtotal?: number
  maxUses?: number
  expiresAt?: string
  isActive?: boolean
}

export interface AdminInstagramPost {
  isVideo?: boolean
  likesCount?: number | null
  commentsCount?: number | null
  statsUpdatedAt?: string | null
  id: number
  link: string | null
  sortOrder: number
  isActive: boolean
  file: {
    id: number
    s3Key: string
    s3KeyThumb: string | null
    s3KeyMedium: string | null
    s3KeyLarge: string | null
  }
}

export const adminApi = {
  dashboard() {
    return useNuxtApp().$api<AdminDashboard>('/admin/dashboard')
  },

  settings() {
    return useNuxtApp().$api<AdminSettings>('/admin/settings')
  },
  updateSettings(dto: Partial<Omit<AdminSettings, 'id' | 'hasNovaPoshtaApiKey' | 'hasTelegramBotToken' | 'updatedAt'>> & { novaPoshtaApiKey?: string }) {
    return useNuxtApp().$api<AdminSettings>('/admin/settings', { method: 'PATCH', body: dto })
  },
  testNovaPoshta() {
    return useNuxtApp().$api<Array<{ value: string, label: string }>>('/delivery/cities', {
      query: { search: 'Київ' },
    })
  },

  products(query: { search?: string, page?: number, limit?: number, isActive?: string } = {}) {
    return useNuxtApp().$api<Paginated<AdminProduct>>('/admin/products', { query })
  },
  product(id: number) {
    return useNuxtApp().$api<AdminProduct>(`/admin/products/${id}`)
  },
  createProduct(dto: AdminProductInput) {
    return useNuxtApp().$api<AdminProduct>('/admin/products', { method: 'POST', body: dto })
  },
  updateProduct(id: number, dto: Partial<AdminProductInput>) {
    return useNuxtApp().$api<AdminProduct>(`/admin/products/${id}`, { method: 'PATCH', body: dto })
  },
  deleteProduct(id: number) {
    return useNuxtApp().$api(`/admin/products/${id}`, { method: 'DELETE' })
  },
  wearWith(id: number) {
    return useNuxtApp().$api<AdminWearWithItem[]>(`/admin/products/${id}/wear-with`)
  },
  setWearWith(id: number, productIds: number[]) {
    return useNuxtApp().$api<AdminWearWithItem[]>(`/admin/products/${id}/wear-with`, { method: 'PUT', body: { productIds } })
  },
  uploadFile(file: File, onProgress?: (percent: number) => void) {
    const body = new FormData()
    body.append('file', file)
    if (!onProgress) return useNuxtApp().$api<AdminUploadedFile>('/admin/files/upload', { method: 'POST', body })
    // $fetch не віддає прогрес відправки — для великих відео йдемо через XHR
    const { $refreshAccessToken } = useNuxtApp()
    const url = `${import.meta.dev ? '/api' : useRuntimeConfig().public.apiBase}/admin/files/upload`
    const send = (token: string | null) => new Promise<{ status: number, data: unknown }>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.withCredentials = true
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = event => event.lengthComputable && onProgress(Math.round(event.loaded / event.total * 100))
      xhr.onload = () => resolve({ status: xhr.status, data: (() => { try { return JSON.parse(xhr.responseText) } catch { return null } })() })
      xhr.onerror = () => reject(new Error('Помилка мережі під час завантаження'))
      xhr.send(body)
    })
    return (async () => {
      let res = await send(getAccessToken())
      if (res.status === 401) res = await send(await $refreshAccessToken())
      if (res.status >= 400) throw { data: res.data, statusCode: res.status }
      return res.data as AdminUploadedFile
    })()
  },
  productMedia(productId: number) {
    return useNuxtApp().$api<AdminProductMedia[]>(`/admin/products/${productId}/media`)
  },
  addProductMedia(productId: number, dto: { fileId: number, mediaType: 'IMAGE' | 'VIDEO', isMain?: boolean, sortOrder?: number }) {
    return useNuxtApp().$api<AdminProductMedia>(`/admin/products/${productId}/media`, {
      method: 'POST',
      body: dto,
    })
  },
  addProductInstagramMedia(productId: number, dto: { url: string, sortOrder?: number }) {
    return useNuxtApp().$api<AdminProductMedia>(`/admin/products/${productId}/media/instagram`, { method: 'POST', body: dto })
  },
  updateProductMedia(productId: number, mediaId: number, dto: { variantId?: number | null, sortOrder?: number, isMain?: boolean, isHover?: boolean }) {
    return useNuxtApp().$api<AdminProductMedia>(`/admin/products/${productId}/media/${mediaId}`, { method: 'PATCH', body: dto })
  },
  setMainProductMedia(productId: number, mediaId: number) {
    return useNuxtApp().$api<AdminProductMedia>(`/admin/products/${productId}/media/${mediaId}/main`, { method: 'PATCH' })
  },
  reorderProductMedia(productId: number, items: Array<{ id: number, sortOrder: number }>) {
    return useNuxtApp().$api<AdminProductMedia[]>(`/admin/products/${productId}/media/reorder`, { method: 'PATCH', body: { items } })
  },
  deleteProductMedia(productId: number, mediaId: number) {
    return useNuxtApp().$api(`/admin/products/${productId}/media/${mediaId}`, { method: 'DELETE' })
  },

  variants(productId: number) {
    return useNuxtApp().$api<AdminVariant[]>(`/admin/products/${productId}/variants`)
  },
  createVariant(productId: number, dto: Partial<AdminVariant> & { sku: string }) {
    return useNuxtApp().$api<AdminVariant>(`/admin/products/${productId}/variants`, { method: 'POST', body: dto })
  },
  updateVariant(productId: number, id: number, dto: Partial<AdminVariant>) {
    return useNuxtApp().$api<AdminVariant>(`/admin/products/${productId}/variants/${id}`, { method: 'PATCH', body: dto })
  },
  deleteVariant(productId: number, id: number) {
    return useNuxtApp().$api(`/admin/products/${productId}/variants/${id}`, { method: 'DELETE' })
  },

  async categories() {
    const items = await useNuxtApp().$api<AdminCategory[]>('/admin/categories')
    return items.filter(category => category.parentId === null)
  },
  createCategory(dto: AdminCategoryInput) {
    return useNuxtApp().$api<AdminCategory>('/admin/categories', { method: 'POST', body: dto })
  },
  updateCategory(id: number, dto: Partial<AdminCategoryInput>) {
    return useNuxtApp().$api<AdminCategory>(`/admin/categories/${id}`, { method: 'PATCH', body: dto })
  },
  deleteCategory(id: number) {
    return useNuxtApp().$api(`/admin/categories/${id}`, { method: 'DELETE' })
  },
  sizeChart(categoryId: number) {
    return useNuxtApp().$api<{ columns: string[], rows: string[][] } | null>(`/admin/categories/${categoryId}/size-chart`)
  },
  upsertSizeChart(categoryId: number, dto: { columns: string[], rows: string[][] }) {
    return useNuxtApp().$api(`/admin/categories/${categoryId}/size-chart`, { method: 'PUT', body: dto })
  },

  colors(query: { isActive?: boolean } = {}) { return useNuxtApp().$api<AdminColor[]>('/admin/colors', { query }) },
  createColor(dto: Omit<AdminColor, 'id'>) { return useNuxtApp().$api<AdminColor>('/admin/colors', { method: 'POST', body: dto }) },
  updateColor(id: number, dto: Partial<AdminColor>) { return useNuxtApp().$api<AdminColor>(`/admin/colors/${id}`, { method: 'PATCH', body: dto }) },
  deleteColor(id: number) { return useNuxtApp().$api(`/admin/colors/${id}`, { method: 'DELETE' }) },
  sizes(query: { sizeType?: string, isActive?: boolean } = {}) { return useNuxtApp().$api<AdminSize[]>('/admin/sizes', { query }) },
  createSize(dto: Omit<AdminSize, 'id'>) { return useNuxtApp().$api<AdminSize>('/admin/sizes', { method: 'POST', body: dto }) },
  updateSize(id: number, dto: Partial<AdminSize>) { return useNuxtApp().$api<AdminSize>(`/admin/sizes/${id}`, { method: 'PATCH', body: dto }) },
  deleteSize(id: number) { return useNuxtApp().$api(`/admin/sizes/${id}`, { method: 'DELETE' }) },

  orders(query: { search?: string, status?: string, archived?: boolean, page?: number, limit?: number, dateFrom?: string, dateTo?: string, userId?: number, utmSource?: string, utmMedium?: string, utmCampaign?: string } = {}) {
    return useNuxtApp().$api<Paginated<AdminOrder>>('/admin/orders', { query })
  },
  updateOrderStatus(id: number, status: AdminOrderStatus) {
    return useNuxtApp().$api<AdminOrder>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: { newStatus: status },
    })
  },
  order(id: number) { return useNuxtApp().$api<AdminOrder>(`/admin/orders/${id}`) },
  orderTracking(id: number) { return useNuxtApp().$api<AdminTrackingInfo | null>(`/admin/orders/${id}/tracking`) },
  updateOrder(id: number, dto: { internalComment?: string, trackingNumber?: string }) { return useNuxtApp().$api<AdminOrder>(`/admin/orders/${id}`, { method: 'PATCH', body: dto }) },
  archiveOrder(id: number, archived: boolean) { return useNuxtApp().$api<{ id: number, archivedAt: string | null }>(`/admin/orders/${id}/archive`, { method: 'PATCH', body: { archived } }) },
  createTtn(id: number) { return useNuxtApp().$api<AdminOrder>(`/admin/orders/${id}/ttn`, { method: 'POST' }) },

  users(query: { search?: string, role?: string, isActive?: boolean, page?: number, limit?: number } = {}) { return useNuxtApp().$api<Paginated<AdminUser>>('/admin/users', { query }) },
  user(id: number) { return useNuxtApp().$api<AdminUser>(`/admin/users/${id}`) },
  updateUser(id: number, dto: Partial<Pick<AdminUser, 'firstName' | 'lastName' | 'phone' | 'role' | 'isActive' | 'personalDiscountPercent'>>) { return useNuxtApp().$api<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: dto }) },

  reviews(query: { status?: string, productId?: number, page?: number, limit?: number } = {}) { return useNuxtApp().$api<Paginated<AdminReview>>('/admin/reviews', { query }) },
  updateReviewStatus(id: number, status: AdminReview['status']) { return useNuxtApp().$api(`/admin/reviews/${id}/status`, { method: 'PATCH', body: { status } }) },
  replyReview(id: number, text: string) { return useNuxtApp().$api(`/admin/reviews/${id}/reply`, { method: 'POST', body: { text } }) },

  feedback(query: { status?: string, page?: number, limit?: number, deletedOnly?: boolean } = {}) { return useNuxtApp().$api<Paginated<AdminFeedback>>('/admin/feedback', { query }) },
  updateFeedbackStatus(id: number, status: AdminFeedback['status']) { return useNuxtApp().$api(`/admin/feedback/${id}/status`, { method: 'PATCH', body: { status } }) },
  deleteFeedback(id: number) { return useNuxtApp().$api(`/admin/feedback/${id}`, { method: 'DELETE' }) },
  restoreFeedback(id: number) { return useNuxtApp().$api(`/admin/feedback/${id}/restore`, { method: 'PATCH' }) },

  heroSlides() { return useNuxtApp().$api<AdminHeroSlide[]>('/admin/hero-slides') },
  createHeroSlide(dto: Omit<AdminHeroSlide, 'id' | 'mediaFile'>) { return useNuxtApp().$api<AdminHeroSlide>('/admin/hero-slides', { method: 'POST', body: dto }) },
  updateHeroSlide(id: number, dto: Partial<AdminHeroSlide>) { return useNuxtApp().$api<AdminHeroSlide>(`/admin/hero-slides/${id}`, { method: 'PATCH', body: dto }) },
  deleteHeroSlide(id: number) { return useNuxtApp().$api(`/admin/hero-slides/${id}`, { method: 'DELETE' }) },
  promoBlocks() { return useNuxtApp().$api<AdminPromoBlock[]>('/admin/promo-blocks') },
  createPromoBlock(dto: Omit<AdminPromoBlock, 'id' | 'products' | 'imageFile'>) { return useNuxtApp().$api<AdminPromoBlock>('/admin/promo-blocks', { method: 'POST', body: dto }) },
  updatePromoBlock(id: number, dto: Partial<AdminPromoBlock>) { return useNuxtApp().$api<AdminPromoBlock>(`/admin/promo-blocks/${id}`, { method: 'PATCH', body: dto }) },
  deletePromoBlock(id: number) { return useNuxtApp().$api(`/admin/promo-blocks/${id}`, { method: 'DELETE' }) },
  addPromoProduct(id: number, productId: number, sortOrder: number) { return useNuxtApp().$api(`/admin/promo-blocks/${id}/products`, { method: 'POST', body: { productId, sortOrder } }) },
  removePromoProduct(id: number, productId: number) { return useNuxtApp().$api(`/admin/promo-blocks/${id}/products`, { method: 'DELETE', body: { productId } }) },
  pages() { return useNuxtApp().$api<AdminPageContent[]>('/admin/pages') },
  page(slug: string) { return useNuxtApp().$api<AdminPageContent>(`/admin/pages/${slug}`) },
  createPage(slug: 'about' | 'delivery', dto: Partial<AdminPageContent>) { return useNuxtApp().$api<AdminPageContent>(`/admin/pages/${slug}`, { method: 'POST', body: { ...dto, slug } }) },
  savePage(slug: 'about' | 'delivery', dto: Partial<AdminPageContent>) { return useNuxtApp().$api<AdminPageContent>(`/admin/pages/${slug}`, { method: 'PATCH', body: dto }) },

  reportSummary(query: ReportQuery) { return useNuxtApp().$api<ReportSummary>('/admin/reports/summary', { query }) },
  reportByDay(query: ReportQuery) { return useNuxtApp().$api<ReportDay[]>('/admin/reports/by-day', { query }) },
  reportByCategory(query: ReportQuery) { return useNuxtApp().$api<ReportCategory[]>('/admin/reports/by-category', { query }) },
  reportByProduct(query: ReportQuery) { return useNuxtApp().$api<ReportProduct[]>('/admin/reports/by-product', { query }) },
  reportExpensesByCategory(query: ReportQuery) { return useNuxtApp().$api<ReportExpenseCategory[]>('/admin/reports/expenses-by-category', { query }) },

  notificationSettings() { return useNuxtApp().$api<AdminNotificationSettings>('/admin/notification-settings') },
  updateNotificationSettings(dto: Partial<AdminNotificationSettings> & { telegramBotToken?: string, telegramChatId?: string }) { return useNuxtApp().$api<AdminNotificationSettings>('/admin/notification-settings', { method: 'PATCH', body: dto }) },

  expenses(query: { page?: number, limit?: number, type?: string } = {}) {
    return useNuxtApp().$api<Paginated<AdminExpense>>('/admin/expenses', { query })
  },
  createExpense(dto: CreateExpenseDto) {
    return useNuxtApp().$api<AdminExpense>('/admin/expenses', { method: 'POST', body: dto })
  },
  updateExpense(id: number, dto: UpdateExpenseDto) {
    return useNuxtApp().$api<AdminExpense>(`/admin/expenses/${id}`, { method: 'PATCH', body: dto })
  },
  deleteExpense(id: number) {
    return useNuxtApp().$api(`/admin/expenses/${id}`, { method: 'DELETE' })
  },

  coupons() { return useNuxtApp().$api<AdminCoupon[]>('/admin/coupons') },
  createCoupon(dto: CreateCouponDto) { return useNuxtApp().$api<AdminCoupon>('/admin/coupons', { method: 'POST', body: dto }) },
  updateCoupon(id: number, dto: Partial<CreateCouponDto>) { return useNuxtApp().$api<AdminCoupon>(`/admin/coupons/${id}`, { method: 'PATCH', body: dto }) },
  deleteCoupon(id: number) { return useNuxtApp().$api(`/admin/coupons/${id}`, { method: 'DELETE' }) },

  importPreview(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    return useNuxtApp().$api<{ headers: string[], sampleRows: string[][], totalRows: number }>('/admin/import/preview', { method: 'POST', body: fd })
  },
  importStock(file: File, mapping: { sku: number, price?: number, stockQty?: number }) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('sku', String(mapping.sku))
    if (mapping.price !== undefined) fd.append('price', String(mapping.price))
    if (mapping.stockQty !== undefined) fd.append('stockQty', String(mapping.stockQty))
    return useNuxtApp().$api<{ updated: number, notFoundCount: number, notFound: string[] }>('/admin/import/stock', { method: 'POST', body: fd })
  },
  importProducts(file: File, mapping: Record<string, number | undefined>) {
    const fd = new FormData()
    fd.append('file', file)
    for (const [key, value] of Object.entries(mapping)) {
      if (value !== undefined) fd.append(key, String(value))
    }
    return useNuxtApp().$api<{ created: number, updated: number, errors: string[] }>('/admin/import/products', { method: 'POST', body: fd })
  },
  importPhotos(files: File[]) {
    const fd = new FormData()
    for (const f of files) fd.append('files', f)
    return useNuxtApp().$api<{ attached: number, notFound: string[], errors: string[] }>('/admin/import/photos', { method: 'POST', body: fd })
  },
  importYml(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    return useNuxtApp().$api<{ created: number, updated: number, errors: string[] }>('/admin/import/yml', { method: 'POST', body: fd })
  },

  printLabels(items: { variantId: number, copies: number }[]) {
    return useNuxtApp().$api<string>('/admin/labels/print', { method: 'POST', body: { items }, responseType: 'text' })
  },

  instagramPosts() { return useNuxtApp().$api<AdminInstagramPost[]>('/admin/instagram') },
  createInstagramPost(dto: { fileId: number, link?: string, sortOrder?: number, isActive?: boolean }) { return useNuxtApp().$api<AdminInstagramPost>('/admin/instagram', { method: 'POST', body: dto }) },
  createInstagramPostFromLink(dto: { link: string, sortOrder?: number }) { return useNuxtApp().$api<AdminInstagramPost>('/admin/instagram/from-link', { method: 'POST', body: dto }) },
  refreshInstagramStats() { return useNuxtApp().$api<{ updated: number, total: number }>('/admin/instagram/refresh-stats', { method: 'POST' }) },
  updateInstagramPost(id: number, dto: Partial<{ link: string, sortOrder: number, isActive: boolean }>) { return useNuxtApp().$api<AdminInstagramPost>(`/admin/instagram/${id}`, { method: 'PATCH', body: dto }) },
  deleteInstagramPost(id: number) { return useNuxtApp().$api(`/admin/instagram/${id}`, { method: 'DELETE' }) },
}

export function getAdminError(error: unknown, fallback = 'Не вдалося виконати дію') {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }
  return error instanceof Error ? error.message : fallback
}

// Returns (see modules/returns)

export type AdminReturnListItem = ReturnSummary & { customer: ReturnCustomer }
export interface AdminReturnsResponse { items: AdminReturnListItem[], totalCount: number, page: number, limit: number }
export interface AdminReturnStatusDto { status: ReturnStatus, comment?: string, refundAmount?: number, rejectReason?: string, managerComment?: string }

export const adminReturnsApi = {
  list(params: { status?: string, search?: string, page?: number, limit?: number }) {
    return useNuxtApp().$api<AdminReturnsResponse>('/admin/returns', { params })
  },
  stats() {
    return useNuxtApp().$api<{ new: number, underReview: number }>('/admin/returns/stats')
  },
  get(id: number) {
    return useNuxtApp().$api<ReturnDetail>(`/admin/returns/${id}`)
  },
  updateStatus(id: number, dto: AdminReturnStatusDto) {
    return useNuxtApp().$api<ReturnDetail>(`/admin/returns/${id}/status`, { method: 'PATCH', body: dto })
  },
}
