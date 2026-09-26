export interface InstagramPost {
  id: number
  link: string | null
  isVideo?: boolean
  likesCount?: number | null
  commentsCount?: number | null
  sortOrder: number
  file: {
    id: number
    s3Key: string
    s3KeyThumb: string | null
    s3KeyMedium: string | null
    s3KeyLarge: string | null
  }
}

export const instagramApi = {
  list() {
    const { $api } = useNuxtApp()
    return $api<InstagramPost[]>('/storefront/instagram')
  },
}
