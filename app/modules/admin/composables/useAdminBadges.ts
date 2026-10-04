import { adminApi } from '~/modules/admin/adminApi'

// Лічильники «потребує уваги» біля пунктів меню адмінки і в блоці дашборду.
// Стан спільний для бічної панелі, мобільного меню й дашборду; оновлення запускає лише layout адмінки (startAdminBadges).
export function useAdminBadges() {
  return useState<Record<string, number>>('admin-badges', () => ({}))
}

// Що означає бейдж і як він скидається — показуємо підказкою на бейджі
export const ADMIN_BADGE_HINTS: Record<string, string> = {
  '/admin': 'Усе нове разом: замовлення, відгуки, звернення, повернення, користувачі',
  '/admin/orders': 'Нові замовлення — зникають, коли змінюєте статус (В роботі / Скасовано) або архівуєте',
  '/admin/reviews': 'Нові відгуки з вашого останнього перегляду розділу — скидаються, коли відкриваєте «Відгуки»',
  '/admin/feedback': 'Нові звернення — зникають, коли змінюєте статус звернення',
  '/admin/returns': 'Нові заявки на повернення — зникають, коли берете в роботу',
  '/admin/users': 'Нові реєстрації з вашого останнього перегляду — скидаються, коли відкриваєте «Користувачі»',
  '/admin/products': 'Варіантів закінчується (залишок ≤ порогу) — зникають після поповнення',
}

// Відгуки й користувачі — «нове з останнього перегляду розділу»: мітки зберігаємо в браузері адміна.
const SEEN_KEY = 'admin-seen'
const SEEN_SECTIONS = { '/admin/reviews': 'reviewsSince', '/admin/users': 'usersSince' } as const
type SeenMarks = Partial<Record<(typeof SEEN_SECTIONS)[keyof typeof SEEN_SECTIONS], string>>

function readSeen(): SeenMarks {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') }
  catch { return {} }
}

function markSeen(path: string) {
  const entry = Object.entries(SEEN_SECTIONS).find(([section]) => path === section || path.startsWith(`${section}/`))
  if (!entry) return
  try { localStorage.setItem(SEEN_KEY, JSON.stringify({ ...readSeen(), [entry[1]]: new Date().toISOString() })) }
  catch { /* приватний режим — лічильник просто не скинеться */ }
}

async function loadAdminBadges() {
  try {
    const counters = await adminApi.dashboardCounters(readSeen())
    useAdminBadges().value = {
      // «Огляд»: усе нове разом (малий залишок — не «нове», у суму не входить)
      '/admin': counters.newOrders + counters.newReviews + counters.newFeedback + counters.newReturns + counters.newUsers,
      '/admin/orders': counters.newOrders,
      '/admin/reviews': counters.newReviews,
      '/admin/feedback': counters.newFeedback,
      '/admin/returns': counters.newReturns,
      '/admin/users': counters.newUsers,
      '/admin/products': counters.lowStockVariants,
    }
  }
  catch { /* бейджі необовʼязкові */ }
}

// Оновлюємо при відкритті, при переході між розділами (відкритий розділ відгуків/користувачів скидає свій лічильник),
// раз на хвилину і коли сторінка збільшує 'admin-badges-tick' після дії (статус замовлення, архів).
export function startAdminBadges() {
  const route = useRoute()
  const refresh = () => { markSeen(route.path); loadAdminBadges() }
  onMounted(refresh)
  useIntervalFn(loadAdminBadges, 60_000)
  watch(() => route.path, refresh)
  watch(useState('admin-badges-tick', () => 0), loadAdminBadges)
}
