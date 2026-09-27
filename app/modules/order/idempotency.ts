interface CartLineIdentity {
  quantity: number
  variant: { id: number }
}

interface PendingOrderAttempt {
  fingerprint: string
  key: string
}

const STORAGE_KEY = 'shop-pending-order-attempt'
let memoryAttempt: PendingOrderAttempt | null = null

export async function getOrderIdempotencyKey(
  payload: unknown,
  cartItems: CartLineIdentity[],
  createKey: () => string = () => crypto.randomUUID(),
): Promise<string> {
  const fingerprintInput = JSON.stringify({
    payload,
    items: cartItems.map(item => [item.variant.id, item.quantity]),
  })
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprintInput))
  const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')

  let storedAttempt = memoryAttempt
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) storedAttempt = JSON.parse(raw) as PendingOrderAttempt
  }
  catch {
    // sessionStorage can be unavailable in restricted browser contexts.
  }

  if (storedAttempt?.fingerprint === fingerprint && storedAttempt.key) {
    memoryAttempt = storedAttempt
    return storedAttempt.key
  }

  const attempt = { fingerprint, key: createKey() }
  memoryAttempt = attempt
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempt))
  }
  catch {
    // The in-memory copy still makes retries in this page idempotent.
  }
  return attempt.key
}

export function clearOrderIdempotencyKey(): void {
  memoryAttempt = null
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // The next page load can safely start a new attempt.
  }
}
