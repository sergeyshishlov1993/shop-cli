interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

interface ApiError {
  message: string
  error: string
  statusCode: number
}
