import { getRequestURL, getRouterParam, proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const path = getRouterParam(event, 'path') ?? ''
  const search = getRequestURL(event).search
  const target = `${config.apiInternalBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}${search}`

  return proxyRequest(event, target)
})
