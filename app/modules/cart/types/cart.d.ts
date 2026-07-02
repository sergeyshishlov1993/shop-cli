export interface CartItemVariant {
    id: number
    sku: string
    price: number
    stockQty: number
    reservedQty: number
    size: { id: number; name: string; sizeType: SizeType } | null
    color: { id: number; name: string; hexCode: string | null } | null
    mainImage: ProductCardImage | null
}

export interface CartItemProduct {
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
}

export interface CartItem {
    id: number
    quantity: number
    unitPriceSnapshot: number
    currentUnitPrice: number
    lineTotal: number
    availabilityStatus: 'IN_STOCK' | 'LOW_STOCK'
    availableQty: number
    variant: CartItemVariant
    product: CartItemProduct
}

export interface Cart {
    id: number
    userId: number | null
    sessionId: string | null
    items: CartItem[]
    totalItems: number
    subtotal: number
}

export interface AddCartItemDto {
    variantId: number
    quantity: number
}

export interface UpdateCartItemDto {
    quantity: number
}