type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Review {
  id: number
  productId: number
  userId: number
  parentId: number | null
  rating: number | null
  text: string
  depth: number
  status: ReviewStatus
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    avatarFile: FileRecord | null
  }
  replies: Review[]
  createdAt: string
  updatedAt: string
}
