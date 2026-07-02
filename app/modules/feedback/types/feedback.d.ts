type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'DONE'

interface Feedback {
  id: number
  name: string
  email: string | null
  phone: string | null
  message: string
  status: FeedbackStatus
  ip: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface CreateFeedbackDto {
  name: string
  email?: string
  phone?: string
  message: string
}
