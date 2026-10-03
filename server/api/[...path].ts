import { getRequestURL, getRouterParam, proxyRequest } from 'h3'

// Проксі до API потрібен лише в dev (клієнт і SSR ходять на /api). У проді клієнт
// ходить на NUXT_PUBLIC_API_BASE напряму — відкритий проксі там не потрібен.
export default defineEventHandler((event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  const config = useRuntimeConfig(event)
  const path = getRouterParam(event, 'path') ?? ''
  const search = getRequestURL(event).search
  const target = `${config.apiInternalBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}${search}`

  return proxyRequest(event, target)
})
