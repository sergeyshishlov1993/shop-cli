import { getRequestURL } from 'h3'

interface CategoryNode { slug: string, children?: CategoryNode[] }

function collectCategorySlugs(nodes: CategoryNode[]): string[] {
  const out: string[] = []
  for (const node of nodes) {
    if (node?.slug) out.push(node.slug)
    if (Array.isArray(node?.children)) out.push(...collectCategorySlugs(node.children))
  }
  return out
}

// Динамический sitemap: статические страницы + категории + товары из API.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const api = config.apiInternalBase.replace(/\/$/, '')
  const origin = getRequestURL(event).origin

  const [productsRes, categories] = await Promise.all([
    $fetch<{ items: { slug: string }[] }>(`${api}/storefront/products`, { query: { limit: 1000 } })
      .catch(() => ({ items: [] as { slug: string }[] })),
    $fetch<CategoryNode[]>(`${api}/storefront/categories`).catch(() => [] as CategoryNode[]),
  ])

  const staticPaths = ['/', '/catalog', '/about', '/delivery', '/contacts']
  const urls = [
    ...staticPaths.map(p => `${origin}${p}`),
    ...collectCategorySlugs(categories).map(slug => `${origin}/catalog/${slug}`),
    ...productsRes.items.map(p => `${origin}/product/${p.slug}`),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')
  }\n</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
