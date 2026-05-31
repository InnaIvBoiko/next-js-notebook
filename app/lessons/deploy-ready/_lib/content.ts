// =============================================================================
// app/lessons/deploy-ready/_lib/content.ts
// Inline i18n dictionary for Module 5 · Lesson 5 (Deploy-Ready).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    liveDeploy: {
        heading: string;
        description: string;
        openLabel: string;
        url: string;
    };
    sections: {
        buildAnatomy: Section;
        runtime: Section;
        outputModes: Section;
        ciPipeline: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        buildViewer: {
            badge: string;
            title: string;
            description: string;
            noBuildHeading: string;
            noBuildHint: string;
            buildIdLabel: string;
            generatedAtLabel: string;
            routesHeading: string;
            staticLabel: string;
            dynamicLabel: string;
            isrLabel: string;
            countLabel: string;
        };
        runtime: {
            badge: string;
            title: string;
            description: string;
            localHeading: string;
            liveHeading: string;
            refreshLabel: string;
            loadingLabel: string;
            errorLabel: string;
            fields: {
                runtime: string;
                nodeVersion: string;
                timestamp: string;
                uptime: string;
                nodeEnv: string;
                vercelEnv: string;
                vercelRegion: string;
                vercelSha: string;
                vercelBranch: string;
                vercelUrl: string;
            };
            notSet: string;
            localHint: string;
            liveHint: string;
        };
        preflight: {
            badge: string;
            title: string;
            description: string;
            okLabel: string;
            missingLabel: string;
            scoreLabel: string;
            items: { label: string; hint: string }[];
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 5 · Lezione 5',
    title: 'Deploy-Ready',
    intro: "Le 19 lezioni precedenti hanno costruito un'app. Questa la spedisce. `next build` non è una black-box: produce un albero di file con una semantica precisa — quali rotte sono **statiche** (HTML prerenderizzato, servito dal CDN), quali **dinamiche** (la funzione gira a ogni request), quali **ibride** con Cache Components (`◐` = shell statico + buchi suspended che si idratano a runtime). Sopra a tutto: scegli il **runtime** (Node vs Edge) per rotta, l'**output mode** (default | standalone | export) per il target di hosting, e una **CI** che blocca i merge se lint/typecheck/build falliscono. Il deploy di questo notebook è live: l'URL Vercel sotto è esattamente quello che `npm run build && npm start` produce in locale.",
    liveDeploy: {
        heading: 'Deploy live di questo notebook',
        description:
            'Questa app è già in produzione su Vercel. Apri l\'URL in un\'altra tab e tieni a portata di mano la DevTools → Network: ogni concetto qui sotto si vede nei response headers (`x-vercel-cache`, `x-vercel-id`, `x-matched-path`).',
        openLabel: 'Apri il deploy live ↗',
        url: 'https://next-js-notebook.vercel.app/',
    },
    sections: {
        buildAnatomy: {
            heading: '§1 Anatomia di `next build`',
            description:
                "`next build` legge `app/**`, esegue ogni Server Component, e produce in `.next/` un albero ben definito. I file chiave: `.next/BUILD_ID` (hash univoco del build, finisce nei nomi dei chunk), `.next/prerender-manifest.json` (catalogo delle rotte prerenderizzate con `initialRevalidate` per ISR), `.next/server/app/**/page.html` (l'HTML statico per le rotte ○), `.next/server/app/**/*.js` (le funzioni per le rotte λ). A terminale vedi una tabella con i marker: **○** statica (HTML al build), **λ** dinamica (funzione per request), **◐** Cache Components (shell statico + buchi suspended). Cache Components è il default in Next 16 — è quello che permette a una pagina di essere parzialmente statica.",
            snippet: `# Quello che vedi al terminale dopo \`npm run build\`:
Route (app)                              Size  First Load JS
┌ ○ /                                  1.2 kB        102 kB    ← statica
├ ◐ /lessons/server-fetching             8 kB        109 kB    ← Cache Components
├ ◐ /lessons/seo-metadata/posts/[slug]  3 kB        104 kB    ← shell statico + slug dinamico
├ λ /api/runtime-probe                  0 B         0 kB      ← route handler
└ λ /api/webhook                        0 B         0 kB      ← POST handler

# Quello che esiste in .next/ dopo il build:
.next/
├── BUILD_ID                            ← hash es. "kQVx9_2-mP4..."
├── prerender-manifest.json             ← rotte prerenderizzate + ISR
├── routes-manifest.json                ← routing table
├── app-build-manifest.json             ← chunk per pagina
├── server/app/page.html                ← homepage prerenderizzata
└── static/<BUILD_ID>/...               ← JS/CSS con hash`,
        },
        runtime: {
            heading: '§2 Node vs Edge runtime',
            description:
                "Ogni rotta può girare in due ambienti molto diversi. **Node** (default): server completo con `fs`, driver DB nativi, Buffer, accesso a `process.env` completo, cold start ~100ms, gira nelle region tradizionali. **Edge**: V8 isolate al confine della CDN, cold start ~5ms, gira in 35+ region simultaneamente, MA niente Node API (no `fs`, no driver nativi, no `Buffer` se non importato), `setTimeout` limitato, runtime ridotto. Si sceglie con `export const runtime = 'edge' | 'nodejs'` dentro la rotta. Regola pratica: **edge** per cose stateless e geo-distribuite (middleware, redirect, A/B testing, header injection — il nostro `proxy.ts`), **node** per qualunque cosa parli con DB o usi librerie native (la nostra `/api/auth/*` con PGlite, il `/api/webhook` con crypto). Sbagliare runtime non è graceful: l'edge throwa al cold start con `Module not found` su `node:fs`.",
            snippet: `// app/api/runtime-probe/route.ts — Node (default, ha bisogno di process.*)
export async function GET() {
  return Response.json({
    nodeVersion: process.versions?.node,
    uptime: process.uptime(),
    vercelRegion: process.env.VERCEL_REGION,
  });
}

// app/api/geo/route.ts — Edge (geo-distribuito, no Node API)
export const runtime = 'edge';

export async function GET(req: Request) {
  // su Vercel Edge: req.geo è popolato dalla CDN
  return Response.json({ country: req.headers.get('x-vercel-ip-country') });
}

// proxy.ts gira EDGE di default (è il middleware) — non puoi importare
// drizzle, pglite, bcrypt qui dentro. Niente fs. Solo Web APIs.`,
        },
        outputModes: {
            heading: '§3 Output modes: default | standalone | export',
            description:
                "`next build` produce sempre `.next/`, ma il **modo** decide cosa serve per servirlo. **default** (`output` non settato): hai bisogno di Node + `node_modules` + `npm start`. È quello che Vercel usa. **standalone** (`output: 'standalone'`): Next copia SOLO le dipendenze davvero usate in `.next/standalone/`, producendo un'immagine Docker da ~80MB invece di 800MB. È lo standard per AWS/GCP/self-hosted. **export** (`output: 'export'`): l'app diventa pure HTML statico in `out/`, niente runtime — caricabile su S3/CDN. Funziona SOLO se l'app è 100% statica: niente API routes, niente `cookies()`, niente Server Actions, niente Cache Components dinamici. Per questo notebook impossibile (abbiamo auth, API, cookie). Per una landing page è perfetto.",
            snippet: `// next.config.ts — switch tra i tre modi:

// Default (Vercel) — non aggiungere niente
const config: NextConfig = {};

// Standalone (Docker) — produce .next/standalone/server.js
const config: NextConfig = { output: 'standalone' };

// Dockerfile minimo:
//   FROM node:20-alpine
//   COPY .next/standalone .
//   COPY .next/static .next/static
//   COPY public public
//   CMD ["node", "server.js"]

// Static export (S3/CDN) — produce out/index.html, out/about.html, ...
const config: NextConfig = { output: 'export' };

// ⚠️ Con 'export' queste rompono al build:
//   - app/api/**             (no server)
//   - cookies(), headers()   (no request)
//   - server actions          (no POST)
//   - dynamic routes senza generateStaticParams`,
        },
        ciPipeline: {
            heading: "§4 CI/CD: il merge non passa se il build non passa",
            description:
                "Una pipeline di base ha 4 step **in ordine**: `lint` (eslint catches 80% degli errori stilistici), `typecheck` (`tsc --noEmit` — Next 16 lo fa già in `next build`, ma in CI standalone è più veloce isolato), `build` (`next build` — fallisce su env mancanti se hai lo schema zod della Lezione 3), `test` (se ne hai). Su Vercel questo è automatico: ogni push apre un **preview deployment** con il proprio URL, ogni merge in `main` triggera il **production deployment**. Su self-hosted usi GitHub Actions con un YAML come quello sotto. Il fatto chiave: il **build genera lo stesso `.next/` indipendentemente da dove gira**, quindi puoi buildare in CI, taggare l'artefatto, e fare deploy separato — il pattern \"build once, deploy many\".",
            snippet: `# .github/workflows/ci.yml
name: CI
on: [pull_request, push]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
        env:
          # gli env devono essere VERI valori, non placeholder —
          # lo schema zod della Lezione 3 fallirebbe il boot
          WEBHOOK_SECRET: \${{ secrets.WEBHOOK_SECRET }}
          AUTH_SECRET: \${{ secrets.AUTH_SECRET }}
          NEXT_PUBLIC_SITE_NAME: Living Notebook
          NEXT_PUBLIC_FEATURE_BETA: false`,
        },
    },
    decisionTable: {
        heading: '§5 Decision table: scenario → scelta',
        intro:
            "Cinque scelte ricorrenti. Salva la tabella, evita di rifare la ricerca ogni volta.",
        rows: [
            {
                scenario: 'Landing page marketing, contenuto fisso, vuoi CDN puro',
                choice: "output: 'export' + S3/Cloudflare Pages",
            },
            {
                scenario: 'SaaS con auth, DB, Server Actions — il caso classico',
                choice: 'default output + Vercel (zero config) o standalone + Docker',
            },
            {
                scenario: 'API geo-distribuita, no DB, latenza < 50ms ovunque',
                choice: "runtime = 'edge' su tutte le route handler",
            },
            {
                scenario: 'Webhook che firma con HMAC + parla con Postgres',
                choice: "runtime = 'nodejs' (Edge non ha crypto.timingSafeEqual + pg)",
            },
            {
                scenario: 'Self-host AWS/GCP, vuoi container piccolo',
                choice: "output: 'standalone' + multi-stage Dockerfile (node:alpine)",
            },
            {
                scenario: 'Preview deployment per ogni PR',
                choice: 'Vercel (built-in) o GH Actions + Cloudflare Pages',
            },
            {
                scenario: 'Build deve fallire se manca un env var',
                choice: "Schema zod in _lib/env.ts importato dal layout root",
            },
        ],
    },
    labs: {
        heading: 'Laboratorio',
        buildViewer: {
            badge: 'Lab 1',
            title: 'Build-marker viewer',
            description:
                "Questo lab legge `.next/prerender-manifest.json` dal filesystem e mostra cosa Next ha effettivamente prerenderizzato. Se non vedi nulla: esegui `npm run build` (dev mode non scrive questo file). Le rotte con `initialRevalidate: false` sono **statiche** (○), quelle con un numero sono **ISR**, quelle assenti dal manifest sono **dinamiche** (λ) o **Cache Components** (◐).",
            noBuildHeading: 'Nessun build trovato',
            noBuildHint:
                'Esegui `npm run build` nel terminal, poi ricarica questa pagina. Il manifest viene scritto a `.next/prerender-manifest.json`.',
            buildIdLabel: 'BUILD_ID',
            generatedAtLabel: 'Generato il',
            routesHeading: 'Rotte prerenderizzate',
            staticLabel: 'STATIC',
            dynamicLabel: 'DINAMICA',
            isrLabel: 'ISR',
            countLabel: 'rotte',
        },
        runtime: {
            badge: 'Lab 2',
            title: 'Runtime probe — local vs live',
            description:
                "Lo stesso route handler `/api/runtime-probe` gira sia in locale sia sul deploy Vercel. La sinistra mostra il tuo Node locale; la destra fetcha il deploy live e mostra le var `VERCEL_*` popolate solo in produzione. È la prova visiva di \"build once, deploy many\": **lo stesso codice**, due ambienti.",
            localHeading: 'Locale (questo processo)',
            liveHeading: 'Live (Vercel deploy)',
            refreshLabel: 'Ricarica',
            loadingLabel: 'Caricamento…',
            errorLabel: 'Errore di fetch',
            fields: {
                runtime: 'runtime',
                nodeVersion: 'Node version',
                timestamp: 'timestamp',
                uptime: 'uptime (s)',
                nodeEnv: 'NODE_ENV',
                vercelEnv: 'VERCEL_ENV',
                vercelRegion: 'VERCEL_REGION',
                vercelSha: 'commit SHA',
                vercelBranch: 'branch',
                vercelUrl: 'VERCEL_URL',
            },
            notSet: '— non settato',
            localHint:
                'In dev, le var VERCEL_* sono `null`: non sei su Vercel.',
            liveHint:
                'In produzione le VERCEL_* sono popolate dalla piattaforma — niente codice nostro le imposta.',
        },
        preflight: {
            badge: 'Lab 3',
            title: 'Pre-flight checklist (auto-verificata)',
            description:
                "Il server controlla la presenza/assenza dei file chiave del notebook e ti dice se sei pronto per spedire. Verde = trovato, rosso = manca. Non sostituisce la review umana, ma intercetta la classe di errori \"ho dimenticato di committare X\" che è il 70% degli incidenti di deploy.",
            okLabel: 'OK',
            missingLabel: 'manca',
            scoreLabel: 'check superati',
            items: [
                {
                    label: 'Schema env validato con zod',
                    hint: 'app/lessons/security-env/_lib/env.ts',
                },
                {
                    label: "Tripwire `server-only` su moduli con secret",
                    hint: 'app/lessons/security-env/_lib/server-only-secret.ts',
                },
                {
                    label: 'Edge proxy attivo (CSP nonce, locale sniff)',
                    hint: 'proxy.ts',
                },
                {
                    label: 'Static security headers in next.config.ts',
                    hint: 'HSTS, X-Frame-Options, Referrer-Policy',
                },
                {
                    label: 'images.remotePatterns whitelistato',
                    hint: 'next.config.ts → no open image proxy',
                },
                {
                    label: 'Sitemap + robots.txt + metadata',
                    hint: 'app/sitemap.ts + app/robots.ts',
                },
                {
                    label: 'OG image generata server-side',
                    hint: 'app/opengraph-image.tsx',
                },
                {
                    label: 'Cache Components abilitato',
                    hint: 'next.config.ts → cacheComponents: true',
                },
                {
                    label: 'Auth.js configurato',
                    hint: 'auth.ts + auth.config.ts',
                },
                {
                    label: 'README presente',
                    hint: 'README.md — cosa fa il progetto in 5 righe',
                },
            ],
        },
    },
    debug: {
        heading: 'Debugging Lab',
        description:
            'Tre cose da osservare per chiudere il cerchio dev → build → deploy.',
        steps: [
            '1) Apri il terminal nella root del progetto: `npm run build`. Leggi la tabella che Next stampa alla fine — annota quali rotte hanno il marker ○, ◐, λ. Confronta con quello che il Lab 1 mostra dopo il refresh.',
            "2) Ricarica `/lessons/deploy-ready`. Il Lab 1 ora popola la lista delle rotte prerenderizzate dal manifest. Il Lab 2 (sinistra) mostra il tuo Node version, il PID, le var VERCEL_* a `null`.",
            "3) Apri `https://next-js-notebook.vercel.app/lessons/deploy-ready` in una tab. Il Lab 2 (destra) ora ha le VERCEL_* popolate (env=production, region=fra1 o simile, SHA del commit). DevTools → Network sull'URL Vercel: osserva `x-vercel-cache: HIT|MISS|STALE`, `x-vercel-id` (region + request id), `x-matched-path` (la rotta che ha risolto). Sono gli header che ti diranno se la CDN sta servendo dal cache o no.",
            '4) Apri `.next/prerender-manifest.json` con `cat .next/prerender-manifest.json | jq` (o aprilo nell\'editor). Cerca una rotta in `routes`: vedrai `initialRevalidate`, `srcRoute`, `dataRoute` — è la firma esatta che Vercel/Node-server usa per decidere cache + revalidation.',
            "5) Esegui `du -sh .next .next/standalone 2>/dev/null` — la differenza tra default e standalone è ~10×. Se cambiassi `next.config.ts` a `output: 'standalone'` e rifabbricassi, vedresti il secondo numero.",
        ],
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 5 · Lesson 5',
    title: 'Deploy-Ready',
    intro: "The previous 19 lessons built an app. This one ships it. `next build` is not a black box: it produces a tree of files with precise semantics — which routes are **static** (HTML prerendered, served from the CDN), which are **dynamic** (function runs on every request), which are **hybrid** with Cache Components (`◐` = static shell + suspended holes that hydrate at runtime). On top of that: pick the **runtime** (Node vs Edge) per route, the **output mode** (default | standalone | export) for your hosting target, and a **CI** that blocks merges when lint/typecheck/build fail. This notebook's deploy is live: the Vercel URL below is exactly what `npm run build && npm start` produces locally.",
    liveDeploy: {
        heading: 'Live deploy of this notebook',
        description:
            'This app is already in production on Vercel. Open the URL in another tab and keep DevTools → Network handy: every concept below is visible in response headers (`x-vercel-cache`, `x-vercel-id`, `x-matched-path`).',
        openLabel: 'Open the live deploy ↗',
        url: 'https://next-js-notebook.vercel.app/',
    },
    sections: {
        buildAnatomy: {
            heading: '§1 Anatomy of `next build`',
            description:
                "`next build` reads `app/**`, executes every Server Component, and produces a well-defined tree under `.next/`. The key files: `.next/BUILD_ID` (unique build hash, baked into chunk names), `.next/prerender-manifest.json` (catalog of prerendered routes with `initialRevalidate` for ISR), `.next/server/app/**/page.html` (static HTML for ○ routes), `.next/server/app/**/*.js` (functions for λ routes). In the terminal you see a table with markers: **○** static (HTML at build), **λ** dynamic (function per request), **◐** Cache Components (static shell + suspended holes). Cache Components is the default in Next 16 — that's what lets a page be partially static.",
            snippet: `# What you see in the terminal after \`npm run build\`:
Route (app)                              Size  First Load JS
┌ ○ /                                  1.2 kB        102 kB    ← static
├ ◐ /lessons/server-fetching             8 kB        109 kB    ← Cache Components
├ ◐ /lessons/seo-metadata/posts/[slug]  3 kB        104 kB    ← static shell + dynamic slug
├ λ /api/runtime-probe                  0 B         0 kB      ← route handler
└ λ /api/webhook                        0 B         0 kB      ← POST handler

# What exists in .next/ after the build:
.next/
├── BUILD_ID                            ← hash e.g. "kQVx9_2-mP4..."
├── prerender-manifest.json             ← prerendered routes + ISR
├── routes-manifest.json                ← routing table
├── app-build-manifest.json             ← chunks per page
├── server/app/page.html                ← homepage prerendered
└── static/<BUILD_ID>/...               ← hashed JS/CSS`,
        },
        runtime: {
            heading: '§2 Node vs Edge runtime',
            description:
                "Every route can run in two very different environments. **Node** (default): full server with `fs`, native DB drivers, Buffer, full `process.env` access, ~100ms cold start, runs in traditional regions. **Edge**: V8 isolate at the CDN edge, ~5ms cold start, runs in 35+ regions simultaneously, BUT no Node API (no `fs`, no native drivers, no `Buffer` unless imported), limited `setTimeout`, slimmer runtime. Pick with `export const runtime = 'edge' | 'nodejs'` inside the route. Rule of thumb: **edge** for stateless and geo-distributed things (middleware, redirects, A/B testing, header injection — our `proxy.ts`), **node** for anything talking to a DB or using native libraries (our `/api/auth/*` with PGlite, our `/api/webhook` with crypto). Picking the wrong runtime is not graceful: edge will throw at cold start with `Module not found` on `node:fs`.",
            snippet: `// app/api/runtime-probe/route.ts — Node (default, needs process.*)
export async function GET() {
  return Response.json({
    nodeVersion: process.versions?.node,
    uptime: process.uptime(),
    vercelRegion: process.env.VERCEL_REGION,
  });
}

// app/api/geo/route.ts — Edge (geo-distributed, no Node API)
export const runtime = 'edge';

export async function GET(req: Request) {
  // on Vercel Edge: req.geo is populated by the CDN
  return Response.json({ country: req.headers.get('x-vercel-ip-country') });
}

// proxy.ts runs EDGE by default (it IS the middleware) — you cannot import
// drizzle, pglite, bcrypt in here. No fs. Web APIs only.`,
        },
        outputModes: {
            heading: '§3 Output modes: default | standalone | export',
            description:
                "`next build` always produces `.next/`, but the **mode** decides what's needed to serve it. **default** (`output` unset): you need Node + `node_modules` + `npm start`. That's what Vercel uses. **standalone** (`output: 'standalone'`): Next copies ONLY the dependencies actually used into `.next/standalone/`, producing a ~80MB Docker image instead of 800MB. It's the standard for AWS/GCP/self-hosted. **export** (`output: 'export'`): the app becomes pure static HTML in `out/`, no runtime — uploadable to S3/CDN. Works ONLY if the app is 100% static: no API routes, no `cookies()`, no Server Actions, no dynamic Cache Components. Impossible for this notebook (we have auth, API, cookies). Perfect for a landing page.",
            snippet: `// next.config.ts — switch between the three modes:

// Default (Vercel) — add nothing
const config: NextConfig = {};

// Standalone (Docker) — produces .next/standalone/server.js
const config: NextConfig = { output: 'standalone' };

// Minimal Dockerfile:
//   FROM node:20-alpine
//   COPY .next/standalone .
//   COPY .next/static .next/static
//   COPY public public
//   CMD ["node", "server.js"]

// Static export (S3/CDN) — produces out/index.html, out/about.html, ...
const config: NextConfig = { output: 'export' };

// ⚠️ With 'export' these break at build:
//   - app/api/**             (no server)
//   - cookies(), headers()   (no request)
//   - server actions          (no POST)
//   - dynamic routes without generateStaticParams`,
        },
        ciPipeline: {
            heading: "§4 CI/CD: the merge doesn't pass if the build doesn't pass",
            description:
                "A basic pipeline has 4 steps **in order**: `lint` (eslint catches 80% of stylistic mistakes), `typecheck` (`tsc --noEmit` — Next 16 already does this in `next build`, but in standalone CI it's faster in isolation), `build` (`next build` — fails on missing env if you have the zod schema from Lesson 3), `test` (if you have any). On Vercel this is automatic: every push opens a **preview deployment** with its own URL, every merge to `main` triggers the **production deployment**. Self-hosted, you use GitHub Actions with a YAML like the one below. The key fact: the **build produces the same `.next/` regardless of where it runs**, so you can build in CI, tag the artifact, and deploy separately — the classic \"build once, deploy many\" pattern.",
            snippet: `# .github/workflows/ci.yml
name: CI
on: [pull_request, push]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
        env:
          # env must be REAL values, not placeholders —
          # the zod schema from Lesson 3 would fail at boot
          WEBHOOK_SECRET: \${{ secrets.WEBHOOK_SECRET }}
          AUTH_SECRET: \${{ secrets.AUTH_SECRET }}
          NEXT_PUBLIC_SITE_NAME: Living Notebook
          NEXT_PUBLIC_FEATURE_BETA: false`,
        },
    },
    decisionTable: {
        heading: '§5 Decision table: scenario → pick',
        intro:
            'Five recurring choices. Save the table, skip the research next time.',
        rows: [
            {
                scenario: 'Marketing landing, fixed content, want pure CDN',
                choice: "output: 'export' + S3/Cloudflare Pages",
            },
            {
                scenario: 'SaaS with auth, DB, Server Actions — the classic case',
                choice: 'default output + Vercel (zero config) or standalone + Docker',
            },
            {
                scenario: 'Geo-distributed API, no DB, < 50ms latency everywhere',
                choice: "runtime = 'edge' on all route handlers",
            },
            {
                scenario: 'Webhook that signs with HMAC + talks to Postgres',
                choice: "runtime = 'nodejs' (Edge has no crypto.timingSafeEqual + pg)",
            },
            {
                scenario: 'Self-host AWS/GCP, want a small container',
                choice: "output: 'standalone' + multi-stage Dockerfile (node:alpine)",
            },
            {
                scenario: 'Preview deployment per PR',
                choice: 'Vercel (built-in) or GH Actions + Cloudflare Pages',
            },
            {
                scenario: 'Build must fail if an env var is missing',
                choice: 'zod schema in _lib/env.ts imported by the root layout',
            },
        ],
    },
    labs: {
        heading: 'Lab',
        buildViewer: {
            badge: 'Lab 1',
            title: 'Build-marker viewer',
            description:
                "This lab reads `.next/prerender-manifest.json` from the filesystem and shows what Next actually prerendered. If you see nothing: run `npm run build` (dev mode does not write this file). Routes with `initialRevalidate: false` are **static** (○), those with a number are **ISR**, those absent from the manifest are **dynamic** (λ) or **Cache Components** (◐).",
            noBuildHeading: 'No build found',
            noBuildHint:
                'Run `npm run build` in the terminal, then reload this page. The manifest is written to `.next/prerender-manifest.json`.',
            buildIdLabel: 'BUILD_ID',
            generatedAtLabel: 'Generated at',
            routesHeading: 'Prerendered routes',
            staticLabel: 'STATIC',
            dynamicLabel: 'DYNAMIC',
            isrLabel: 'ISR',
            countLabel: 'routes',
        },
        runtime: {
            badge: 'Lab 2',
            title: 'Runtime probe — local vs live',
            description:
                "The same `/api/runtime-probe` route handler runs both locally and on the Vercel deploy. The left side shows your local Node; the right side fetches the live deploy and shows the `VERCEL_*` vars populated only in production. It's the visual proof of \"build once, deploy many\": **same code**, two environments.",
            localHeading: 'Local (this process)',
            liveHeading: 'Live (Vercel deploy)',
            refreshLabel: 'Refresh',
            loadingLabel: 'Loading…',
            errorLabel: 'Fetch error',
            fields: {
                runtime: 'runtime',
                nodeVersion: 'Node version',
                timestamp: 'timestamp',
                uptime: 'uptime (s)',
                nodeEnv: 'NODE_ENV',
                vercelEnv: 'VERCEL_ENV',
                vercelRegion: 'VERCEL_REGION',
                vercelSha: 'commit SHA',
                vercelBranch: 'branch',
                vercelUrl: 'VERCEL_URL',
            },
            notSet: '— not set',
            localHint: 'In dev, the VERCEL_* vars are `null`: you are not on Vercel.',
            liveHint:
                'In production the VERCEL_* are populated by the platform — no code of ours sets them.',
        },
        preflight: {
            badge: 'Lab 3',
            title: 'Pre-flight checklist (auto-verified)',
            description:
                "The server checks the presence/absence of the notebook's key files and tells you whether you're ready to ship. Green = found, red = missing. Doesn't replace human review, but catches the \"I forgot to commit X\" class of bugs — 70% of deploy incidents.",
            okLabel: 'OK',
            missingLabel: 'missing',
            scoreLabel: 'checks passed',
            items: [
                {
                    label: 'Env schema validated with zod',
                    hint: 'app/lessons/security-env/_lib/env.ts',
                },
                {
                    label: '`server-only` tripwire on secret-touching modules',
                    hint: 'app/lessons/security-env/_lib/server-only-secret.ts',
                },
                {
                    label: 'Edge proxy active (CSP nonce, locale sniff)',
                    hint: 'proxy.ts',
                },
                {
                    label: 'Static security headers in next.config.ts',
                    hint: 'HSTS, X-Frame-Options, Referrer-Policy',
                },
                {
                    label: 'images.remotePatterns whitelisted',
                    hint: 'next.config.ts → no open image proxy',
                },
                {
                    label: 'Sitemap + robots.txt + metadata',
                    hint: 'app/sitemap.ts + app/robots.ts',
                },
                {
                    label: 'OG image generated server-side',
                    hint: 'app/opengraph-image.tsx',
                },
                {
                    label: 'Cache Components enabled',
                    hint: 'next.config.ts → cacheComponents: true',
                },
                {
                    label: 'Auth.js configured',
                    hint: 'auth.ts + auth.config.ts',
                },
                {
                    label: 'README present',
                    hint: 'README.md — what the project does in 5 lines',
                },
            ],
        },
    },
    debug: {
        heading: 'Debugging Lab',
        description:
            'Three things to observe to close the dev → build → deploy loop.',
        steps: [
            '1) Open the terminal at the project root: `npm run build`. Read the table Next prints at the end — note which routes have the ○, ◐, λ marker. Compare with what Lab 1 shows after refresh.',
            "2) Reload `/lessons/deploy-ready`. Lab 1 now populates the list of prerendered routes from the manifest. Lab 2 (left) shows your Node version, PID, and the VERCEL_* vars as `null`.",
            "3) Open `https://next-js-notebook.vercel.app/lessons/deploy-ready` in a tab. Lab 2 (right) now has VERCEL_* populated (env=production, region=fra1 or similar, commit SHA). DevTools → Network on the Vercel URL: watch `x-vercel-cache: HIT|MISS|STALE`, `x-vercel-id` (region + request id), `x-matched-path` (the route that resolved). These are the headers that tell you if the CDN is serving from cache or not.",
            '4) Open `.next/prerender-manifest.json` with `cat .next/prerender-manifest.json | jq` (or open it in the editor). Find a route under `routes`: you will see `initialRevalidate`, `srcRoute`, `dataRoute` — the exact signature Vercel/Node-server uses to decide cache + revalidation.',
            "5) Run `du -sh .next .next/standalone 2>/dev/null` — the difference between default and standalone is ~10×. If you flipped `next.config.ts` to `output: 'standalone'` and rebuilt, you'd see the second number.",
        ],
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 5 · Урок 5',
    title: 'Готовність до Deploy',
    intro: "Попередні 19 уроків побудували застосунок. Цей його відправляє в продакшн. `next build` — це не «чорний ящик»: він створює дерево файлів із чіткою семантикою — які маршрути **статичні** (HTML, попередньо згенерований, віддається з CDN), які **динамічні** (функція виконується на кожен запит), які **гібридні** з Cache Components (`◐` = статична оболонка + suspended-діри, що гідратуються в рантаймі). Поверх цього: обери **runtime** (Node або Edge) для кожного маршруту, **output mode** (default | standalone | export) для свого хостингу, і **CI**, яка блокує merge, коли lint/typecheck/build падають. Deploy цього блокноту вже живий: URL Vercel нижче — це саме те, що `npm run build && npm start` створює локально.",
    liveDeploy: {
        heading: 'Живий deploy цього блокноту',
        description:
            'Цей застосунок уже в продакшні на Vercel. Відкрий URL у новій вкладці і тримай поруч DevTools → Network: кожна концепція нижче видима у response-хедерах (`x-vercel-cache`, `x-vercel-id`, `x-matched-path`).',
        openLabel: 'Відкрити живий deploy ↗',
        url: 'https://next-js-notebook.vercel.app/',
    },
    sections: {
        buildAnatomy: {
            heading: '§1 Анатомія `next build`',
            description:
                "`next build` читає `app/**`, виконує кожен Server Component і створює в `.next/` чітко визначене дерево. Ключові файли: `.next/BUILD_ID` (унікальний хеш білду, потрапляє в імена чанків), `.next/prerender-manifest.json` (каталог попередньо згенерованих маршрутів з `initialRevalidate` для ISR), `.next/server/app/**/page.html` (статичний HTML для ○-маршрутів), `.next/server/app/**/*.js` (функції для λ-маршрутів). У терміналі ти бачиш таблицю з маркерами: **○** статичний (HTML на білді), **λ** динамічний (функція на запит), **◐** Cache Components (статична оболонка + suspended-діри). Cache Components — це default у Next 16, саме воно дозволяє сторінці бути частково статичною.",
            snippet: `# Що ти бачиш у терміналі після \`npm run build\`:
Route (app)                              Size  First Load JS
┌ ○ /                                  1.2 kB        102 kB    ← статичний
├ ◐ /lessons/server-fetching             8 kB        109 kB    ← Cache Components
├ ◐ /lessons/seo-metadata/posts/[slug]  3 kB        104 kB    ← статична shell + динамічний slug
├ λ /api/runtime-probe                  0 B         0 kB      ← route handler
└ λ /api/webhook                        0 B         0 kB      ← POST handler

# Що існує в .next/ після білду:
.next/
├── BUILD_ID                            ← хеш напр. "kQVx9_2-mP4..."
├── prerender-manifest.json             ← prerendered маршрути + ISR
├── routes-manifest.json                ← таблиця маршрутів
├── app-build-manifest.json             ← чанки на сторінку
├── server/app/page.html                ← prerendered homepage
└── static/<BUILD_ID>/...               ← JS/CSS з хешем`,
        },
        runtime: {
            heading: '§2 Node vs Edge runtime',
            description:
                "Кожен маршрут може виконуватись у двох дуже різних середовищах. **Node** (default): повноцінний сервер із `fs`, нативними DB-драйверами, Buffer, повним доступом до `process.env`, cold start ~100мс, працює у традиційних регіонах. **Edge**: V8 isolate на краю CDN, cold start ~5мс, працює в 35+ регіонах одночасно, АЛЕ без Node API (немає `fs`, немає нативних драйверів, немає `Buffer`, поки не імпортуєш), обмежений `setTimeout`, урізаний рантайм. Обирається через `export const runtime = 'edge' | 'nodejs'` усередині маршруту. Правило: **edge** для stateless і гео-розподілених речей (middleware, redirects, A/B-тестинг, ін'єкція хедерів — наш `proxy.ts`), **node** для всього, що говорить із БД або використовує нативні бібліотеки (наш `/api/auth/*` з PGlite, наш `/api/webhook` з crypto). Неправильний вибір runtime не graceful: edge кине `Module not found` на `node:fs` на cold start.",
            snippet: `// app/api/runtime-probe/route.ts — Node (default, потребує process.*)
export async function GET() {
  return Response.json({
    nodeVersion: process.versions?.node,
    uptime: process.uptime(),
    vercelRegion: process.env.VERCEL_REGION,
  });
}

// app/api/geo/route.ts — Edge (гео-розподілений, немає Node API)
export const runtime = 'edge';

export async function GET(req: Request) {
  // на Vercel Edge: req.geo заповнений CDN-ом
  return Response.json({ country: req.headers.get('x-vercel-ip-country') });
}

// proxy.ts за замовчуванням працює на EDGE (це і є middleware) — сюди
// не можна імпортувати drizzle, pglite, bcrypt. Немає fs. Лише Web APIs.`,
        },
        outputModes: {
            heading: '§3 Output modes: default | standalone | export',
            description:
                "`next build` завжди створює `.next/`, але **mode** вирішує, що треба для його роздачі. **default** (`output` не вказано): тобі потрібен Node + `node_modules` + `npm start`. Саме це використовує Vercel. **standalone** (`output: 'standalone'`): Next копіює ТІЛЬКИ реально використовувані залежності в `.next/standalone/`, отримуючи ~80MB Docker-образ замість 800MB. Стандарт для AWS/GCP/self-hosted. **export** (`output: 'export'`): застосунок стає чистим статичним HTML у `out/`, без рантайму — завантажується на S3/CDN. Працює ТІЛЬКИ якщо застосунок 100% статичний: без API routes, без `cookies()`, без Server Actions, без динамічних Cache Components. Для цього блокноту неможливо (у нас auth, API, cookies). Для лендингу — ідеально.",
            snippet: `// next.config.ts — перемикання між трьома режимами:

// Default (Vercel) — нічого не додавай
const config: NextConfig = {};

// Standalone (Docker) — створює .next/standalone/server.js
const config: NextConfig = { output: 'standalone' };

// Мінімальний Dockerfile:
//   FROM node:20-alpine
//   COPY .next/standalone .
//   COPY .next/static .next/static
//   COPY public public
//   CMD ["node", "server.js"]

// Статичний export (S3/CDN) — створює out/index.html, out/about.html, ...
const config: NextConfig = { output: 'export' };

// ⚠️ З 'export' ламаються на білді:
//   - app/api/**             (немає сервера)
//   - cookies(), headers()   (немає запиту)
//   - server actions          (немає POST)
//   - dynamic routes без generateStaticParams`,
        },
        ciPipeline: {
            heading: "§4 CI/CD: merge не проходить, якщо білд не проходить",
            description:
                "Базовий пайплайн має 4 кроки **по порядку**: `lint` (eslint ловить 80% стилістичних помилок), `typecheck` (`tsc --noEmit` — Next 16 вже робить це в `next build`, але в standalone CI швидше окремо), `build` (`next build` — падає на відсутніх env, якщо є zod-схема з Уроку 3), `test` (якщо є). На Vercel це автоматично: кожен push відкриває **preview deployment** зі своїм URL, кожен merge у `main` тригерить **production deployment**. Self-hosted — використовуєш GitHub Actions з YAML як нижче. Ключовий факт: **білд створює однаковий `.next/` незалежно від того, де він виконується**, тому можна збилдити в CI, тегнути артефакт і деплоїти окремо — класичний патерн «build once, deploy many».",
            snippet: `# .github/workflows/ci.yml
name: CI
on: [pull_request, push]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
        env:
          # env мають бути СПРАВЖНІМИ значеннями, не placeholder-ами —
          # zod-схема з Уроку 3 завалить boot
          WEBHOOK_SECRET: \${{ secrets.WEBHOOK_SECRET }}
          AUTH_SECRET: \${{ secrets.AUTH_SECRET }}
          NEXT_PUBLIC_SITE_NAME: Living Notebook
          NEXT_PUBLIC_FEATURE_BETA: false`,
        },
    },
    decisionTable: {
        heading: '§5 Таблиця рішень: сценарій → вибір',
        intro:
            "П'ять повторюваних виборів. Збережи таблицю, наступного разу пропустиш пошук.",
        rows: [
            {
                scenario: 'Маркетинговий лендинг, фіксований контент, хочеш чистий CDN',
                choice: "output: 'export' + S3/Cloudflare Pages",
            },
            {
                scenario: 'SaaS з auth, БД, Server Actions — класика',
                choice: 'default output + Vercel (zero config) або standalone + Docker',
            },
            {
                scenario: 'Гео-розподілена API, без БД, < 50мс латентність скрізь',
                choice: "runtime = 'edge' на всіх route handler-ах",
            },
            {
                scenario: 'Webhook, що підписує HMAC + говорить з Postgres',
                choice: "runtime = 'nodejs' (Edge не має crypto.timingSafeEqual + pg)",
            },
            {
                scenario: 'Self-host AWS/GCP, хочеш маленький контейнер',
                choice: "output: 'standalone' + multi-stage Dockerfile (node:alpine)",
            },
            {
                scenario: 'Preview deployment на кожен PR',
                choice: 'Vercel (built-in) або GH Actions + Cloudflare Pages',
            },
            {
                scenario: 'Білд має падати, якщо бракує env var',
                choice: 'zod-схема в _lib/env.ts, імпортована root-лейаутом',
            },
        ],
    },
    labs: {
        heading: 'Лабораторія',
        buildViewer: {
            badge: 'Lab 1',
            title: 'Build-marker viewer',
            description:
                "Цей лаб читає `.next/prerender-manifest.json` з файлової системи і показує, що саме Next попередньо згенерував. Якщо нічого не бачиш — виконай `npm run build` (dev mode цей файл не пише). Маршрути з `initialRevalidate: false` — **статичні** (○), з числом — **ISR**, відсутні в маніфесті — **динамічні** (λ) або **Cache Components** (◐).",
            noBuildHeading: 'Білд не знайдено',
            noBuildHint:
                'Виконай `npm run build` у терміналі, потім перезавантаж сторінку. Маніфест пишеться у `.next/prerender-manifest.json`.',
            buildIdLabel: 'BUILD_ID',
            generatedAtLabel: 'Згенеровано',
            routesHeading: 'Prerendered маршрути',
            staticLabel: 'STATIC',
            dynamicLabel: 'ДИНАМ.',
            isrLabel: 'ISR',
            countLabel: 'маршрутів',
        },
        runtime: {
            badge: 'Lab 2',
            title: 'Runtime probe — локально vs живий',
            description:
                "Той самий route handler `/api/runtime-probe` працює і локально, і на Vercel deploy. Зліва — твій локальний Node; справа фетчиться живий deploy і показуються змінні `VERCEL_*`, заповнені тільки в продакшні. Це візуальний доказ «build once, deploy many»: **той самий код**, два середовища.",
            localHeading: 'Локально (цей процес)',
            liveHeading: 'Live (Vercel deploy)',
            refreshLabel: 'Оновити',
            loadingLabel: 'Завантаження…',
            errorLabel: 'Помилка fetch',
            fields: {
                runtime: 'runtime',
                nodeVersion: 'Node version',
                timestamp: 'timestamp',
                uptime: 'uptime (с)',
                nodeEnv: 'NODE_ENV',
                vercelEnv: 'VERCEL_ENV',
                vercelRegion: 'VERCEL_REGION',
                vercelSha: 'commit SHA',
                vercelBranch: 'branch',
                vercelUrl: 'VERCEL_URL',
            },
            notSet: '— не встановлено',
            localHint: 'У dev VERCEL_* — `null`: ти не на Vercel.',
            liveHint:
                'У продакшні VERCEL_* заповнюються платформою — наш код їх не встановлює.',
        },
        preflight: {
            badge: 'Lab 3',
            title: 'Pre-flight checklist (автоверифікація)',
            description:
                "Сервер перевіряє наявність/відсутність ключових файлів блокноту і каже, чи готовий ти до відправлення. Зелений = знайдено, червоний = бракує. Не замінює людський review, але ловить клас помилок «забув закомітити X» — це 70% інцидентів при deploy.",
            okLabel: 'OK',
            missingLabel: 'бракує',
            scoreLabel: 'перевірок пройдено',
            items: [
                {
                    label: 'Env-схема валідована zod',
                    hint: 'app/lessons/security-env/_lib/env.ts',
                },
                {
                    label: '`server-only` tripwire на модулях із секретами',
                    hint: 'app/lessons/security-env/_lib/server-only-secret.ts',
                },
                {
                    label: 'Edge proxy активний (CSP nonce, locale sniff)',
                    hint: 'proxy.ts',
                },
                {
                    label: 'Статичні security-хедери в next.config.ts',
                    hint: 'HSTS, X-Frame-Options, Referrer-Policy',
                },
                {
                    label: 'images.remotePatterns у whitelist',
                    hint: 'next.config.ts → немає open image proxy',
                },
                {
                    label: 'Sitemap + robots.txt + metadata',
                    hint: 'app/sitemap.ts + app/robots.ts',
                },
                {
                    label: 'OG-зображення генерується server-side',
                    hint: 'app/opengraph-image.tsx',
                },
                {
                    label: 'Cache Components увімкнено',
                    hint: 'next.config.ts → cacheComponents: true',
                },
                {
                    label: 'Auth.js налаштовано',
                    hint: 'auth.ts + auth.config.ts',
                },
                {
                    label: 'README присутній',
                    hint: 'README.md — що робить проєкт у 5 рядках',
                },
            ],
        },
    },
    debug: {
        heading: 'Debugging Lab',
        description:
            'Три речі для спостереження, щоб закрити петлю dev → build → deploy.',
        steps: [
            '1) Відкрий термінал у корені проєкту: `npm run build`. Прочитай таблицю, яку Next друкує в кінці — занотуй, які маршрути мають маркер ○, ◐, λ. Порівняй з тим, що Lab 1 показує після reload.',
            "2) Перезавантаж `/lessons/deploy-ready`. Lab 1 тепер показує список prerendered маршрутів з маніфесту. Lab 2 (ліворуч) показує твою Node version, PID і VERCEL_* змінні як `null`.",
            "3) Відкрий `https://next-js-notebook.vercel.app/lessons/deploy-ready` в окремій вкладці. Lab 2 (праворуч) тепер має заповнені VERCEL_* (env=production, region=fra1 чи подібне, commit SHA). DevTools → Network на Vercel URL: дивись `x-vercel-cache: HIT|MISS|STALE`, `x-vercel-id` (region + request id), `x-matched-path` (маршрут, що зрезолвився). Ці хедери скажуть тобі, чи CDN віддає з кешу.",
            '4) Відкрий `.next/prerender-manifest.json` через `cat .next/prerender-manifest.json | jq` (або відкрий у редакторі). Знайди маршрут під `routes`: побачиш `initialRevalidate`, `srcRoute`, `dataRoute` — це точний підпис, який Vercel/Node-server використовує для рішення cache + revalidation.',
            "5) Запусти `du -sh .next .next/standalone 2>/dev/null` — різниця між default і standalone ~10×. Якби ти перемкнув `next.config.ts` на `output: 'standalone'` і перебилдив, побачив би друге число.",
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
