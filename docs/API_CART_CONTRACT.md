# Контракт API: Cart Sync (productId)

## Єдине рішення для фронту та бекенду

### Правило
**`productId` в payload кошика — завжди `string`.**

- WooCommerce: числовий id як рядок, наприклад `"123"`
- Каталог (CUID): рядок на кшталт `"clxxxxxxxxxxxxxxxx"`
- Slug: альтернатива `productId` — рядок slug товару

### POST /api/cart/sync

**Request body:**
```json
{
  "items": [
    { "productId": "123", "quantity": 2 },
    { "productId": "clxxxxxxxxxxxx", "quantity": 1 },
    { "slug": "product-slug", "quantity": 1 }
  ]
}
```

**Типи:**
- `productId?: string` — завжди string (ніколи number)
- `slug?: string` — fallback, коли productId недоступний
- `quantity: number`

**Валідація на бекенді:**
- `productId` — `IsString()`, але з `Transform` для захисту: якщо прийде `number`, перетворити в string
- Хоча б одне з `productId` або `slug` має бути присутнє в кожному item

### Фронтенд
- cart store: `productId: String(...).trim()` при формуванні sync items
- bfbApi.syncCart: `productId: String(i.productId).trim()` перед POST
- проксі /api/cart/sync: `String(it.productId).trim()` перед проксуванням
- Тип `SyncCartItem.productId` — `string`

### Бекенд (NestJS)
- DTO: `@Transform(({ value }) => (value != null ? String(value).trim() : undefined))` + `@IsString()`
- Контролер: `String(pid).trim()` перед передачею в сервіс
