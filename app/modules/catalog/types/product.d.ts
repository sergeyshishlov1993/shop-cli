type AvailabilityStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

type SizeType = 'CLOTHING' | 'SHOES' | 'ACCESSORY'

type MediaType = 'IMAGE' | 'VIDEO'

type ProductType = 'CLOTHING' | 'SHOES' | 'ACCESSORY'

interface Size {
  id: number
  name: string
  sizeType: SizeType
  sortOrder: number
  isActive: boolean
}

interface Color {
  id: number
  name: string
  hexCode: string | null
  isActive: boolean
}

interface ProductCardImage {
  id: number
  s3Key: string
  s3KeyThumb: string | null
  s3KeyMedium: string | null
  s3KeyLarge: string | null
}

interface ProductMediaFile {
  id: number
  s3Key: string
  s3KeyThumb: string | null
  s3KeyMedium: string | null
  s3KeyLarge: string | null
  fileType: string
  originalName: string
}

interface ProductMedia {
    id: number
    mediaType: MediaType
    isMain: boolean
    sortOrder: number
    variantId: number | null
    file: ProductMediaFile
}


interface StorefrontVariant {
  id: number
  sku: string
  size: { id: number; name: string; sizeType: SizeType } | null
  color: { id: number; name: string; hexCode: string | null } | null
  price: number
  stockQty: number
  availableQty: number
  availabilityStatus: Exclude<AvailabilityStatus, 'OUT_OF_STOCK'>
}

interface CategoryBreadcrumbItem {
  id: number
  name: string
  slug: string
}

interface StorefrontProductCategory {
  id: number
  name: string
  slug: string
  breadcrumb: CategoryBreadcrumbItem[]
}

interface ProductListItem {
  id: number
  name: string
  slug: string
  productType: ProductType
  brand: string | null
  basePrice: number
  oldPrice: number | null
  isNew: boolean
  isHit: boolean
  isSeasonal: boolean
  effectivePrice: number
  availabilityStatus: Exclude<AvailabilityStatus, 'OUT_OF_STOCK'>
  mainImage: ProductCardImage | null
  hoverImage: ProductCardImage | null
  averageRating: number | null
  reviewCount: number
}

interface ProductDetail {
    id: number
    name: string
    slug: string
    description: string | null
    productType: ProductType
    brand: string | null
    season: string | null
    material: string | null
    basePrice: number
    oldPrice: number | null
    isNew: boolean
    isHit: boolean
    isSeasonal: boolean
    category: StorefrontProductCategory
    media: ProductMedia[]
    hoverVideo: ProductMediaFile | null
    variants: StorefrontVariant[]
    seo: {
        metaTitle: string | null
        metaDescription: string | null
    }
    averageRating: number | null
    reviewCount: number
}

interface ProductFilters {
  sizes: { id: number; name: string; count: number }[]
  colors: { id: number; name: string; hexCode: string | null; count: number }[]
  brands: { value: string; count: number }[]
  seasons: { value: string; count: number }[]
  materials: { value: string; count: number }[]
  priceRange: { min: number; max: number }
}

interface ProductListResponse {
  items: ProductListItem[]
  totalCount: number
  filters: ProductFilters
}

interface RelatedProducts {
  boughtTogether: ProductListItem[]
  similar: ProductListItem[]
}

