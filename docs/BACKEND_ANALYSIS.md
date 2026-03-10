# Бекенд: тільки NestJS

Усі виклики на фронті спрямовані на NestJS. WordPress/WooCommerce видалено.

## Маршрути

| Модуль | Маршрут | NestJS endpoint |
|--------|---------|-----------------|
| Корзина | `/api/cart`, `/api/cart/sync` | `/api/cart`, `/api/cart/sync` |
| Каталог | `/api/catalog/products` | `/api/catalog/products` |
| Wishlist | `/api/wishlist`, `/api/wishlist/sync` | `/api/wishlist`, `/api/wishlist/sync` |
| Користувач | `/api/user/me`, `/api/user/profile`, `/api/user/password` | NestJS user API |
| Замовлення | `/api/orders` | `/api/orders` |
| Auth | `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password` | NestJS auth |
| FAQ | `/api/faq`, `/api/faq_category` | `/api/faq`, `/api/faq_category` |
| Banners | `/api/banners` | `/api/banners` |
| Trainers | `/api/trainers` | `/api/trainers` |
| Courses | `/api/course`, `/api/main-courses` | `/api/course`, `/api/main-courses` |
| Applications | `/api/applications/training`, `/api/applications/question` | NestJS applications |
| Subscription | `/api/subscription/assign-tariff`, `/api/subscription/cancel` | NestJS subscription |
| Theme | `/api/theme-settings` | `/api/theme-settings` |

## Вимоги до бекенду: Cart Sync

**POST `/api/cart/sync`** отримує повний бажаний стан кошика. Фронт не робить окремі запити на add/remove — надсилає один payload при закритті модалки (якщо були зміни).

- **Формат:** `{ items: [{ productId?: string, slug?: string, quantity: number }] }`
- **Семантика:** **повна заміна** кошика (replace). Бекенд має встановити кошик = ці items. Товари, яких немає в списку або quantity=0, мають бути видалені.
- **Відповідь:** така ж структура, як `GET /api/cart` — `{ items, items_count, total, currency }`, де кожен item має `productId`, `product`, `quantity`, `name`, `price`, `mainImageUrl` тощо.

## Вимоги до бекенду: Orders API

**POST `/api/orders`** — створення замовлення. Потрібен JWT.

- **Тіло:** `{ firstName, lastName, phone, email, deliveryToAnother?, recipientFirstName?, recipientLastName?, recipientPhone?, deliveryMethod?, deliveryCity?, deliveryAddress?, comment?, newsletterConsent?, termsAccepted, discountAmount?, deliveryCost?, items? }`
- **items:** опційно; `[{ productId, quantity }]`. Якщо не передано — товари беруться з кошика.
- **Відповідь:** `{ id, status, total, subtotal, discountAmount?, deliveryCost?, items: [{ productId, quantity, price, product }] }`
- Після створення бекенд очищає кошик.

**GET `/api/orders`** — список замовлень поточного користувача (JWT).

**GET `/api/orders/:id`** — замовлення за ID (JWT). Формат відповіді для order-success:
`{ id, createdAt, deliveryAddress, paymentLabel, recipient, phoneLabel, subtotal, discountAmount, deliveryCost, total, items? }`. Якщо deliveryCost=0 — UI показує «За тарифами Нової Пошти».

**Важливо:** 404 "Cannot POST /api/orders" означає, що NestJS ще не має ендпоінту POST /api/orders. Потрібно його реалізувати на бекенді.

## Видалено

- Усі `wp-json` виклики
- `/api/proxy`
- Test routes: test-avatar, test-coach, test-instructor, test-product-variations
