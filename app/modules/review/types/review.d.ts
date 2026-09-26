type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type ReviewSort = 'newest' | 'oldest' | 'popular' | 'rating_desc' | 'rating_asc'

type ReviewFilter = 'all' | 'with_media' | 'mine'

interface ReviewMedia {
  id: number
  mediaType: 'IMAGE' | 'VIDEO'
  file: FileRecord
}

interface Review {
  id: number
  parentId: number | null
  rating: number | null
  text: string
  depth: number
  status: ReviewStatus
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    avatar: { thumb: string | null, medium: string | null } | null
  }
  media: ReviewMedia[]
  likesCount: number
  likedByMe: boolean
  isAdminReply: boolean
  replies: Review[]
  createdAt: string
  editedAt: string | null
}
