type FileKeys = {
  s3Key: string
  s3KeyThumb?: string | null
  s3KeyMedium?: string | null
  s3KeyLarge?: string | null
}

type FileSize = 'thumb' | 'medium' | 'large' | 'original'

export function getFileUrl(file: FileKeys | null | undefined, size: FileSize = 'original'): string {
  if (!file) return ''
  const config = useRuntimeConfig()
  const base = config.public.s3BaseUrl?.replace(/\/$/, '') ?? ''
  const key = size === 'thumb'
    ? file.s3KeyThumb
    : size === 'medium'
      ? file.s3KeyMedium
      : size === 'large'
        ? file.s3KeyLarge
        : file.s3Key
  const finalKey = key ?? file.s3Key
  if (!finalKey) return ''
  return `${base}/${finalKey.replace(/^\//, '')}`
}
