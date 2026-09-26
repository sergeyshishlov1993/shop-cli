type ProductType = 'CLOTHING' | 'SHOES' | 'ACCESSORY'

interface Category {
  id: number
  name: string
  slug: string
  productType: ProductType | null
  parentId: number | null
  parent: Category | null
  children: Category[]
  /** Товаров в наличии, у родителя — вместе с подкатегориями. */
  productCount: number
  imageFile: FileRecord | null
  bannerFile: FileRecord | null
  focalX?: number
  focalY?: number
  focalXTablet?: number
  focalYTablet?: number
  focalXMobile?: number
  focalYMobile?: number
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}
