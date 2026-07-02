interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}
