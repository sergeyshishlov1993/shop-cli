// «Ви переглядали» (1.2) — client-side, localStorage. Без бэкенда.
interface RecentItem {
  slug: string
  name: string
  image: string
  price: number
}

const KEY = 'recently-viewed'
const MAX = 12

export function useRecentlyViewed() {
  const items = ref<RecentItem[]>([])

  function load() {
    try {
      items.value = JSON.parse(localStorage.getItem(KEY) || '[]')
    }
    catch {
      items.value = []
    }
  }

  function add(item: RecentItem) {
    load()
    const next = [item, ...items.value.filter(i => i.slug !== item.slug)].slice(0, MAX)
    items.value = next
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    }
    catch { /* приватный режим — пропускаем */ }
  }

  return { items, load, add }
}
