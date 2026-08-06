// Best-effort emoji guess from a category name, used as a fallback icon
// until the category gets a real uploaded image.
const KEYWORD_MAP = [
  [/grocer|food|snack|rice|veg|fruit/i, '🛒'],
  [/foot|shoe|sneaker|sandal/i, '👟'],
  [/bag|purse|luggage/i, '👜'],
  [/jewel|necklace|ring|earring/i, '💍'],
  [/beauty|cosmetic|makeup|skin/i, '💄'],
  [/men.?s? cloth|shirt|men.?s? fashion/i, '👔'],
  [/wom.?e?n.?s? cloth|dress|wom.?e?n.?s? fashion/i, '👗'],
  [/baby|kid|infant|toy/i, '🧸'],
  [/eyewear|glass|sunglass/i, '🕶️'],
  [/office|school|stationery/i, '🖊️'],
  [/season|holiday|gift/i, '🎁'],
  [/phone|mobile|accessor/i, '📱'],
  [/sport|fitness|gym/i, '🏀'],
  [/entertain|toy|game/i, '🎮'],
  [/watch|clock/i, '⌚'],
  [/automobile|car|vehicle/i, '🚗'],
  [/electronic|gadget/i, '🔌'],
  [/home|kitchen|furnitur/i, '🏠'],
  [/travel|outdoor/i, '🧳'],
  [/meat|beef|chicken|fish/i, '🍖'],
  [/dairy|egg|milk/i, '🥛'],
  [/pet/i, '🐾'],
]

export function guessCategoryEmoji(name = '') {
  for (const [pattern, emoji] of KEYWORD_MAP) {
    if (pattern.test(name)) return emoji
  }
  return '🛍️'
}
