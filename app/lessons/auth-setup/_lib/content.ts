// =============================================================================
// app/lessons/auth-setup/_lib/content.ts
// Inline i18n dictionary for Module 4 · Lesson 3 (Auth.js v5).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        split: Section;
        callsites: Section;
        sessionStrategy: Section;
        protectedAccess: Section;
        oauthSetup: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        session: {
            badge: string;
            description: string;
            signedInLabel: string;
            signedOutLabel: string;
            signOutLabel: string;
            signingOutLabel: string;
        };
        credentials: {
            badge: string;
            description: string;
            demoCredsLabel: string;
            emailPlaceholder: string;
            passwordPlaceholder: string;
            signInLabel: string;
            signingInLabel: string;
            namePlaceholder: string;
            signUpLabel: string;
            signingUpLabel: string;
            signUpSuccessLabel: string;
        };
        github: {
            badge: string;
            description: string;
            signInLabel: string;
            missingEnvLabel: string;
        };
        myNotes: {
            badge: string;
            description: string;
            titlePlaceholder: string;
            bodyPlaceholder: string;
            tagsPlaceholder: string;
            createLabel: string;
            creatingLabel: string;
            deleteLabel: string;
            emptyLabel: string;
            authRequiredLabel: string;
        };
        apiTest: {
            badge: string;
            description: string;
            callLabel: string;
            callingLabel: string;
            statusLabel: string;
            responseLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 4 · Lezione 3',
    title: 'Auth.js v5',
    intro: "Auth.js v5 (next-auth@beta) è una rewrite per l'App Router. Cambia API, file layout, runtime. Cuore: una sola funzione `auth()` legge la sessione in QUALSIASI superficie server-side — RSC, Server Action, Route Handler, middleware. In questa lezione configuriamo due provider (Credentials con bcrypt + GitHub OAuth), montiamo l'adapter Drizzle sul PGlite di Lez. 2 (gli utenti vivono nel DB), e dimostriamo i 4 checkpoint di autenticazione con una mini-app `/api/me/notes` protetta.",
    sections: {
        split: {
            heading: "§1 Il pattern 'split config' di Auth.js v5",
            description: "Il middleware di Next gira sul runtime EDGE, dove molti moduli Node sono proibiti: bcryptjs, Drizzle drivers, PGlite WASM. Auth.js v5 affronta il problema dividendo la config in due file:\n\n• `auth.config.ts` (edge-safe): solo provider che NON usano Node in `authorize`, callbacks `authorized`, `pages`.\n• `auth.ts` (Node): importa `auth.config` + aggiunge DrizzleAdapter, Credentials con bcrypt, session callbacks pesanti.\n• `proxy.ts` (ex `middleware.ts`): istanzia `NextAuth(authConfig)` (solo la parte edge-safe) → ottiene un handler edge leggero.\n\n⚠️ Da Next 16, il file `middleware.ts` è stato rinominato `proxy.ts`. Il vecchio nome funziona ancora ma emette un warning al boot. La semantica è identica.\n\nÈ una rottura rispetto a v4 dove tutto stava in un solo file. Costa due file, paga la possibilità di avere handler edge + adapter DB nello stesso progetto.",
            snippet: `// auth.config.ts — edge-safe
import GitHub from 'next-auth/providers/github';
export const authConfig: NextAuthConfig = {
  providers: [GitHub({...})],   // OAuth = solo redirect, edge-safe
  callbacks: {
    authorized({ auth, request }) { return true; }
  }
};

// auth.ts — Node only
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { authConfig } from './auth.config';
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: 'database' },
  providers: [...authConfig.providers, Credentials({ authorize: async (c) => {
    const user = await db.query.users.findFirst({ where: eq(users.email, c.email) });
    if (!user || !await bcrypt.compare(c.password, user.passwordHash)) return null;
    return user;
  }})]
});

// proxy.ts — edge runtime (Next 16: era middleware.ts in versioni precedenti)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth(authConfig);  // ← solo authConfig`,
        },
        callsites: {
            heading: '§2 Una API, quattro call-site',
            description: "`auth()` è una funzione universale. La importi da `./auth.ts` e la chiami ovunque ti serva sapere CHI è loggato:\n\n• **Server Component** — `const session = await auth()` in cima all'RSC. Sotto Cache Components va in `<Suspense>` perché legge cookies (request-time).\n\n• **Server Action** — `const session = await auth()` in cima. Le Server Actions sono endpoint POST PUBBLICI: chiunque può craftare un FormData e chiamarli. **SEMPRE** ri-check qui dentro, mai fidarsi dello stato UI.\n\n• **Route Handler** — stesso pattern. Restituisci 401 senza redirect (il client decide).\n\n• **Proxy** (ex middleware) — `req.auth` è iniettato da Auth.js. La callback `authorized()` in auth.config decide allow/redirect.",
            snippet: `// 1️⃣ RSC
import { auth } from '@/auth';
async function Profile() {
  const session = await auth();
  if (!session?.user) return <SignInPrompt />;
  return <div>Welcome {session.user.name}</div>;
}

// 2️⃣ Server Action
'use server';
import { auth } from '@/auth';
export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, session.user.id)));
}

// 3️⃣ Route Handler
import { auth } from '@/auth';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return Response.json({ user: session.user });
}

// 4️⃣ Proxy (proxy.ts — il vecchio middleware.ts in Next ≤15)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith('/admin')) return !!auth?.user;
      return true;
    }
  }
});`,
        },
        sessionStrategy: {
            heading: '§3 JWT vs Database (e perché Credentials forza JWT globale)',
            description: "Auth.js supporta due strategie di sessione:\n\n**JWT** (default) — sessione firmata in cookie, stateless. Edge-compatible. Zero DB query per session check. Logout = aspetta scadenza (no revoca server-side).\n\n**Database** — riga sessione in DB via adapter, lookup per request. Revoca immediata, audit-abile. +1 DB query per request autenticato, schema più grosso.\n\n⚠️ **Il vero comportamento di v5 con Credentials**: `auth()` legge la sessione UNIFORMEMENTE secondo `session.strategy`. Con `'database'`, Auth.js cerca il valore del cookie come `sessionToken` in tabella. Ma Credentials non crea mai una row in `session` (l'adapter è OAuth-shaped). Risultato: signin riesce, cookie è settato, ma OGNI successivo `auth()` ritorna `null` perché nessuna row matcha → utente \"loggato ma fantasma\".\n\n**Conseguenza pratica**: se vuoi Credentials nel mix, **DEVI** usare `strategy: 'jwt'` globalmente. Il DrizzleAdapter resta utile per `user`, `account`, `verificationToken` — solo la tabella `session` rimane vuota. Trade-off: perdi la \"revoke by DELETE row\" capability. Per ottenerla servirebbe una blocklist custom o un middleware che chiama il DB ad ogni request.",
            snippet: `// auth.ts — strategia JWT globale (richiesta da Credentials)
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),         // ← users + accounts in DB
  session: { strategy: 'jwt' },        // ← cookie JWT per ENTRAMBI i provider

  // Con JWT strategy + adapter, devi popolare manualmente session.user.id:
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;   // su signin
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },

  providers: [GitHub({...}), Credentials({...})],
});

// Verifica nel DB dopo login (qualsiasi provider):
//   SELECT * FROM "user"     → 1 row per utente registrato
//   SELECT * FROM session    → 0 row (sessioni vivono nel JWT cookie)
//
// Per recuperare la "DB session" pattern in produzione:
//   • togli Credentials (solo OAuth) → strategy: 'database' funziona
//   • oppure aggiungi una sessions-blocklist table + middleware che la consulta`,
        },
        protectedAccess: {
            heading: '§4 Proteggere risorse: pattern e anti-pattern',
            description: "Tre regole d'oro per non bucarti la sicurezza:\n\n**1. Non fidarti del client.** Il bottone 'Delete' nascosto nella UI per utenti non loggati non protegge nulla. Chiunque può `curl -X DELETE /api/notes/42`. La protezione vive SERVER-SIDE, nella Server Action o nel Route Handler.\n\n**2. Compound check ownership + auth.** Non basta sapere che l'utente è loggato; devi verificare che possieda la risorsa. Drizzle: `where: and(eq(notes.id, id), eq(notes.userId, session.user.id))`. Cross-user delete = matching zero rows = no-op silenzioso (corretto: non leakare l'esistenza della risorsa).\n\n**3. Logica auth FUORI dalla UI.** I controlli `if (!session) throw new Error('Unauthorized')` vanno nel layer dati (Server Action, Route Handler), non solo nel componente. Così se domani aggiungi un nuovo entry point (mobile, CLI, webhook) la protezione è già lì.",
            snippet: `// ❌ Anti-pattern: protezione SOLO UI
{session && <button onClick={() => deleteNote(id)}>Delete</button>}
// → la action server è ancora chiamabile da fuori

// ✅ Protezione layered
// UI conditional + Server Action che ri-check + ownership check
{session && <button onClick={() => deleteMyNoteAction(id)}>Delete</button>}

'use server';
export async function deleteMyNoteAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');       // ← layer 1
  await db.delete(notes).where(
    and(eq(notes.id, id), eq(notes.userId, session.user.id))     // ← layer 2
  );
}

// Nel Route Handler equivalente:
export async function DELETE(req, ctx) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  // ... stessa compound where ...
}`,
        },
        oauthSetup: {
            heading: '§5 GitHub OAuth in 90 secondi',
            description: "Per attivare il Lab GitHub:\n\n**1. Crea un'OAuth App su github.com:**\n   Settings → Developer settings → OAuth Apps → New OAuth App\n   • Homepage URL: `http://localhost:3000`\n   • Callback URL: `http://localhost:3000/api/auth/callback/github`\n\n**2. Copia il Client ID e genera un Client Secret**\n\n**3. Crea `.env.local` nella root:**\n   ```\n   AUTH_SECRET=<genera con: npx auth secret>\n   AUTH_GITHUB_ID=<client id>\n   AUTH_GITHUB_SECRET=<client secret>\n   ```\n\n**4. Riavvia `npm run dev`** — il bottone GitHub funziona. Senza queste env vars il bottone resta visibile ma genera errore al click (è documentato nella UI).\n\n`AUTH_SECRET` firma JWT + cookie. Auth.js v5 lo genera con `npx auth secret`. In produzione: ruota se compromesso → invalida tutti i JWT esistenti.",
            snippet: `// .env.local (NON committarlo!)
AUTH_SECRET=cnFjMzM3ZkRkY2tCS1NMUlNlbmJReGVoSGdrYjJoeUE=
AUTH_GITHUB_ID=Iv1.abc123...
AUTH_GITHUB_SECRET=ghp_xyz789...

// Generazione del secret:
//   npx auth secret
// (scrive direttamente in .env.local)

// In production (Vercel, ecc.):
//   • imposta queste 3 env vars nel dashboard del provider
//   • il callback URL passa da localhost:3000 al tuo dominio
//   • IMPORTANTE: aggiorna la OAuth App su GitHub con il dominio production`,
        },
    },
    decisionTable: {
        heading: '§5 Tabella decisionale: dove va il check?',
        intro: "Auth.js dà `auth()` ovunque. Il pattern giusto dipende DA CHI è il caller della risorsa.",
        rows: [
            { scenario: 'Render condizionale (mostra/nascondi UI)', choice: 'RSC + auth() in <Suspense> (Cache Components-compliant)' },
            { scenario: 'Form HTML che muta dati owned', choice: 'Server Action + auth() ri-check + compound WHERE ownership' },
            { scenario: 'API consumata da client JS / mobile', choice: 'Route Handler + auth() + 401 senza redirect' },
            { scenario: 'Blocco intera area (es. /admin/*)', choice: 'Middleware + callback authorized()' },
            { scenario: 'Solo OAuth (no Credentials)', choice: 'Session strategy: database, DrizzleAdapter, revoca via DELETE su session table' },
            { scenario: 'Credentials presenti (mix con OAuth)', choice: 'Session strategy: jwt FORZATO globale. Adapter resta utile per users/accounts.' },
            { scenario: 'Logout immediato che invalidi su tutti i device', choice: 'Database sessions (richiede pure-OAuth) o blocklist custom + middleware' },
            { scenario: 'Multi-tenant / RBAC custom', choice: 'callbacks.session estende session.user con role / tenantId dal DB' },
        ],
    },
    labs: {
        heading: '🧪 Laboratori',
        session: {
            badge: 'Lab 1 — Stato sessione (RSC + auth())',
            description: 'Server Component che chiama `auth()` e mostra cosa contiene la sessione. Vivente dentro `<Suspense>` perché Cache Components.',
            signedInLabel: 'Loggato come',
            signedOutLabel: 'Non loggato',
            signOutLabel: 'Sign out',
            signingOutLabel: 'Logout…',
        },
        credentials: {
            badge: 'Lab 2 — Credentials (email/password + bcrypt)',
            description: 'Sign in con email/password contro la tabella `user` di PGlite. Sign up qui sotto per creare un nuovo account. Forzata strategia JWT da Auth.js.',
            demoCredsLabel: 'Credenziali demo seedate',
            emailPlaceholder: 'Email',
            passwordPlaceholder: 'Password',
            signInLabel: 'Sign in',
            signingInLabel: 'Sign-in…',
            namePlaceholder: 'Nome (opzionale)',
            signUpLabel: 'Sign up',
            signingUpLabel: 'Creazione account…',
            signUpSuccessLabel: 'Account creato. Ora puoi fare Sign in.',
        },
        github: {
            badge: 'Lab 3 — GitHub OAuth',
            description: "Sign in via OAuth. Produce una riga in `user` + una in `account` di PGlite (account-linking). Sessione vive nel JWT cookie come per Credentials (vedi §3). Richiede AUTH_GITHUB_ID/SECRET in .env.local — vedi §5.",
            signInLabel: 'Sign in with GitHub',
            missingEnvLabel: '⚠️ Manca AUTH_GITHUB_ID/SECRET in .env.local. Vedi §5 per la configurazione.',
        },
        myNotes: {
            badge: 'Lab 3 — Mini-CRUD protetto',
            description: 'Server Action che crea note PROPRIETARIE dell\'utente loggato. Ogni mutation ri-check `auth()` + compound WHERE su ownership. I non-loggati vedono solo un placeholder.',
            titlePlaceholder: 'Titolo della tua nota',
            bodyPlaceholder: 'Corpo (opzionale)…',
            tagsPlaceholder: 'Tag separati da virgola',
            createLabel: 'Crea (owned)',
            creatingLabel: 'Creazione…',
            deleteLabel: 'Elimina',
            emptyLabel: "Non hai ancora note. Creane una qui sopra!",
            authRequiredLabel: 'Effettua il login per creare le tue note.',
        },
        apiTest: {
            badge: 'Lab 4 — Route Handler protetto (/api/me/notes)',
            description: 'Chiama GET /api/me/notes. Loggato → 200 con le tue note. Non loggato → 401. Vedi DevTools → Network.',
            callLabel: 'GET /api/me/notes',
            callingLabel: 'Chiamata in corso…',
            statusLabel: 'Status',
            responseLabel: 'Risposta',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Apri DevTools → Application → Cookies + Network. Esegui:',
        steps: [
            "Sign in con le credenziali demo (Lab 2). Cookie: appare `authjs.session-token`. È un JWT JWE (criptato, non solo firmato) — Auth.js v5 critta i token. Non è ispezionabile su jwt.io tradizionale senza la chiave.",
            "Stesso login: nel terminale di `npm run dev` NIENTE log SELECT su `session`. La tabella resta vuota — sessioni vivono nel cookie.",
            "Lab 4 → GET /api/me/notes da loggato: 200 con la lista. Sign out → stesso GET: 401.",
            "Lab 3 → crea una nota, poi prova a deletarla aprendo `/api/notes/:id` direttamente in DevTools console:\n```\nfetch('/api/notes/' + id, { method: 'DELETE' })\n```\nFunziona — perché /api/notes è il CRUD pubblico di Lez. 2 (no auth). Confronta con `/api/me/notes` che richiede auth.",
            "Apri lo store PGlite: `SELECT id, email, name FROM \"user\";` — vedi il demo user + chiunque hai signup-pato. `SELECT * FROM session;` — ZERO righe (sessioni vivono nel JWT cookie, vedi §3).",
            "⚠️ Sicurezza: prova a chiamare la Server Action `deleteMyNoteAction(id)` per una nota di un ALTRO utente. Il compound WHERE silenziosamente non elimina nulla — questo è il pattern corretto (non leakare l'esistenza con un 404).",
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 4 · Lesson 3',
    title: 'Auth.js v5',
    intro: "Auth.js v5 (next-auth@beta) is a rewrite for App Router. New APIs, new file layout, new runtimes. The cornerstone: one universal `auth()` function reads the session from ANY server-side surface — RSC, Server Action, Route Handler, middleware. In this lesson we wire up two providers (Credentials with bcrypt + GitHub OAuth), mount the Drizzle adapter on Lesson 2's PGlite (users live in the DB), and demo the 4 auth checkpoints with a protected `/api/me/notes` mini-app.",
    sections: {
        split: {
            heading: "§1 The 'split config' pattern of Auth.js v5",
            description: "Next's edge-runtime handler runs on the EDGE, where many Node modules are forbidden: bcryptjs, Drizzle drivers, PGlite WASM. Auth.js v5 splits the config in two files:\n\n• `auth.config.ts` (edge-safe): only providers that DON'T need Node in `authorize`, `authorized` callback, `pages`.\n• `auth.ts` (Node): imports `auth.config` + adds DrizzleAdapter, Credentials with bcrypt, heavy session callbacks.\n• `proxy.ts` (was `middleware.ts`): instantiates `NextAuth(authConfig)` (the edge-safe half only) → produces a lean edge handler.\n\n⚠️ Since Next 16, the `middleware.ts` file is renamed `proxy.ts`. The old name still works but emits a boot warning. Semantics are identical.\n\nIt's a break from v4 where everything sat in a single file. Costs two files, buys you the ability to have an edge handler + DB adapter in the same project.",
            snippet: `// auth.config.ts — edge-safe
import GitHub from 'next-auth/providers/github';
export const authConfig: NextAuthConfig = {
  providers: [GitHub({...})],   // OAuth = redirect only, edge-safe
  callbacks: {
    authorized({ auth, request }) { return true; }
  }
};

// auth.ts — Node only
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { authConfig } from './auth.config';
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: 'database' },
  providers: [...authConfig.providers, Credentials({ authorize: async (c) => {
    const user = await db.query.users.findFirst({ where: eq(users.email, c.email) });
    if (!user || !await bcrypt.compare(c.password, user.passwordHash)) return null;
    return user;
  }})]
});

// proxy.ts — edge runtime (was middleware.ts in Next ≤15)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth(authConfig);  // ← authConfig only`,
        },
        callsites: {
            heading: '§2 One API, four callers',
            description: "`auth()` is a universal function. Import it from `./auth.ts` and call it wherever you need to know WHO is signed in:\n\n• **Server Component** — `const session = await auth()` at the top. Under Cache Components it must live inside `<Suspense>` because it reads cookies (request-time).\n\n• **Server Action** — `const session = await auth()` at the top. Server Actions are PUBLIC POST endpoints: anyone can craft a FormData and call them. **ALWAYS** re-check inside the action, never trust UI state.\n\n• **Route Handler** — same pattern. Return 401 without redirect (let the client decide).\n\n• **Proxy** (was middleware) — `req.auth` is injected by Auth.js. The `authorized()` callback in auth.config decides allow/redirect.",
            snippet: `// 1️⃣ RSC
import { auth } from '@/auth';
async function Profile() {
  const session = await auth();
  if (!session?.user) return <SignInPrompt />;
  return <div>Welcome {session.user.name}</div>;
}

// 2️⃣ Server Action
'use server';
import { auth } from '@/auth';
export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, session.user.id)));
}

// 3️⃣ Route Handler
import { auth } from '@/auth';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return Response.json({ user: session.user });
}

// 4️⃣ Proxy (proxy.ts — was middleware.ts in Next ≤15)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith('/admin')) return !!auth?.user;
      return true;
    }
  }
});`,
        },
        sessionStrategy: {
            heading: '§3 JWT vs Database (and why Credentials forces JWT globally)',
            description: "Auth.js supports two session strategies:\n\n**JWT** (default) — session signed in a cookie, stateless. Edge-compatible. Zero DB query per session check. Logout = wait for expiry (no server-side revocation).\n\n**Database** — session row in DB via adapter, lookup per request. Immediate revocation, auditable. +1 DB query per authenticated request, bigger schema.\n\n⚠️ **The real v5 behaviour with Credentials**: `auth()` reads the session UNIFORMLY per `session.strategy`. With `'database'`, Auth.js looks up the cookie value as a `sessionToken` in the table. But Credentials NEVER creates a `session` row (the adapter contract is OAuth-shaped). Result: signin succeeds, cookie is set, but EVERY subsequent `auth()` returns `null` because no row matches → user is \"logged in but ghost\".\n\n**Practical consequence**: if you want Credentials in the mix, you **MUST** use `strategy: 'jwt'` globally. The DrizzleAdapter is still useful for `user`, `account`, `verificationToken` — only the `session` table stays empty. Trade-off: you lose the \"revoke by DELETE row\" capability. To get it back you'd need a custom blocklist or a middleware that hits the DB on every request.",
            snippet: `// auth.ts — JWT strategy globally (required by Credentials)
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),         // ← users + accounts in DB
  session: { strategy: 'jwt' },        // ← JWT cookie for BOTH providers

  // With JWT strategy + adapter you must populate session.user.id by hand:
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;   // on signin
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },

  providers: [GitHub({...}), Credentials({...})],
});

// Verify in DB after sign-in (either provider):
//   SELECT * FROM "user"     → 1 row per registered user
//   SELECT * FROM session    → 0 rows (sessions live in the JWT cookie)
//
// To get the "DB session" pattern back in production:
//   • drop Credentials (OAuth-only) → strategy: 'database' works
//   • or add a sessions-blocklist table + middleware that consults it`,
        },
        protectedAccess: {
            heading: '§4 Protecting resources: patterns and anti-patterns',
            description: "Three golden rules to not blow your own security:\n\n**1. Don't trust the client.** Hiding the 'Delete' button in the UI for non-logged-in users protects nothing. Anyone can `curl -X DELETE /api/notes/42`. Protection lives SERVER-SIDE, in the Server Action or Route Handler.\n\n**2. Compound check ownership + auth.** It's not enough to know the user is logged in; you have to verify they own the resource. Drizzle: `where: and(eq(notes.id, id), eq(notes.userId, session.user.id))`. Cross-user delete = matches zero rows = silent no-op (correct: don't leak existence of other users' resources).\n\n**3. Auth logic OUTSIDE the UI.** `if (!session) throw new Error('Unauthorized')` checks belong to the data layer (Server Action, Route Handler), not just the component. So when tomorrow you add a new entry point (mobile, CLI, webhook), the protection is already there.",
            snippet: `// ❌ Anti-pattern: UI-only protection
{session && <button onClick={() => deleteNote(id)}>Delete</button>}
// → the server action is still callable from outside

// ✅ Layered protection
// UI conditional + Server Action re-check + ownership check
{session && <button onClick={() => deleteMyNoteAction(id)}>Delete</button>}

'use server';
export async function deleteMyNoteAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');       // ← layer 1
  await db.delete(notes).where(
    and(eq(notes.id, id), eq(notes.userId, session.user.id))     // ← layer 2
  );
}

// In the Route Handler equivalent:
export async function DELETE(req, ctx) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  // ... same compound where ...
}`,
        },
        oauthSetup: {
            heading: '§5 GitHub OAuth in 90 seconds',
            description: "To enable the GitHub Lab:\n\n**1. Create an OAuth App on github.com:**\n   Settings → Developer settings → OAuth Apps → New OAuth App\n   • Homepage URL: `http://localhost:3000`\n   • Callback URL: `http://localhost:3000/api/auth/callback/github`\n\n**2. Copy the Client ID and generate a Client Secret**\n\n**3. Create `.env.local` at root:**\n   ```\n   AUTH_SECRET=<generate with: npx auth secret>\n   AUTH_GITHUB_ID=<client id>\n   AUTH_GITHUB_SECRET=<client secret>\n   ```\n\n**4. Restart `npm run dev`** — the GitHub button works. Without these env vars the button stays visible but errors on click (it's documented in the UI).\n\n`AUTH_SECRET` signs JWTs + cookies. Auth.js v5 generates it via `npx auth secret`. In production: rotate if compromised → invalidates all existing JWTs.",
            snippet: `// .env.local (DO NOT commit!)
AUTH_SECRET=cnFjMzM3ZkRkY2tCS1NMUlNlbmJReGVoSGdrYjJoeUE=
AUTH_GITHUB_ID=Iv1.abc123...
AUTH_GITHUB_SECRET=ghp_xyz789...

// Generate the secret:
//   npx auth secret
// (writes directly into .env.local)

// In production (Vercel, etc.):
//   • set these 3 env vars in your provider dashboard
//   • the callback URL switches from localhost:3000 to your domain
//   • IMPORTANT: update the OAuth App on GitHub with the production domain`,
        },
    },
    decisionTable: {
        heading: '§5 Decision table: where does the check live?',
        intro: "Auth.js gives you `auth()` everywhere. The right pattern depends on WHO is the caller of the resource.",
        rows: [
            { scenario: 'Conditional render (show/hide UI)', choice: 'RSC + auth() inside <Suspense> (Cache Components-compliant)' },
            { scenario: 'HTML form mutating owned data', choice: 'Server Action + auth() re-check + compound WHERE ownership' },
            { scenario: 'API consumed by JS / mobile client', choice: 'Route Handler + auth() + 401 with no redirect' },
            { scenario: 'Block an entire area (e.g. /admin/*)', choice: 'Middleware + authorized() callback' },
            { scenario: 'OAuth only (no Credentials)', choice: 'Session strategy: database, DrizzleAdapter, revoke via DELETE on session table' },
            { scenario: 'Credentials in the mix (with OAuth)', choice: 'Session strategy: jwt FORCED globally. Adapter still useful for users/accounts.' },
            { scenario: 'Immediate logout invalidating all devices', choice: 'Database sessions (requires pure-OAuth) or custom blocklist + middleware' },
            { scenario: 'Multi-tenant / custom RBAC', choice: 'callbacks.session extends session.user with role / tenantId from DB' },
        ],
    },
    labs: {
        heading: '🧪 Labs',
        session: {
            badge: 'Lab 1 — Session state (RSC + auth())',
            description: 'Server Component that calls `auth()` and shows what the session contains. Lives inside `<Suspense>` because Cache Components.',
            signedInLabel: 'Signed in as',
            signedOutLabel: 'Not signed in',
            signOutLabel: 'Sign out',
            signingOutLabel: 'Signing out…',
        },
        credentials: {
            badge: 'Lab 2 — Credentials (email/password + bcrypt)',
            description: 'Sign in with email/password against PGlite\'s `user` table. Sign up below to create a new account. JWT strategy forced by Auth.js.',
            demoCredsLabel: 'Seeded demo credentials',
            emailPlaceholder: 'Email',
            passwordPlaceholder: 'Password',
            signInLabel: 'Sign in',
            signingInLabel: 'Signing in…',
            namePlaceholder: 'Name (optional)',
            signUpLabel: 'Sign up',
            signingUpLabel: 'Creating account…',
            signUpSuccessLabel: 'Account created. You can now sign in.',
        },
        github: {
            badge: 'Lab 3 — GitHub OAuth',
            description: "Sign in via OAuth. Produces a row in `user` + one in `account` in PGlite (account linking). Session lives in the JWT cookie just like Credentials (see §3). Requires AUTH_GITHUB_ID/SECRET in .env.local — see §5.",
            signInLabel: 'Sign in with GitHub',
            missingEnvLabel: '⚠️ Missing AUTH_GITHUB_ID/SECRET in .env.local. See §5 for the setup.',
        },
        myNotes: {
            badge: 'Lab 3 — Protected mini-CRUD',
            description: "Server Action that creates notes OWNED by the signed-in user. Every mutation re-checks `auth()` + compound WHERE on ownership. Non-logged-in users see only a placeholder.",
            titlePlaceholder: 'Your note title',
            bodyPlaceholder: 'Body (optional)…',
            tagsPlaceholder: 'Comma-separated tags',
            createLabel: 'Create (owned)',
            creatingLabel: 'Creating…',
            deleteLabel: 'Delete',
            emptyLabel: "You don't have any notes yet. Create one above!",
            authRequiredLabel: 'Sign in to create your notes.',
        },
        apiTest: {
            badge: 'Lab 4 — Protected Route Handler (/api/me/notes)',
            description: 'Calls GET /api/me/notes. Signed in → 200 with your notes. Signed out → 401. See DevTools → Network.',
            callLabel: 'GET /api/me/notes',
            callingLabel: 'Calling…',
            statusLabel: 'Status',
            responseLabel: 'Response',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Open DevTools → Application → Cookies + Network. Run through:',
        steps: [
            "Sign in with the demo credentials (Lab 2). Cookies: `authjs.session-token` appears. It's a JWE (encrypted, not just signed) — Auth.js v5 encrypts tokens. Not inspectable on the standard jwt.io without the key.",
            "Same sign-in: the `npm run dev` terminal shows NO SELECT logs on `session`. The table stays empty — sessions live in the cookie.",
            "Lab 4 → GET /api/me/notes while signed in: 200 with the list. Sign out → same GET: 401.",
            "Lab 3 → create a note, then try to delete it by opening `/api/notes/:id` directly in DevTools console:\n```\nfetch('/api/notes/' + id, { method: 'DELETE' })\n```\nIt works — because /api/notes is the public Lesson 2 CRUD (no auth). Compare with `/api/me/notes` which requires auth.",
            "Open the PGlite store: `SELECT id, email, name FROM \"user\";` — see the demo user + anyone you signed up. `SELECT * FROM session;` — ZERO rows (sessions live in JWT cookies, see §3).",
            "⚠️ Security: try calling the Server Action `deleteMyNoteAction(id)` for ANOTHER user's note. The compound WHERE silently deletes nothing — that's the correct pattern (don't leak existence via 404).",
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 4 · Лекція 3',
    title: 'Auth.js v5',
    intro: "Auth.js v5 (next-auth@beta) — це rewrite для App Router. Нові API, новий layout файлів, нові runtime. Серцевина: одна універсальна функція `auth()` читає сесію з БУДЬ-ЯКОЇ server-side поверхні — RSC, Server Action, Route Handler, middleware. У цій лекції налаштовуємо два провайдери (Credentials з bcrypt + GitHub OAuth), монтуємо Drizzle adapter на PGlite з Лекції 2 (користувачі живуть у БД), і демонструємо 4 checkpoint автентифікації через захищений `/api/me/notes` mini-app.",
    sections: {
        split: {
            heading: "§1 Pattern 'split config' в Auth.js v5",
            description: "Edge-runtime handler Next працює на EDGE, де багато Node-модулів заборонені: bcryptjs, Drizzle drivers, PGlite WASM. Auth.js v5 ділить config на два файли:\n\n• `auth.config.ts` (edge-safe): тільки провайдери, що НЕ використовують Node в `authorize`, callback `authorized`, `pages`.\n• `auth.ts` (Node): імпортує `auth.config` + додає DrizzleAdapter, Credentials з bcrypt, важкі session callbacks.\n• `proxy.ts` (раніше `middleware.ts`): створює `NextAuth(authConfig)` (тільки edge-safe частина) → отримує легкий edge handler.\n\n⚠️ Починаючи з Next 16, файл `middleware.ts` перейменовано на `proxy.ts`. Стара назва ще працює, але дає warning при boot. Семантика ідентична.\n\nЦе breaking change порівняно з v4, де все було в одному файлі. Коштує два файли, дає змогу мати edge handler + DB adapter в одному проєкті.",
            snippet: `// auth.config.ts — edge-safe
import GitHub from 'next-auth/providers/github';
export const authConfig: NextAuthConfig = {
  providers: [GitHub({...})],   // OAuth = тільки redirect, edge-safe
  callbacks: {
    authorized({ auth, request }) { return true; }
  }
};

// auth.ts — тільки Node
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { authConfig } from './auth.config';
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: 'database' },
  providers: [...authConfig.providers, Credentials({ authorize: async (c) => {
    const user = await db.query.users.findFirst({ where: eq(users.email, c.email) });
    if (!user || !await bcrypt.compare(c.password, user.passwordHash)) return null;
    return user;
  }})]
});

// proxy.ts — edge runtime (раніше middleware.ts в Next ≤15)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth(authConfig);  // ← тільки authConfig`,
        },
        callsites: {
            heading: '§2 Одна API, чотири caller-и',
            description: "`auth()` — універсальна функція. Імпортуєш з `./auth.ts` і викликаєш будь-де, де треба знати ХТО залогінений:\n\n• **Server Component** — `const session = await auth()` на початку RSC. При Cache Components має бути в `<Suspense>`, бо читає cookies (request-time).\n\n• **Server Action** — `const session = await auth()` на початку. Server Actions — ПУБЛІЧНІ POST endpoint: будь-хто може скрафтити FormData і викликати. **ЗАВЖДИ** re-check всередині action, ніколи не довіряй UI-стану.\n\n• **Route Handler** — той самий патерн. Повертай 401 без redirect (клієнт сам вирішить).\n\n• **Proxy** (раніше middleware) — `req.auth` ін'єктується Auth.js. Callback `authorized()` в auth.config вирішує allow/redirect.",
            snippet: `// 1️⃣ RSC
import { auth } from '@/auth';
async function Profile() {
  const session = await auth();
  if (!session?.user) return <SignInPrompt />;
  return <div>Welcome {session.user.name}</div>;
}

// 2️⃣ Server Action
'use server';
import { auth } from '@/auth';
export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, session.user.id)));
}

// 3️⃣ Route Handler
import { auth } from '@/auth';
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  return Response.json({ user: session.user });
}

// 4️⃣ Proxy (proxy.ts — раніше middleware.ts у Next ≤15)
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export const { auth: proxy } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith('/admin')) return !!auth?.user;
      return true;
    }
  }
});`,
        },
        sessionStrategy: {
            heading: '§3 JWT vs Database (і чому Credentials примушує JWT глобально)',
            description: "Auth.js підтримує дві стратегії сесії:\n\n**JWT** (default) — сесія підписана в cookie, stateless. Edge-compatible. Нуль DB queries на session check. Logout = чекати закінчення (без server-side revocation).\n\n**Database** — рядок сесії в БД через adapter, lookup на request. Миттєвий revoke, audit-able. +1 DB query на authenticated request, більша схема.\n\n⚠️ **Реальна поведінка v5 із Credentials**: `auth()` читає сесію ОДНОРІДНО за `session.strategy`. При `'database'` Auth.js шукає значення cookie як `sessionToken` у таблиці. Але Credentials НІКОЛИ не створює рядок у `session` (adapter — OAuth-shaped). Результат: signin успішний, cookie встановлено, але КОЖЕН подальший `auth()` повертає `null`, бо жоден рядок не матчить → юзер «залогінений, але привид».\n\n**Практичний наслідок**: якщо хочеш Credentials у міксі, **МУСИШ** використовувати `strategy: 'jwt'` глобально. DrizzleAdapter залишається корисним для `user`, `account`, `verificationToken` — тільки таблиця `session` лишається порожньою. Trade-off: втрачаєш можливість «revoke by DELETE row». Щоб повернути її, треба custom blocklist або middleware, що пінгує БД на кожен request.",
            snippet: `// auth.ts — JWT strategy глобально (потрібна для Credentials)
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),         // ← users + accounts у БД
  session: { strategy: 'jwt' },        // ← JWT cookie для ОБОХ провайдерів

  // З JWT strategy + adapter ти маєш заповнити session.user.id вручну:
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;   // на signin
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },

  providers: [GitHub({...}), Credentials({...})],
});

// Перевірка в БД після login (будь-який провайдер):
//   SELECT * FROM "user"     → 1 рядок на зареєстрованого юзера
//   SELECT * FROM session    → 0 рядків (сесії живуть у JWT cookie)
//
// Щоб повернути "DB session" pattern у production:
//   • прибери Credentials (тільки OAuth) → strategy: 'database' працює
//   • або додай sessions-blocklist table + middleware, що її консультує`,
        },
        protectedAccess: {
            heading: '§4 Захист ресурсів: патерни і анти-патерни',
            description: "Три золоті правила, щоб не пробити власну безпеку:\n\n**1. Не довіряй клієнту.** Сховаєш 'Delete' для незалогінених юзерів — це нічого не захищає. Будь-хто може `curl -X DELETE /api/notes/42`. Захист живе SERVER-SIDE, у Server Action чи Route Handler.\n\n**2. Compound check ownership + auth.** Недостатньо знати, що юзер залогінений; треба перевірити, що він володіє ресурсом. Drizzle: `where: and(eq(notes.id, id), eq(notes.userId, session.user.id))`. Cross-user delete = matches zero rows = тихий no-op (правильно: не leakати існування чужого ресурсу).\n\n**3. Логіка auth ПОЗА UI.** Перевірки `if (!session) throw new Error('Unauthorized')` мають бути в data layer (Server Action, Route Handler), не лише в компоненті. Тоді коли завтра додаси новий entry point (mobile, CLI, webhook), захист уже там.",
            snippet: `// ❌ Анти-патерн: захист ЛИШЕ в UI
{session && <button onClick={() => deleteNote(id)}>Delete</button>}
// → server action все одно викликається зовні

// ✅ Layered protection
// UI conditional + Server Action re-check + ownership check
{session && <button onClick={() => deleteMyNoteAction(id)}>Delete</button>}

'use server';
export async function deleteMyNoteAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');       // ← layer 1
  await db.delete(notes).where(
    and(eq(notes.id, id), eq(notes.userId, session.user.id))     // ← layer 2
  );
}

// У відповідному Route Handler:
export async function DELETE(req, ctx) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  // ... той самий compound where ...
}`,
        },
        oauthSetup: {
            heading: '§5 GitHub OAuth за 90 секунд',
            description: "Щоб увімкнути GitHub Lab:\n\n**1. Створи OAuth App на github.com:**\n   Settings → Developer settings → OAuth Apps → New OAuth App\n   • Homepage URL: `http://localhost:3000`\n   • Callback URL: `http://localhost:3000/api/auth/callback/github`\n\n**2. Скопіюй Client ID і згенеруй Client Secret**\n\n**3. Створи `.env.local` в root:**\n   ```\n   AUTH_SECRET=<згенеруй через: npx auth secret>\n   AUTH_GITHUB_ID=<client id>\n   AUTH_GITHUB_SECRET=<client secret>\n   ```\n\n**4. Перезапусти `npm run dev`** — кнопка GitHub працює. Без цих env vars кнопка залишається, але дає помилку при кліку (це задокументовано в UI).\n\n`AUTH_SECRET` підписує JWT + cookies. Auth.js v5 генерує його через `npx auth secret`. У production: rotate якщо скомпрометовано → інвалідує всі існуючі JWT.",
            snippet: `// .env.local (НЕ комітити!)
AUTH_SECRET=cnFjMzM3ZkRkY2tCS1NMUlNlbmJReGVoSGdrYjJoeUE=
AUTH_GITHUB_ID=Iv1.abc123...
AUTH_GITHUB_SECRET=ghp_xyz789...

// Генерація secret:
//   npx auth secret
// (пише прямо в .env.local)

// У production (Vercel, etc.):
//   • встанови ці 3 env vars в дашборді провайдера
//   • callback URL змінюється з localhost:3000 на твій domain
//   • ВАЖЛИВО: оновлюй OAuth App на GitHub з production domain`,
        },
    },
    decisionTable: {
        heading: '§5 Decision table: де живе перевірка?',
        intro: "Auth.js дає тобі `auth()` всюди. Правильний патерн залежить від ТОГО ХТО caller ресурсу.",
        rows: [
            { scenario: 'Conditional render (показати/приховати UI)', choice: 'RSC + auth() у <Suspense> (Cache Components-compliant)' },
            { scenario: 'HTML-форма змінює owned дано', choice: 'Server Action + auth() re-check + compound WHERE ownership' },
            { scenario: 'API для JS / mobile клієнта', choice: 'Route Handler + auth() + 401 без redirect' },
            { scenario: 'Блок цілої зони (напр. /admin/*)', choice: 'Middleware + callback authorized()' },
            { scenario: 'Тільки OAuth (без Credentials)', choice: 'Session strategy: database, DrizzleAdapter, revoke через DELETE на session table' },
            { scenario: 'Credentials у міксі (з OAuth)', choice: 'Session strategy: jwt ПРИМУСОВО глобально. Adapter все ще корисний для users/accounts.' },
            { scenario: 'Миттєвий logout, що інвалідує всі девайси', choice: 'Database sessions (потребує pure-OAuth) або custom blocklist + middleware' },
            { scenario: 'Multi-tenant / custom RBAC', choice: 'callbacks.session розширює session.user з role / tenantId з БД' },
        ],
    },
    labs: {
        heading: '🧪 Лабораторії',
        session: {
            badge: 'Lab 1 — Стан сесії (RSC + auth())',
            description: 'Server Component, що викликає `auth()` і показує, що містить сесія. Живе всередині `<Suspense>`, бо Cache Components.',
            signedInLabel: 'Залогінений як',
            signedOutLabel: 'Не залогінений',
            signOutLabel: 'Sign out',
            signingOutLabel: 'Logout…',
        },
        credentials: {
            badge: 'Lab 2 — Credentials (email/password + bcrypt)',
            description: 'Sign in з email/password проти таблиці `user` PGlite. Sign up знизу для створення нового акаунту. JWT стратегія примушена Auth.js.',
            demoCredsLabel: 'Seeded demo credentials',
            emailPlaceholder: 'Email',
            passwordPlaceholder: 'Password',
            signInLabel: 'Sign in',
            signingInLabel: 'Sign-in…',
            namePlaceholder: "Ім'я (опційно)",
            signUpLabel: 'Sign up',
            signingUpLabel: 'Створення акаунту…',
            signUpSuccessLabel: 'Акаунт створено. Тепер можеш Sign in.',
        },
        github: {
            badge: 'Lab 3 — GitHub OAuth',
            description: "Sign in через OAuth. Створює рядок у `user` + один у `account` в PGlite (account linking). Сесія живе в JWT cookie так само як у Credentials (див. §3). Потребує AUTH_GITHUB_ID/SECRET в .env.local — див. §5.",
            signInLabel: 'Sign in with GitHub',
            missingEnvLabel: '⚠️ Бракує AUTH_GITHUB_ID/SECRET в .env.local. Див. §5 для налаштування.',
        },
        myNotes: {
            badge: 'Lab 3 — Захищений mini-CRUD',
            description: "Server Action, що створює нотатки ВЛАСНІ для залогіненого юзера. Кожна mutation re-check `auth()` + compound WHERE на ownership. Незалогінені бачать тільки placeholder.",
            titlePlaceholder: 'Заголовок твоєї нотатки',
            bodyPlaceholder: 'Зміст (опційно)…',
            tagsPlaceholder: 'Теги через кому',
            createLabel: 'Створити (owned)',
            creatingLabel: 'Створення…',
            deleteLabel: 'Видалити',
            emptyLabel: 'У тебе ще немає нотаток. Створи вище!',
            authRequiredLabel: 'Залогінься, щоб створити свої нотатки.',
        },
        apiTest: {
            badge: 'Lab 4 — Захищений Route Handler (/api/me/notes)',
            description: 'Викликає GET /api/me/notes. Залогінений → 200 з твоїми нотатками. Незалогінений → 401. Дивись DevTools → Network.',
            callLabel: 'GET /api/me/notes',
            callingLabel: 'Виклик…',
            statusLabel: 'Status',
            responseLabel: 'Відповідь',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Відкрий DevTools → Application → Cookies + Network. Перевір:',
        steps: [
            "Sign in з demo credentials (Lab 2). Cookies: з'являється `authjs.session-token`. Це JWE (зашифрований, не лише підписаний) — Auth.js v5 шифрує токени. Не інспектується звичайним jwt.io без ключа.",
            "Той самий login: у терміналі `npm run dev` НЕМАЄ SELECT логів на `session`. Таблиця лишається порожня — сесії живуть у cookie.",
            "Lab 4 → GET /api/me/notes коли залогінений: 200 зі списком. Sign out → той самий GET: 401.",
            "Lab 3 → створи нотатку, потім спробуй видалити, відкривши `/api/notes/:id` напряму в DevTools console:\n```\nfetch('/api/notes/' + id, { method: 'DELETE' })\n```\nПрацює — бо /api/notes це публічний CRUD Лекції 2 (без auth). Порівняй з `/api/me/notes`, що вимагає auth.",
            "Відкрий PGlite store: `SELECT id, email, name FROM \"user\";` — бачиш demo user + будь-кого, кого signup. `SELECT * FROM session;` — ЗЕРО рядків (сесії живуть у JWT cookie, див. §3).",
            "⚠️ Безпека: спробуй викликати Server Action `deleteMyNoteAction(id)` для нотатки ІНШОГО юзера. Compound WHERE тихо нічого не видаляє — це правильний патерн (не leakати існування через 404).",
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
export type { Dictionary };
