# План: Batch-синхронізація корзини та улюбленого

## Поточний стан

### Що вже реалізовано
| Функція | Авторизований | Неавторизований |
|---------|---------------|-----------------|
| **Корзина** | WooCommerce API (`/api/cart`) | localStorage (`bfb-cart`) |
| **Улюблене** | WooCommerce API (`/api/wishlist`) | localStorage (`bfb-favorites`) |

### Проблема
- **По одному запиту на дію**: addToCart, addToWishlist, removeItem тощо — кожна дія робить окремий HTTP-запит
- Це створює затримки та навантаження при швидких діях користувача

---

## Цільова логіка

1. **Оптимістичне оновлення UI** — зміни одразу відображаються в інтерфейсі
2. **Відкладена синхронізація** — збираємо зміни в локальний стан, відправляємо **один batch-запит при закритті модалки**
3. **localStorage для анонімів** — без змін (вже є)

---

## Реалізація

### Фронтенд (store)

#### Корзина (`src/store/cart.ts`)
- Оновлювати UI миттєво (як зараз)
- **Не викликати API** при add/remove/increment/decrement — лише зберігати в state
- Додати `pendingCartSync: boolean` — чи є несинхронізовані зміни
- При `close()` модалки: якщо `pendingCartSync && token` → викликати `syncCartToApi()`
- `syncCartToApi()`: POST `/api/cart/sync` з тілом `{ items: [...] }` — поточний локальний стан
- Після успішного sync — оновити `items` з відповіді (щоб отримати `cart_item_key`), скинути `pendingCartSync`

**Важливо**: при `addItem` для логіна все одно потрібен негайний API-виклик, бо без `cart_item_key` ми не зможемо робити increment/decrement на сервері. Тому:
- **Варіант A**: Синхронізувати при кожному add (бо треба отримати cart_item_key), але update/remove — batch при close
- **Варіант B**: Повністю batch — при sync надсилаємо весь стан, бекенд повертає повний кошик з ключами

Варіант B простіший для UX — жодних API-викликів до закриття модалки.

#### Улюблене (`src/store/favorites.ts`)
- Аналогічно: `toggleFavorite`, `remove`, `removeAll` — тільки оновлення state
- `pendingFavoritesSync: boolean`
- При `close()` → `syncFavoritesToApi()`
- POST `/api/wishlist/sync` з `{ productIds: string[] }`

---

### Бекенд (Next.js API routes)

#### `POST /api/cart/sync`
**Body** (camelCase за специфікацією): `{ items: Array<{ productId: string; quantity: number; variationId?: number }> }`  
Підтримується також snake_case: `product_id`, `variation_id`.

**Логіка**:
1. GET поточний кошик з WP (`sl_cart`)
2. Очистити кошик (DELETE clear)
3. Для кожного item з body — POST add
4. GET оновлений кошик
5. Повернути клієнту

#### `POST /api/wishlist/sync`
**Body** (camelCase за специфікацією): `{ productIds: string[] }`  
Підтримується також snake_case: `product_ids` (number[] або string[]).

**Логіка**:
1. GET поточний wishlist з WP
2. toAdd = product_ids - current
3. toRemove = current - product_ids
4. Для кожного з toRemove — DELETE
5. Для кожного з toAdd — POST add
6. Повернути оновлений wishlist

---

## Порядок змін

1. Додати batch endpoints: `/api/cart/sync`, `/api/wishlist/sync`
2. Додати в `bfbApi.ts`: `syncCart`, `syncWishlist`
3. Змінити `cart.ts`: вимкнути негайні API-виклики, додати sync при close
4. Змінити `favorites.ts`: аналогічно
5. Переконатися, що `close()` викликається при закритті модалки (CartModal, FavoritesModal використовують `useCartStore.close` / `useFavoriteStore.close`)

---

## Перевірка відповідності специфікації

| Вимога | Статус |
|--------|--------|
| POST /api/cart/sync, body `{ items: [{ productId, quantity }] }` | ✅ camelCase + snake_case |
| POST /api/wishlist/sync, body `{ productIds: [...] }` | ✅ camelCase + snake_case |
| JWT (Authorization: Bearer) | ✅ api interceptor |
| Стейт — лише local + pendingSync | ✅ pendingCartSync, pendingFavoritesSync |
| Sync при закритті модалки | ✅ close() викликає syncCartToApi/syncFavoritesToApi |
| Sync на beforeunload | ✅ CartModal, FavoritesModal |
| Sync на visibilitychange | ✅ CartModal, FavoritesModal |
| zustand persist для неавторизованих | ✅ partialize items, currentUserId |
