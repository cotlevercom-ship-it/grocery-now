const CART_KEY = 'book_cart'

function readCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function writeCart(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart-changed'))
}

export function getCart() {
  return readCart()
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.quantity, 0)
}

export function addToCart(book, quantity = 1) {
  const items = readCart()
  const existing = items.find(i => i.id === book.id)
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, book.stock || 99)
  } else {
    items.push({
      id: book.id,
      title: book.title,
      price: book.price,
      image_url: book.image_url,
      stock: book.stock,
      quantity: Math.min(quantity, book.stock || 99),
    })
  }
  writeCart(items)
  return items
}

export function updateCartQuantity(id, quantity) {
  let items = readCart()
  if (quantity <= 0) {
    items = items.filter(i => i.id !== id)
  } else {
    items = items.map(i => i.id === id ? { ...i, quantity: Math.min(quantity, i.stock || 99) } : i)
  }
  writeCart(items)
  return items
}

export function removeFromCart(id) {
  const items = readCart().filter(i => i.id !== id)
  writeCart(items)
  return items
}

export function clearCart() {
  writeCart([])
}

export function getCartTotal() {
  return readCart().reduce((sum, item) => sum + item.price * item.quantity, 0)
}
