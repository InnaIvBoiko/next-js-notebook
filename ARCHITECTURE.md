# Architecture

Deep technical companion to [README.md](./README.md). Documents the non-obvious decisions baked into the codebase so future maintainers (and future-me) don't have to reverse-engineer them.

---

## Table of Contents

1. [Routing model](#1-routing-model)
2. [Rendering model & Cache Components](#2-rendering-model--cache-components)
3. [Server-into-Client pattern](#3-server-into-client-pattern)
4. [Cookie-driven i18n](#4-cookie-driven-i18n)
5. [Edge proxy pipeline](#5-edge-proxy-pipeline)
6. [Auth.js v5 split config](#6-authjs-v5-split-config)
7. [Database: PGlite + Drizzle](#7-database-pglite--drizzle)
8. [Security stack](#8-security-stack)
9. [Performance: fonts, images, assets](#9-performance-fonts-images-assets)
10. [SEO surface](#10-seo-surface)
11. [Build output & deploy](#11-build-output--deploy)
12. [File conventions cheat-sheet](#12-file-conventions-cheat-sheet)

---

## 1. Routing model

The notebook uses the **App Router exclusively** (no `pages/`). Every URL maps to a folder under `app/`:

- `app/page.tsx` → `/`
- `app/lessons/server-vs-client/page.tsx` → `/lessons/server-vs-client`
- `app/api/runtime-probe/route.ts` → `/api/runtime-probe`

### Special files

| File | Role |
| ---- | ---- |
| `page.tsx` | Renders a route (Server Component by default) |
| `layout.tsx` | Wraps every child route; persists across navigation |
| `loading.tsx` | Suspense fallback for the route |
| `error.tsx` | Error Boundary for the route (must be Client) |
| `not-found.tsx` | Renders when `notFound()` is called |
| `default.tsx` | Required fallback for parallel-route `@slot`s when no match |
| `route.ts` | Route Handler (REST) — `GET`/`POST`/etc. exports |
| `opengraph-image.tsx` | Generates OG image at build/request time |
| `sitemap.ts` | Returns sitemap entries (typed `MetadataRoute.Sitemap`) |
| `robots.ts` | Returns robots config (typed `MetadataRoute.Robots`) |

### Folder conventions

| Prefix | Meaning | Used for |
| ------ | ------- | -------- |
| `_underscore` | Private folder — **not** part of routing | `_components/`, `_lib/` |
| `(parens)` | Route group — **not** part of URL | unused so far; documented in Lesson 19 |
| `[bracket]` | Dynamic segment | `[id]`, `[slug]` |
| `[...catch]` | Catch-all segment | `[...path]` |
| `[[...opt]]` | Optional catch-all | `[[...path]]` (crumbs lab) |
| `@slot` | Parallel route slot | Lesson 19 dashboard |
| `(..)folder` | Intercepting route (one level up) | Lesson 19 gallery modal |

---

## 2. Rendering model & Cache Components

### Default: everything is a Server Component

Every file under `app/` is a Server Component **unless** it starts with `'use client'`. This means:

- It runs **only on the server**, never in the browser bundle.
- It can be `async` and call DB, fs, environment variables directly.
- It cannot use `useState`, `useEffect`, event handlers, or refs.

### `'use client'` directive

`'use client'` marks a **module-graph boundary**. Everything reachable from a Client Component ends up in the client bundle:

```tsx
// app/foo.tsx (Server)
import Counter from './counter';  // ← pulls Counter + its deps into the bundle
export default function Foo() {
  return <Counter />;
}

// app/counter.tsx (Client)
'use client';
import { useState } from 'react';
export default function Counter() { /* ... */ }
```

The boundary is **directional**: a Server Component can render a Client Component, but a Client Component cannot import a Server Component (only receive one as `children` / props).

### Cache Components (`cacheComponents: true`)

Enabled in [`next.config.ts`](next.config.ts). Pages can be **partially prerendered**:

- The static parts (skeleton, headers, decorative UI) render at build time → CDN-cacheable HTML.
- Suspense-wrapped dynamic parts stream in at request time → hydrate without re-fetching the shell.

In `npm run build` output, routes show one of three markers:

| Marker | Meaning |
| ------ | ------- |
| `○` | Static — pure HTML, no per-request work |
| `◐` | Partial — static shell + dynamic holes (Cache Components) |
| `λ` | Dynamic — function per request |

#### The "layouts can't read request data" rule

Under Cache Components, **layouts that read uncached request-time data must wrap the read in `<Suspense>`** (or move it into a page). The notebook hits this in [`app/lessons/layout.tsx`](app/lessons/layout.tsx) — the cookie read happens inside an async inner Component behind a top-level Suspense:

```tsx
export default function LessonsLayout({ children }) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LangScope>{children}</LangScope>     {/* ← reads cookies() */}
    </Suspense>
  );
}
```

Without the Suspense wrap, the build throws an opaque "uncached data in layout" error.

#### Forbidden config under Cache Components

These route-segment configs are **not allowed**:
- `export const runtime = 'edge' | 'nodejs'` — runtime is inferred per file
- `export const dynamic = 'force-dynamic'` — dynamism is inferred from `<Suspense>` placement
- `export const revalidate = N` — use `cacheLife({ revalidate: N })` inside `'use cache'` functions

---

## 3. Server-into-Client pattern

Recurring pattern across every lesson: a Server `page.tsx` does the privileged work (read DB, env, headers, fs), then passes results as **props or slots** to a Client orchestrator.

```tsx
// app/lessons/security-env/page.tsx (Server)
export default async function Page() {
  const headerSnapshot = await readHeaders();
  const envSnapshot = await readEnv();
  return (
    <IndexView
      headersInspector={<HeadersInspector headers={headerSnapshot} />}
      envInspector={<EnvInspector env={envSnapshot} />}
    />
  );
}

// app/lessons/security-env/_components/index-view.tsx (Client)
'use client';
export default function IndexView({ headersInspector, envInspector }) {
  const lang = useLang();   // ← Client-only Context hook
  return (
    <article>
      {headersInspector}
      {envInspector}
    </article>
  );
}
```

Why: the orchestrator needs `useLang()` (Client), but the inspectors need `process.env` (Server). Passing pre-rendered Server Components as ReactNode props is the canonical bridge.

---

## 4. Cookie-driven i18n

No external i18n library. The whole stack is hand-rolled to keep the lesson on what's actually happening.

### Components

- **Dictionary**: a deeply-typed TypeScript object with `it` / `en` / `uk` keys. One per scope: a global one in [`app/_lib/dictionaries.ts`](app/_lib/dictionaries.ts), per-lesson ones in `app/lessons/*/\_lib/content.ts`.
- **Cookie**: `nb-lang` — value is `'it' | 'en' | 'uk'`. SameSite=Lax, 1-year expiry.
- **Edge proxy**: writes the cookie on first visit (sniffs `Accept-Language`).
- **Layout**: reads the cookie via `cookies()` and passes it as `initialLang` to `<LangProvider>`.
- **Provider**: `LangProvider` exposes `useLang()` (read) and `useSetLang()` (write) as **two separate Contexts** — consumers of one don't re-render when the other updates.
- **Switcher**: `<LangBar>` writes the cookie (`document.cookie = ...`) on click + calls `setLang()` for instant UI update.

### Why two Contexts

A component using only `useSetLang()` (the lang switcher itself, on its own) shouldn't re-render when `lang` changes. Splitting into ReadContext + WriteContext gives `<LangBar>` a stable identity across language changes.

### Server-side language resolution

In sub-routes that are Server Components (e.g. modal-from-link in Lesson 19), `useLang()` isn't available. They read the cookie directly:

```tsx
async function ServerOnlySubroute() {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get('nb-lang')?.value;
  const lang: Lang = rawLang === 'en' || rawLang === 'uk' ? rawLang : 'it';
  // ...
}
```

This is why the cookie is the source of truth, not Context.

---

## 5. Edge proxy pipeline

[`proxy.ts`](proxy.ts) (renamed from `middleware.ts` in Next 16) runs on the Edge runtime for every request matching its `matcher`. Pipeline:

```
incoming request
      │
      ▼
┌─────────────────────────┐
│ 1. auth()               │  Refresh session cookies, inject req.auth
│    (Auth.js edge half)  │
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ 2. locale resolution    │  Read nb-lang; if absent, sniff
│                         │  Accept-Language; write cookie
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ 3. protected zone       │  /lessons/middleware-logic/protected*:
│                         │  require nb-demo-pass or 307 redirect
└─────────────────────────┘
      │
      ▼
┌─────────────────────────┐
│ 4. header injection     │  x-pathname, x-geo-country,
│                         │  x-lang (downstream RSCs read via
│                         │  headers())
└─────────────────────────┘
      │
      ▼
NextResponse.next({ request: { headers } })
```

### What can NOT live in proxy.ts

The Edge runtime forbids:
- Node-only APIs (`node:fs`, `Buffer` unless explicitly imported, native modules)
- Heavy crypto (bcrypt, native libsodium)
- The full `auth.ts` (which imports Drizzle + PGlite)

That's why `auth.config.ts` is the edge-safe half and `proxy.ts` only imports from there.

---

## 6. Auth.js v5 split config

```
┌────────────────────────────┐    ┌─────────────────────────┐
│ auth.config.ts             │    │ auth.ts                 │
│ (EDGE-SAFE)                │◄───│ (NODE / SERVER)         │
│                            │    │                         │
│ - GitHub provider          │    │ - imports config        │
│ - callbacks.authorized     │    │ - adds Credentials      │
│ - session strategy         │    │ - adds DrizzleAdapter   │
│ - pages config             │    │ - bcrypt.compare()      │
│                            │    │                         │
│ Imported by:               │    │ Imported by:            │
│   proxy.ts                 │    │   Server Components     │
│                            │    │   /api/auth/[...nextauth]│
└────────────────────────────┘    └─────────────────────────┘
```

Why: `proxy.ts` runs Edge → can't load bcrypt or PGlite → can't load the full auth. The split lets the middleware still validate sessions (via the JWT secret) without doing credential checks.

### Session strategy

JWT (default), not database sessions. Reasons:
- Edge proxy can validate JWTs without a DB roundtrip.
- PGlite (in-memory) resets on restart; database sessions would log everyone out.

---

## 7. Database: PGlite + Drizzle

### PGlite

[@electric-sql/pglite](https://pglite.dev) is **real Postgres compiled to WebAssembly**, running in-process. Trade-offs:

| Pro | Con |
| --- | --- |
| Zero install — no docker, no service | In-memory (data lost on restart) |
| Real Postgres SQL (joins, JSON, FTS) | Single-connection (no pool) |
| Works in dev + on Vercel Serverless | ~10 MB WASM payload |

For a learning notebook this is ideal. For production, swap the connection string to a real Postgres in `db.ts`.

### Drizzle ORM

- **Schema in TS** — table definitions are TypeScript with `pgTable()`. Inferred types feed every query.
- **No code generation** — types are derived from the schema at compile time.
- **Migration-light** — `drizzle-kit push` for dev, generated SQL for prod.

### `serverExternalPackages`

`next.config.ts` lists `@electric-sql/pglite` in `serverExternalPackages` because the WASM payload + native deps must run via Node's `require`, not Next's bundler. Without this flag the build attempts to bundle the WASM and fails.

---

## 8. Security stack

Layered defense — every layer holds even if another fails.

### Layer 1 — Environment validation

`app/lessons/security-env/_lib/env.ts` defines a zod schema; the module throws at import time if any required var is missing or malformed. Imported transitively from the root layout, so:

- `npm run dev` crashes immediately with the field name.
- `npm run build` fails in CI.
- Production never boots with bad config.

### Layer 2 — `server-only` tripwire

Any module that reads `process.env.X` for a secret begins with `import 'server-only'`. If a Client Component accidentally imports it (directly or transitively), Turbopack throws at build time with a clear error pointing to the offending import chain. **Static guarantee against secret leaks.**

### Layer 3 — Static headers (`next.config.ts`)

| Header | Value | Purpose |
| ------ | ----- | ------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS for 1 year |
| `X-Content-Type-Options` | `nosniff` | Block MIME-sniffing |
| `X-Frame-Options` | `DENY` | Legacy clickjacking guard |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy-conscious referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disable unused APIs |
| `X-DNS-Prefetch-Control` | `off` | Block third-party DNS prefetch |

### Layer 4 — Dynamic CSP with per-request nonce

`proxy.ts` generates a fresh nonce per request and writes:
```
Content-Security-Policy: script-src 'self' 'nonce-{NONCE}'; frame-ancestors 'none'; ...
```
In production it's enforced; in dev it's `Content-Security-Policy-Report-Only` so Turbopack HMR works while still logging violations.

The page passes the nonce down to any `<Script>` tag that needs it (e.g. JSON-LD blocks in Lesson 17).

### Layer 5 — HMAC webhook

`/api/webhook` requires:
- An `X-Signature` header containing `HMAC-SHA256(body, WEBHOOK_SECRET)`.
- Comparison via `crypto.timingSafeEqual` (constant time) to prevent timing attacks.
- Rejection within 50ms regardless of payload size.

---

## 9. Performance: fonts, images, assets

### Fonts (Lesson 16)

`next/font/google` self-hosts Inter (sans) and JetBrains Mono (mono). The fonts ship from the same origin as the HTML — no DNS lookup, no third-party request, no FOIT.

The CSS variables `--font-sans` and `--font-mono` are scoped to the lesson layout, then applied via Tailwind's `font-(family-name:--font-mono)` arbitrary syntax.

Inter has `preload: true` (LCP-critical); JetBrains Mono has `preload: false` (only in code blocks).

### Images (Lesson 16)

`next/image` ships a **server image-optimization endpoint** at `/_next/image?url=...&w=...&q=...`. To prevent it from becoming an open image proxy, every remote host must be whitelisted in `images.remotePatterns`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
  ],
},
```

Missing host → build/runtime error "url not allowed", **not** a silent fallback.

### Static assets

Everything under `public/` ships verbatim at the root URL. Hashed asset URLs (`static/<BUILD_ID>/...`) come from Next's build pipeline and get `Cache-Control: public, immutable, max-age=31536000`.

---

## 10. SEO surface

Lesson 17 is the canonical reference. Summary of what the app emits:

### Per-route metadata

```tsx
// Static
export const metadata: Metadata = { title: '...', description: '...' };

// Dynamic (async, can read params)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return { title: post.title, openGraph: { ... } };
}
```

### OG images

`app/opengraph-image.tsx` renders a `<div>` tree that `ImageResponse` converts to PNG via Satori. No headless browser. Edge-runtime friendly.

Per-route overrides are possible by placing an `opengraph-image.tsx` next to the route's `page.tsx`.

### Sitemap + robots

Both are typed:
```ts
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://.../lessons/server-vs-client', priority: 0.8, ... },
    // ...
  ];
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/' }], sitemap: '...' };
}
```

The sitemap iterates the same `dictionaries.ts` modules list, so adding a lesson auto-updates the sitemap.

### JSON-LD

Schema.org Course and Article blocks are emitted from a Server-only `<JsonLd>` component that escapes `</script>` to prevent XSS via injected content.

---

## 11. Build output & deploy

### `.next/` anatomy (Lesson 20)

```
.next/
├── BUILD_ID                            ← hash baked into chunk names
├── prerender-manifest.json             ← static + ISR routes catalog
├── routes-manifest.json                ← routing table
├── app-build-manifest.json             ← chunks per page
├── server/app/<route>/page.html        ← prerendered HTML
├── server/app/<route>/*.js             ← request-time functions
└── static/<BUILD_ID>/...               ← hashed JS/CSS
```

### Output modes

| Mode | What it produces | When to use |
| ---- | ---------------- | ----------- |
| default | `.next/` + `node_modules` required | Vercel, anywhere with Node + npm |
| `standalone` | `.next/standalone/` with only used deps (~80 MB) | Docker, AWS, GCP, self-hosted |
| `export` | `out/index.html`, etc. (no server) | S3, CDN, GitHub Pages — **incompatible with this app** |

### Vercel deployment

The current production deploy uses **default mode**. Vercel auto-detects Next.js and:
1. Runs `next build`
2. Wraps each `λ` route in a Serverless Function (Node)
3. Deploys `proxy.ts` as an Edge Function
4. Uploads `.next/static/*` to the global CDN

Vercel-only env vars available at runtime:
- `VERCEL_ENV` — `'production' | 'preview' | 'development'`
- `VERCEL_REGION` — e.g. `'fra1'`, `'iad1'`
- `VERCEL_URL` — deployment hostname
- `VERCEL_GIT_COMMIT_SHA` — full commit hash
- `VERCEL_GIT_COMMIT_REF` — branch name

---

## 12. File conventions cheat-sheet

```
# Routing
page.tsx                  → renders this URL
layout.tsx                → wraps children (persists across nav)
loading.tsx               → Suspense fallback (auto-wrapped)
error.tsx                 → Error Boundary (must be Client)
not-found.tsx             → renders on notFound()
default.tsx               → fallback for unmatched @slot
route.ts                  → REST handler (GET/POST/...)
template.tsx              → like layout but remounts on nav

# Folder modifiers
_foo/                     → private (NOT a route)
(foo)/                    → route group (NOT in URL)
[foo]/                    → dynamic segment (params.foo: string)
[...foo]/                 → catch-all (params.foo: string[])
[[...foo]]/               → optional catch-all
@foo/                     → parallel route slot
(..)foo/                  → intercepting route (one level up)

# Metadata
metadata export           → static metadata
generateMetadata()        → async metadata
opengraph-image.tsx       → OG image
twitter-image.tsx         → Twitter card image
sitemap.ts                → sitemap.xml
robots.ts                 → robots.txt
manifest.ts               → manifest.webmanifest
icon.tsx                  → favicon variants

# Edge / middleware
proxy.ts (root)           → edge proxy (was middleware.ts in Next ≤ 15)
auth.config.ts            → edge-safe Auth.js half
auth.ts                   → full Auth.js
```

---

For lesson-by-lesson explanations, run the app and read the lessons themselves — they are the canonical documentation.
