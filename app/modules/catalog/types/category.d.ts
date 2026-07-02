type ProductType = 'CLOTHING' | 'SHOES' | 'ACCESSORY'

interface Category {
  id: number
  name: string
  slug: string
  productType: ProductType | null
  parentId: number | null
  parent: Category | null
  children: Category[]
  imageFile: FileRecord | null
  bannerFile: FileRecord | null
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}
