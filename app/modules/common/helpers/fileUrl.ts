type FileKeys = {
  s3Key: string
  s3KeyThumb?: string | null
  s3KeyMedium?: string | null
  s3KeyLarge?: string | null
}

type FileSize = 'thumb' | 'medium' | 'large' | 'original'

const demoProductImages = [
  '/demo-media/stella-silk.jpg',
  '/demo-media/stella-street.jpg',
  '/demo-media/stella-classic.jpg',
  '/demo-media/stella-lingerie-style.jpg',
  '/demo-media/stella-bride.jpg',
  '/demo-media/stella-chiffon.jpg',
]

const stellaCategoryImages: Record<string, string> = {
  'dlya-narechenoyi': '/demo-media/stella-bride.jpg',
  'shovkovi-komplekty': '/demo-media/stella-silk.jpg',
  'shyfonovi-komplekty': '/demo-media/stella-chiffon.jpg',
  'classic': '/demo-media/stella-classic.jpg',
  'odyag-u-biliznyanomu-styli': '/demo-media/stella-lingerie-style.jpg',
  'vulychni-kostyumy': '/demo-media/stella-street.jpg',
  'top-komplektiv-dlya-podarunkiv': '/demo-media/stella-silk.jpg',
  'sukni-dlya-svyatkovogo-nastroyu': '/demo-media/stella-classic.jpg',
  'velyurovi-domashni-kostyumy': '/demo-media/stella-street.jpg',
}

export function getStellaCategoryImage(slug: string): string {
  return stellaCategoryImages[slug] ?? ''
}

export function getDemoProductImage(seed = 1): string {
  return demoProductImages[Math.abs(seed - 1) % demoProductImages.length]!
}

export function getPublicMediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  const browserHost = import.meta.client ? window.location.hostname : 'localhost'
  return url.replace(/\/\/(?:host\.docker\.internal|minio)(?=[:/])/, `//${browserHost}`)
}

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

  const seedMatch = finalKey.match(/^seed\/(\d+)\//)
  if (seedMatch) return getDemoProductImage(Number(seedMatch[1]))
  if (finalKey.startsWith('mock/products/vid-')) return '/demo-media/product-fashion-loop.mp4'

  return `${base}/${finalKey.replace(/^\//, '')}`
}

/** Instagram post/reel URL → embed iframe URL (null якщо не Instagram) */
export function getInstagramEmbedUrl(url: string | null | undefined): string | null {
  const match = url?.match(/instagram\.com\/(p|reels?|tv)\/([\w-]+)/)
  if (!match) return null
  const kind = match[1] === 'p' || match[1] === 'tv' ? 'p' : 'reel'
  return `https://www.instagram.com/${kind}/${match[2]}/embed`
}
