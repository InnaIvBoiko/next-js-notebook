# Living Notebook — Next.js 16 / React 19

> Un quaderno interattivo dove ogni rotta è una lezione pratica sull'App Router moderno. Teoria architetturale, codice eseguibile e laboratori di debugging — tutto in una sola app.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/) [![Deploy](https://img.shields.io/badge/Vercel-live-000?logo=vercel)](https://next-js-notebook.vercel.app/)

**🌐 Live:** [next-js-notebook.vercel.app](https://next-js-notebook.vercel.app/)
**📘 Traduzioni:** [English](./README.md) · [Українська](./README-ukr.md)

---

## Indice

- [Cos'è](#cosè)
- [Quick start](#quick-start)
- [I 5 moduli · 20 lezioni](#i-5-moduli--20-lezioni)
- [Stack tecnologico](#stack-tecnologico)
- [Struttura del progetto](#struttura-del-progetto)
- [Variabili d'ambiente](#variabili-dambiente)
- [Scelte architetturali](#scelte-architetturali)
- [Deploy](#deploy)
- [Script](#script)
- [Browser supportati](#browser-supportati)
- [Contribuire](#contribuire)
- [Crediti](#crediti)

---

## Cos'è

Un'**app Next.js 16 reale** dove ogni rotta sotto `/lessons/*` è una lezione autocontenuta. Ogni lezione combina:

1. **Teoria architetturale** — cosa fa l'API, perché esiste, e i trade-off rispetto alle alternative.
2. **Codice funzionante** — la lezione È la demo; nessun snippet separato da copiare.
3. **Laboratorio di debugging** — istruzioni step-by-step per osservare il meccanismo in azione (log a terminale, DevTools → Network, React DevTools, ecc.).

Il quaderno è **trilingue** (Italiano · English · Українська) con uno switcher di lingua persistito in cookie che sopravvive a navigazione e SSR. La lingua base è l'italiano.

**Non è** un sito tutorial, un blog statico o un set di slide. È un'app che lanci in locale con `npm run dev`, navighi nel browser, e rompi con il debugger.

---

## Quick start

**Requisiti**
- Node.js 20+ (usa `fetch` nativo, `node:test`, crypto API moderne)
- npm (il progetto usa `package-lock.json`; pnpm / yarn / bun funzionano ma il lockfile divergerà)

```bash
# 1. installa
git clone https://github.com/InnaIvBoiko/next-js-notebook.git
cd next-js-notebook
npm install

# 2. configura env (vedi .env.example per i valori da inserire)
cp .env.example .env.local
# genera un secret di 32 byte per AUTH_SECRET / WEBHOOK_SECRET:
#   openssl rand -base64 32

# 3. avvia
npm run dev
# apri http://localhost:3000
```

Il dev server usa Turbopack. La prima request a una lezione compila il suo module graph on demand (~200ms a caldo, ~2s a freddo) e poi è cache-ato.

---

## I 5 moduli · 20 lezioni

Ogni lezione è una rotta. Clicca per aprire nel deploy live.

### Modulo 1 · Architettura · le fondamenta dell'App Router
| # | Rotta | Cosa impari |
| - | ----- | ----------- |
| 1 | [`/server-vs-client`](https://next-js-notebook.vercel.app/lessons/server-vs-client) | Server vs Client Components: quali API funzionano dove, hydration boundary, semantica di `'use client'` |
| 2 | [`/routing-basics`](https://next-js-notebook.vercel.app/lessons/routing-basics) | File-system routing, layouts annidati, persistenza dello stato del layout tra navigazioni |
| 3 | [`/dynamic-routes`](https://next-js-notebook.vercel.app/lessons/dynamic-routes) | Segmenti `[id]`, `generateStaticParams`, params tipizzati con `PageProps<>` |
| 4 | [`/loading-and-errors`](https://next-js-notebook.vercel.app/lessons/loading-and-errors) | `loading.tsx` come Suspense boundary, `error.tsx` come Error Boundary, streaming |

### Modulo 2 · Data fetching & cache
| # | Rotta | Cosa impari |
| - | ----- | ----------- |
| 5 | [`/server-fetching`](https://next-js-notebook.vercel.app/lessons/server-fetching) | Server Components `async`, `Promise.all` per fetch paralleli, `cookies()`/`headers()` come dati request-time |
| 6 | [`/caching`](https://next-js-notebook.vercel.app/lessons/caching) | Cache Components (`'use cache'`), `cacheLife`/`cacheTag`, React `cache()` per memoizzazione per-request |
| 7 | [`/server-actions`](https://next-js-notebook.vercel.app/lessons/server-actions) | Funzioni `'use server'`, form actions, `revalidatePath` / `revalidateTag` |
| 8 | [`/action-pending`](https://next-js-notebook.vercel.app/lessons/action-pending) | `useFormStatus`, `useActionState`, `useOptimistic` |

### Modulo 3 · Stato & pattern client
| # | Rotta | Cosa impari |
| - | ----- | ----------- |
| 9 | [`/context-provider`](https://next-js-notebook.vercel.app/lessons/context-provider) | Pattern Server-into-Client, split del Context in Read + Write provider per evitare re-render spuri |
| 10 | [`/zustand-store`](https://next-js-notebook.vercel.app/lessons/zustand-store) | Zustand con middleware `persist`, selectors, hydration SSR |
| 11 | [`/tanstack-query`](https://next-js-notebook.vercel.app/lessons/tanstack-query) | `useQuery`/`useMutation`, polling con `refetchInterval`, Devtools |

### Modulo 4 · Full-stack
| # | Rotta | Cosa impari |
| -- | ----- | ----------- |
| 12 | [`/api-routes`](https://next-js-notebook.vercel.app/lessons/api-routes) | Route Handlers (`route.ts`), segmenti dinamici, risposte JSON / Streaming |
| 13 | [`/database-orm`](https://next-js-notebook.vercel.app/lessons/database-orm) | Drizzle ORM + PGlite (Postgres WASM in-process), schema tipizzato, migrazioni |
| 14 | [`/auth-setup`](https://next-js-notebook.vercel.app/lessons/auth-setup) | Auth.js v5: split config edge-safe, Credentials con bcrypt, DrizzleAdapter |
| 15 | [`/middleware-logic`](https://next-js-notebook.vercel.app/lessons/middleware-logic) | `proxy.ts` (rinominato da `middleware.ts` in Next 16): auth gating, header injection, redirect |

### Modulo 5 · Performance & sicurezza
| # | Rotta | Cosa impari |
| -- | ----- | ----------- |
| 16 | [`/optimization-media`](https://next-js-notebook.vercel.app/lessons/optimization-media) | `next/image` (3 sorgenti × 2 layout), `next/font/google` self-hosted (Inter + JetBrains Mono) |
| 17 | [`/seo-metadata`](https://next-js-notebook.vercel.app/lessons/seo-metadata) | `metadata` statico + dinamico, `generateMetadata`, `ImageResponse` per OG, `sitemap.ts` / `robots.ts` tipizzati, JSON-LD |
| 18 | [`/security-env`](https://next-js-notebook.vercel.app/lessons/security-env) | env tipizzato con zod al boot, tripwire `server-only`, security headers statici, CSP nonce nel proxy, webhook HMAC |
| 19 | [`/advanced-routing`](https://next-js-notebook.vercel.app/lessons/advanced-routing) | Route groups `(group)`, parallel routes `@slot`, intercepting routes `(..)folder`, catch-all `[...path]` |
| 20 | [`/deploy-ready`](https://next-js-notebook.vercel.app/lessons/deploy-ready) | Anatomia di `next build`, runtime Node vs Edge, output modes, pipeline CI/CD, pre-flight checklist |

---

## Stack tecnologico

| Layer | Scelta | Perché |
| ----- | ------ | ------ |
| Framework | **Next.js 16.2** (App Router) | Tutto il senso del quaderno |
| UI | **React 19.2** | Server Components, `use()`, `useOptimistic` |
| Linguaggio | **TypeScript 5** | Lezioni completamente tipizzate, niente `any` |
| Styling | **Tailwind CSS v4** | Zero-config, CSS-first, più veloce della v3 |
| Stato (client) | **Zustand 5** | Minimal, no boilerplate; Lezione 10 |
| Cache server | **TanStack Query 5** | Usato nella Lezione 11 (client cache) |
| ORM | **Drizzle ORM 0.45** | SQL type-safe, nessuna astrazione di troppo |
| Database | **@electric-sql/pglite** | Postgres WASM in-process — DB demo zero-install |
| Auth | **Auth.js v5** (next-auth beta) | Session edge-compatible, OAuth + Credentials |
| Validazione | **zod 4** | Schema env (Lezione 18), payload webhook |
| Hashing | **bcryptjs** | Provider Credentials (Lezione 14) |
| Guard di confine | **server-only** | Tripwire per import client accidentali |

---

## Struttura del progetto

```
.
├── app/                              # Root dell'App Router
│   ├── _components/                  # Componenti della home
│   │   └── notebook-shell.tsx        # Hero + roadmap + footer
│   ├── _lib/                         # Condivisi (prefisso gitignorato dal routing)
│   │   └── dictionaries.ts           # Dizionario IT/EN/UK della home
│   ├── api/                          # Route Handlers
│   │   ├── auth/[...nextauth]/       # Auth.js
│   │   ├── echo/[...path]/           # Demo catch-all (Lezione 12)
│   │   ├── items/                    # REST mock (Lezione 12)
│   │   ├── me/notes/                 # Protetto (Lezione 14)
│   │   ├── notes/                    # CRUD (Lezione 13)
│   │   ├── now-static/               # Rotta cache-ata (Lezione 6)
│   │   ├── now-dynamic/              # Rotta non cache-ata (Lezione 6)
│   │   ├── runtime-probe/            # Lezione 20
│   │   ├── server-time/              # Sorgente di polling (Lezione 11)
│   │   └── webhook/                  # POST firmato HMAC (Lezione 18)
│   ├── lessons/                      # Ogni lezione è una rotta
│   │   ├── _components/              # Componenti header condivisi
│   │   │   ├── lang-bar.tsx          # Switcher IT/EN/UK
│   │   │   ├── lang-provider.tsx     # Context cookie-backed
│   │   │   ├── persistence-probe.tsx # Demo "layout clicks: N"
│   │   │   └── render-counter.tsx
│   │   ├── layout.tsx                # Shell di /lessons/*
│   │   ├── [lezione]/                # Una cartella per lezione
│   │   │   ├── page.tsx              # Server entry
│   │   │   ├── _components/          # UI locale della lezione
│   │   │   └── _lib/                 # i18n e helper locali
│   │   └── …
│   ├── opengraph-image.tsx           # OG image di default (Lezione 17)
│   ├── robots.ts                     # robots.txt tipizzato (Lezione 17)
│   ├── sitemap.ts                    # sitemap tipizzata (Lezione 17)
│   └── page.tsx                      # Home (landing del quaderno)
├── public/                           # Asset statici (favicon, immagini)
├── auth.ts                           # Config full Auth.js (Node-only)
├── auth.config.ts                    # Config edge-safe Auth.js
├── proxy.ts                          # Edge proxy (rinominato da middleware.ts)
├── next.config.ts                    # Cache Components + headers + immagini
├── eslint.config.mjs                 # Flat config
├── package.json
├── tsconfig.json
├── .env.example                      # Template env (committalo)
├── .env.local                        # Secret veri (MAI committare)
├── README.md                         # Inglese
├── README-it.md                      # Questo file
├── README-ukr.md                     # Ucraino
├── ARCHITECTURE.md                   # Note tecniche approfondite
└── CONTRIBUTING.md                   # Come estendere il quaderno
```

L'underscore iniziale su `_components/` / `_lib/` li marca come **private folders** — Next.js li ignora per il routing (quindi non diventano URL).

---

## Variabili d'ambiente

Copia `.env.example` in `.env.local` e riempi i valori. **`.env.local` è gitignorato.**

| Variabile | Obbligatoria | Scopo |
| --------- | ------------ | ----- |
| `WEBHOOK_SECRET` | ✅ | Firma HMAC per `/api/webhook` (Lezione 18). Min 16 caratteri. |
| `AUTH_SECRET` | ✅ | Cifratura della session di Auth.js. Min 32 caratteri. |
| `AUTH_GITHUB_ID` | opzionale | Client id GitHub OAuth (Lezione 14) |
| `AUTH_GITHUB_SECRET` | opzionale | Client secret GitHub OAuth |
| `NEXT_PUBLIC_SITE_NAME` | opzionale | Default `"Living Notebook"` |
| `NEXT_PUBLIC_FEATURE_BETA` | opzionale | `"true"` per abilitare feature beta; default `false` |

Qualunque variabile con prefisso `NEXT_PUBLIC_` viene inlinata nel bundle del browser. **Mai mettere un secret lì.**

La validazione avviene al module load: se manca una variabile obbligatoria o è malformata, il dev server e `npm run build` crashano con il nome esatto del campo. Vedi [`app/lessons/security-env/_lib/env.ts`](app/lessons/security-env/_lib/env.ts).

Generare i secret:
```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -hex 32      # WEBHOOK_SECRET
```

---

## Scelte architetturali

Riassunto delle scelte di design che fanno l'app quello che è. Il deep-dive completo è in [ARCHITECTURE.md](./ARCHITECTURE.md).

### Cache Components
`next.config.ts` abilita `cacheComponents: true`. Le pagine sono prerenderizzate parzialmente: una shell statica parte dal CDN immediatamente, le parti dinamiche streamano dietro boundary `<Suspense>`. L'output del build mostra `◐` (partial) invece di `○` (static) o `λ` (dynamic).

Conseguenza: **i layout non possono leggere dati request-time non-cached** se non wrappati in `<Suspense>`. Il `/lessons/layout.tsx` wrappa la lettura del cookie in un boundary Suspense per questo motivo.

### Edge proxy
`proxy.ts` (rinominato da `middleware.ts` in Next 16) gira sul runtime Edge per ogni request matched. Tre concerns sovrapposti:
1. **Auth** — `auth()` di Auth.js refresha i session cookie e inietta `req.auth`.
2. **Locale** — legge il cookie `nb-lang`; se manca, sniffa `Accept-Language` per `it`/`en`/`uk`, riscrive il cookie. È ciò che permette al `<LangProvider>` di renderizzare la lingua corretta **server-side** senza mismatch SSR/CSR.
3. **Gating** — `/lessons/middleware-logic/protected*` richiede il cookie `nb-demo-pass` o redirige (307).
4. **Headers** — inietta `x-pathname` e `x-geo-country` per gli RSC downstream.

### i18n via cookie
Il quaderno ha la sua implementazione i18n (no `next-intl` / `next-i18next`):
- I file dizionario sono oggetti TypeScript con chiavi `it` / `en` / `uk`.
- Il `<LangProvider>` legge il cookie `nb-lang` via `cookies()` nel layout.
- Il `<LangBar>` scrive il cookie allo switch utente + aggiorna il Context.
- I Server Components nelle sub-rotte leggono il cookie direttamente (non possono usare `useLang()`).

Trade-off: type-safety totale, zero dipendenze runtime, ma niente estrazione automatizzata o helper di pluralizzazione.

### Split Auth.js v5
- `auth.config.ts` — edge-safe (no bcrypt, no DB). Importato da `proxy.ts`.
- `auth.ts` — config full (Credentials + DrizzleAdapter + bcrypt). Importato dai Server Components.

Senza questo split il proxy crasherebbe a cold start perché bcrypt richiede Node.

### Layer di sicurezza
- **Validazione env** al boot via zod — env sbagliato → il processo non parte.
- **`server-only`** tripwire su ogni modulo che tocca secret — Turbopack throwa al build se un Client island li importa accidentalmente.
- **Security headers statici** in `next.config.ts`: HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **CSP con nonce per-request** generato in `proxy.ts` (`Report-Only` in dev così l'HMR sopravvive, enforced in produzione).
- **Webhook HMAC** con `crypto.timingSafeEqual` per prevenire timing attack.

### Performance
- **`next/image`** con remote patterns whitelisted (`picsum.photos`) → niente open image proxy.
- **`next/font/google`** self-hosting Inter + JetBrains Mono via CSS variables — zero richieste esterne, niente FOIT.
- **Static-first**: 15 lezioni su 20 prerenderizzano; solo `/api/*` e rotte auth-gated sono dinamiche.

---

## Deploy

### Vercel (zero-config)
```bash
vercel
```
Il quaderno gira come singolo progetto Vercel. Push su `main` → deploy production. Push su qualunque branch → preview deploy. Il deploy attuale è su [next-js-notebook.vercel.app](https://next-js-notebook.vercel.app/).

Setta le stesse env vars di `.env.local` nei project settings di Vercel (scope Production + Preview).

### Docker (self-host)
Aggiungi `output: 'standalone'` a [`next.config.ts`](next.config.ts), poi:
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

Il mode standalone produce un albero che contiene solo le dipendenze davvero usate (~80 MB vs ~800 MB di `node_modules`).

### Static export
Non supportato: l'app usa API routes, `cookies()`, Server Actions e Auth.js — tutto incompatibile con `output: 'export'`. Vedi Lezione 20.

---

## Script

| Comando | Cosa fa |
| ------- | ------- |
| `npm run dev` | Turbopack dev server sulla porta 3000 |
| `npm run build` | Build di produzione → `.next/` |
| `npm start` | Servi il build di produzione (esegui `npm run build` prima) |
| `npm run lint` | ESLint flat config |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI) |

Loop pre-commit tipico:
```bash
npm run lint && npx tsc --noEmit && npm run build
```

---

## Browser supportati

- Chrome / Edge ≥ 110
- Firefox ≥ 110
- Safari ≥ 16

L'app usa CSS nesting, `:has()`, container queries, e logical properties moderne. IE / Safari ≤ 15 non sono supportati.

Testato responsive fino a **320 px** di larghezza (la viewport comune più stretta — iPhone SE / Galaxy Fold outer).

---

## Contribuire

Vedi [CONTRIBUTING.md](./CONTRIBUTING.md). Versione corta: apri prima una issue se vuoi aggiungere una lezione, segui il layout esistente delle cartelle (`page.tsx` → `_components/index-view.tsx` → `_lib/content.ts` per l'i18n), e lancia `npm run lint && npx tsc --noEmit && npm run build` prima di pushare.

---

## Crediti

Progettato e sviluppato da **Inna Boiko**.

- 📧 [inna_boiko@libero.it](mailto:inna_boiko@libero.it)
- 💼 [LinkedIn](https://www.linkedin.com/in/inna-boiko/)
- 🐙 [GitHub @InnaIvBoiko](https://github.com/InnaIvBoiko)

Costruito usando la documentazione ufficiale di Next.js, React e Vercel come riferimento principale. La struttura delle lezioni si ispira al corso [Learn Next.js](https://nextjs.org/learn) di Vercel andando significativamente più in profondità sui pattern di produzione (sicurezza, observability, runtime edge, deploy).

---

## Licenza

[MIT](./LICENSE) — sentiti libero di fare fork, adattare e usare come risorsa di studio. Attribuzione apprezzata ma non obbligatoria.
