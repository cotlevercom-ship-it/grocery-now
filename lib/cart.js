// Cart is stored in localStorage as:
// { shops: { [shopId]: { shopName, items: [...] } } }
// This lets a customer add items from multiple merchants at once —
// each merchant's items stay grouped for per-shop checkout/shipping.

const KEY = 'cart'

function readRaw() {
  try {
    const saved = localStorage.getItem(KEY)
    if (!saved) return { shops: {} }
    const parsed = JSON.parse(saved)
    // Backward-compat: migrate the old single-shop cart shape if present
    if (parsed && parsed.shopId && parsed.items && !parsed.shops) {
      return { shops: { [parsed.shopId]: { shopName: parsed.shopName, items: parsed.items } } }
    }
    return parsed && parsed.shops ? parsed : { shops: {} }
  } catch (e) {
    return { shops: {} }
  }
}

function writeRaw(data) {
  try {
    const hasAny = Object.values(data.shops || {}).some(s => (s.items || []).length > 0)
    if (hasAny) {
      localStorage.setItem(KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(KEY)
    }
    window.dispatchEvent(new Event('cart-changed'))
  } catch (e) {
    console.error(e)
  }
}

export function getShopCart(shopId) {
  const data = readRaw()
  return data.shops[shopId]?.items || []
}

export function setShopCart(shopId, shopName, items) {
  const data = readRaw()
  if (items.length > 0) {
    data.shops[shopId] = { shopName, items }
  } else {
    delete data.shops[shopId]
  }
  writeRaw(data)
}

// Returns [{ shopId, shopName, items }] for every shop with items in the cart.
export function getAllShopCarts() {
  const data = readRaw()
  return Object.entries(data.shops).map(([shopId, v]) => ({
    shopId,
    shopName: v.shopName,
    items: v.items || [],
  }))
}

export function getTotalCount() {
  return getAllShopCarts().reduce((sum, s) => sum + s.items.reduce((a, b) => a + (b.qty || 0), 0), 0)
}

export function clearCart() {
  writeRaw({ shops: {} })
}
