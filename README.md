# Playwright hybrid UI + API

Agency template: **API sets up state, UI proves the journey**. No click-through login.

Target app: [Practice Software Testing](https://practicesoftwaretesting.com) (Toolshop).  
API docs: [Swagger](https://api.practicesoftwaretesting.com/api/documentation)

## What this shows

| Piece | Where |
|---|---|
| POM | `src/pages` |
| Fixtures | `src/fixtures` (`api`, `seededCheckout`, `checkoutPage`) |
| Typed config + env switch | `src/config` (`TEST_ENV=demo` or `staging`) |
| Retry | Playwright `retries` + `withRetry()` |
| Self-heal | `src/healing/locator.ts` — try `data-test`, then fallbacks |
| E2E flow | API register + cart → UI checkout → cash on delivery |

## E2E flow

1. `POST /users/register` then `POST /users/login` (unique user each run — the shared demo customer is often locked)
2. `GET /products` → pick in-stock item
3. `POST /carts` + add product
4. Inject `auth-token` (localStorage) and `cart_id` (sessionStorage)
5. Open `/checkout` already logged in, cart already filled
6. Proceed → address → cash on delivery → order confirmation

## Setup

```bash
npm install
npx playwright install chromium
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`.

## Run

```bash
npm test           # API + UI
npm run test:api   # API only
npm run test:e2e   # checkout journey
npm run test:headed
```

Switch environment:

```bash
# PowerShell
$env:TEST_ENV="staging"; npm test
```

`staging` uses `UI_BASE_URL` / `API_BASE_URL` from `.env`.

## Layout

```
src/config       typed env
src/api          ShopApi client
src/fixtures     Playwright fixtures
src/healing      locator fallback + retry helper
src/pages        page objects
tests/api        API checks
tests/e2e        UI journey
```

## CI

GitHub Actions runs `npm test` on push/PR (`CI=true` adds retries and the GitHub reporter) and uploads the Playwright HTML report as the `playwright-report` artifact.
