# Living Notebook — Next.js 16 / React 19

> Інтерактивний блокнот, де кожен маршрут — це практичний урок із сучасного App Router. Архітектурна теорія, робочий код і лабораторії з дебагінгу — все в одному застосунку.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/) [![Deploy](https://img.shields.io/badge/Vercel-live-000?logo=vercel)](https://next-js-notebook.vercel.app/)

**🌐 Live:** [next-js-notebook.vercel.app](https://next-js-notebook.vercel.app/)
**📘 Переклади:** [English](./README.md) · [Italiano](./README-it.md)

---

## Зміст

- [Що це таке](#що-це-таке)
- [Швидкий старт](#швидкий-старт)
- [5 модулів · 20 уроків](#5-модулів--20-уроків)
- [Технологічний стек](#технологічний-стек)
- [Структура проєкту](#структура-проєкту)
- [Змінні середовища](#змінні-середовища)
- [Архітектурні рішення](#архітектурні-рішення)
- [Deploy](#deploy)
- [Скрипти](#скрипти)
- [Підтримка браузерів](#підтримка-браузерів)
- [Як долучитися](#як-долучитися)
- [Автор](#автор)

---

## Що це таке

**Справжній застосунок Next.js 16**, де кожен маршрут під `/lessons/*` — самодостатній урок. Кожен урок поєднує:

1. **Архітектурну теорію** — що робить API, чому воно існує, та компроміси проти альтернатив.
2. **Робочий код** — урок Є демо; ніяких окремих сніпетів для копіювання.
3. **Лабораторію з дебагінгу** — покрокові інструкції, як побачити механізм у дії (термінальні логи, DevTools → Network, React DevTools тощо).

Блокнот **тримовний** (Італійська · English · Українська) з cookie-based перемикачем мови, який переживає навігацію та SSR. Базова мова — італійська.

Це **не** туторіал-сайт, не статичний блог, не презентація. Це застосунок, який ти запускаєш локально через `npm run dev`, навігуєш у браузері та ламаєш дебагером.

---

## Швидкий старт

**Вимоги**
- Node.js 20+ (використовує нативний `fetch`, `node:test`, сучасні crypto API)
- npm (проєкт використовує `package-lock.json`; pnpm / yarn / bun працюватимуть, але lockfile розійдеться)

```bash
# 1. встановлення
git clone https://github.com/InnaIvBoiko/next-js-notebook.git
cd next-js-notebook
npm install

# 2. налаштування env (дивись .env.example для значень)
cp .env.example .env.local
# згенеруй 32-байтний секрет для AUTH_SECRET / WEBHOOK_SECRET:
#   openssl rand -base64 32

# 3. запуск
npm run dev
# відкрий http://localhost:3000
```

Dev-сервер використовує Turbopack. Перший запит до уроку компілює його module graph on demand (~200мс гаряче, ~2с холодне) і потім кешується.

---

## 5 модулів · 20 уроків

Кожен урок — це маршрут. Клікни, щоб відкрити в живому деплої.

### Модуль 1 · Архітектура · фундамент App Router
| # | Маршрут | Що вивчиш |
| - | ------- | --------- |
| 1 | [`/server-vs-client`](https://next-js-notebook.vercel.app/lessons/server-vs-client) | Server vs Client Components: які API де працюють, hydration boundary, семантика `'use client'` |
| 2 | [`/routing-basics`](https://next-js-notebook.vercel.app/lessons/routing-basics) | File-system routing, вкладені layouts, збереження стану layout між навігаціями |
| 3 | [`/dynamic-routes`](https://next-js-notebook.vercel.app/lessons/dynamic-routes) | Сегменти `[id]`, `generateStaticParams`, типізовані params з `PageProps<>` |
| 4 | [`/loading-and-errors`](https://next-js-notebook.vercel.app/lessons/loading-and-errors) | `loading.tsx` як Suspense boundary, `error.tsx` як Error Boundary, стрімінг |

### Модуль 2 · Data fetching & кеш
| # | Маршрут | Що вивчиш |
| - | ------- | --------- |
| 5 | [`/server-fetching`](https://next-js-notebook.vercel.app/lessons/server-fetching) | `async` Server Components, `Promise.all` для паралельних fetch, `cookies()`/`headers()` як request-time дані |
| 6 | [`/caching`](https://next-js-notebook.vercel.app/lessons/caching) | Cache Components (`'use cache'`), `cacheLife`/`cacheTag`, React `cache()` для per-request мемоїзації |
| 7 | [`/server-actions`](https://next-js-notebook.vercel.app/lessons/server-actions) | Функції `'use server'`, form actions, `revalidatePath` / `revalidateTag` |
| 8 | [`/action-pending`](https://next-js-notebook.vercel.app/lessons/action-pending) | `useFormStatus`, `useActionState`, `useOptimistic` |

### Модуль 3 · Стан & клієнтські патерни
| # | Маршрут | Що вивчиш |
| - | ------- | --------- |
| 9 | [`/context-provider`](https://next-js-notebook.vercel.app/lessons/context-provider) | Патерн Server-into-Client, розділення Context на Read + Write provider для уникнення зайвих ре-рендерів |
| 10 | [`/zustand-store`](https://next-js-notebook.vercel.app/lessons/zustand-store) | Zustand з middleware `persist`, селектори, SSR гідратація |
| 11 | [`/tanstack-query`](https://next-js-notebook.vercel.app/lessons/tanstack-query) | `useQuery`/`useMutation`, polling через `refetchInterval`, Devtools |

### Модуль 4 · Full-stack
| # | Маршрут | Що вивчиш |
| -- | ------- | --------- |
| 12 | [`/api-routes`](https://next-js-notebook.vercel.app/lessons/api-routes) | Route Handlers (`route.ts`), динамічні сегменти, JSON / Streaming відповіді |
| 13 | [`/database-orm`](https://next-js-notebook.vercel.app/lessons/database-orm) | Drizzle ORM + PGlite (Postgres WASM in-process), типізована схема, міграції |
| 14 | [`/auth-setup`](https://next-js-notebook.vercel.app/lessons/auth-setup) | Auth.js v5: розділення edge-safe конфігурації, Credentials з bcrypt, DrizzleAdapter |
| 15 | [`/middleware-logic`](https://next-js-notebook.vercel.app/lessons/middleware-logic) | `proxy.ts` (перейменовано з `middleware.ts` у Next 16): auth gating, ін'єкція хедерів, redirect |

### Модуль 5 · Продуктивність & безпека
| # | Маршрут | Що вивчиш |
| -- | ------- | --------- |
| 16 | [`/optimization-media`](https://next-js-notebook.vercel.app/lessons/optimization-media) | `next/image` (3 джерела × 2 layout), `next/font/google` self-hosted (Inter + JetBrains Mono) |
| 17 | [`/seo-metadata`](https://next-js-notebook.vercel.app/lessons/seo-metadata) | Статичний + динамічний `metadata`, `generateMetadata`, `ImageResponse` для OG, типізовані `sitemap.ts` / `robots.ts`, JSON-LD |
| 18 | [`/security-env`](https://next-js-notebook.vercel.app/lessons/security-env) | Типізований env через zod на boot, tripwire `server-only`, статичні security-хедери, CSP nonce у proxy, HMAC webhook |
| 19 | [`/advanced-routing`](https://next-js-notebook.vercel.app/lessons/advanced-routing) | Route groups `(group)`, паралельні маршрути `@slot`, intercepting routes `(..)folder`, catch-all `[...path]` |
| 20 | [`/deploy-ready`](https://next-js-notebook.vercel.app/lessons/deploy-ready) | Анатомія `next build`, runtime Node vs Edge, output modes, CI/CD pipeline, pre-flight checklist |

---

## Технологічний стек

| Шар | Вибір | Чому |
| --- | ----- | ---- |
| Фреймворк | **Next.js 16.2** (App Router) | Уся суть блокноту |
| UI | **React 19.2** | Server Components, `use()`, `useOptimistic` |
| Мова | **TypeScript 5** | Уроки повністю типізовані, без `any` |
| Стилі | **Tailwind CSS v4** | Zero-config, CSS-first, швидше за v3 |
| Стан (client) | **Zustand 5** | Маленький, без boilerplate; Урок 10 |
| Server cache | **TanStack Query 5** | Використано в Уроці 11 (client cache) |
| ORM | **Drizzle ORM 0.45** | Type-safe SQL, без зайвих абстракцій |
| База даних | **@electric-sql/pglite** | Postgres WASM in-process — demo DB без встановлення |
| Auth | **Auth.js v5** (next-auth beta) | Edge-compatible сесії, OAuth + Credentials |
| Валідація | **zod 4** | Схема env (Урок 18), webhook payload-и |
| Хешування | **bcryptjs** | Provider Credentials (Урок 14) |
| Boundary guard | **server-only** | Tripwire для випадкових клієнтських імпортів |

---

## Структура проєкту

```
.
├── app/                              # Корінь App Router
│   ├── _components/                  # Компоненти головної сторінки
│   │   └── notebook-shell.tsx        # Hero + roadmap + footer
│   ├── _lib/                         # Спільні (префікс ігнорується routing-ом)
│   │   └── dictionaries.ts           # IT/EN/UK словник home
│   ├── api/                          # Route Handlers
│   │   ├── auth/[...nextauth]/       # Auth.js
│   │   ├── echo/[...path]/           # catch-all demo (Урок 12)
│   │   ├── items/                    # mock REST (Урок 12)
│   │   ├── me/notes/                 # захищений (Урок 14)
│   │   ├── notes/                    # CRUD (Урок 13)
│   │   ├── now-static/               # cached маршрут (Урок 6)
│   │   ├── now-dynamic/              # uncached маршрут (Урок 6)
│   │   ├── runtime-probe/            # Урок 20
│   │   ├── server-time/              # polling source (Урок 11)
│   │   └── webhook/                  # HMAC-signed POST (Урок 18)
│   ├── lessons/                      # Кожен урок — це маршрут
│   │   ├── _components/              # Спільні header components
│   │   │   ├── lang-bar.tsx          # Перемикач IT/EN/UK
│   │   │   ├── lang-provider.tsx     # Cookie-backed Context
│   │   │   ├── persistence-probe.tsx # Demo "layout clicks: N"
│   │   │   └── render-counter.tsx
│   │   ├── layout.tsx                # Shell для /lessons/*
│   │   ├── [урок]/                   # Одна папка на урок
│   │   │   ├── page.tsx              # Server entry
│   │   │   ├── _components/          # Lesson-local UI
│   │   │   └── _lib/                 # Lesson-local i18n + helpers
│   │   └── …
│   ├── opengraph-image.tsx           # Default OG image (Урок 17)
│   ├── robots.ts                     # Типізований robots.txt (Урок 17)
│   ├── sitemap.ts                    # Типізований sitemap (Урок 17)
│   └── page.tsx                      # Home (landing блокноту)
├── public/                           # Статичні asset-и (favicons, картинки)
├── auth.ts                           # Повна конфігурація Auth.js (Node-only)
├── auth.config.ts                    # Edge-safe конфігурація Auth.js
├── proxy.ts                          # Edge proxy (перейменовано з middleware.ts)
├── next.config.ts                    # Cache Components + headers + images
├── eslint.config.mjs                 # Flat config
├── package.json
├── tsconfig.json
├── .env.example                      # Template env (комітуй)
├── .env.local                        # Справжні секрети (НІКОЛИ не комітуй)
├── README.md                         # Англійською
├── README-it.md                      # Італійською
├── README-ukr.md                     # Цей файл
├── ARCHITECTURE.md                   # Глибокі технічні нотатки
└── CONTRIBUTING.md                   # Як розширювати блокнот
```

Підкреслення на початку `_components/` / `_lib/` маркує їх як **private folders** — Next.js ігнорує їх для routing-у (тому вони не стають URL-ами).

---

## Змінні середовища

Скопіюй `.env.example` у `.env.local` і заповни значення. **`.env.local` гітіґнорований.**

| Змінна | Обов'язкова | Призначення |
| ------ | ----------- | ----------- |
| `WEBHOOK_SECRET` | ✅ | HMAC підпис для `/api/webhook` (Урок 18). Мін. 16 символів. |
| `AUTH_SECRET` | ✅ | Шифрування сесії Auth.js. Мін. 32 символи. |
| `AUTH_GITHUB_ID` | опціонально | GitHub OAuth client id (Урок 14) |
| `AUTH_GITHUB_SECRET` | опціонально | GitHub OAuth client secret |
| `NEXT_PUBLIC_SITE_NAME` | опціонально | За замовчуванням `"Living Notebook"` |
| `NEXT_PUBLIC_FEATURE_BETA` | опціонально | `"true"` щоб увімкнути beta features; за замовчуванням `false` |

Усе з префіксом `NEXT_PUBLIC_` потрапляє в bundle браузера. **Ніколи не клади туди секрет.**

Валідація відбувається при імпорті модуля: якщо бракує обов'язкової змінної або вона зламана, dev-сервер і `npm run build` падають з точним іменем поля. Дивись [`app/lessons/security-env/_lib/env.ts`](app/lessons/security-env/_lib/env.ts).

Генерація секретів:
```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # WEBHOOK_SECRET
```

---

## Архітектурні рішення

Короткий огляд рішень дизайну, що роблять застосунок таким, яким він є. Повне занурення — у [ARCHITECTURE.md](./ARCHITECTURE.md).

### Cache Components
`next.config.ts` вмикає `cacheComponents: true`. Сторінки prerendered частково: статична оболонка відправляється з CDN миттєво, динамічні частини стрімляться за boundary `<Suspense>`. Build output показує `◐` (partial) замість `○` (static) або `λ` (dynamic).

Наслідок: **layouts не можуть читати uncached request-time дані** без обгортання в `<Suspense>`. `/lessons/layout.tsx` обгортає читання cookie в Suspense boundary саме з цієї причини.

### Edge proxy
`proxy.ts` (перейменовано з `middleware.ts` у Next 16) виконується на Edge runtime для кожного matched-запиту. Три concerns послідовно:
1. **Auth** — `auth()` з Auth.js оновлює session cookies і ін'єктує `req.auth`.
2. **Locale** — читає cookie `nb-lang`; якщо нема, сніфає `Accept-Language` для `it`/`en`/`uk`, записує cookie назад. Саме це дозволяє `<LangProvider>` рендерити правильну мову **server-side** без SSR/CSR mismatch.
3. **Gating** — `/lessons/middleware-logic/protected*` вимагає cookie `nb-demo-pass` або робить redirect (307).
4. **Хедери** — ін'єктує `x-pathname` та `x-geo-country` для downstream RSC.

### i18n через cookie
Блокнот має власну реалізацію i18n (без `next-intl` / `next-i18next`):
- Файли словників — це TypeScript об'єкти з ключами `it` / `en` / `uk`.
- `<LangProvider>` читає cookie `nb-lang` через `cookies()` у layout.
- `<LangBar>` записує cookie при перемиканні + оновлює Context.
- Server Components у саб-маршрутах читають cookie напряму (вони не можуть використати `useLang()`).

Компроміс: повна type-safety, нуль рантайм залежностей, але немає автоматизованого extraction чи helper-ів для плюралізації.

### Розділення Auth.js v5
- `auth.config.ts` — edge-safe (без bcrypt, без БД). Імпортується `proxy.ts`.
- `auth.ts` — повна конфігурація (Credentials + DrizzleAdapter + bcrypt). Імпортується Server Components.

Без цього розділення proxy впав би на cold start, бо bcrypt вимагає Node.

### Шари безпеки
- **Валідація env** на boot через zod — неправильний env → процес не стартує.
- **`server-only`** tripwire на кожному модулі, що торкається секретів — Turbopack кидає на білді, якщо Client island випадково їх імпортує.
- **Статичні security-хедери** в `next.config.ts`: HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **CSP з per-request nonce** генерується в `proxy.ts` (`Report-Only` у dev, щоб HMR вижив, enforced у продакшні).
- **HMAC webhook** з `crypto.timingSafeEqual` для запобігання timing-атак.

### Продуктивність
- **`next/image`** з whitelisted remote patterns (`picsum.photos`) → ніякого open image proxy.
- **`next/font/google`** self-hosting Inter + JetBrains Mono через CSS variables — нуль зовнішніх запитів, ніякого FOIT.
- **Static-first**: 15 із 20 уроків prerendered; лише `/api/*` та auth-gated маршрути динамічні.

---

## Deploy

### Vercel (zero-config)
```bash
vercel
```
Блокнот працює як один Vercel проєкт. Push до `main` → production deploy. Push до будь-якого branch → preview deploy. Поточний деплой — на [next-js-notebook.vercel.app](https://next-js-notebook.vercel.app/).

Налаштуй ті самі env vars, що і в `.env.local`, у project settings Vercel (scope Production + Preview).

### Docker (self-host)
Додай `output: 'standalone'` до [`next.config.ts`](next.config.ts), потім:
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Standalone mode виробляє дерево, яке містить лише реально використовувані залежності (~80 МБ vs ~800 МБ у `node_modules`).

### Static export
Не підтримується: застосунок використовує API routes, `cookies()`, Server Actions та Auth.js — все несумісне з `output: 'export'`. Дивись Урок 20.

---

## Скрипти

| Команда | Що робить |
| ------- | --------- |
| `npm run dev` | Turbopack dev сервер на порту 3000 |
| `npm run build` | Production білд → `.next/` |
| `npm start` | Сервити production білд (спочатку `npm run build`) |
| `npm run lint` | ESLint flat config |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI) |

Типовий pre-commit loop:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

---

## Підтримка браузерів

- Chrome / Edge ≥ 110
- Firefox ≥ 110
- Safari ≥ 16

Застосунок використовує CSS nesting, `:has()`, container queries та сучасні logical properties. IE / Safari ≤ 15 не підтримуються.

Протестовано responsive до **320 px** ширини (найвужча поширена viewport — iPhone SE / Galaxy Fold outer).

---

## Як долучитися

Дивись [CONTRIBUTING.md](./CONTRIBUTING.md). Коротко: спочатку відкрий issue, якщо хочеш додати урок, дотримуйся існуючої структури папок (`page.tsx` → `_components/index-view.tsx` → `_lib/content.ts` для i18n), і запусти `npm run lint && npx tsc --noEmit && npm run build` перед push.

---

## Автор

Спроєктовано та розроблено **Інною Бойко**.

- 📧 [inna_boiko@libero.it](mailto:inna_boiko@libero.it)
- 💼 [LinkedIn](https://www.linkedin.com/in/inna-boiko/)
- 🐙 [GitHub @InnaIvBoiko](https://github.com/InnaIvBoiko)

Зроблено з офіційною документацією Next.js, React і Vercel як основним референсом. Структура уроків надихалася курсом [Learn Next.js](https://nextjs.org/learn) від Vercel, але йде значно глибше у production-патерни (безпека, observability, edge runtime, deploy).

---

## Ліцензія

[MIT](./LICENSE) — можеш сміливо форкати, адаптувати та використовувати як навчальний ресурс. Атрибуція вітається, але не обов'язкова.
