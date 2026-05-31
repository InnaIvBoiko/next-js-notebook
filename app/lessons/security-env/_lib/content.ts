// =============================================================================
// app/lessons/security-env/_lib/content.ts
// Inline i18n dictionary for Module 5 · Lesson 3 (Env & Security).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        bundleSplit: Section;
        envLoading: Section;
        zodValidation: Section;
        serverOnly: Section;
        staticHeaders: Section;
        cspNonce: Section;
        webhookHmac: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        env: {
            badge: string;
            description: string;
            clientHeading: string;
            serverHeading: string;
            leakWarning: string;
            safeHint: string;
        };
        headers: {
            badge: string;
            description: string;
            cspLabel: string;
            hstsLabel: string;
            frameLabel: string;
            referrerLabel: string;
            permissionsLabel: string;
            nonceLabel: string;
        };
        csp: {
            badge: string;
            description: string;
            allowedLabel: string;
            allowedHint: string;
            blockedLabel: string;
            blockedHint: string;
            triggerLabel: string;
            successLabel: string;
            failureLabel: string;
            // Outcome shown when the inline script was blocked by an
            // enforced CSP (production).
            blockedSuccessLabel: string;
            // Outcome shown in dev when CSP is Report-Only: the script DID
            // run but the browser logged a violation. We surface that
            // explicitly so the user understands the dev/prod difference.
            reportOnlyLabel: string;
        };
        webhook: {
            badge: string;
            description: string;
            payloadLabel: string;
            modeLabel: string;
            modeCorrect: string;
            modeTampered: string;
            sendLabel: string;
            sendingLabel: string;
            statusLabel: string;
            responseLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 5 · Lezione 3',
    title: 'Variabili & Sicurezza',
    intro: "Tre cose separano un Next 16 \"hobby\" da uno production-ready: (1) gli env vengono **validati al boot** invece di essere `process.env.X` sparpagliati a caso, (2) ogni modulo che tocca un secret porta `import 'server-only'` come tripwire al bundler, (3) le response portano **security headers** ben oliati — statici in `next.config.ts` per le cose tranquille (HSTS, X-Frame-Options) e un **CSP con nonce per-request** generato nel `proxy.ts` per fermare l'XSS. Sopra a tutto: un endpoint `/api/webhook` che verifica firme HMAC in tempo costante. Si vede tutto live nei tre lab.",
    sections: {
        bundleSplit: {
            heading: '§1 Server vs Client: cosa finisce davvero nel browser',
            description: "Next 16 fa **due bundle separati**: uno server (Node, ha accesso a `process.env`, `fs`, DB driver, secret) e uno client (browser, NIENTE secret). Il confine si traccia con la direttiva `'use client'` in cima al file. Quello che il bundler SBAGLIA è: se un modulo server viene importato (anche indirettamente) da un modulo client, finisce nel bundle del browser. E con lui tutte le sue dipendenze, incluso quel modulo che leggeva `process.env.DATABASE_URL`. Una catena di import di 5 livelli che parte da una utility innocente può portare la connection string Postgres dentro un JavaScript scaricato da ogni visitatore. È il bug più costoso che vedrai in produzione.",
            snippet: `// app/lessons/security-env/_lib/server-only-secret.ts
import 'server-only';            // ← tripwire
import { env } from './env';     // legge process.env.WEBHOOK_SECRET

export async function signPayload(payload: string) { /* HMAC */ }

// app/lessons/security-env/_components/safe-client.tsx
'use client';
import { signPayload } from '../_lib/server-only-secret';
//          ^^^^^^^^^^^^ ← Turbopack ERRORE al build:
//   "You're importing a component that needs 'server-only'.
//    It only works in a Server Component."`,
        },
        envLoading: {
            heading: '§2 .env, .env.local, NEXT_PUBLIC_*',
            description: "Quattro file caricati IN ORDINE (l'ultimo vince):\n\n1. `.env` (committato — defaults)\n2. `.env.development` / `.env.production` (committati — per ambiente)\n3. `.env.local` (gitignored — secret del dev)\n4. variabili shell (override puntuale)\n\nDue regole non negoziabili:\n• **Niente secret in `.env`** committato — quel file finisce su GitHub\n• **`NEXT_PUBLIC_` significa PUBBLICO**: viene inlinato in TUTTO il JS che spedisci al browser. Mettere un secret qui = leak garantito. Il prefisso esiste per cose che SONO pubbliche: nome del sito, base URL dell'API, feature flag.",
            snippet: `# .env.local (gitignored)
WEBHOOK_SECRET=lc9c4...                    # solo server
AUTH_SECRET=lD+ZuN...                      # solo server
NEXT_PUBLIC_SITE_NAME=Living Notebook      # pubblico
NEXT_PUBLIC_FEATURE_BETA=true              # pubblico

# ❌ TRAPPOLA — mai farlo:
# NEXT_PUBLIC_API_KEY=sk_live_xxxxx        # NO, finisce nei bundle client`,
        },
        zodValidation: {
            heading: '§3 zod schema al boot',
            description: "`process.env` è `Record<string, string | undefined>` — TS non sa NIENTE di cosa contiene. Soluzione production: definisci uno schema zod, validalo all'import del modulo `_lib/env.ts`, esporta un oggetto `env` tipizzato. Vantaggi: (1) errore al BOOT se manca o è malformato (vs scoprirlo alle 3 di notte quando il webhook restituisce 500); (2) autocomplete nello IDE; (3) parsing di stringhe in numeri/boolean/URL gratis. Il dev/build crasha con un messaggio che dice ESATTAMENTE quale variabile è il problema.",
            snippet: `// app/lessons/security-env/_lib/env.ts
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  WEBHOOK_SECRET: z.string().min(16),
  AUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Living Notebook'),
  NEXT_PUBLIC_FEATURE_BETA: z.string().transform(v => v === 'true'),
});

export const env = envSchema.parse(process.env);
// ↑ throws AT BOOT con messaggio dettagliato se qualcosa è mancante`,
        },
        serverOnly: {
            heading: '§4 import \'server-only\' come tripwire',
            description: "Il pacchetto `server-only` (di Vercel, ufficiale) esporta un singolo modulo che fa `throw` se viene risolto nel bundle client. Lo importi all'inizio di OGNI file che tocca secret/DB/secret-derived. Se per errore un Client Component (o un suo antenato in `'use client'`) importa quel file, il build esplode con un errore inequivocabile: *\"You're importing a component that needs server-only. It only works in a Server Component but one of its parents is marked with 'use client'\"*. Costo: una dipendenza vuota (0 bytes runtime). Beneficio: zero leak accidentali.",
            snippet: `// _lib/server-only-secret.ts
import 'server-only';
import { env } from './env';

export async function signPayload(body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(body),
  );
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}`,
        },
        staticHeaders: {
            heading: '§5 Security headers in next.config.ts',
            description: "Headers che non cambiano per request: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. Vivono in `next.config.ts` → applicati a OGNI response, anche `/api/*` e file statici (che il proxy NON copre, perché il matcher li esclude). Quando il proxy non gira (es. `/api/auth` che è escluso), questi headers ti salvano comunque. Defense in depth: due strati che ti coprono l'uno con l'altro.",
            snippet: `// next.config.ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}`,
        },
        cspNonce: {
            heading: '§6 CSP con nonce per-request via proxy',
            description: "CSP (Content Security Policy) è il singolo header più potente contro XSS. La modalità senior: invece di `'unsafe-inline'` (che disattiva metà delle protezioni), generi un **nonce casuale per ogni request** nel `proxy.ts`, lo aggiungi al `script-src` della CSP, e lo applichi via `nonce={…}` sui `<Script>` legittimi. Qualsiasi script inline NON nonce-tagged viene bloccato dal browser. In dev usiamo `Content-Security-Policy-Report-Only` (logga ma non blocca → HMR di Turbopack continua a funzionare); in prod è enforced.",
            snippet: `// proxy.ts
const nonceBytes = new Uint8Array(16);
crypto.getRandomValues(nonceBytes);
const nonce = btoa(String.fromCharCode(...nonceBytes));
requestHeaders.set('x-nonce', nonce);

const csp = [
  \`default-src 'self'\`,
  \`script-src 'self' 'nonce-\${nonce}'\`,
  \`style-src 'self' 'unsafe-inline'\`,
  \`img-src 'self' blob: data: https://picsum.photos\`,
  \`frame-ancestors 'none'\`,
].join('; ');

response.headers.set(
  isProd ? 'Content-Security-Policy'
         : 'Content-Security-Policy-Report-Only',
  csp,
);`,
        },
        webhookHmac: {
            heading: '§7 Webhook con firma HMAC in tempo costante',
            description: "Stripe, GitHub, Slack, Twilio: ogni webhook serio firma il body con un secret condiviso. Tu (receiver) ricomputi l'HMAC sul body RAW e confronti — in **tempo costante** (no early-exit sul primo byte sbagliato, altrimenti un attaccante misura il response time e indovina il secret byte per byte). Lo facciamo via `crypto.subtle` di Web Crypto: stesso codice gira identico su Node, Edge runtime, Cloudflare Workers, Deno.",
            snippet: `// app/api/webhook/route.ts
export async function POST(request: Request) {
  const claimedSig = request.headers.get('x-nb-signature');
  if (!claimedSig) return Response.json({ error: '…' }, { status: 400 });

  const body = await request.text();  // RAW, non JSON.parse
  const expectedSig = await signPayload(body);

  // === DEVE essere constant-time, non '==='
  if (!timingSafeEqual(claimedSig, expectedSig)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);  // safe SOLO dopo la verifica
  // … dispatch al job queue …
  return Response.json({ ok: true });
}`,
        },
    },
    decisionTable: {
        heading: '§8 Quale primitivo per quale problema?',
        intro: 'Mapping scenario → API.',
        rows: [
            {
                scenario: 'Un secret che il backend deve leggere',
                choice: '.env.local + zod schema + import \'server-only\'',
            },
            {
                scenario: 'Un valore pubblico (site name, feature flag)',
                choice: 'NEXT_PUBLIC_* in .env',
            },
            {
                scenario: 'Bloccare un import accidentale di codice server in Client',
                choice: 'import \'server-only\' nel modulo sensibile',
            },
            {
                scenario: 'Forzare HTTPS, fermare clickjacking, MIME-sniff',
                choice: 'Static headers in next.config.ts → headers()',
            },
            {
                scenario: 'Fermare XSS da inline script malevoli',
                choice: 'CSP con nonce per-request nel proxy.ts',
            },
            {
                scenario: 'Verificare un payload inviato da un servizio esterno',
                choice: 'HMAC-SHA256 con crypto.subtle + timingSafeEqual',
            },
            {
                scenario: 'CSRF su una Server Action',
                choice: 'Automatico (Next li blocca con origin check)',
            },
            {
                scenario: 'CSRF su Auth.js',
                choice: 'Automatico (Auth.js v5 ha CSRF token built-in)',
            },
        ],
    },
    labs: {
        heading: '🧪 Lab interattivi',
        env: {
            badge: 'Lab 1',
            description: "Lato Server (la pagina di lezione è un Server Component) leggiamo TUTTI gli env. Lato Client leggiamo solo i `NEXT_PUBLIC_*`. Prova: apri DevTools → Sources → cerca \"WEBHOOK_SECRET\" nel bundle JS → NON la trovi. Cerca \"Living Notebook\" → la trovi inlineata. Questa è la prova visiva del confine Server/Client.",
            clientHeading: 'Lato Client (process.env letto da \'use client\')',
            serverHeading: 'Lato Server (process.env letto dalla page)',
            leakWarning: '⚠️ Se vedessi un secret qui sotto, il leak sarebbe già avvenuto',
            safeHint: '✓ Solo NEXT_PUBLIC_* dovrebbero essere accessibili lato Client',
        },
        headers: {
            badge: 'Lab 2',
            description: 'Headers della response corrente, letti dalla page tramite `headers()`. Aprili anche in DevTools → Network → click sulla request HTML → Response Headers per confermare.',
            cspLabel: 'Content-Security-Policy (-Report-Only in dev)',
            hstsLabel: 'Strict-Transport-Security',
            frameLabel: 'X-Frame-Options',
            referrerLabel: 'Referrer-Policy',
            permissionsLabel: 'Permissions-Policy',
            nonceLabel: 'x-nonce (request header iniettato dal proxy)',
        },
        csp: {
            badge: 'Lab 3',
            description: "Due bottoni: il primo esegue uno script con il nonce corretto (la CSP lo accetta); il secondo prova a iniettare un `<script>` inline SENZA nonce (la CSP lo blocca → vedi violazione nella console DevTools). In dev la CSP è Report-Only (logga senza bloccare); in prod sarebbe bloccato hard.",
            allowedLabel: 'Script con nonce valido',
            allowedHint: 'Click → vedrai un alert. Lo script gira perché porta il nonce per-request che la CSP autorizza.',
            blockedLabel: 'Script inline senza nonce',
            blockedHint: 'Click → DevTools console mostra "Refused to execute inline script…". In dev la CSP è Report-Only (logga senza bloccare); in prod il browser bloccherebbe davvero l\'esecuzione.',
            triggerLabel: 'Esegui',
            successLabel: '✓ alert mostrato — script eseguito',
            failureLabel: '✗ non eseguito',
            blockedSuccessLabel: '✓ bloccato dalla CSP (modalità enforced)',
            reportOnlyLabel: '⚠️ violazione rilevata e loggata in console · in prod sarebbe bloccato (qui CSP è Report-Only per non rompere Turbopack HMR)',
        },
        webhook: {
            badge: 'Lab 4',
            description: "Manda un POST a `/api/webhook`. In modalità \"corretto\", il browser calcola la firma HMAC col secret server (esposto SOLO per questo lab) e la mette nell'header `x-nb-signature` → la route restituisce 200. In modalità \"alterato\", manda firma sbagliata → 401. In produzione, ovviamente, il secret NON sarebbe disponibile lato Client: lo simuliamo via Server Action che calcola la firma per te.",
            payloadLabel: 'Payload JSON',
            modeLabel: 'Modalità',
            modeCorrect: 'Firma corretta',
            modeTampered: 'Firma alterata',
            sendLabel: 'Invia',
            sendingLabel: 'Invio in corso…',
            statusLabel: 'Status',
            responseLabel: 'Risposta',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Sette controlli da fare ogni volta che fai un audit di sicurezza su un\'app Next.',
        steps: [
            "**Cerca il secret nel bundle**: DevTools → Sources → Cmd+Shift+F (search across files) → cerca le prime 4 caratteri di un secret server. Se la trovi nel bundle .js del browser → leak. Per `WEBHOOK_SECRET` non dovresti trovarla MAI.",
            '**Verifica gli headers**: DevTools → Network → click sulla request HTML → Headers tab → Response Headers. Dovresti vedere CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. Confronta col Lab 2 (devono matchare).',
            "**Triggera una violazione CSP**: Lab 3 → click \"Script inline senza nonce\". DevTools → Console → riga rossa \"Refused to execute inline script because it violates the following Content Security Policy directive: ...\". Quello è la CSP che fa il suo lavoro.",
            '**Test webhook con curl**: `curl -X POST http://localhost:3000/api/webhook -H "x-nb-signature: deadbeef" -d \'{"hello":"world"}\'` → 401. Senza header → 400. Con firma corretta (Lab 4 te la calcola) → 200.',
            "**Rompi una variabile env**: apri `.env.local`, accorcia `WEBHOOK_SECRET` a 10 caratteri, salva, ricarica la pagina. Il server crasha con `[env] Invalid environment variables: WEBHOOK_SECRET must be at least 16 characters`. Quel è zod che ti salva da un deploy rotto. Ripristina il valore originale.",
            "**Prova a importare server-only nel Client**: crea un Client Component fake che fa `import { signPayload } from '../_lib/server-only-secret'`. Build esplode con messaggio chiaro. (Una demo viva c'è nei commenti del componente csp-demo).",
            '**Verifica HSTS in produzione** (non in localhost): browser strumenti → chrome://net-internals/#hsts → cerca il dominio → dovrebbe essere preloadato. HSTS è sticky — un rollout sbagliato dura un anno.',
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 5 · Lesson 3',
    title: 'Env & Security',
    intro: "Three things separate a \"hobby\" Next 16 app from a production-grade one: (1) env vars are **validated at boot** instead of `process.env.X` scattered everywhere, (2) every module that touches a secret carries `import 'server-only'` as a bundler tripwire, (3) responses ship **security headers** — static ones in `next.config.ts` for the calm stuff (HSTS, X-Frame-Options) and a per-request **CSP with nonce** generated in `proxy.ts` to stop XSS. On top: a `/api/webhook` endpoint that verifies HMAC signatures in constant time. All four labs prove it live.",
    sections: {
        bundleSplit: {
            heading: '§1 Server vs Client: what actually ships to the browser',
            description: "Next 16 produces **two separate bundles**: a server bundle (Node, has access to `process.env`, `fs`, DB drivers, secrets) and a client bundle (browser, NO secrets). The boundary is drawn by the `'use client'` directive at the top of a file. What the bundler GETS WRONG is: if a server module is imported (even transitively) from a client module, it ends up in the browser bundle. With it, every transitive dependency — including the one that read `process.env.DATABASE_URL`. A 5-level import chain starting from an innocent utility can carry the Postgres connection string into JavaScript downloaded by every visitor. It's the most expensive bug you'll see in production.",
            snippet: `// app/lessons/security-env/_lib/server-only-secret.ts
import 'server-only';            // ← tripwire
import { env } from './env';     // reads process.env.WEBHOOK_SECRET

export async function signPayload(payload: string) { /* HMAC */ }

// app/lessons/security-env/_components/safe-client.tsx
'use client';
import { signPayload } from '../_lib/server-only-secret';
//          ^^^^^^^^^^^^ ← Turbopack BUILD ERROR:
//   "You're importing a component that needs 'server-only'.
//    It only works in a Server Component."`,
        },
        envLoading: {
            heading: '§2 .env, .env.local, NEXT_PUBLIC_*',
            description: "Four files loaded IN ORDER (last wins):\n\n1. `.env` (committed — defaults)\n2. `.env.development` / `.env.production` (committed — per environment)\n3. `.env.local` (gitignored — dev secrets)\n4. shell variables (one-off override)\n\nTwo non-negotiable rules:\n• **No secret in `.env`** — that file ends up on GitHub\n• **`NEXT_PUBLIC_` means PUBLIC**: inlined into ALL JS shipped to the browser. Putting a secret here = guaranteed leak. The prefix exists for things that ARE public: site name, public API base URL, feature flags.",
            snippet: `# .env.local (gitignored)
WEBHOOK_SECRET=lc9c4...                    # server-only
AUTH_SECRET=lD+ZuN...                      # server-only
NEXT_PUBLIC_SITE_NAME=Living Notebook      # public
NEXT_PUBLIC_FEATURE_BETA=true              # public

# ❌ TRAP — never do this:
# NEXT_PUBLIC_API_KEY=sk_live_xxxxx        # NO, ships to client bundles`,
        },
        zodValidation: {
            heading: '§3 zod schema at boot',
            description: "`process.env` is `Record<string, string | undefined>` — TS knows NOTHING about what's in it. Production fix: define a zod schema, validate at the `_lib/env.ts` module import, export a typed `env` object. Wins: (1) error AT BOOT if missing/malformed (vs discovering at 3am when the webhook returns 500); (2) IDE autocomplete; (3) free parsing of strings to numbers/booleans/URLs. The dev/build crashes with a message that says EXACTLY which variable is the problem.",
            snippet: `// app/lessons/security-env/_lib/env.ts
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  WEBHOOK_SECRET: z.string().min(16),
  AUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Living Notebook'),
  NEXT_PUBLIC_FEATURE_BETA: z.string().transform(v => v === 'true'),
});

export const env = envSchema.parse(process.env);
// ↑ throws AT BOOT with detailed message if anything is missing`,
        },
        serverOnly: {
            heading: '§4 import \'server-only\' as a tripwire',
            description: "The `server-only` package (by Vercel, official) exports a single module that `throws` if resolved in the client bundle. You import it at the top of EVERY file that touches secrets/DB/secret-derived. If a Client Component (or any `'use client'` ancestor) imports that file by mistake, the build explodes with an unambiguous error: *\"You're importing a component that needs server-only. It only works in a Server Component but one of its parents is marked with 'use client'\"*. Cost: an empty dependency (0 bytes runtime). Benefit: zero accidental leaks.",
            snippet: `// _lib/server-only-secret.ts
import 'server-only';
import { env } from './env';

export async function signPayload(body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(body),
  );
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}`,
        },
        staticHeaders: {
            heading: '§5 Security headers in next.config.ts',
            description: "Headers that don't change per request: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. They live in `next.config.ts` → applied to EVERY response, including `/api/*` and static files (which the proxy does NOT cover, because the matcher excludes them). When the proxy doesn't run (e.g. `/api/auth` is excluded), these still save you. Defense in depth: two layers covering each other.",
            snippet: `// next.config.ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}`,
        },
        cspNonce: {
            heading: '§6 CSP with per-request nonce via the proxy',
            description: "CSP (Content Security Policy) is the single most powerful header against XSS. Senior mode: instead of `'unsafe-inline'` (which kills half the protections), you generate a **random nonce per request** in `proxy.ts`, add it to `script-src`, and apply it via `nonce={…}` on legitimate `<Script>` tags. Any inline script NOT nonce-tagged is blocked by the browser. In dev we use `Content-Security-Policy-Report-Only` (logs but doesn't block → Turbopack HMR keeps working); in prod it's enforced.",
            snippet: `// proxy.ts
const nonceBytes = new Uint8Array(16);
crypto.getRandomValues(nonceBytes);
const nonce = btoa(String.fromCharCode(...nonceBytes));
requestHeaders.set('x-nonce', nonce);

const csp = [
  \`default-src 'self'\`,
  \`script-src 'self' 'nonce-\${nonce}'\`,
  \`style-src 'self' 'unsafe-inline'\`,
  \`img-src 'self' blob: data: https://picsum.photos\`,
  \`frame-ancestors 'none'\`,
].join('; ');

response.headers.set(
  isProd ? 'Content-Security-Policy'
         : 'Content-Security-Policy-Report-Only',
  csp,
);`,
        },
        webhookHmac: {
            heading: '§7 HMAC-signed webhook with constant-time verification',
            description: "Stripe, GitHub, Slack, Twilio: every serious webhook signs the body with a shared secret. You (receiver) recompute the HMAC over the RAW body and compare — in **constant time** (no early exit on first wrong byte, otherwise an attacker measures response time and guesses the secret byte by byte). We use Web Crypto's `crypto.subtle`: same code runs identically on Node, Edge runtimes, Cloudflare Workers, Deno.",
            snippet: `// app/api/webhook/route.ts
export async function POST(request: Request) {
  const claimedSig = request.headers.get('x-nb-signature');
  if (!claimedSig) return Response.json({ error: '…' }, { status: 400 });

  const body = await request.text();  // RAW, no JSON.parse
  const expectedSig = await signPayload(body);

  // === MUST be constant-time, not '==='
  if (!timingSafeEqual(claimedSig, expectedSig)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);  // safe ONLY after verification
  // … dispatch to job queue …
  return Response.json({ ok: true });
}`,
        },
    },
    decisionTable: {
        heading: '§8 Which primitive for which problem?',
        intro: 'Scenario → API mapping.',
        rows: [
            {
                scenario: 'A secret the backend must read',
                choice: '.env.local + zod schema + import \'server-only\'',
            },
            {
                scenario: 'A public value (site name, feature flag)',
                choice: 'NEXT_PUBLIC_* in .env',
            },
            {
                scenario: 'Block accidental server import from Client',
                choice: 'import \'server-only\' in the sensitive module',
            },
            {
                scenario: 'Force HTTPS, stop clickjacking, MIME-sniff',
                choice: 'Static headers in next.config.ts → headers()',
            },
            {
                scenario: 'Stop XSS from malicious inline scripts',
                choice: 'CSP with per-request nonce in proxy.ts',
            },
            {
                scenario: 'Verify a payload sent by an external service',
                choice: 'HMAC-SHA256 with crypto.subtle + timingSafeEqual',
            },
            {
                scenario: 'CSRF on a Server Action',
                choice: 'Automatic (Next blocks with origin check)',
            },
            {
                scenario: 'CSRF on Auth.js',
                choice: 'Automatic (Auth.js v5 has built-in CSRF token)',
            },
        ],
    },
    labs: {
        heading: '🧪 Interactive labs',
        env: {
            badge: 'Lab 1',
            description: 'Server-side (the lesson page is a Server Component) reads ALL env. Client-side reads only `NEXT_PUBLIC_*`. Try this: open DevTools → Sources → search for "WEBHOOK_SECRET" in the JS bundle → not there. Search for "Living Notebook" → inlined. Visual proof of the Server/Client boundary.',
            clientHeading: 'Client-side (process.env read from \'use client\')',
            serverHeading: 'Server-side (process.env read by the page)',
            leakWarning: '⚠️ If you saw a secret below, the leak would already have happened',
            safeHint: '✓ Only NEXT_PUBLIC_* should be accessible client-side',
        },
        headers: {
            badge: 'Lab 2',
            description: "Headers of the current response, read by the page via `headers()`. Cross-check in DevTools → Network → click the HTML request → Response Headers.",
            cspLabel: 'Content-Security-Policy (-Report-Only in dev)',
            hstsLabel: 'Strict-Transport-Security',
            frameLabel: 'X-Frame-Options',
            referrerLabel: 'Referrer-Policy',
            permissionsLabel: 'Permissions-Policy',
            nonceLabel: 'x-nonce (request header injected by proxy)',
        },
        csp: {
            badge: 'Lab 3',
            description: "Two buttons: the first runs a script with the correct nonce (CSP accepts it); the second tries injecting an inline `<script>` WITHOUT nonce (CSP blocks → see the violation in DevTools console). In dev the CSP is Report-Only (logs without blocking); in prod it would be hard-blocked.",
            allowedLabel: 'Script with valid nonce',
            allowedHint: 'Click → you will see an alert. The script runs because it carries the per-request nonce that the CSP whitelists.',
            blockedLabel: 'Inline script without nonce',
            blockedHint: 'Click → DevTools console shows "Refused to execute inline script…". In dev CSP is Report-Only (logs without blocking); in prod the browser would actually block execution.',
            triggerLabel: 'Run',
            successLabel: '✓ alert shown — script executed',
            failureLabel: '✗ did not run',
            blockedSuccessLabel: '✓ blocked by CSP (enforced mode)',
            reportOnlyLabel: '⚠️ violation detected and logged in console · in prod this would be blocked (CSP is Report-Only here so Turbopack HMR keeps working)',
        },
        webhook: {
            badge: 'Lab 4',
            description: "POST to `/api/webhook`. In \"correct\" mode, a Server Action computes the HMAC signature with the server-only secret and sends it via the `x-nb-signature` header → 200. In \"tampered\" mode, wrong signature → 401. The secret stays server-side — the Client never sees it; the Action acts as a signing oracle for this demo.",
            payloadLabel: 'JSON payload',
            modeLabel: 'Mode',
            modeCorrect: 'Correct signature',
            modeTampered: 'Tampered signature',
            sendLabel: 'Send',
            sendingLabel: 'Sending…',
            statusLabel: 'Status',
            responseLabel: 'Response',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Seven checks for every Next app security audit.',
        steps: [
            "**Search the bundle for the secret**: DevTools → Sources → Cmd+Shift+F (search across files) → search the first 4 chars of a server secret. If you find it in the browser .js bundle → leak. `WEBHOOK_SECRET` should NEVER appear.",
            "**Inspect the headers**: DevTools → Network → click the HTML request → Headers tab → Response Headers. You should see CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. Cross-check with Lab 2 (must match).",
            "**Trigger a CSP violation**: Lab 3 → click \"Inline script without nonce\". DevTools → Console → red line \"Refused to execute inline script because it violates the following Content Security Policy directive: ...\". That's CSP doing its job.",
            '**curl the webhook**: `curl -X POST http://localhost:3000/api/webhook -H "x-nb-signature: deadbeef" -d \'{"hello":"world"}\'` → 401. Without header → 400. With the correct signature (Lab 4 computes it) → 200.',
            "**Break an env variable**: open `.env.local`, shorten `WEBHOOK_SECRET` to 10 chars, save, reload the page. Server crashes with `[env] Invalid environment variables: WEBHOOK_SECRET must be at least 16 characters`. That's zod saving you from a broken deploy. Restore the value.",
            "**Try importing server-only into a Client Component**: make a fake Client Component that does `import { signPayload } from '../_lib/server-only-secret'`. The build explodes with a clear message. (A live demo lives in the comments of csp-demo).",
            '**Verify HSTS in production** (not localhost): chrome://net-internals/#hsts → search for your domain → it should be preloaded. HSTS is sticky — a bad rollout lasts a year.',
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 5 · Лекція 3',
    title: 'Змінні та Безпека',
    intro: "Три речі відрізняють «hobby» Next 16 від production-grade: (1) env-змінні **валідуються на boot** замість `process.env.X` розкиданих усюди, (2) кожен модуль, що торкається secret, має `import 'server-only'` як bundler tripwire, (3) responses несуть **security headers** — статичні в `next.config.ts` для спокійних речей (HSTS, X-Frame-Options) і per-request **CSP з nonce**, згенерований у `proxy.ts`, проти XSS. Зверху: endpoint `/api/webhook`, що перевіряє HMAC підписи в constant time. Усі чотири лабораторії показують це наживо.",
    sections: {
        bundleSplit: {
            heading: '§1 Server vs Client: що насправді потрапляє в браузер',
            description: "Next 16 робить **два окремі bundle**: server (Node, доступ до `process.env`, `fs`, DB-драйверів, secrets) і client (браузер, БЕЗ secrets). Межа малюється директивою `'use client'` зверху файлу. Що bundler ROBYTЬ НЕПРАВИЛЬНО: якщо server-модуль імпортується (навіть транзитивно) з client-модуля, він потрапляє в browser bundle. З ним усі транзитивні залежності — включно з тим, що читав `process.env.DATABASE_URL`. 5-рівневий ланцюг імпортів з безневинної утиліти може занести Postgres connection string у JS, що його завантажує кожен відвідувач. Найдорожчий бул, який побачиш у production.",
            snippet: `// app/lessons/security-env/_lib/server-only-secret.ts
import 'server-only';            // ← tripwire
import { env } from './env';     // читає process.env.WEBHOOK_SECRET

export async function signPayload(payload: string) { /* HMAC */ }

// app/lessons/security-env/_components/safe-client.tsx
'use client';
import { signPayload } from '../_lib/server-only-secret';
//          ^^^^^^^^^^^^ ← Turbopack BUILD ERROR:
//   "You're importing a component that needs 'server-only'.
//    It only works in a Server Component."`,
        },
        envLoading: {
            heading: '§2 .env, .env.local, NEXT_PUBLIC_*',
            description: "Чотири файли завантажуються ПО ПОРЯДКУ (останній виграє):\n\n1. `.env` (закомічений — defaults)\n2. `.env.development` / `.env.production` (закомічені — per environment)\n3. `.env.local` (gitignored — dev secrets)\n4. shell змінні (одноразовий override)\n\nДва непорушні правила:\n• **Жодного secret у `.env`** закоміченому — він потрапить на GitHub\n• **`NEXT_PUBLIC_` означає ПУБЛІЧНО**: inline-иться в УСІ JS, відправлені в браузер. Secret тут = гарантований leak. Префікс існує для речей, що Є публічними: ім'я сайту, public API base URL, feature flags.",
            snippet: `# .env.local (gitignored)
WEBHOOK_SECRET=lc9c4...                    # server-only
AUTH_SECRET=lD+ZuN...                      # server-only
NEXT_PUBLIC_SITE_NAME=Living Notebook      # public
NEXT_PUBLIC_FEATURE_BETA=true              # public

# ❌ ПАСТКА — ніколи не роби так:
# NEXT_PUBLIC_API_KEY=sk_live_xxxxx        # НІ, потрапляє в client bundles`,
        },
        zodValidation: {
            heading: '§3 zod schema на boot',
            description: "`process.env` — це `Record<string, string | undefined>`. TS не знає НІЧОГО про вміст. Production fix: визнач zod schema, валідуй на import модуля `_lib/env.ts`, експортуй типізований об'єкт `env`. Виграші: (1) помилка НА BOOT, якщо щось пропущено/malformed (vs дізнатися о 3-й ночі, коли webhook повертає 500); (2) автокомпліт в IDE; (3) безкоштовний parsing рядків у числа/booleans/URL. Dev/build падає з повідомленням, яке каже ТОЧНО, в якій змінній проблема.",
            snippet: `// app/lessons/security-env/_lib/env.ts
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  WEBHOOK_SECRET: z.string().min(16),
  AUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Living Notebook'),
  NEXT_PUBLIC_FEATURE_BETA: z.string().transform(v => v === 'true'),
});

export const env = envSchema.parse(process.env);
// ↑ throws НА BOOT із детальним повідомленням, якщо щось пропущено`,
        },
        serverOnly: {
            heading: '§4 import \'server-only\' як tripwire',
            description: "Пакет `server-only` (від Vercel, офіційний) експортує єдиний модуль, який `throws`, якщо резолвиться в client bundle. Імпортуєш його зверху КОЖНОГО файлу, що торкається secrets/DB/secret-derived. Якщо Client Component (або будь-який `'use client'` ancestor) випадково імпортує цей файл, build вибухає з ясним повідомленням. Вартість: порожня залежність (0 bytes runtime). Бенефіт: нуль випадкових leaks.",
            snippet: `// _lib/server-only-secret.ts
import 'server-only';
import { env } from './env';

export async function signPayload(body: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC', key, new TextEncoder().encode(body),
  );
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}`,
        },
        staticHeaders: {
            heading: '§5 Security headers у next.config.ts',
            description: "Headers, що не змінюються per request: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. Живуть у `next.config.ts` → застосовуються до КОЖНОЇ response, включно з `/api/*` і static files (які proxy НЕ покриває, бо matcher їх виключає). Коли proxy не біжить (напр. `/api/auth`), ці headers все одно тебе рятують. Defense in depth: два шари перекривають один одного.",
            snippet: `// next.config.ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}`,
        },
        cspNonce: {
            heading: '§6 CSP з per-request nonce через proxy',
            description: "CSP (Content Security Policy) — найпотужніший header проти XSS. Senior-режим: замість `'unsafe-inline'` (що вбиває половину захисту), генеруєш **випадковий nonce per request** у `proxy.ts`, додаєш у `script-src`, і застосовуєш через `nonce={…}` на легітимні `<Script>` теги. Будь-який inline script БЕЗ nonce блокується. У dev використовуємо `Content-Security-Policy-Report-Only` (логує без блокування → Turbopack HMR працює); у prod — enforced.",
            snippet: `// proxy.ts
const nonceBytes = new Uint8Array(16);
crypto.getRandomValues(nonceBytes);
const nonce = btoa(String.fromCharCode(...nonceBytes));
requestHeaders.set('x-nonce', nonce);

const csp = [
  \`default-src 'self'\`,
  \`script-src 'self' 'nonce-\${nonce}'\`,
  \`style-src 'self' 'unsafe-inline'\`,
  \`img-src 'self' blob: data: https://picsum.photos\`,
  \`frame-ancestors 'none'\`,
].join('; ');

response.headers.set(
  isProd ? 'Content-Security-Policy'
         : 'Content-Security-Policy-Report-Only',
  csp,
);`,
        },
        webhookHmac: {
            heading: '§7 Webhook з HMAC підписом і constant-time верифікацією',
            description: 'Stripe, GitHub, Slack, Twilio: кожен серйозний webhook підписує body shared secret. Ти (receiver) перераховуєш HMAC над RAW body і порівнюєш — у **constant time** (без раннього виходу на першому неправильному байті, інакше атакувальник міряє response time і вгадує secret byte за byte). Робимо це через Web Crypto `crypto.subtle`: той самий код працює однаково на Node, Edge runtime, Cloudflare Workers, Deno.',
            snippet: `// app/api/webhook/route.ts
export async function POST(request: Request) {
  const claimedSig = request.headers.get('x-nb-signature');
  if (!claimedSig) return Response.json({ error: '…' }, { status: 400 });

  const body = await request.text();  // RAW, no JSON.parse
  const expectedSig = await signPayload(body);

  // === МУСИТЬ бути constant-time, не '==='
  if (!timingSafeEqual(claimedSig, expectedSig)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);  // safe ТІЛЬКИ після верифікації
  // … dispatch до job queue …
  return Response.json({ ok: true });
}`,
        },
    },
    decisionTable: {
        heading: '§8 Який primitive для якої проблеми?',
        intro: 'Сценарій → API.',
        rows: [
            {
                scenario: 'Secret, який backend має читати',
                choice: '.env.local + zod schema + import \'server-only\'',
            },
            {
                scenario: 'Публічне значення (site name, feature flag)',
                choice: 'NEXT_PUBLIC_* у .env',
            },
            {
                scenario: 'Блокувати випадковий import server-коду в Client',
                choice: 'import \'server-only\' у sensitive модулі',
            },
            {
                scenario: 'Форсувати HTTPS, зупинити clickjacking, MIME-sniff',
                choice: 'Static headers у next.config.ts → headers()',
            },
            {
                scenario: 'Зупинити XSS від inline scripts',
                choice: 'CSP з per-request nonce у proxy.ts',
            },
            {
                scenario: 'Верифікувати payload від зовнішнього сервісу',
                choice: 'HMAC-SHA256 з crypto.subtle + timingSafeEqual',
            },
            {
                scenario: 'CSRF на Server Action',
                choice: 'Автоматично (Next блокує через origin check)',
            },
            {
                scenario: 'CSRF на Auth.js',
                choice: 'Автоматично (Auth.js v5 має built-in CSRF token)',
            },
        ],
    },
    labs: {
        heading: '🧪 Інтерактивні лабораторії',
        env: {
            badge: 'Лаб 1',
            description: 'Server-side (page лекції — Server Component) читає УСІ env. Client-side читає тільки `NEXT_PUBLIC_*`. Спробуй: DevTools → Sources → пошук "WEBHOOK_SECRET" у JS bundle → не знайдеш. Пошук "Living Notebook" → inline-ний. Візуальний доказ межі Server/Client.',
            clientHeading: 'Client-side (process.env читається з \'use client\')',
            serverHeading: 'Server-side (process.env читається page)',
            leakWarning: '⚠️ Якби побачив secret нижче, leak вже стався б',
            safeHint: '✓ Тільки NEXT_PUBLIC_* мають бути доступні client-side',
        },
        headers: {
            badge: 'Лаб 2',
            description: 'Headers поточної response, прочитані page через `headers()`. Перевір у DevTools → Network → click HTML request → Response Headers.',
            cspLabel: 'Content-Security-Policy (-Report-Only в dev)',
            hstsLabel: 'Strict-Transport-Security',
            frameLabel: 'X-Frame-Options',
            referrerLabel: 'Referrer-Policy',
            permissionsLabel: 'Permissions-Policy',
            nonceLabel: 'x-nonce (request header, ін\'єктований proxy)',
        },
        csp: {
            badge: 'Лаб 3',
            description: 'Дві кнопки: перша запускає script із правильним nonce (CSP приймає); друга пробує ін\'єктувати inline `<script>` БЕЗ nonce (CSP блокує → бачиш порушення в DevTools console). У dev CSP — Report-Only (логує без блокування); у prod — hard-block.',
            allowedLabel: 'Script із валідним nonce',
            allowedHint: 'Click → побачиш alert. Скрипт запускається, бо містить per-request nonce, який CSP whitelist-ить.',
            blockedLabel: 'Inline script без nonce',
            blockedHint: 'Click → DevTools console покаже "Refused to execute inline script…". У dev CSP — Report-Only (логує без блокування); у prod браузер дійсно заблокує виконання.',
            triggerLabel: 'Запустити',
            successLabel: '✓ alert показано — скрипт виконано',
            failureLabel: '✗ не виконано',
            blockedSuccessLabel: '✓ заблоковано CSP (enforced режим)',
            reportOnlyLabel: '⚠️ порушення виявлено й залоговано в console · у prod заблокувало б (тут CSP Report-Only, щоб Turbopack HMR працював)',
        },
        webhook: {
            badge: 'Лаб 4',
            description: 'POST на `/api/webhook`. У режимі "correct" Server Action рахує HMAC підпис із server-only secret і шле через `x-nb-signature` header → 200. У режимі "tampered" — неправильний підпис → 401. Secret лишається server-side — Client його не бачить; Action — як signing oracle для демо.',
            payloadLabel: 'JSON payload',
            modeLabel: 'Режим',
            modeCorrect: 'Правильний підпис',
            modeTampered: 'Підроблений підпис',
            sendLabel: 'Відправити',
            sendingLabel: 'Відправка…',
            statusLabel: 'Статус',
            responseLabel: 'Відповідь',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Сім перевірок для security audit будь-якого Next-додатка.',
        steps: [
            '**Пошук secret у bundle**: DevTools → Sources → Cmd+Shift+F → шукай перші 4 символи server secret. Якщо знайдеш у browser .js → leak. `WEBHOOK_SECRET` НЕ має з\'явитися.',
            '**Перевірка headers**: DevTools → Network → click HTML request → Headers tab → Response Headers. Має бути CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. Звір із Лаб 2.',
            '**Триггер CSP violation**: Лаб 3 → click "Inline script без nonce". DevTools → Console → червоний рядок "Refused to execute inline script...". Це CSP робить роботу.',
            '**curl webhook**: `curl -X POST http://localhost:3000/api/webhook -H "x-nb-signature: deadbeef" -d \'{"hello":"world"}\'` → 401. Без header → 400. З правильним підписом (Лаб 4 рахує) → 200.',
            '**Зламай env**: відкрий `.env.local`, вкороти `WEBHOOK_SECRET` до 10 символів, збережи, перезавантаж. Server падає з `[env] Invalid environment variables: WEBHOOK_SECRET must be at least 16 characters`. Це zod рятує тебе. Відновлюй.',
            '**Спробуй імпортувати server-only у Client**: створи fake Client Component із `import { signPayload } from \'../_lib/server-only-secret\'`. Build вибухає з ясним повідомленням.',
            '**Перевір HSTS у production** (не localhost): chrome://net-internals/#hsts → шукай домен → має бути preloaded. HSTS sticky — поганий rollout триває рік.',
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
