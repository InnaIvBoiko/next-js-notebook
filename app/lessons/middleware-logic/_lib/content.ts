// =============================================================================
// app/lessons/middleware-logic/_lib/content.ts
// Inline i18n dictionary for Module 4 · Lesson 4 (Proxy / ex-middleware).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        whatIs: Section;
        primitives: Section;
        localeFix: Section;
        protectedGate: Section;
        headerInjection: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        locale: {
            badge: string;
            description: string;
            cookieLabel: string;
            clearLabel: string;
            clearingLabel: string;
            instructionsLabel: string;
        };
        headers: {
            badge: string;
            description: string;
            pathnameLabel: string;
            countryLabel: string;
            langLabel: string;
        };
        protected: {
            badge: string;
            description: string;
            cookieStatusLabel: string;
            cookiePresent: string;
            cookieAbsent: string;
            grantLabel: string;
            grantingLabel: string;
            revokeLabel: string;
            visitLabel: string;
            deniedLabel: string;
            protectedPageHeading: string;
            protectedPageBody: string;
            backLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 4 · Lezione 4',
    title: 'Proxy (ex middleware)',
    intro: "Il `proxy.ts` (in Next ≤15 era `middleware.ts`) è l'UNICO hook server-side che gira PRIMA che il routing decida quale pagina renderizzare, sull'**edge runtime**, su ogni request matchata. È dove vivono: i18n routing, A/B testing, gating di sezioni, header injection, geo detection, security headers. Niente di tutto questo può andare in un layout o in un Server Component (girano DOPO il routing). In questa lezione il proxy fa quattro cose in produzione: gating Auth.js (lez. 3), sniff lingua + cookie, gate del cookie demo, injection di header per gli RSC.",
    sections: {
        whatIs: {
            heading: "§1 Dove vive il proxy nel ciclo di vita di una request",
            description: "Quando una request arriva, l'ordine è:\n\n1. **Proxy** (`proxy.ts`) — edge runtime, decisione globale, ZERO accesso a Node/DB/WASM\n2. Routing decide il segmento\n3. Layout server-side rendering\n4. Page server-side rendering (con Suspense / Cache Components)\n5. Risposta streamata al browser\n\nIl proxy ha tre superpoteri:\n• Può **redirect/rewrite** la request prima che diventi una pagina\n• Può **iniettare header** sulla request che gli RSC leggeranno via `headers()`\n• Può **scrivere cookie** sulla response che il browser memorizzerà\n\nE tre vincoli:\n• Edge runtime → no `fs`, no driver DB nativi, no bcrypt, no PGlite WASM\n• Gira su OGNI request matchata → ogni millisecondo conta\n• Niente render: ritorna sempre un `NextResponse`, non JSX",
            snippet: `// proxy.ts — il pattern base
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect: cambia URL nel browser
  if (pathname === '/legacy') {
    return NextResponse.redirect(new URL('/new', request.url), 308);
  }

  // 2. Rewrite: cambia URL INTERNO, URL nel browser invariato
  if (pathname === '/old-internal') {
    return NextResponse.rewrite(new URL('/new-internal', request.url));
  }

  // 3. Next + mutazione: lascia passare con header/cookie modificati
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set('visited', '1', { path: '/' });
  return response;
}

// Matcher: dove il proxy gira
export const config = {
  matcher: ['/((?!api/auth|_next|favicon.ico|.*\\\\..*).*)'],
};`,
        },
        primitives: {
            heading: '§2 Le primitive del NextResponse',
            description: "Tre return possibili (e i loro casi d'uso):\n\n• **`NextResponse.next({ request: { headers } })`** → lascia passare. Opzionalmente muta gli header della REQUEST (visibili agli RSC) o aggiunge cookie via `response.cookies.set()`. È il return default per le mutation non-bloccanti (cookie write, header inject).\n\n• **`NextResponse.rewrite(url)`** → cambia URL INTERNO che il router elabora, URL nel browser RIMANE quello originale. Usato per i18n routing (`/about` → `/it/about` internamente), A/B testing (`/page` → `/page/variant-b`), feature flags. L'utente non si accorge della riscrittura.\n\n• **`NextResponse.redirect(url, status)`** → manda 307 o 308 al browser, l'URL cambia. Status: 307 = temporaneo + method-preserving, 308 = permanente. Usato per gating (login wall, paywall), legacy URL → nuovo URL, geo redirect.\n\n• **`Response`** custom (es. JSON) → blocchi e rispondi con la TUA response. Usato per rate-limit (429), maintenance mode (503), webhook validation.\n\nMatcher e ordine: il `config.matcher` filtra QUALI path attivano il proxy. Pattern regex con `(?!...)` per escludere `/_next`, `/api/auth`, statici. Sotto la pagina è già escluso il `/api/auth/*` perché Auth.js lo gestisce a parte (re-entrancy infinita altrimenti).",
            snippet: `// Quattro return diversi a confronto

// next() — lascia passare con mutazione
return NextResponse.next({
  request: { headers: requestHeaders },  // visibili agli RSC via headers()
});

// rewrite() — URL browser invariato, render interno diverso
return NextResponse.rewrite(new URL('/it/about', request.url));
// Browser vede /about, RSC renderizza /it/about

// redirect() — URL cambia, browser naviga
return NextResponse.redirect(new URL('/login', request.url), 307);

// Response custom — blocco totale
return new Response('Rate limit exceeded', {
  status: 429,
  headers: { 'Retry-After': '60' },
});`,
        },
        localeFix: {
            heading: '§3 Caso d\'uso reale: il fix del LangProvider',
            description: "Lezioni 2 e 3 avevano un problema documentato: il `<LangProvider>` usava `sessionStorage` (browser-only), quindi SSR partiva sempre da 'it' mentre il client poteva essere su 'uk' → hydration mismatch nelle parti streamate → workaround `suppressHydrationWarning` sparso.\n\nIl proxy risolve definitivamente:\n\n1. **Sniff**: legge `Accept-Language: it-IT,it;q=0.9,en-US;q=0.8,uk-UA;q=0.6` e prende la prima lingua supportata (`it`/`en`/`uk`).\n2. **Persist**: scrive `nb-lang` cookie con `Max-Age=1y`. Le request successive saltano lo sniff.\n3. **Read server-side**: il `app/lessons/layout.tsx` (Server Component) legge il cookie via `cookies()` da `next/headers` e lo passa al `LangProvider` come `initialLang`.\n4. **Client switch**: quando l'utente preme la `LangBar`, il provider riscrive il cookie via `document.cookie` (oltre a aggiornare lo state) → SSR successivo è già allineato.\n\nRisultato: SSR e prima render client partono dalla STESSA lingua → niente flicker → ELIMINATI i `suppressHydrationWarning` da Lez. 2 e 3.",
            snippet: `// proxy.ts — lo sniff
const existingLang = request.cookies.get('nb-lang')?.value;
const lang = existingLang ?? sniffAcceptLanguage(request);

const headers = new Headers(request.headers);
const response = NextResponse.next({ request: { headers } });

if (existingLang !== lang) {
  response.cookies.set('nb-lang', lang, {
    path: '/', sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,  // 1 anno, sticky
  });
}

// app/lessons/layout.tsx — lettura server-side
import { cookies } from 'next/headers';
export default async function LessonsLayout({ children }) {
  const lang = (await cookies()).get('nb-lang')?.value ?? 'it';
  return <LangProvider initialLang={lang as Lang}>{children}</LangProvider>;
}

// LangProvider riceve initialLang → useState parte già con il valore corretto
// → SSR e client primo render combaciano → no mismatch.`,
        },
        protectedGate: {
            heading: "§4 Gating di una sezione: redirect from proxy",
            description: "Pattern molto comune: certe rotte richiedono un cookie/sessione, altrimenti redirect verso una pagina di login (o, nel nostro lab, verso la pagina della lezione con `?denied=1`).\n\nLa logica vive nel proxy perché:\n• Evita render parziale: se non sei autenticato, NON renderizzare nemmeno il layout della rotta protetta\n• Centralizza la regola in un solo file\n• È edge-veloce (no DB lookup necessario se il check è cookie-only)\n\nQui usiamo un cookie `nb-demo-pass=1` impostabile dalla stessa pagina (via Server Action) — non c'è auth reale. Per gating con sessione vera userai `auth?.user` come fa Auth.js v5 (vedi Lez. 3).\n\nDifferenza importante: `redirect()` cambia l'URL del browser; `rewrite()` no. Per un \"login wall\" SEMPRE redirect (l'utente deve sapere dove sta andando). Per un \"feature flag\" → rewrite (utente non deve accorgersene).",
            snippet: `// proxy.ts — gating del cookie
if (pathname.startsWith('/lessons/middleware-logic/protected')) {
  const pass = request.cookies.get('nb-demo-pass')?.value;
  if (pass !== '1') {
    const url = request.nextUrl.clone();
    url.pathname = '/lessons/middleware-logic';
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url, 307);
  }
}

// Variante 'auth wall' con Auth.js v5 nello stesso proxy:
export default auth((request) => {
  if (pathname.startsWith('/admin') && !request.auth?.user) {
    return NextResponse.redirect(new URL('/lessons/auth-setup', request.url), 307);
  }
  // ... resto della logica
});`,
        },
        headerInjection: {
            heading: '§5 Header injection: dare agli RSC informazioni di contesto',
            description: "Gli RSC NON ricevono `request` direttamente. Per sapere il pathname corrente, l'IP, il country, il bucket A/B... devono leggere `headers()` da `next/headers`. Ma `headers()` ritorna gli header CHE IL PROXY HA EVENTUALMENTE MUTATO.\n\nQuesto è il canale ufficiale per passare info dal proxy agli RSC:\n\n1. Il proxy clona `request.headers` e setta nuove chiavi.\n2. Passa l'header clonato a `NextResponse.next({ request: { headers } })`.\n3. Gli RSC fanno `(await headers()).get('x-pathname')` e ottengono il valore.\n\nNel nostro lab iniettiamo:\n• `x-pathname` → il pathname della request (utile per analytics, breadcrumb)\n• `x-lang` → la lingua risolta (ridondante col cookie, mostriamo il pattern)\n• `x-geo-country` → da `x-vercel-ip-country` / `cf-ipcountry` o `'XX'` in dev\n\nPerché il prefisso `x-`: convenzione storica per custom header. Auth.js usa `x-auth-*`, Vercel `x-vercel-*`, Cloudflare `cf-*`. Restare nel pattern aiuta la leggibilità.",
            snippet: `// proxy.ts — inject
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-pathname', pathname);
requestHeaders.set('x-lang', lang);
requestHeaders.set(
  'x-geo-country',
  request.headers.get('x-vercel-ip-country') ?? 'XX',
);
return NextResponse.next({ request: { headers: requestHeaders } });

// Server Component — lettura
import { headers } from 'next/headers';
async function PathnameBadge() {
  const h = await headers();
  return <code>{h.get('x-pathname')}</code>;
}

// ⚠️ headers() è dynamic API → il componente diventa request-time.
// Sotto Cache Components va in <Suspense> se padre prerendered.`,
        },
    },
    decisionTable: {
        heading: '§6 Tabella decisionale: cosa nel proxy, cosa altrove',
        intro: "Il proxy è potente ma costoso (gira ovunque). La regola: se la logica DEVE girare prima del routing, va nel proxy. Tutto il resto sta meglio nel layout/page/Server Action.",
        rows: [
            { scenario: "Auth wall su /admin/*", choice: 'Proxy + redirect (no render della rotta protetta)' },
            { scenario: 'i18n routing (sniff + cookie)', choice: 'Proxy: sniff in cookie, layout legge cookie via cookies()' },
            { scenario: 'A/B test bucket persistente', choice: 'Proxy + rewrite verso variant page + cookie set' },
            { scenario: 'Security headers (CSP, HSTS)', choice: 'Proxy o `next.config.ts` → `headers()` (per header statici)' },
            { scenario: 'Rate limiting per IP', choice: 'Proxy + KV/Redis check + return 429 custom' },
            { scenario: 'Geo redirect (.it → /it)', choice: 'Proxy + redirect su prima visita' },
            { scenario: 'Pass info al RSC corrente', choice: 'Proxy header injection + RSC legge via headers()' },
            { scenario: 'Mutation che NON deve girare prima del routing', choice: 'Server Action o Route Handler (non proxy)' },
            { scenario: 'DB lookup pesante / bcrypt', choice: "NON nel proxy (edge runtime). Fallo nel layer dopo." },
        ],
    },
    labs: {
        heading: '🧪 Laboratori',
        locale: {
            badge: 'Lab 1 — Cookie nb-lang (i18n fix)',
            description: 'Il proxy ha già sniffato la tua lingua dall\'`Accept-Language` e ha settato `nb-lang`. La `LangBar` in alto sovrascrive questo cookie quando cambi lingua. Premi "Cancella cookie" e ricarica per veder rifare lo sniff dal proxy.',
            cookieLabel: 'Cookie nb-lang attuale:',
            clearLabel: 'Cancella cookie nb-lang',
            clearingLabel: 'Cancellazione…',
            instructionsLabel: 'Dopo aver cancellato, ricarica la pagina. Il proxy rivedrà l\'Accept-Language del tuo browser.',
        },
        headers: {
            badge: 'Lab 2 — Header injection (proxy → RSC)',
            description: 'Questi valori sono iniettati dal proxy nei request headers e letti dal Server Component qui sotto via `headers()` da next/headers.',
            pathnameLabel: 'x-pathname',
            countryLabel: 'x-geo-country',
            langLabel: 'x-lang',
        },
        protected: {
            badge: 'Lab 3 — Gating del cookie nb-demo-pass',
            description: 'La sottorotta `/lessons/middleware-logic/protected` richiede il cookie `nb-demo-pass=1`. Senza, il proxy ti redirige qui con `?denied=1`. Usa i bottoni per concedere/revocare il pass, poi clicca "Vai a /protected".',
            cookieStatusLabel: 'Stato cookie nb-demo-pass:',
            cookiePresent: '✓ presente — accesso consentito',
            cookieAbsent: '✗ assente — accesso bloccato',
            grantLabel: 'Concedi pass (30 min)',
            grantingLabel: 'Concessione…',
            revokeLabel: 'Revoca pass',
            visitLabel: 'Vai a /protected →',
            deniedLabel: '⛔ Il proxy ti ha redirezionato qui perché manca il cookie nb-demo-pass.',
            protectedPageHeading: 'Zona protetta',
            protectedPageBody: 'Sei riuscito a entrare perché hai il cookie `nb-demo-pass=1`. In una app reale qui andrebbe il check `auth?.user` di Auth.js. Revoca il pass nella pagina principale per testare il redirect.',
            backLabel: '← Torna alla lezione',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Apri DevTools → Application → Cookies + Network. Esegui:',
        steps: [
            "Ricarica questa pagina. Network → seleziona il documento HTML → Response Headers: cerca `set-cookie: nb-lang=...`. Solo alla PRIMA visita (cookie già presente = niente set-cookie successivi).",
            "Cambia lingua dalla LangBar in alto. Application → Cookies → vedi `nb-lang` aggiornato a `en` o `uk`. La prossima request al server sarà già nella nuova lingua → niente flicker.",
            "Lab 1: premi 'Cancella cookie nb-lang' poi ricarica. Network mostra di nuovo `set-cookie: nb-lang=...` perché il proxy ha rifatto lo sniff da Accept-Language.",
            "Lab 2: gli header `x-pathname`, `x-lang`, `x-geo-country` sono visibili nella tabella. Sono stati iniettati dal proxy e letti dal RSC via `headers()`.",
            "Lab 3 (senza pass): clicca 'Vai a /protected'. Vedi un 307 redirect nel Network tab, e l'URL diventa `/lessons/middleware-logic?denied=1`. Il proxy ha bloccato il render della rotta protetta.",
            "Lab 3 (con pass): premi 'Concedi pass', poi 'Vai a /protected'. Stavolta la rotta carica normalmente. Application → Cookies → vedi `nb-demo-pass=1` con Max-Age di 30 minuti.",
            "Confronta con Lez. 2/3: il debug-lab in `/lessons/database-orm` recita '✅ no suppressHydrationWarning' — è grazie a questa lezione. Il LangProvider è ora cookie-backed end-to-end.",
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 4 · Lesson 4',
    title: 'Proxy (was middleware)',
    intro: "The `proxy.ts` file (in Next ≤15 it was `middleware.ts`) is the ONLY server-side hook that runs BEFORE routing decides which page to render, on the **edge runtime**, on every matched request. It's where i18n routing, A/B testing, section gating, header injection, geo detection, and security headers live. None of this can go in a layout or a Server Component (they run AFTER routing). In this lesson the proxy does four things in production: Auth.js gating (Lesson 3), language sniff + cookie, demo-cookie gate, header injection for RSCs.",
    sections: {
        whatIs: {
            heading: '§1 Where the proxy sits in a request lifecycle',
            description: "When a request arrives, the order is:\n\n1. **Proxy** (`proxy.ts`) — edge runtime, global decision, ZERO access to Node/DB/WASM\n2. Routing picks the segment\n3. Layout server-side rendering\n4. Page server-side rendering (with Suspense / Cache Components)\n5. Streaming response to the browser\n\nThe proxy has three superpowers:\n• It can **redirect/rewrite** before the request becomes a page\n• It can **inject headers** on the request that RSCs will read via `headers()`\n• It can **write cookies** on the response that the browser will store\n\nAnd three constraints:\n• Edge runtime → no `fs`, no native DB drivers, no bcrypt, no PGlite WASM\n• Runs on EVERY matched request → every millisecond counts\n• No render: always returns a `NextResponse`, not JSX",
            snippet: `// proxy.ts — the base pattern
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect: change URL in the browser
  if (pathname === '/legacy') {
    return NextResponse.redirect(new URL('/new', request.url), 308);
  }

  // 2. Rewrite: change INTERNAL URL, browser URL stays
  if (pathname === '/old-internal') {
    return NextResponse.rewrite(new URL('/new-internal', request.url));
  }

  // 3. Next + mutation: let through with headers/cookies altered
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set('visited', '1', { path: '/' });
  return response;
}

// Matcher: where the proxy runs
export const config = {
  matcher: ['/((?!api/auth|_next|favicon.ico|.*\\\\..*).*)'],
};`,
        },
        primitives: {
            heading: '§2 NextResponse primitives',
            description: "Four possible returns (and their use cases):\n\n• **`NextResponse.next({ request: { headers } })`** → let through. Optionally mutate REQUEST headers (visible to RSCs) or add cookies via `response.cookies.set()`. Default return for non-blocking mutations (cookie write, header inject).\n\n• **`NextResponse.rewrite(url)`** → change the INTERNAL URL the router processes; the browser URL stays the original. Used for i18n routing (`/about` → `/it/about` internally), A/B testing (`/page` → `/page/variant-b`), feature flags. The user doesn't notice the rewrite.\n\n• **`NextResponse.redirect(url, status)`** → send 307 or 308 to the browser, URL changes. Status: 307 = temporary + method-preserving, 308 = permanent. Used for gating (login wall, paywall), legacy → new URL, geo redirect.\n\n• Custom **`Response`** (e.g. JSON) → block and respond with YOUR response. Used for rate limiting (429), maintenance mode (503), webhook validation.\n\nMatcher and order: `config.matcher` filters WHICH paths trigger the proxy. Regex pattern with `(?!...)` to exclude `/_next`, `/api/auth`, statics. The default already excludes `/api/auth/*` because Auth.js handles it separately (infinite re-entrancy otherwise).",
            snippet: `// Four different returns compared

// next() — let through with mutation
return NextResponse.next({
  request: { headers: requestHeaders },  // visible to RSCs via headers()
});

// rewrite() — browser URL stays, internal render differs
return NextResponse.rewrite(new URL('/it/about', request.url));
// Browser sees /about, RSC renders /it/about

// redirect() — URL changes, browser navigates
return NextResponse.redirect(new URL('/login', request.url), 307);

// Custom Response — total block
return new Response('Rate limit exceeded', {
  status: 429,
  headers: { 'Retry-After': '60' },
});`,
        },
        localeFix: {
            heading: '§3 Real use case: the LangProvider fix',
            description: "Lessons 2 and 3 had a documented problem: `<LangProvider>` used `sessionStorage` (browser-only), so SSR always started in 'it' while the client might be on 'uk' → hydration mismatch in streamed parts → `suppressHydrationWarning` workarounds scattered around.\n\nThe proxy solves this definitively:\n\n1. **Sniff**: reads `Accept-Language: it-IT,it;q=0.9,en-US;q=0.8,uk-UA;q=0.6` and picks the first supported language (`it`/`en`/`uk`).\n2. **Persist**: writes `nb-lang` cookie with `Max-Age=1y`. Subsequent requests skip the sniff.\n3. **Server-side read**: `app/lessons/layout.tsx` (Server Component) reads the cookie via `cookies()` from `next/headers` and passes it to `LangProvider` as `initialLang`.\n4. **Client switch**: when the user presses the `LangBar`, the provider rewrites the cookie via `document.cookie` (in addition to updating state) → the next SSR is already aligned.\n\nResult: SSR and first client render start from the SAME language → no flicker → `suppressHydrationWarning` REMOVED from Lessons 2 and 3.",
            snippet: `// proxy.ts — the sniff
const existingLang = request.cookies.get('nb-lang')?.value;
const lang = existingLang ?? sniffAcceptLanguage(request);

const headers = new Headers(request.headers);
const response = NextResponse.next({ request: { headers } });

if (existingLang !== lang) {
  response.cookies.set('nb-lang', lang, {
    path: '/', sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,  // 1 year, sticky
  });
}

// app/lessons/layout.tsx — server-side read
import { cookies } from 'next/headers';
export default async function LessonsLayout({ children }) {
  const lang = (await cookies()).get('nb-lang')?.value ?? 'it';
  return <LangProvider initialLang={lang as Lang}>{children}</LangProvider>;
}

// LangProvider receives initialLang → useState starts with the correct value
// → SSR and first client render match → no mismatch.`,
        },
        protectedGate: {
            heading: '§4 Gating a section: redirect from proxy',
            description: "Very common pattern: some routes require a cookie/session, otherwise redirect to a login page (or, in our lab, back to the lesson page with `?denied=1`).\n\nThe logic lives in the proxy because:\n• Avoids partial render: if you're not authenticated, DON'T even render the protected route's layout\n• Centralises the rule in a single file\n• It's edge-fast (no DB lookup needed if the check is cookie-only)\n\nHere we use a `nb-demo-pass=1` cookie that the same page can set (via Server Action) — no real auth. For real session gating you'd use `auth?.user` like Auth.js v5 does (see Lesson 3).\n\nImportant difference: `redirect()` changes the browser URL; `rewrite()` doesn't. For a \"login wall\" ALWAYS use redirect (the user needs to know where they're going). For a \"feature flag\" → rewrite (the user shouldn't notice).",
            snippet: `// proxy.ts — cookie gating
if (pathname.startsWith('/lessons/middleware-logic/protected')) {
  const pass = request.cookies.get('nb-demo-pass')?.value;
  if (pass !== '1') {
    const url = request.nextUrl.clone();
    url.pathname = '/lessons/middleware-logic';
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url, 307);
  }
}

// 'auth wall' variant with Auth.js v5 in the same proxy:
export default auth((request) => {
  if (pathname.startsWith('/admin') && !request.auth?.user) {
    return NextResponse.redirect(new URL('/lessons/auth-setup', request.url), 307);
  }
  // ... rest of the logic
});`,
        },
        headerInjection: {
            heading: '§5 Header injection: giving RSCs context info',
            description: "RSCs do NOT receive `request` directly. To know the current pathname, IP, country, A/B bucket… they have to read `headers()` from `next/headers`. But `headers()` returns the headers THE PROXY MAY HAVE MUTATED.\n\nThis is the official channel to pass info from proxy to RSCs:\n\n1. The proxy clones `request.headers` and sets new keys.\n2. Passes the cloned headers to `NextResponse.next({ request: { headers } })`.\n3. RSCs call `(await headers()).get('x-pathname')` and get the value.\n\nIn our lab we inject:\n• `x-pathname` → the request pathname (useful for analytics, breadcrumb)\n• `x-lang` → the resolved language (redundant with the cookie, we show the pattern)\n• `x-geo-country` → from `x-vercel-ip-country` / `cf-ipcountry` or `'XX'` in dev\n\nWhy the `x-` prefix: historical convention for custom headers. Auth.js uses `x-auth-*`, Vercel `x-vercel-*`, Cloudflare `cf-*`. Staying in the pattern helps readability.",
            snippet: `// proxy.ts — inject
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-pathname', pathname);
requestHeaders.set('x-lang', lang);
requestHeaders.set(
  'x-geo-country',
  request.headers.get('x-vercel-ip-country') ?? 'XX',
);
return NextResponse.next({ request: { headers: requestHeaders } });

// Server Component — read
import { headers } from 'next/headers';
async function PathnameBadge() {
  const h = await headers();
  return <code>{h.get('x-pathname')}</code>;
}

// ⚠️ headers() is a dynamic API → the component becomes request-time.
// Under Cache Components it must live inside <Suspense> if the parent
// is prerendered.`,
        },
    },
    decisionTable: {
        heading: '§6 Decision table: what in the proxy, what elsewhere',
        intro: "The proxy is powerful but costly (runs everywhere). The rule: if the logic MUST run before routing, it goes in the proxy. Everything else is better in layout/page/Server Action.",
        rows: [
            { scenario: 'Auth wall on /admin/*', choice: 'Proxy + redirect (no render of the protected route)' },
            { scenario: 'i18n routing (sniff + cookie)', choice: 'Proxy: sniff into cookie, layout reads cookie via cookies()' },
            { scenario: 'Persistent A/B test bucket', choice: 'Proxy + rewrite to variant page + cookie set' },
            { scenario: 'Security headers (CSP, HSTS)', choice: 'Proxy or `next.config.ts` → `headers()` (for static headers)' },
            { scenario: 'Per-IP rate limiting', choice: 'Proxy + KV/Redis check + return custom 429' },
            { scenario: 'Geo redirect (.it → /it)', choice: 'Proxy + redirect on first visit' },
            { scenario: 'Pass info to the current RSC', choice: 'Proxy header injection + RSC reads via headers()' },
            { scenario: "Mutation that doesn't need to run before routing", choice: 'Server Action or Route Handler (not the proxy)' },
            { scenario: 'Heavy DB lookup / bcrypt', choice: "NOT in the proxy (edge runtime). Do it in the layer after." },
        ],
    },
    labs: {
        heading: '🧪 Labs',
        locale: {
            badge: 'Lab 1 — nb-lang cookie (i18n fix)',
            description: 'The proxy already sniffed your language from `Accept-Language` and set `nb-lang`. The `LangBar` at the top overwrites this cookie when you switch language. Press "Clear cookie" and reload to see the proxy re-sniff.',
            cookieLabel: 'Current nb-lang cookie:',
            clearLabel: 'Clear nb-lang cookie',
            clearingLabel: 'Clearing…',
            instructionsLabel: "After clearing, reload the page. The proxy will re-read your browser's Accept-Language.",
        },
        headers: {
            badge: 'Lab 2 — Header injection (proxy → RSC)',
            description: 'These values are injected by the proxy into request headers and read by the Server Component below via `headers()` from next/headers.',
            pathnameLabel: 'x-pathname',
            countryLabel: 'x-geo-country',
            langLabel: 'x-lang',
        },
        protected: {
            badge: 'Lab 3 — Gating with nb-demo-pass cookie',
            description: 'The subroute `/lessons/middleware-logic/protected` requires the `nb-demo-pass=1` cookie. Without it, the proxy redirects you here with `?denied=1`. Use the buttons to grant/revoke the pass, then click "Visit /protected".',
            cookieStatusLabel: 'nb-demo-pass cookie status:',
            cookiePresent: '✓ present — access granted',
            cookieAbsent: '✗ absent — access blocked',
            grantLabel: 'Grant pass (30 min)',
            grantingLabel: 'Granting…',
            revokeLabel: 'Revoke pass',
            visitLabel: 'Visit /protected →',
            deniedLabel: '⛔ The proxy redirected you here because the nb-demo-pass cookie is missing.',
            protectedPageHeading: 'Protected zone',
            protectedPageBody: 'You got in because you have the `nb-demo-pass=1` cookie. In a real app, this is where the Auth.js `auth?.user` check would live. Revoke the pass on the main page to test the redirect.',
            backLabel: '← Back to the lesson',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Open DevTools → Application → Cookies + Network. Run through:',
        steps: [
            "Reload this page. Network → select the HTML document → Response Headers: look for `set-cookie: nb-lang=...`. Only on the FIRST visit (cookie already present = no further set-cookie).",
            "Switch language from the LangBar at the top. Application → Cookies → see `nb-lang` updated to `en` or `uk`. The next request to the server is already in the new language → no flicker.",
            "Lab 1: press 'Clear nb-lang cookie' then reload. Network shows `set-cookie: nb-lang=...` again because the proxy re-sniffed Accept-Language.",
            "Lab 2: the `x-pathname`, `x-lang`, `x-geo-country` headers are visible in the table. They were injected by the proxy and read by the RSC via `headers()`.",
            "Lab 3 (no pass): click 'Visit /protected'. You see a 307 redirect in the Network tab and the URL becomes `/lessons/middleware-logic?denied=1`. The proxy blocked the render of the protected route.",
            "Lab 3 (with pass): press 'Grant pass', then 'Visit /protected'. This time the route loads normally. Application → Cookies → see `nb-demo-pass=1` with a 30-minute Max-Age.",
            "Compare with Lessons 2/3: the debug-lab in `/lessons/database-orm` says '✅ no suppressHydrationWarning' — that's thanks to this lesson. LangProvider is now cookie-backed end-to-end.",
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 4 · Лекція 4',
    title: 'Proxy (раніше middleware)',
    intro: "Файл `proxy.ts` (у Next ≤15 був `middleware.ts`) — ЄДИНИЙ server-side хук, що виконується ДО того, як routing вирішить яку сторінку рендерити, на **edge runtime**, на кожному matched запиті. Тут живуть: i18n routing, A/B testing, gating секцій, header injection, geo detection, security headers. Нічого з цього не може жити в layout або Server Component (вони запускаються ПІСЛЯ routing). У цій лекції proxy робить чотири речі в production: gating Auth.js (Лекція 3), sniff мови + cookie, gate demo cookie, injection header-ів для RSC.",
    sections: {
        whatIs: {
            heading: '§1 Де живе proxy у lifecycle запиту',
            description: "Коли запит приходить, порядок такий:\n\n1. **Proxy** (`proxy.ts`) — edge runtime, глобальне рішення, НУЛЬ доступу до Node/DB/WASM\n2. Routing обирає сегмент\n3. Layout server-side rendering\n4. Page server-side rendering (з Suspense / Cache Components)\n5. Streaming відповідь у браузер\n\nProxy має три суперсили:\n• Може **redirect/rewrite** запит до того, як він стане сторінкою\n• Може **інʼєктувати header** на запит, який RSC прочитають через `headers()`\n• Може **писати cookie** на response, які браузер збереже\n\nТри обмеження:\n• Edge runtime → немає `fs`, нативних DB driver-ів, bcrypt, PGlite WASM\n• Працює на КОЖНОМУ matched запиті → кожна мілісекунда має значення\n• Без render: завжди повертає `NextResponse`, не JSX",
            snippet: `// proxy.ts — базовий патерн
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect: змінює URL у браузері
  if (pathname === '/legacy') {
    return NextResponse.redirect(new URL('/new', request.url), 308);
  }

  // 2. Rewrite: змінює ВНУТРІШНІЙ URL, URL у браузері той самий
  if (pathname === '/old-internal') {
    return NextResponse.rewrite(new URL('/new-internal', request.url));
  }

  // 3. Next + мутація: пропускає з модифікованими header/cookie
  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set('visited', '1', { path: '/' });
  return response;
}

export const config = {
  matcher: ['/((?!api/auth|_next|favicon.ico|.*\\\\..*).*)'],
};`,
        },
        primitives: {
            heading: '§2 Примітиви NextResponse',
            description: "Чотири можливі return (і їх use case):\n\n• **`NextResponse.next({ request: { headers } })`** → пропустити. Опційно змінити header REQUEST (видимі RSC-ам) або додати cookie через `response.cookies.set()`. Default для non-blocking мутацій (cookie write, header inject).\n\n• **`NextResponse.rewrite(url)`** → змінює ВНУТРІШНІЙ URL, що обробляє router; URL у браузері ЗАЛИШАЄТЬСЯ оригіналом. Для i18n routing (`/about` → `/it/about` внутрішньо), A/B testing, feature flags. Користувач не помічає rewrite.\n\n• **`NextResponse.redirect(url, status)`** → 307 або 308 у браузер, URL змінюється. Status: 307 = тимчасовий + method-preserving, 308 = постійний. Для gating (login wall), legacy → new URL, geo redirect.\n\n• Custom **`Response`** (наприклад JSON) → блокуєш і відповідаєш СВОЇМ response. Для rate limiting (429), maintenance mode (503), webhook validation.\n\nMatcher і порядок: `config.matcher` фільтрує ЯКІ шляхи активують proxy. Regex з `(?!...)` для виключення `/_next`, `/api/auth`, статичних. За замовчуванням вже виключений `/api/auth/*`, бо Auth.js обробляє його окремо (інфінітне re-entrancy інакше).",
            snippet: `// Чотири різні return порівняно

// next() — пропусти з мутацією
return NextResponse.next({
  request: { headers: requestHeaders },  // видимі RSC-ам через headers()
});

// rewrite() — URL у браузері той самий, внутрішній render інший
return NextResponse.rewrite(new URL('/it/about', request.url));
// Браузер бачить /about, RSC рендерить /it/about

// redirect() — URL змінюється, браузер навігує
return NextResponse.redirect(new URL('/login', request.url), 307);

// Custom Response — тотальний блок
return new Response('Rate limit exceeded', {
  status: 429,
  headers: { 'Retry-After': '60' },
});`,
        },
        localeFix: {
            heading: '§3 Реальний use case: фікс LangProvider',
            description: "Лекції 2 і 3 мали задокументовану проблему: `<LangProvider>` використовував `sessionStorage` (browser-only), тому SSR завжди починав з 'it', а клієнт міг бути на 'uk' → hydration mismatch у streamed частинах → workaround `suppressHydrationWarning` розсіяно.\n\nProxy вирішує остаточно:\n\n1. **Sniff**: читає `Accept-Language: it-IT,it;q=0.9,en-US;q=0.8,uk-UA;q=0.6` і бере першу підтримувану мову (`it`/`en`/`uk`).\n2. **Persist**: пише cookie `nb-lang` з `Max-Age=1y`. Наступні запити пропускають sniff.\n3. **Server-side read**: `app/lessons/layout.tsx` (Server Component) читає cookie через `cookies()` з `next/headers` і передає до `LangProvider` як `initialLang`.\n4. **Client switch**: коли користувач натискає `LangBar`, provider перезаписує cookie через `document.cookie` (плюс оновлення state) → наступний SSR вже узгоджений.\n\nРезультат: SSR і перший client render починаються з ТІЄЇ САМОЇ мови → нуль flicker → `suppressHydrationWarning` ВИДАЛЕНІ з Лекцій 2 і 3.",
            snippet: `// proxy.ts — sniff
const existingLang = request.cookies.get('nb-lang')?.value;
const lang = existingLang ?? sniffAcceptLanguage(request);

const headers = new Headers(request.headers);
const response = NextResponse.next({ request: { headers } });

if (existingLang !== lang) {
  response.cookies.set('nb-lang', lang, {
    path: '/', sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,  // 1 рік, sticky
  });
}

// app/lessons/layout.tsx — server-side read
import { cookies } from 'next/headers';
export default async function LessonsLayout({ children }) {
  const lang = (await cookies()).get('nb-lang')?.value ?? 'it';
  return <LangProvider initialLang={lang as Lang}>{children}</LangProvider>;
}

// LangProvider отримує initialLang → useState починає з правильного значення
// → SSR і перший client render збігаються → немає mismatch.`,
        },
        protectedGate: {
            heading: '§4 Gating секції: redirect з proxy',
            description: "Дуже поширений патерн: деякі маршрути потребують cookie/сесію, інакше redirect на сторінку login (або, у нашому labі, назад на сторінку лекції з `?denied=1`).\n\nЛогіка живе в proxy, бо:\n• Уникає часткового render: якщо не автентифікований, НЕ рендерити навіть layout захищеного маршруту\n• Централізує правило в одному файлі\n• Edge-швидко (без DB lookup, якщо перевірка лише cookie-based)\n\nТут ми використовуємо cookie `nb-demo-pass=1`, який сама сторінка може встановити (через Server Action) — без реальної auth. Для реального session gating використовуй `auth?.user` як Auth.js v5 (див. Лекцію 3).\n\nВажлива різниця: `redirect()` змінює URL у браузері; `rewrite()` — ні. Для 'login wall' ЗАВЖДИ redirect (юзер має знати куди йде). Для 'feature flag' → rewrite (юзер не повинен помітити).",
            snippet: `// proxy.ts — gating cookie
if (pathname.startsWith('/lessons/middleware-logic/protected')) {
  const pass = request.cookies.get('nb-demo-pass')?.value;
  if (pass !== '1') {
    const url = request.nextUrl.clone();
    url.pathname = '/lessons/middleware-logic';
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url, 307);
  }
}

// 'auth wall' варіант з Auth.js v5 у тому самому proxy:
export default auth((request) => {
  if (pathname.startsWith('/admin') && !request.auth?.user) {
    return NextResponse.redirect(new URL('/lessons/auth-setup', request.url), 307);
  }
  // ... решта логіки
});`,
        },
        headerInjection: {
            heading: '§5 Header injection: давати RSC контекстну інфо',
            description: "RSC НЕ отримують `request` напряму. Щоб знати поточний pathname, IP, country, A/B bucket... вони мають читати `headers()` з `next/headers`. Але `headers()` повертає header-и, ЩО PROXY МІГ ЗМІНИТИ.\n\nЦе офіційний канал передачі інфо від proxy до RSC:\n\n1. Proxy клонує `request.headers` і встановлює нові ключі.\n2. Передає клоновані headers в `NextResponse.next({ request: { headers } })`.\n3. RSC викликають `(await headers()).get('x-pathname')` і отримують значення.\n\nУ нашому labі ми інʼєктуємо:\n• `x-pathname` → pathname запиту (корисно для analytics, breadcrumb)\n• `x-lang` → resolve-нута мова (надлишково з cookie, показуємо патерн)\n• `x-geo-country` → з `x-vercel-ip-country` / `cf-ipcountry` або `'XX'` в dev\n\nЧому префікс `x-`: історична конвенція для custom header. Auth.js використовує `x-auth-*`, Vercel `x-vercel-*`, Cloudflare `cf-*`. Дотримання патерну допомагає читабельності.",
            snippet: `// proxy.ts — inject
const requestHeaders = new Headers(request.headers);
requestHeaders.set('x-pathname', pathname);
requestHeaders.set('x-lang', lang);
requestHeaders.set(
  'x-geo-country',
  request.headers.get('x-vercel-ip-country') ?? 'XX',
);
return NextResponse.next({ request: { headers: requestHeaders } });

// Server Component — read
import { headers } from 'next/headers';
async function PathnameBadge() {
  const h = await headers();
  return <code>{h.get('x-pathname')}</code>;
}

// ⚠️ headers() — dynamic API → компонент стає request-time.
// При Cache Components має жити в <Suspense>, якщо parent prerendered.`,
        },
    },
    decisionTable: {
        heading: '§6 Decision table: що в proxy, що деінде',
        intro: "Proxy потужний, але дорогий (працює всюди). Правило: якщо логіка МАЄ працювати перед routing, вона йде в proxy. Все інше краще в layout/page/Server Action.",
        rows: [
            { scenario: 'Auth wall на /admin/*', choice: 'Proxy + redirect (без render захищеного маршруту)' },
            { scenario: 'i18n routing (sniff + cookie)', choice: 'Proxy: sniff у cookie, layout читає cookie через cookies()' },
            { scenario: 'Постійний A/B test bucket', choice: 'Proxy + rewrite на variant page + cookie set' },
            { scenario: 'Security headers (CSP, HSTS)', choice: 'Proxy або `next.config.ts` → `headers()` (для статичних)' },
            { scenario: 'Rate limiting по IP', choice: 'Proxy + KV/Redis check + return custom 429' },
            { scenario: 'Geo redirect (.it → /it)', choice: 'Proxy + redirect на першому візиті' },
            { scenario: 'Передати інфо поточному RSC', choice: 'Proxy header injection + RSC читає через headers()' },
            { scenario: 'Mutation, яка не має йти перед routing', choice: 'Server Action або Route Handler (не proxy)' },
            { scenario: 'Важкий DB lookup / bcrypt', choice: "НЕ в proxy (edge runtime). Зроби в шарі після." },
        ],
    },
    labs: {
        heading: '🧪 Лабораторії',
        locale: {
            badge: 'Lab 1 — Cookie nb-lang (i18n фікс)',
            description: 'Proxy вже sniff-нув твою мову з `Accept-Language` і встановив `nb-lang`. `LangBar` зверху перезаписує цей cookie, коли змінюєш мову. Натисни "Очистити cookie" і перезавантаж, щоб побачити повторний sniff від proxy.',
            cookieLabel: 'Поточний nb-lang cookie:',
            clearLabel: 'Очистити nb-lang cookie',
            clearingLabel: 'Очищення…',
            instructionsLabel: 'Після очищення перезавантаж сторінку. Proxy перечитає Accept-Language твого браузера.',
        },
        headers: {
            badge: 'Lab 2 — Header injection (proxy → RSC)',
            description: 'Ці значення інʼєктовані proxy в request headers і прочитані Server Component-ом нижче через `headers()` з next/headers.',
            pathnameLabel: 'x-pathname',
            countryLabel: 'x-geo-country',
            langLabel: 'x-lang',
        },
        protected: {
            badge: 'Lab 3 — Gating з cookie nb-demo-pass',
            description: 'Підмаршрут `/lessons/middleware-logic/protected` потребує cookie `nb-demo-pass=1`. Без нього proxy перенаправляє тебе сюди з `?denied=1`. Використай кнопки для grant/revoke pass, потім натисни "До /protected".',
            cookieStatusLabel: 'Статус cookie nb-demo-pass:',
            cookiePresent: '✓ присутній — доступ дозволено',
            cookieAbsent: '✗ відсутній — доступ заблоковано',
            grantLabel: 'Дати pass (30 хв)',
            grantingLabel: 'Надання…',
            revokeLabel: 'Відкликати pass',
            visitLabel: 'До /protected →',
            deniedLabel: '⛔ Proxy перенаправив тебе сюди, бо немає cookie nb-demo-pass.',
            protectedPageHeading: 'Захищена зона',
            protectedPageBody: 'Ти зайшов, бо в тебе є cookie `nb-demo-pass=1`. У реальному застосунку тут була б перевірка `auth?.user` з Auth.js. Відклич pass на головній сторінці, щоб протестувати redirect.',
            backLabel: '← Назад до лекції',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Відкрий DevTools → Application → Cookies + Network. Зроби:',
        steps: [
            "Перезавантаж цю сторінку. Network → обери HTML документ → Response Headers: шукай `set-cookie: nb-lang=...`. Лише на ПЕРШОМУ візиті (cookie вже є = немає наступних set-cookie).",
            "Зміни мову через LangBar зверху. Application → Cookies → побачиш `nb-lang` оновлений на `en` або `uk`. Наступний запит до сервера вже буде в новій мові → без flicker.",
            "Lab 1: натисни 'Очистити nb-lang cookie' і перезавантаж. Network знову показує `set-cookie: nb-lang=...`, бо proxy перепровів sniff з Accept-Language.",
            "Lab 2: header `x-pathname`, `x-lang`, `x-geo-country` видимі в таблиці. Інʼєктовані proxy і прочитані RSC через `headers()`.",
            "Lab 3 (без pass): натисни 'До /protected'. Бачиш 307 redirect у Network tab, URL стає `/lessons/middleware-logic?denied=1`. Proxy заблокував render захищеного маршруту.",
            "Lab 3 (з pass): натисни 'Дати pass', потім 'До /protected'. Цього разу маршрут завантажується нормально. Application → Cookies → бачиш `nb-demo-pass=1` з Max-Age 30 хвилин.",
            "Порівняй з Лекціями 2/3: debug-lab в `/lessons/database-orm` каже '✅ no suppressHydrationWarning' — це завдяки цій лекції. LangProvider тепер cookie-backed end-to-end.",
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
export type { Dictionary };
