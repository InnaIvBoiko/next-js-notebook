// =============================================================================
// app/lessons/api-routes/_lib/content.ts
// Inline i18n dictionary for Module 4 · Lesson 1 (API Routes / Route Handlers).
// -----------------------------------------------------------------------------
// The `_lib` folder is a private folder (underscore prefix) — Next.js does
// NOT map it as a route. Perfect place for the EN/IT/UK content used by the
// lesson page.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        anatomy: Section;
        whenNot: Section;
        dynamicParams: Section;
        body: Section;
        caching: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        echo: {
            badge: string;
            description: string;
            methodLabel: string;
            pathLabel: string;
            pathHint: string;
            queryLabel: string;
            queryHint: string;
            headersLabel: string;
            headersHint: string;
            bodyLabel: string;
            bodyHint: string;
            sendLabel: string;
            sendingLabel: string;
            statusLabel: string;
            responseLabel: string;
            curlLabel: string;
        };
        notes: {
            badge: string;
            description: string;
            titlePlaceholder: string;
            bodyPlaceholder: string;
            createLabel: string;
            creatingLabel: string;
            editLabel: string;
            saveLabel: string;
            cancelLabel: string;
            deleteLabel: string;
            resetLabel: string;
            emptyLabel: string;
            error405Label: string;
            try405Label: string;
        };
        cache: {
            badge: string;
            description: string;
            dynamicLabel: string;
            staticLabel: string;
            refetchLabel: string;
            fetchingLabel: string;
            nonceLabel: string;
            invalidateLabel: string;
            invalidatingLabel: string;
            devNote: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT — Base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 4 · Lezione 1',
    title: 'API Routes (Route Handlers)',
    intro: "Un Route Handler (`route.ts`) è il livello PIÙ BASSO del routing di App Router: niente layout, niente RSC, niente navigazione client. Esporta funzioni una-per-verbo (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`) che ricevono un Web `Request` e restituiscono un `Response`. In questa lezione lo smontiamo a livello di anatomia HTTP — query, header, cookie, body, params dinamici — costruiamo un piccolo CRUD `/api/notes`, vediamo il 405 automatico, e mettiamo a confronto un GET dinamico e un GET cached con `'use cache'`.",
    sections: {
        anatomy: {
            heading: "§1 Anatomia di un Route Handler",
            description: "Un file `route.ts` esporta una funzione per ogni metodo HTTP che vuoi gestire. La firma è sempre `(request: NextRequest, ctx: RouteContext<'/path'>) => Response | Promise<Response>`.\n\n`NextRequest` estende il Web `Request` standard con shortcut: `request.nextUrl.searchParams`, `request.cookies`, `request.geo` (su edge). `Response.json(data, init)` è uno helper Web-standard equivalente a `new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...init })`.\n\n`RouteContext` è un helper GLOBALE generato da `next dev` / `next build` / `next typegen`. Deriva il tipo dei `params` dal letterale della rotta — niente type a mano. Da Next 15 in poi `ctx.params` è una Promise, va awaitata.",
            snippet: `// app/api/notes/[id]/route.ts
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;        // 🆕 params è Promise
  const q = request.nextUrl.searchParams.get('expand'); // ?expand=author
  return Response.json({ id, expand: q });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;
  // ...elimina...
  return new Response(null, { status: 204 }); // No Content
}`,
        },
        whenNot: {
            heading: "§2 Quando NON usare un Route Handler",
            description: "App Router ha tre modi di esporre endpoint server-side. Confonderli è il bug architetturale più tipico del modulo 4. La regola:\n\n• Un dato letto da una pagina RSC?  → fetch DIRETTO nel Server Component (no HTTP, no JSON serialization).\n• Una mutation legata a un form sul tuo dominio? → Server Action (`'use server'`). Niente fetch client, niente endpoint visibile.\n• Un'API consumata da un client esterno, da un webhook, da TanStack Query, o che deve rispondere con status code, header, content-type custom? → Route Handler.\n\nIn Cache Components mode (`cacheComponents: true`), i Route Handler GET seguono lo stesso modello delle pagine: dinamici di default, opt-in al caching con `'use cache'`.",
            snippet: `// ❌ Anti-pattern: chiamare via fetch un endpoint locale da una RSC
async function Page() {
  const res = await fetch('http://localhost:3000/api/notes'); // self-call!
  const { notes } = await res.json();
  return <List notes={notes} />;
}

// ✅ Server Component → chiama direttamente lo strato dati
import { listNotes } from '@/app/api/notes/_store';
async function Page() {
  const notes = listNotes();   // zero HTTP, zero JSON, zero overhead
  return <List notes={notes} />;
}

// ✅ Mutation con redirect → Server Action, non Route Handler
'use server';
export async function addNote(formData: FormData) { /* ... */ }`,
        },
        dynamicParams: {
            heading: "§3 Path dinamici e catch-all",
            description: "I segmenti dinamici funzionano nei Route Handler ESATTAMENTE come nelle pagine: `[id]`, `[...slug]`, `[[...slug]]`.\n\n• `[id]` → match singolo. `params` è `{ id: string }`.\n• `[...path]` (catch-all) → match di N segmenti. `params` è `{ path: string[] }`. Richiede ALMENO un segmento.\n• `[[...path]]` (optional catch-all) → match anche di zero segmenti.\n\nIl 'Echo Lab' qui sotto è montato su `/api/echo/[...path]`. Visita `/api/echo`, `/api/echo/a`, `/api/echo/a/b/c` e osserva come `params.path` cambia.",
            snippet: `// app/api/echo/[...path]/route.ts
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/echo/[...path]'>,
) {
  const { path } = await ctx.params;        // string[]
  const q = request.nextUrl.searchParams;   // URLSearchParams
  return Response.json({
    path,
    query: Object.fromEntries(q.entries()),
  });
}

// /api/echo            → 404 (richiede almeno 1 segmento)
// /api/echo/a          → { path: ['a'], query: {} }
// /api/echo/a/b?x=1    → { path: ['a','b'], query: { x: '1' } }`,
        },
        body: {
            heading: "§4 Body, FormData, status, header",
            description: "Il body di una `Request` è uno stream: leggilo UNA volta in ESATTAMENTE una forma. Una volta consumato non puoi più rileggerlo.\n\n• `await request.json()` → parse JSON\n• `await request.formData()` → form HTML, anche multipart con file\n• `await request.text()` → testo grezzo, utile per webhooks firmati\n• `await request.arrayBuffer()` → bytes puri\n\nPer rispondere: `Response.json(data, { status, headers })`. I codici da padroneggiare: 200 (OK), 201 (Created — con `Location:` header), 204 (No Content — body VUOTO), 400 (input malformato), 401/403 (auth/permessi), 404 (risorsa assente), 405 (metodo non permesso — Next lo gestisce automaticamente).",
            snippet: `// app/api/notes/route.ts
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Body must be valid JSON.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' ||
      typeof (payload as any).title !== 'string') {
    return Response.json({ error: 'Expected { title, body }.' }, { status: 400 });
  }

  const note = createNote(payload as { title: string; body: string });
  return Response.json(
    { note },
    { status: 201, headers: { Location: \`/api/notes/\${note.id}\` } },
  );
}

// PUT non esportato qui? Next risponde 405 con \`Allow: GET, POST\` di default.`,
        },
        caching: {
            heading: "§5 Caching: dinamico di default, opt-in con `'use cache'`",
            description: "In Next 16 con Cache Components attivo (cf. next.config.ts), i Route Handler GET seguono il modello delle pagine: girano a request-time, vengono prerender-ati se non toccano API runtime. Per congelarli si usa `'use cache'` — MA il direttivo NON può stare nel body del handler stesso: va estratto in una helper.\n\n`cacheLife('seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max')` dichiara la freschezza. Aggiungi `cacheTag('mio-tag')` dentro la helper per poter invalidare on-demand: una Server Action chiama `updateTag('mio-tag')` e la prossima richiesta rigenera.\n\n⚠️ Caveat di `next dev`: HMR (Hot Module Replacement) invalida AUTOMATICAMENTE le entry `'use cache'`. Se modifichi un qualsiasi file mentre il lab è aperto, il `nonce` cachato cambierà — è normale, è documentato (use-cache.md). In `next start` la cache resiste finché non scade cacheLife o non chiami `updateTag`.\n\nNel lab qui sotto confrontiamo `/api/now-dynamic` (Date.now() inline, request-time) e `/api/now-static` (helper `'use cache'` + `cacheLife('max')` + `cacheTag('now-static')`). Refetch a destra: il nonce resta uguale. Premi 'Invalida cache' → Server Action → `updateTag('now-static')` → prossima fetch ha un nonce nuovo.",
            snippet: `// ✅ Dinamico (default)
export async function GET() {
  return Response.json({ now: Date.now() });   // request-time
}

// ✅ Cached + invalidabile via tag
import { cacheLife, cacheTag } from 'next/cache';

async function frozen() {
  'use cache';                    // ❗ in una helper, NON nel GET
  cacheLife('max');               // revalidate ogni 30g, expire 1 anno
  cacheTag('now-static');         // label per updateTag()
  return { now: Date.now() };
}
export async function GET() {
  return Response.json(await frozen());
}

// 🔥 In un'altra parte dell'app: invalida on-demand
'use server';
import { updateTag } from 'next/cache';
export async function invalidate() {
  updateTag('now-static');        // prossima GET rigenera la helper
}

// ❌ Non disponibile con cacheComponents:true
// export const dynamic = 'force-static';     // rimosso in Next 16
// export const revalidate = 60;              // rimosso in Next 16`,
        },
    },
    decisionTable: {
        heading: "§6 Tabella decisionale: cosa usi quando",
        intro: "Promemoria sintetico: in caso di dubbio, parti da \"chi è il chiamante?\". Se è un Server Component → import diretto. Se è un form HTML → Server Action. Se è un client JS, un webhook o un'altra origine → Route Handler.",
        rows: [
            { scenario: 'Una RSC deve leggere dati per renderizzare', choice: 'Import diretto della funzione data (es. listNotes())' },
            { scenario: 'Form che crea/aggiorna sul tuo dominio', choice: "Server Action ('use server') + revalidatePath/updateTag" },
            { scenario: "TanStack Query / SWR sul client", choice: 'Route Handler GET/POST + fetch dal client' },
            { scenario: 'Webhook da Stripe / GitHub', choice: 'Route Handler POST con verifica firma' },
            { scenario: 'Endpoint pubblico per consumatori esterni', choice: 'Route Handler con CORS espliciti + auth' },
            { scenario: 'Dato statico cachato (config, listini)', choice: "Route Handler GET con helper 'use cache' + cacheLife" },
            { scenario: 'OG image, sitemap, robots, RSS', choice: 'Special Route Handlers (file conventions dedicati)' },
        ],
    },
    labs: {
        heading: '🧪 Laboratori',
        echo: {
            badge: 'Lab 1 — Echo Lab',
            description: 'Componi una richiesta arbitraria contro `/api/echo/[...path]` e vedi cosa il server riceve davvero: method, pathname, segmenti dinamici, query, header, cookie, body parsato.',
            methodLabel: 'Metodo',
            pathLabel: 'Path',
            pathHint: 'segmenti dopo /api/echo/ (es. users/42)',
            queryLabel: 'Query string',
            queryHint: 'es. q=ciao&lang=it',
            headersLabel: 'Header extra',
            headersHint: 'una per riga, formato: Nome: Valore',
            bodyLabel: 'Body (solo POST/PUT/PATCH/DELETE)',
            bodyHint: 'JSON o testo libero',
            sendLabel: 'Invia richiesta',
            sendingLabel: 'Invio in corso…',
            statusLabel: 'Status',
            responseLabel: 'Risposta del server',
            curlLabel: 'Equivalente cURL',
        },
        notes: {
            badge: 'Lab 2 — Mini CRUD /api/notes',
            description: 'Un piccolo CRUD in memoria. Crea, modifica, elimina note via fetch. Prova il bottone "405 Test" per vedere come Next risponde automaticamente a un metodo non esportato.',
            titlePlaceholder: 'Titolo della nota',
            bodyPlaceholder: 'Contenuto…',
            createLabel: 'Crea',
            creatingLabel: 'Creazione…',
            editLabel: 'Modifica',
            saveLabel: 'Salva',
            cancelLabel: 'Annulla',
            deleteLabel: 'Elimina',
            resetLabel: 'Reset (PUT)',
            emptyLabel: 'Nessuna nota. Creane una!',
            error405Label: 'DELETE non è esportato sulla collection → 405',
            try405Label: '405 Test — DELETE /api/notes',
        },
        cache: {
            badge: 'Lab 3 — Dinamico vs cached',
            description: "Due GET fianco a fianco: uno chiama `Date.now()` direttamente, l'altro lo nasconde dietro una helper con `'use cache'` + `cacheLife('max')` + `cacheTag('now-static')`. Refetcha entrambi: il nonce dinamico cambia sempre, quello cachato no. Poi premi 'Invalida cache' — esegue una Server Action con `updateTag('now-static')` e la successiva fetch rigenera il nonce.",
            dynamicLabel: '/api/now-dynamic',
            staticLabel: '/api/now-static',
            refetchLabel: 'Refetch',
            fetchingLabel: 'Caricamento…',
            nonceLabel: 'nonce',
            invalidateLabel: 'Invalida cache',
            invalidatingLabel: 'Invalidazione…',
            devNote: "⚠️ Modalità dev: HMR (Hot Module Replacement) invalida AUTOMATICAMENTE le entry `'use cache'`. Se modifichi un qualsiasi file mentre il lab è aperto vedrai il nonce cachato cambiare — è il comportamento documentato. In `next start` (produzione locale) la cache rimane fino a `updateTag` o scadenza `cacheLife`.",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: "Apri DevTools → Network e il terminale dove gira `npm run dev`. Esercita ogni lab e osserva:",
        steps: [
            "Echo Lab → invia un POST con body JSON. Nel pannello Network, ispeziona Request Headers (Content-Type), Request Payload, e la Response: ritrovi tutto il payload echo-ato.",
            "Echo Lab → cambia il path in `users/42/posts`. La risposta mostra `pathSegments: ['users','42','posts']` perché il route è catch-all.",
            "Notes Lab → premi '405 Test'. In Network vedi `405 Method Not Allowed` e l'header `Allow: GET, POST, PUT` — Next l'ha generato da solo perché non esportiamo DELETE su `/api/notes`.",
            "Notes Lab → crea una nota. Lo status è 201, e l'header `Location` punta alla risorsa creata. Apri il URL in una nuova tab: il GET singolo funziona.",
            "Cache Lab → premi 'Refetch' su entrambi i box ripetutamente. Il box dinamico cambia `nonce` ogni volta; quello statico no. Poi premi 'Invalida cache': il bottone esegue una Server Action con `updateTag('now-static')` e SOLO il box statico rigenera. NB: in dev, HMR può invalidare la cache anche da solo — è documentato.",
            "Terminale → quando esegui un Server Action o un fetch lato client, ogni Route Handler stampa il suo log. Nessuna richiesta = nessun log: i Route Handler NON girano al render delle pagine.",
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 4 · Lesson 1',
    title: 'API Routes (Route Handlers)',
    intro: "A Route Handler (`route.ts`) is the LOWEST level of App Router routing: no layout, no RSC, no client-side navigation. It exports one async function per HTTP verb (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`) that receives a Web `Request` and returns a `Response`. In this lesson we dissect the HTTP anatomy — query, headers, cookies, body, dynamic params — build a tiny `/api/notes` CRUD, see Next's automatic 405, and compare a dynamic GET against a `'use cache'` GET.",
    sections: {
        anatomy: {
            heading: '§1 Anatomy of a Route Handler',
            description: "A `route.ts` file exports one function per HTTP method you want to handle. The signature is always `(request: NextRequest, ctx: RouteContext<'/path'>) => Response | Promise<Response>`.\n\n`NextRequest` extends the Web `Request` standard with shortcuts: `request.nextUrl.searchParams`, `request.cookies`, `request.geo` (on edge). `Response.json(data, init)` is a Web-standard helper equivalent to `new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...init })`.\n\n`RouteContext` is a GLOBAL helper generated by `next dev` / `next build` / `next typegen`. It derives the `params` type from the route literal — no hand-rolled type. Since Next 15, `ctx.params` is a Promise; you `await` it.",
            snippet: `// app/api/notes/[id]/route.ts
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;        // 🆕 params is a Promise
  const q = request.nextUrl.searchParams.get('expand'); // ?expand=author
  return Response.json({ id, expand: q });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;
  // ...delete...
  return new Response(null, { status: 204 }); // No Content
}`,
        },
        whenNot: {
            heading: '§2 When NOT to use a Route Handler',
            description: "App Router exposes three flavours of server-side endpoint. Confusing them is the typical Module-4 architecture bug. The rule:\n\n• Data read by an RSC page? → fetch DIRECTLY in the Server Component (no HTTP, no JSON serialisation).\n• A mutation tied to a form on your own domain? → Server Action (`'use server'`). No client fetch, no visible endpoint.\n• An API consumed by an external client, a webhook, TanStack Query, or anything that needs custom status codes / headers / content-type? → Route Handler.\n\nIn Cache Components mode (`cacheComponents: true`), GET Route Handlers follow the page model: dynamic by default, opt into caching with `'use cache'`.",
            snippet: `// ❌ Anti-pattern: an RSC fetching a local endpoint via HTTP
async function Page() {
  const res = await fetch('http://localhost:3000/api/notes'); // self-call!
  const { notes } = await res.json();
  return <List notes={notes} />;
}

// ✅ Server Component → call the data layer directly
import { listNotes } from '@/app/api/notes/_store';
async function Page() {
  const notes = listNotes();   // zero HTTP, zero JSON, zero overhead
  return <List notes={notes} />;
}

// ✅ Form mutation with redirect → Server Action, not Route Handler
'use server';
export async function addNote(formData: FormData) { /* ... */ }`,
        },
        dynamicParams: {
            heading: '§3 Dynamic paths and catch-all',
            description: "Dynamic segments work in Route Handlers EXACTLY like in pages: `[id]`, `[...slug]`, `[[...slug]]`.\n\n• `[id]` → single match. `params` is `{ id: string }`.\n• `[...path]` (catch-all) → matches N segments. `params` is `{ path: string[] }`. Requires AT LEAST one segment.\n• `[[...path]]` (optional catch-all) → matches zero segments too.\n\nThe 'Echo Lab' below is mounted at `/api/echo/[...path]`. Visit `/api/echo/a`, `/api/echo/a/b/c` and watch `params.path` change.",
            snippet: `// app/api/echo/[...path]/route.ts
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/echo/[...path]'>,
) {
  const { path } = await ctx.params;        // string[]
  const q = request.nextUrl.searchParams;   // URLSearchParams
  return Response.json({
    path,
    query: Object.fromEntries(q.entries()),
  });
}

// /api/echo            → 404 (requires at least 1 segment)
// /api/echo/a          → { path: ['a'], query: {} }
// /api/echo/a/b?x=1    → { path: ['a','b'], query: { x: '1' } }`,
        },
        body: {
            heading: '§4 Body, FormData, status, headers',
            description: "The body of a `Request` is a stream: read it ONCE, in EXACTLY one form. Once consumed you cannot read it again.\n\n• `await request.json()` → parse JSON\n• `await request.formData()` → HTML form, including multipart with files\n• `await request.text()` → raw text, handy for signed webhooks\n• `await request.arrayBuffer()` → raw bytes\n\nFor responses: `Response.json(data, { status, headers })`. Status codes to master: 200 (OK), 201 (Created — include a `Location:` header), 204 (No Content — body MUST be empty), 400 (malformed input), 401/403 (auth/permissions), 404 (missing resource), 405 (method not allowed — Next handles this automatically).",
            snippet: `// app/api/notes/route.ts
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Body must be valid JSON.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' ||
      typeof (payload as any).title !== 'string') {
    return Response.json({ error: 'Expected { title, body }.' }, { status: 400 });
  }

  const note = createNote(payload as { title: string; body: string });
  return Response.json(
    { note },
    { status: 201, headers: { Location: \`/api/notes/\${note.id}\` } },
  );
}

// No PUT exported? Next answers 405 with \`Allow: GET, POST\` automatically.`,
        },
        caching: {
            heading: "§5 Caching: dynamic by default, opt-in with `'use cache'`",
            description: "In Next 16 with Cache Components on (see next.config.ts), GET Route Handlers follow the page model: they run at request time and get prerendered when they don't touch runtime APIs. To freeze one you use `'use cache'` — BUT the directive CANNOT live in the handler body: extract it to a helper.\n\n`cacheLife('seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max')` declares freshness. Add `cacheTag('my-tag')` inside the helper to invalidate it on demand: a Server Action calls `updateTag('my-tag')` and the next request regenerates.\n\n⚠️ `next dev` caveat: HMR (Hot Module Replacement) AUTOMATICALLY invalidates `'use cache'` entries. If you edit any file while the lab is open the cached `nonce` will change — this is documented (use-cache.md). Under `next start` the cache survives until `cacheLife` expires or you call `updateTag`.\n\nIn the lab below we compare `/api/now-dynamic` (Date.now() inline — request-time) and `/api/now-static` (`'use cache'` helper + `cacheLife('max')` + `cacheTag('now-static')`). Refetch the right box: the nonce stays. Press 'Invalidate cache' → Server Action → `updateTag('now-static')` → next fetch returns a fresh nonce.",
            snippet: `// ✅ Dynamic (default)
export async function GET() {
  return Response.json({ now: Date.now() });   // request-time
}

// ✅ Cached + tag-invalidatable
import { cacheLife, cacheTag } from 'next/cache';

async function frozen() {
  'use cache';                    // ❗ in a helper, NOT inside GET
  cacheLife('max');               // revalidate every 30d, expire 1y
  cacheTag('now-static');         // label for updateTag()
  return { now: Date.now() };
}
export async function GET() {
  return Response.json(await frozen());
}

// 🔥 Anywhere in the app: invalidate on demand
'use server';
import { updateTag } from 'next/cache';
export async function invalidate() {
  updateTag('now-static');        // next GET re-runs the helper
}

// ❌ Not available under cacheComponents:true
// export const dynamic = 'force-static';     // removed in Next 16
// export const revalidate = 60;              // removed in Next 16`,
        },
    },
    decisionTable: {
        heading: '§6 Decision table: pick the right tool',
        intro: "Quick mental model: in doubt, start from \"who's the caller?\". Server Component → direct import. HTML form → Server Action. JS client / webhook / external origin → Route Handler.",
        rows: [
            { scenario: 'An RSC needs data to render', choice: 'Direct import of the data function (e.g. listNotes())' },
            { scenario: 'Form creating/updating on your own domain', choice: "Server Action ('use server') + revalidatePath/updateTag" },
            { scenario: 'TanStack Query / SWR on the client', choice: 'Route Handler GET/POST + client fetch' },
            { scenario: 'Stripe / GitHub webhook', choice: 'Route Handler POST with signature verification' },
            { scenario: 'Public endpoint for external consumers', choice: 'Route Handler with explicit CORS + auth' },
            { scenario: 'Static cached data (config, price lists)', choice: "Route Handler GET with 'use cache' helper + cacheLife" },
            { scenario: 'OG image, sitemap, robots, RSS', choice: 'Special Route Handlers (dedicated file conventions)' },
        ],
    },
    labs: {
        heading: '🧪 Labs',
        echo: {
            badge: 'Lab 1 — Echo Lab',
            description: 'Compose an arbitrary request against `/api/echo/[...path]` and see what the server actually receives: method, pathname, dynamic segments, query, headers, cookies, parsed body.',
            methodLabel: 'Method',
            pathLabel: 'Path',
            pathHint: 'segments after /api/echo/ (e.g. users/42)',
            queryLabel: 'Query string',
            queryHint: 'e.g. q=hello&lang=en',
            headersLabel: 'Extra headers',
            headersHint: 'one per line, format: Name: Value',
            bodyLabel: 'Body (POST/PUT/PATCH/DELETE only)',
            bodyHint: 'JSON or raw text',
            sendLabel: 'Send request',
            sendingLabel: 'Sending…',
            statusLabel: 'Status',
            responseLabel: 'Server response',
            curlLabel: 'cURL equivalent',
        },
        notes: {
            badge: 'Lab 2 — Mini CRUD /api/notes',
            description: 'A small in-memory CRUD. Create, edit, delete notes via fetch. Try the "405 Test" button to see how Next automatically answers a non-exported method.',
            titlePlaceholder: 'Note title',
            bodyPlaceholder: 'Content…',
            createLabel: 'Create',
            creatingLabel: 'Creating…',
            editLabel: 'Edit',
            saveLabel: 'Save',
            cancelLabel: 'Cancel',
            deleteLabel: 'Delete',
            resetLabel: 'Reset (PUT)',
            emptyLabel: 'No notes yet. Create one!',
            error405Label: 'DELETE is not exported on the collection → 405',
            try405Label: '405 Test — DELETE /api/notes',
        },
        cache: {
            badge: 'Lab 3 — Dynamic vs cached',
            description: "Two GET endpoints side by side: one calls `Date.now()` directly, the other hides it behind a helper with `'use cache'` + `cacheLife('max')` + `cacheTag('now-static')`. Refetch both: the dynamic nonce changes every time, the cached one doesn't. Then press 'Invalidate cache' — it fires a Server Action calling `updateTag('now-static')` and the next fetch regenerates the nonce.",
            dynamicLabel: '/api/now-dynamic',
            staticLabel: '/api/now-static',
            refetchLabel: 'Refetch',
            fetchingLabel: 'Loading…',
            nonceLabel: 'nonce',
            invalidateLabel: 'Invalidate cache',
            invalidatingLabel: 'Invalidating…',
            devNote: "⚠️ Dev mode: HMR (Hot Module Replacement) AUTOMATICALLY invalidates `'use cache'` entries. Editing any file while the lab is open will make the cached nonce change — this is documented dev behaviour. Under `next start` (local prod) the cache only changes via `updateTag` or `cacheLife` expiry.",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Open DevTools → Network and the terminal where `npm run dev` is running. Exercise each lab and watch:',
        steps: [
            "Echo Lab → send a POST with a JSON body. In Network inspect Request Headers (Content-Type), Request Payload, and the Response: the echoed payload mirrors everything back.",
            "Echo Lab → change the path to `users/42/posts`. The response shows `pathSegments: ['users','42','posts']` because the route is catch-all.",
            "Notes Lab → press '405 Test'. In Network you'll see `405 Method Not Allowed` and the `Allow: GET, POST, PUT` header — Next generated it on its own because we don't export DELETE on `/api/notes`.",
            "Notes Lab → create a note. The status is 201 and the `Location` header points at the created resource. Open the URL in a new tab: the single-item GET works.",
            "Cache Lab → press 'Refetch' on both boxes repeatedly. The dynamic box changes `nonce` every time; the cached one doesn't. Then press 'Invalidate cache': the button fires a Server Action with `updateTag('now-static')` and ONLY the cached box regenerates. Note: in dev, HMR can also invalidate the cache on its own — this is documented.",
            "Terminal → every Route Handler logs when it runs. No request = no log: Route Handlers do NOT run when pages render.",
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 4 · Лекція 1',
    title: 'API Routes (Route Handlers)',
    intro: "Route Handler (`route.ts`) — це НАЙНИЖЧИЙ рівень маршрутизації App Router: без layout, без RSC, без клієнтської навігації. Експортує по одній async-функції на HTTP-метод (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`), що приймає Web `Request` і повертає `Response`. У цій лекції розбираємо анатомію HTTP — query, headers, cookies, body, динамічні params — будуємо мініатюрний CRUD `/api/notes`, бачимо автоматичний 405 від Next, і порівнюємо динамічний GET із кешованим через `'use cache'`.",
    sections: {
        anatomy: {
            heading: '§1 Анатомія Route Handler',
            description: "Файл `route.ts` експортує по одній функції на кожен HTTP-метод, який треба обробити. Сигнатура завжди `(request: NextRequest, ctx: RouteContext<'/path'>) => Response | Promise<Response>`.\n\n`NextRequest` розширює стандартний Web `Request` шорткатами: `request.nextUrl.searchParams`, `request.cookies`, `request.geo` (на edge). `Response.json(data, init)` — це Web-стандартний хелпер, еквівалент `new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...init })`.\n\n`RouteContext` — це ГЛОБАЛЬНИЙ хелпер, згенерований `next dev` / `next build` / `next typegen`. Він виводить тип `params` із літерала маршруту — без ручних типів. Починаючи з Next 15, `ctx.params` — це Promise; його треба await-ити.",
            snippet: `// app/api/notes/[id]/route.ts
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;        // 🆕 params — це Promise
  const q = request.nextUrl.searchParams.get('expand'); // ?expand=author
  return Response.json({ id, expand: q });
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/notes/[id]'>,
) {
  const { id } = await ctx.params;
  // ...видалити...
  return new Response(null, { status: 204 }); // No Content
}`,
        },
        whenNot: {
            heading: '§2 Коли НЕ треба Route Handler',
            description: "App Router пропонує три способи створити server-side endpoint. Плутанина між ними — типовий архітектурний баг Модуля 4. Правило:\n\n• Дані, що читає RSC-сторінка? → fetch БЕЗПОСЕРЕДНЬО в Server Component (без HTTP, без JSON-серіалізації).\n• Мутація, прив'язана до форми на твоєму домені? → Server Action (`'use server'`). Без клієнтського fetch, без видимого endpoint.\n• API для зовнішнього клієнта, для webhook, для TanStack Query, або таке, що потребує власних status code / headers / content-type? → Route Handler.\n\nУ режимі Cache Components (`cacheComponents: true`) GET Route Handlers поводяться як сторінки: динамічні за замовчуванням, opt-in до кешування через `'use cache'`.",
            snippet: `// ❌ Анти-патерн: RSC викликає локальний endpoint через HTTP
async function Page() {
  const res = await fetch('http://localhost:3000/api/notes'); // self-call!
  const { notes } = await res.json();
  return <List notes={notes} />;
}

// ✅ Server Component → виклик data-шару напряму
import { listNotes } from '@/app/api/notes/_store';
async function Page() {
  const notes = listNotes();   // нуль HTTP, нуль JSON, нуль overhead
  return <List notes={notes} />;
}

// ✅ Мутація з redirect → Server Action, не Route Handler
'use server';
export async function addNote(formData: FormData) { /* ... */ }`,
        },
        dynamicParams: {
            heading: '§3 Динамічні шляхи й catch-all',
            description: "Динамічні сегменти в Route Handlers працюють ТАК САМО, як на сторінках: `[id]`, `[...slug]`, `[[...slug]]`.\n\n• `[id]` → один сегмент. `params` — це `{ id: string }`.\n• `[...path]` (catch-all) → ловить N сегментів. `params` — це `{ path: string[] }`. Потрібен ЩОНАЙМЕНШЕ один сегмент.\n• `[[...path]]` (optional catch-all) → ловить навіть нуль сегментів.\n\n'Echo Lab' нижче змонтований на `/api/echo/[...path]`. Зайди на `/api/echo/a`, `/api/echo/a/b/c` і подивися, як змінюється `params.path`.",
            snippet: `// app/api/echo/[...path]/route.ts
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/echo/[...path]'>,
) {
  const { path } = await ctx.params;        // string[]
  const q = request.nextUrl.searchParams;   // URLSearchParams
  return Response.json({
    path,
    query: Object.fromEntries(q.entries()),
  });
}

// /api/echo            → 404 (потрібен щонайменше 1 сегмент)
// /api/echo/a          → { path: ['a'], query: {} }
// /api/echo/a/b?x=1    → { path: ['a','b'], query: { x: '1' } }`,
        },
        body: {
            heading: '§4 Body, FormData, status, headers',
            description: "Body запиту — це потік: читай його ОДИН раз у РІВНО одній формі. Один раз прочитаний — більше не прочитаєш.\n\n• `await request.json()` → парс JSON\n• `await request.formData()` → HTML-форма, навіть multipart із файлами\n• `await request.text()` → сирий текст, корисно для підписаних webhook\n• `await request.arrayBuffer()` → сирі байти\n\nДля відповідей: `Response.json(data, { status, headers })`. Коди, які треба знати: 200 (OK), 201 (Created — з `Location:` header), 204 (No Content — body МАЄ бути порожнім), 400 (некоректний вхід), 401/403 (auth/дозволи), 404 (ресурс відсутній), 405 (метод не дозволений — Next робить це автоматично).",
            snippet: `// app/api/notes/route.ts
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Body must be valid JSON.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' ||
      typeof (payload as any).title !== 'string') {
    return Response.json({ error: 'Expected { title, body }.' }, { status: 400 });
  }

  const note = createNote(payload as { title: string; body: string });
  return Response.json(
    { note },
    { status: 201, headers: { Location: \`/api/notes/\${note.id}\` } },
  );
}

// PUT не експортуєш? Next автоматично відповість 405 із \`Allow: GET, POST\`.`,
        },
        caching: {
            heading: "§5 Кешування: динамічний за замовчуванням, opt-in із `'use cache'`",
            description: "У Next 16 з увімкненим Cache Components (див. next.config.ts) GET Route Handlers поводяться як сторінки: запускаються в request-time, prerender-яться, якщо не торкаються runtime API. Щоб заморозити — використовуй `'use cache'`. АЛЕ директива НЕ може бути в body handler-а: винеси її в хелпер.\n\n`cacheLife('seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max')` декларує свіжість. Додай `cacheTag('my-tag')` всередині хелпера, щоб інвалідувати on-demand: Server Action викликає `updateTag('my-tag')`, і наступний запит регенерує.\n\n⚠️ Caveat `next dev`: HMR (Hot Module Replacement) АВТОМАТИЧНО інвалідує entry `'use cache'`. Якщо змінити будь-який файл, поки лаба відкрита, кешований `nonce` зміниться — це задокументована поведінка (use-cache.md). У `next start` кеш живе до спливання `cacheLife` або виклику `updateTag`.\n\nУ лабораторії нижче порівнюємо `/api/now-dynamic` (Date.now() inline — request-time) і `/api/now-static` (хелпер `'use cache'` + `cacheLife('max')` + `cacheTag('now-static')`). Refetch правого боксу — nonce не змінюється. Тисни 'Інвалідувати кеш' → Server Action → `updateTag('now-static')` → наступний fetch дає новий nonce.",
            snippet: `// ✅ Динамічний (default)
export async function GET() {
  return Response.json({ now: Date.now() });   // request-time
}

// ✅ Кешований + tag-інвалідується
import { cacheLife, cacheTag } from 'next/cache';

async function frozen() {
  'use cache';                    // ❗ у хелпері, НЕ в GET
  cacheLife('max');               // revalidate що 30д, expire 1р
  cacheTag('now-static');         // label для updateTag()
  return { now: Date.now() };
}
export async function GET() {
  return Response.json(await frozen());
}

// 🔥 Будь-де в додатку: інвалідація on-demand
'use server';
import { updateTag } from 'next/cache';
export async function invalidate() {
  updateTag('now-static');        // наступний GET перезапустить хелпер
}

// ❌ Недоступно при cacheComponents:true
// export const dynamic = 'force-static';     // прибрано в Next 16
// export const revalidate = 60;              // прибрано в Next 16`,
        },
    },
    decisionTable: {
        heading: '§6 Таблиця рішень: який інструмент брати',
        intro: "Швидка модель: у разі сумніву починай із \"хто викликає?\". Server Component → прямий import. HTML-форма → Server Action. JS-клієнт / webhook / зовнішнє походження → Route Handler.",
        rows: [
            { scenario: 'RSC потребує даних для рендера', choice: 'Прямий import data-функції (напр. listNotes())' },
            { scenario: 'Форма створює/оновлює на твоєму домені', choice: "Server Action ('use server') + revalidatePath/updateTag" },
            { scenario: 'TanStack Query / SWR на клієнті', choice: 'Route Handler GET/POST + клієнтський fetch' },
            { scenario: 'Webhook від Stripe / GitHub', choice: 'Route Handler POST із перевіркою підпису' },
            { scenario: 'Публічний endpoint для зовнішніх клієнтів', choice: 'Route Handler з явними CORS + auth' },
            { scenario: 'Статичні кешовані дані (config, прайси)', choice: "Route Handler GET з хелпером 'use cache' + cacheLife" },
            { scenario: 'OG image, sitemap, robots, RSS', choice: 'Special Route Handlers (виділені file conventions)' },
        ],
    },
    labs: {
        heading: '🧪 Лабораторії',
        echo: {
            badge: 'Lab 1 — Echo Lab',
            description: 'Збери довільний запит до `/api/echo/[...path]` і подивися, що сервер дійсно отримує: method, pathname, динамічні сегменти, query, headers, cookies, розпарсений body.',
            methodLabel: 'Метод',
            pathLabel: 'Path',
            pathHint: 'сегменти після /api/echo/ (напр. users/42)',
            queryLabel: 'Query string',
            queryHint: 'напр. q=привіт&lang=uk',
            headersLabel: 'Додаткові headers',
            headersHint: 'по одному на рядок, формат: Name: Value',
            bodyLabel: 'Body (тільки POST/PUT/PATCH/DELETE)',
            bodyHint: 'JSON або сирий текст',
            sendLabel: 'Надіслати',
            sendingLabel: 'Надсилаю…',
            statusLabel: 'Status',
            responseLabel: 'Відповідь сервера',
            curlLabel: 'Еквівалент cURL',
        },
        notes: {
            badge: 'Lab 2 — Mini CRUD /api/notes',
            description: 'Маленький CRUD у пам\'яті. Створюй, редагуй, видаляй нотатки через fetch. Натисни кнопку "405 Test", щоб побачити, як Next автоматично відповідає на не-експортований метод.',
            titlePlaceholder: 'Заголовок нотатки',
            bodyPlaceholder: 'Зміст…',
            createLabel: 'Створити',
            creatingLabel: 'Створення…',
            editLabel: 'Редагувати',
            saveLabel: 'Зберегти',
            cancelLabel: 'Скасувати',
            deleteLabel: 'Видалити',
            resetLabel: 'Reset (PUT)',
            emptyLabel: 'Нотаток поки нема. Створи!',
            error405Label: 'DELETE не експортовано на колекції → 405',
            try405Label: '405 Test — DELETE /api/notes',
        },
        cache: {
            badge: 'Lab 3 — Динамічний vs кешований',
            description: "Два GET-и поруч: один викликає `Date.now()` напряму, інший ховає це за хелпером із `'use cache'` + `cacheLife('max')` + `cacheTag('now-static')`. Refetch обидва: динамічний nonce змінюється завжди, кешований — ні. Потім тисни 'Інвалідувати кеш' — викликає Server Action із `updateTag('now-static')`, і наступний fetch регенерує nonce.",
            dynamicLabel: '/api/now-dynamic',
            staticLabel: '/api/now-static',
            refetchLabel: 'Refetch',
            fetchingLabel: 'Завантаження…',
            nonceLabel: 'nonce',
            invalidateLabel: 'Інвалідувати кеш',
            invalidatingLabel: 'Інвалідація…',
            devNote: "⚠️ Dev-режим: HMR (Hot Module Replacement) АВТОМАТИЧНО інвалідує entry `'use cache'`. Якщо змінити будь-який файл, поки лаба відкрита, кешований nonce зміниться — це задокументована поведінка dev. У `next start` (локальний prod) кеш живе до `updateTag` або спливання `cacheLife`.",
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: "Відкрий DevTools → Network і термінал, де крутиться `npm run dev`. Виконай кожну лабораторію та подивися:",
        steps: [
            "Echo Lab → надішли POST із JSON body. У Network подивися Request Headers (Content-Type), Request Payload і Response: ехо-payload повертає все.",
            "Echo Lab → зміни path на `users/42/posts`. Відповідь показує `pathSegments: ['users','42','posts']`, бо маршрут catch-all.",
            "Notes Lab → натисни '405 Test'. У Network побачиш `405 Method Not Allowed` і header `Allow: GET, POST, PUT` — Next згенерував його сам, бо ми не експортуємо DELETE на `/api/notes`.",
            "Notes Lab → створи нотатку. Status — 201, а header `Location` указує на створений ресурс. Відкрий URL у новій вкладці: одиничний GET працює.",
            "Cache Lab → натисни 'Refetch' на обидвох боксах кілька разів. Динамічний змінює `nonce` щоразу; кешований — ні. Потім натисни 'Інвалідувати кеш': кнопка викликає Server Action з `updateTag('now-static')`, і ЛИШЕ кешований бокс регенерується. NB: у dev, HMR також може інвалідувати кеш сам — це задокументовано.",
            "Термінал → кожен Route Handler логується тільки коли реально виконується. Немає запиту — немає лога: Route Handlers НЕ запускаються під час рендера сторінок.",
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
export type { Dictionary };
