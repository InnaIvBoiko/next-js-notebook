// =============================================================================
// app/lessons/database-orm/_lib/content.ts
// Inline i18n dictionary for Module 4 · Lesson 2 (Database & ORM).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Section = { heading: string; description: string; snippet: string };

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        whyOrm: Section;
        schema: Section;
        threeCallers: Section;
        transactions: Section;
        cacheRsc: Section;
    };
    decisionTable: {
        heading: string;
        intro: string;
        rows: { scenario: string; choice: string }[];
    };
    labs: {
        heading: string;
        rscReader: {
            badge: string;
            description: string;
            tagsLabel: string;
            emptyLabel: string;
            createdLabel: string;
            deleteLabel: string;
            loadingLabel: string;
        };
        serverAction: {
            badge: string;
            description: string;
            titlePlaceholder: string;
            bodyPlaceholder: string;
            tagsPlaceholder: string;
            createLabel: string;
            creatingLabel: string;
            resetLabel: string;
        };
        clientQuery: {
            badge: string;
            description: string;
            refetchLabel: string;
            fetchingLabel: string;
            countLabel: string;
        };
    };
    debug: { heading: string; description: string; steps: string[] };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 4 · Lezione 2',
    title: 'Database & ORM',
    intro: "Lezione 1 ci ha dato endpoint REST contro un array in memoria. Ora sostituiamo quell'array con un VERO database Postgres (PGlite, WASM in-process) e un ORM type-safe (Drizzle). Stesso dato, tre call-site: un Server Component che fa `db.query.notes.findMany()` direttamente (zero HTTP), una Server Action che fa INSERT in transazione, e i Route Handler di Lezione 1 — ora riutilizzati per TanStack Query lato client. Tabella `notes` + `note_tags` con relazione 1-N: il pretesto per insegnare JOIN, transazioni e `ON DELETE CASCADE`.",
    sections: {
        whyOrm: {
            heading: '§1 Perché un ORM (e quale)',
            description: "Un ORM fa tre cose: ti dà type-safety end-to-end (la riga che esce dal DB ha lo stesso shape che hai dichiarato), ti protegge da SQL injection (parametri sempre escape-ati), e ti dà un'API di query componibile. Costi: una nuova astrazione, e l'incentivo a non imparare SQL.\n\nNell'ecosistema Next 16, le due scelte mainstream sono Drizzle e Prisma. Drizzle vince per noi perché: API SQL-like (impari SQL implicitamente), zero codegen runtime (più HMR-friendly), edge-compatible, schema dichiarato direttamente in TS. Prisma resta valido ma è più pesante e l'ecosistema si sta spostando.\n\nPer il database scegliamo PGlite — Postgres compilato a WebAssembly, in-process. Sintassi Postgres VERA (window functions, JSONB, generated columns) senza Docker, senza install. Quando andremo in produzione su Neon/Supabase/RDS, le query Drizzle non cambiano: si scambia solo il driver.",
            snippet: `// Stack scelto:
// • Drizzle ORM   — schema TS + query SQL-like + type inference
// • PGlite        — Postgres in WASM, in-process Node
// • drizzle-orm/pglite — adattatore ufficiale

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

const pglite = new PGlite();          // in-memory; passa una path per persistere
export const db = drizzle(pglite, { schema });

// Stessa query, qualunque driver Postgres:
const notes = await db.query.notes.findMany({ with: { tags: true } });`,
        },
        schema: {
            heading: '§2 Lo schema in TypeScript',
            description: "Drizzle definisce lo schema in TypeScript: niente file .sql separato, niente codegen. Il modulo `pg-core` espone helper (`pgTable`, `serial`, `text`, `timestamp`, ...) che mappano 1-a-1 sui tipi Postgres. La `relations()` API dichiara le associazioni tra tabelle e abilita le query relazionali tipo `findMany({ with: { tags: true } })`.\n\nDue regole d'oro:\n• `serial('id').primaryKey()` per PK auto-increment (rendono bene nella UI didattica). In produzione spesso si preferisce `uuid('id').defaultRandom()` per non esporre i contatori.\n• `references(() => parent.id, { onDelete: 'cascade' })` — la FK + il comportamento on-delete sono ENFORCED dal motore Postgres. Niente cleanup applicativo.",
            snippet: `// app/_db/schema.ts
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull().defaultNow(),
});

export const noteTags = pgTable('note_tags', {
  id: serial('id').primaryKey(),
  noteId: integer('note_id').notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
});

export const notesRelations = relations(notes, ({ many }) => ({
  tags: many(noteTags),
}));

// Tipi inferiti dallo schema — zero duplicazione:
export type Note    = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;`,
        },
        threeCallers: {
            heading: '§3 Un DB, tre call-site',
            description: "La decision table di Lezione 1 prevedeva tre strade per leggere/scrivere dati server-side. Ora con un DB vero possiamo vederle tutte e tre nella stessa pagina:\n\n1. SERVER COMPONENT — `import { listNotesWithTags } from '@/app/_db/queries'`. Niente HTTP, niente serializzazione JSON. Sotto Cache Components, la lettura uncached va in `<Suspense>` (la lezione qui sotto è wrappata).\n\n2. SERVER ACTION — un modulo `'use server'` chiama `createNote()` e poi `revalidatePath('/lessons/database-orm')` per re-renderizzare l'RSC. Form HTML che `action={createNoteAction}` → POST tracciato dal framework, zero `fetch()`.\n\n3. ROUTE HANDLER — gli endpoint `/api/notes` di Lezione 1 ora chiamano lo stesso modulo `queries.ts`. Sono lì per i client che NON possono importare codice server-side: TanStack Query nel browser, app mobile, webhook esterni.",
            snippet: `// 1️⃣ RSC — import diretto, niente HTTP
import { listNotesWithTags } from '@/app/_db/queries';
async function NotesList() {
  const notes = await listNotesWithTags();
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// 2️⃣ Server Action — form action + revalidatePath
'use server';
import { revalidatePath } from 'next/cache';
import { createNote } from '@/app/_db/queries';
export async function createNoteAction(formData: FormData) {
  await createNote({ title: String(formData.get('title')) });
  revalidatePath('/lessons/database-orm');
}

// 3️⃣ Route Handler — stessa funzione, esposta via HTTP
export async function POST(request: NextRequest) {
  const { title } = await request.json();
  const note = await createNote({ title });
  return Response.json({ note }, { status: 201 });
}`,
        },
        transactions: {
            heading: '§4 Transazioni & relazioni',
            description: "Creare una nota CON i suoi tag è due INSERT: uno su `notes`, uno su `note_tags`. Se il secondo fallisce, il primo va annullato — altrimenti restiamo con una nota orfana. Soluzione: una TRANSAZIONE.\n\nDrizzle espone `db.transaction(async tx => { ... })`: dentro la callback, `tx` ha la stessa API di `db`, ma ogni query gira sulla stessa connessione tra `BEGIN` e `COMMIT`. Se la callback lancia, Drizzle emette `ROLLBACK` automaticamente.\n\nPer leggere insieme nota e tag: `db.query.notes.findMany({ with: { tags: true } })`. Drizzle genera UNA query con LEFT JOIN + aggregazione lato Postgres — non un loop N+1. I tipi del risultato si inferiscono dalle `relations()` dichiarate nello schema.",
            snippet: `// CREATE atomico in transazione
export async function createNote(input: { title: string; tags?: string[] }) {
  return db.transaction(async tx => {
    const [row] = await tx.insert(notes).values({
      title: input.title,
    }).returning();

    if (input.tags?.length) {
      await tx.insert(noteTags).values(
        input.tags.map(label => ({ noteId: row.id, label }))
      );
    }
    // Se uno dei due fallisce → ROLLBACK automatico
    return row;
  });
}

// READ relazionale tipizzato:
const notes = await db.query.notes.findMany({
  with: { tags: true },        // ← genera un singolo LEFT JOIN
  orderBy: [desc(notes.createdAt)],
});
// Tipo inferito:  Array<Note & { tags: NoteTag[] }>`,
        },
        cacheRsc: {
            heading: '§5 DB reads in RSC sotto Cache Components',
            description: "In modalità Cache Components (next.config.ts), un Server Component che fa `await listNotesWithTags()` accede a dato NON cachato. La regola: tutto ciò che non è prerender-abile deve vivere dentro `<Suspense>`, o il build fallisce con \"Uncached data was accessed outside of <Suspense>\".\n\nDue strategie:\n\n1. WRAP IN SUSPENSE (la nostra scelta qui): la shell statica viene prerenderata, il contenuto streama. Vedi il `<Suspense fallback={...}>` in `page.tsx`. Perfetto per dati personalizzati o frequenti.\n\n2. `'use cache'` SU UNA HELPER: marca la query come cacheable + `cacheLife('hours')` + opzionalmente `cacheTag('notes')` per invalidare on-demand da una Server Action via `updateTag('notes')`. Pattern di Modulo 2 · Lezione 2.\n\nDato che le Note cambiano spesso (la lezione le crea/elimina interattivamente), la Suspense è la scelta giusta. Per dati raramente cambianti (config app, listini prezzi) preferiremmo `'use cache'`.",
            snippet: `// page.tsx — Server Component
import { Suspense } from 'react';
import { listNotesWithTags } from '@/app/_db/queries';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <RscNotesList />            {/* ← dato uncached, dentro Suspense */}
    </Suspense>
  );
}

async function RscNotesList() {
  const notes = await listNotesWithTags();   // hit DB
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// Alternativa: cache + tag-based invalidation
import { cacheLife, cacheTag } from 'next/cache';
async function getCachedNotes() {
  'use cache';
  cacheLife('hours');
  cacheTag('notes');
  return listNotesWithTags();
}
// Dopo una mutation: updateTag('notes') invalida → prossima lettura rigenera`,
        },
    },
    decisionTable: {
        heading: '§6 Tabella decisionale: dove vive la query',
        intro: 'Stessa regola di Lezione 1, ora con sostanza: il caller decide la strada. Il modulo `queries.ts` è agnostico al trasporto.',
        rows: [
            { scenario: 'RSC che renderizza una pagina', choice: 'Import diretto da @/app/_db/queries · wrap in <Suspense> se Cache Components' },
            { scenario: 'Form HTML che crea/aggiorna', choice: "Server Action ('use server') + revalidatePath" },
            { scenario: 'Mutation client-side senza form (es. drag&drop)', choice: 'Server Action chiamata programmaticamente' },
            { scenario: 'Lista live con polling / search debounced', choice: 'Route Handler + TanStack Query' },
            { scenario: 'Lettura cacheabile (config, prezzi)', choice: "'use cache' helper + cacheTag + updateTag dopo mutation" },
            { scenario: 'Dati molto pesanti consumati da una RSC', choice: 'React.cache() dentro la query per dedup intra-request' },
            { scenario: 'Webhook esterno che mutua dato', choice: 'Route Handler POST + transaction Drizzle' },
        ],
    },
    labs: {
        heading: '🧪 Laboratori',
        rscReader: {
            badge: 'Lab 1 — RSC direct read',
            description: 'Questa lista è renderizzata da un Server Component che fa `await listNotesWithTags()` direttamente. Niente HTTP, niente JSON sul wire. È dentro un `<Suspense>` perché Cache Components proibisce dato uncached fuori da una boundary.',
            tagsLabel: 'tag',
            emptyLabel: 'Nessuna nota nel DB.',
            createdLabel: 'creata',
            deleteLabel: 'Elimina',
            loadingLabel: 'Lettura dal DB…',
        },
        serverAction: {
            badge: 'Lab 2 — Server Action + transaction',
            description: 'Form HTML che fa POST a una Server Action. La action chiama `createNote()` (Drizzle: INSERT note + INSERT tags in UNA transazione), poi `revalidatePath` fa re-fetchare la lista sopra senza reload.',
            titlePlaceholder: 'Titolo della nota',
            bodyPlaceholder: 'Corpo (opzionale)…',
            tagsPlaceholder: 'Tag separati da virgola, es: orm, postgres',
            createLabel: 'Crea (via Server Action)',
            creatingLabel: 'Salvataggio…',
            resetLabel: 'Reset al seed',
        },
        clientQuery: {
            badge: 'Lab 3 — Client + TanStack Query',
            description: 'Stessi dati, ma letti da TanStack Query contro `/api/notes` (Route Handler di Lez. 1, ora backed dal DB). È così che il browser/mobile/app esterna parla al nostro server quando non può importare codice server-side.',
            refetchLabel: 'Refetch (via HTTP)',
            fetchingLabel: 'Loading…',
            countLabel: 'note',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Tre osservazioni che mostrano i tre call-site in azione:',
        steps: [
            "Apri DevTools → Network. Ricarica la pagina: NON vedi nessuna chiamata a `/api/notes` per il Lab 1. La lista è renderizzata server-side dall'RSC, niente HTTP.",
            "Crea una nota dal Lab 2. Network mostra UNA richiesta POST alla pagina stessa (la Server Action è un POST trasparente, non un endpoint esposto). Subito dopo, la lista RSC sopra si aggiorna senza reload — è `revalidatePath` che ha agito.",
            "Refetch nel Lab 3. Network mostra una GET a `/api/notes` con status 200. È il path 'classico' Route Handler + client fetch.",
            "Terminale di `npm run dev`: la prima richiesta DB stampa la creazione delle tabelle + il seed. Successive richieste sono silenziose — il `dbReady` promise è risolta una sola volta.",
            "Elimina una nota: la tabella `note_tags` si pulisce automaticamente grazie a `ON DELETE CASCADE`. Nessun codice applicativo cancella i tag — è Postgres a farlo.",
            "Reset al seed (bottone Lab 2): rivedi i 3 record originali con i loro tag. Le ID partono da numeri PIÙ ALTI perché SERIAL non viene resettato dal DELETE (lo sarebbe da `TRUNCATE ... RESTART IDENTITY`).",
            "⚠️ Caveat hydration: due elementi del Lab 1 (`DeleteNoteButton`, `EmptyState`) hanno `suppressHydrationWarning`. Motivo: vivono dentro un `<Suspense>` streamato, e il `<LangProvider>` (che usa `sessionStorage`) può aver già cambiato lingua sul client prima che il contenuto streamato venga idratato. Il fix architetturale corretto è la persistenza via COOKIE (leggibile lato server) — copertura prevista in Modulo 5 · /advanced-routing.",
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 4 · Lesson 2',
    title: 'Database & ORM',
    intro: "Lesson 1 gave us REST endpoints over an in-memory array. Now we replace that array with a REAL Postgres database (PGlite, WASM in-process) and a type-safe ORM (Drizzle). Same data, three callers: a Server Component running `db.query.notes.findMany()` directly (zero HTTP), a Server Action doing a transactional INSERT, and the Route Handlers from Lesson 1 — now reused by TanStack Query on the client. A `notes` + `note_tags` schema with a 1-to-N relationship is the pretext for teaching JOINs, transactions and `ON DELETE CASCADE`.",
    sections: {
        whyOrm: {
            heading: '§1 Why an ORM (and which one)',
            description: "An ORM does three things: gives you end-to-end type safety (the row coming out of the DB has the exact shape you declared), shields you from SQL injection (parameters always escaped), and gives you a composable query API. Costs: a new abstraction, and the incentive not to learn SQL.\n\nIn the Next 16 ecosystem the two mainstream choices are Drizzle and Prisma. Drizzle wins here because: SQL-like API (you learn SQL implicitly), no runtime codegen (more HMR-friendly), edge-compatible, schema declared directly in TS. Prisma is still valid but heavier and the ecosystem is shifting.\n\nFor the database we pick PGlite — Postgres compiled to WebAssembly, in-process. REAL Postgres syntax (window functions, JSONB, generated columns) without Docker, without install. When we move to production on Neon/Supabase/RDS, the Drizzle queries don't change: only the driver does.",
            snippet: `// Chosen stack:
// • Drizzle ORM     — TS schema + SQL-like queries + type inference
// • PGlite          — Postgres in WASM, in-process Node
// • drizzle-orm/pglite — official adapter

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

const pglite = new PGlite();          // in-memory; pass a path to persist
export const db = drizzle(pglite, { schema });

// Same query, any Postgres driver:
const notes = await db.query.notes.findMany({ with: { tags: true } });`,
        },
        schema: {
            heading: '§2 Schema in TypeScript',
            description: "Drizzle defines the schema in TypeScript: no separate .sql file, no codegen. The `pg-core` module exposes helpers (`pgTable`, `serial`, `text`, `timestamp`, ...) that map 1-to-1 to Postgres types. The `relations()` API declares associations and enables relational queries like `findMany({ with: { tags: true } })`.\n\nTwo golden rules:\n• `serial('id').primaryKey()` for auto-increment PKs (they render nicely in teaching UIs). In production you often prefer `uuid('id').defaultRandom()` to not expose counters.\n• `references(() => parent.id, { onDelete: 'cascade' })` — the FK + on-delete behaviour are ENFORCED by Postgres. No app-side cleanup.",
            snippet: `// app/_db/schema.ts
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull().defaultNow(),
});

export const noteTags = pgTable('note_tags', {
  id: serial('id').primaryKey(),
  noteId: integer('note_id').notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
});

export const notesRelations = relations(notes, ({ many }) => ({
  tags: many(noteTags),
}));

// Types inferred from the schema — zero duplication:
export type Note    = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;`,
        },
        threeCallers: {
            heading: '§3 One DB, three callers',
            description: "Lesson 1's decision table named three ways to read/write server-side data. With a real DB we can see all three on the same page:\n\n1. SERVER COMPONENT — `import { listNotesWithTags } from '@/app/_db/queries'`. No HTTP, no JSON serialisation. Under Cache Components, uncached reads must live in `<Suspense>` (the lesson list below is wrapped).\n\n2. SERVER ACTION — a `'use server'` module calls `createNote()` then `revalidatePath('/lessons/database-orm')` to re-render the RSC. An HTML form with `action={createNoteAction}` → POST tracked by the framework, no `fetch()`.\n\n3. ROUTE HANDLER — Lesson 1's `/api/notes` endpoints now call the same `queries.ts` module. They are there for clients that CANNOT import server code: browser-side TanStack Query, mobile apps, external webhooks.",
            snippet: `// 1️⃣ RSC — direct import, no HTTP
import { listNotesWithTags } from '@/app/_db/queries';
async function NotesList() {
  const notes = await listNotesWithTags();
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// 2️⃣ Server Action — form action + revalidatePath
'use server';
import { revalidatePath } from 'next/cache';
import { createNote } from '@/app/_db/queries';
export async function createNoteAction(formData: FormData) {
  await createNote({ title: String(formData.get('title')) });
  revalidatePath('/lessons/database-orm');
}

// 3️⃣ Route Handler — same function, exposed via HTTP
export async function POST(request: NextRequest) {
  const { title } = await request.json();
  const note = await createNote({ title });
  return Response.json({ note }, { status: 201 });
}`,
        },
        transactions: {
            heading: '§4 Transactions & relations',
            description: "Creating a note WITH its tags is two INSERTs: one on `notes`, one on `note_tags`. If the second fails, the first must roll back — otherwise we'd leave an orphan note. Solution: a TRANSACTION.\n\nDrizzle exposes `db.transaction(async tx => { ... })`: inside the callback `tx` has the same API as `db`, but every query runs on the same connection between `BEGIN` and `COMMIT`. If the callback throws, Drizzle issues `ROLLBACK` automatically.\n\nTo read a note together with its tags: `db.query.notes.findMany({ with: { tags: true } })`. Drizzle generates ONE query with a LEFT JOIN + Postgres-side aggregation — not an N+1 loop. Result types are inferred from the `relations()` declared in the schema.",
            snippet: `// Atomic CREATE in a transaction
export async function createNote(input: { title: string; tags?: string[] }) {
  return db.transaction(async tx => {
    const [row] = await tx.insert(notes).values({
      title: input.title,
    }).returning();

    if (input.tags?.length) {
      await tx.insert(noteTags).values(
        input.tags.map(label => ({ noteId: row.id, label }))
      );
    }
    // If either step fails → automatic ROLLBACK
    return row;
  });
}

// Typed relational READ:
const notes = await db.query.notes.findMany({
  with: { tags: true },        // ← generates a single LEFT JOIN
  orderBy: [desc(notes.createdAt)],
});
// Inferred type:  Array<Note & { tags: NoteTag[] }>`,
        },
        cacheRsc: {
            heading: '§5 DB reads in an RSC under Cache Components',
            description: "In Cache Components mode (next.config.ts), a Server Component running `await listNotesWithTags()` accesses uncached data. The rule: anything that can't be prerendered must live inside `<Suspense>`, or the build fails with \"Uncached data was accessed outside of <Suspense>\".\n\nTwo strategies:\n\n1. WRAP IN SUSPENSE (what we do here): the static shell is prerendered, the content streams. See the `<Suspense fallback={...}>` in `page.tsx`. Right choice for personalised or frequently changing data.\n\n2. `'use cache'` ON A HELPER: mark the query as cacheable + `cacheLife('hours')` + optionally `cacheTag('notes')` to invalidate on demand from a Server Action via `updateTag('notes')`. Module 2 · Lesson 2 pattern.\n\nSince notes change often here (the lesson creates/deletes them interactively), Suspense is the right call. For rarely-changing data (app config, price lists) we'd prefer `'use cache'`.",
            snippet: `// page.tsx — Server Component
import { Suspense } from 'react';
import { listNotesWithTags } from '@/app/_db/queries';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <RscNotesList />            {/* ← uncached data, inside Suspense */}
    </Suspense>
  );
}

async function RscNotesList() {
  const notes = await listNotesWithTags();   // hit DB
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// Alternative: cache + tag-based invalidation
import { cacheLife, cacheTag } from 'next/cache';
async function getCachedNotes() {
  'use cache';
  cacheLife('hours');
  cacheTag('notes');
  return listNotesWithTags();
}
// After a mutation: updateTag('notes') invalidates → next read regenerates`,
        },
    },
    decisionTable: {
        heading: '§6 Decision table: where the query lives',
        intro: "Same rule as Lesson 1, now with substance: the caller picks the path. The `queries.ts` module is transport-agnostic.",
        rows: [
            { scenario: 'RSC rendering a page', choice: 'Direct import from @/app/_db/queries · wrap in <Suspense> under Cache Components' },
            { scenario: 'HTML form creating/updating', choice: "Server Action ('use server') + revalidatePath" },
            { scenario: 'Client-side mutation without a form (e.g. drag&drop)', choice: 'Programmatically-invoked Server Action' },
            { scenario: 'Live list with polling / debounced search', choice: 'Route Handler + TanStack Query' },
            { scenario: 'Cacheable read (config, prices)', choice: "'use cache' helper + cacheTag + updateTag on mutation" },
            { scenario: 'Heavy data consumed by an RSC', choice: 'React.cache() inside the query for intra-request dedup' },
            { scenario: 'External webhook mutating data', choice: 'Route Handler POST + Drizzle transaction' },
        ],
    },
    labs: {
        heading: '🧪 Labs',
        rscReader: {
            badge: 'Lab 1 — RSC direct read',
            description: 'This list is rendered by a Server Component that runs `await listNotesWithTags()` directly. No HTTP, no JSON on the wire. It lives inside a `<Suspense>` because Cache Components forbids uncached data outside a boundary.',
            tagsLabel: 'tags',
            emptyLabel: 'No notes in the DB.',
            createdLabel: 'created',
            deleteLabel: 'Delete',
            loadingLabel: 'Reading from DB…',
        },
        serverAction: {
            badge: 'Lab 2 — Server Action + transaction',
            description: 'HTML form that POSTs to a Server Action. The action calls `createNote()` (Drizzle: INSERT note + INSERT tags in a SINGLE transaction) then `revalidatePath` re-fetches the list above without a reload.',
            titlePlaceholder: 'Note title',
            bodyPlaceholder: 'Body (optional)…',
            tagsPlaceholder: 'Comma-separated tags, e.g. orm, postgres',
            createLabel: 'Create (via Server Action)',
            creatingLabel: 'Saving…',
            resetLabel: 'Reset to seed',
        },
        clientQuery: {
            badge: 'Lab 3 — Client + TanStack Query',
            description: 'Same data, but read by TanStack Query against `/api/notes` (Lesson 1 Route Handlers, now backed by the DB). This is how a browser / mobile / external app talks to our server when it cannot import server code.',
            refetchLabel: 'Refetch (via HTTP)',
            fetchingLabel: 'Loading…',
            countLabel: 'notes',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Three observations that show the three callers in action:',
        steps: [
            'Open DevTools → Network. Reload the page: you see NO request to `/api/notes` for Lab 1. The list is rendered server-side by the RSC, no HTTP.',
            "Create a note from Lab 2. Network shows ONE POST to the page itself (a Server Action is a transparent POST, not an exposed endpoint). Right after, the RSC list above updates without reloading — that's `revalidatePath` at work.",
            "Refetch in Lab 3. Network shows a GET to `/api/notes` with status 200. That's the classic Route Handler + client fetch path.",
            "Terminal running `npm run dev`: the first DB request prints table creation + the seed. Subsequent requests are silent — the `dbReady` promise resolves once.",
            "Delete a note: the `note_tags` table cleans itself up thanks to `ON DELETE CASCADE`. No application code deletes tags — Postgres does it.",
            "Reset to seed (Lab 2 button): you see the original 3 records with their tags. IDs start from HIGHER numbers because SERIAL doesn't reset on DELETE (it would with `TRUNCATE ... RESTART IDENTITY`).",
            "⚠️ Hydration caveat: two Lab 1 elements (`DeleteNoteButton`, `EmptyState`) carry `suppressHydrationWarning`. Reason: they live inside a streamed `<Suspense>` and the `<LangProvider>` (sessionStorage-backed) may have already switched language on the client by the time the streamed content hydrates. The proper architectural fix is COOKIE-based persistence (server-readable) — coming in Module 5 · /advanced-routing.",
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 4 · Лекція 2',
    title: 'База даних & ORM',
    intro: "Лекція 1 дала нам REST-endpoint поверх масиву в пам'яті. Тепер замінюємо цей масив СПРАВЖНЬОЮ Postgres-базою (PGlite, WASM in-process) і type-safe ORM (Drizzle). Той самий дано, три call-site: Server Component, що викликає `db.query.notes.findMany()` напряму (нуль HTTP), Server Action із транзакційним INSERT, і Route Handlers з Лекції 1 — тепер перевикористані TanStack Query на клієнті. Таблиці `notes` + `note_tags` із зв'язком 1-N — привід навчити JOIN, транзакцій та `ON DELETE CASCADE`.",
    sections: {
        whyOrm: {
            heading: '§1 Чому ORM (і який)',
            description: "ORM робить три речі: дає end-to-end type-safety (рядок із БД має той самий shape, який оголошено), захищає від SQL-injection (параметри завжди екрануються), і дає композабельний query API. Ціна: нова абстракція + спокуса не вчити SQL.\n\nВ екосистемі Next 16 mainstream-вибір — Drizzle або Prisma. Тут перемагає Drizzle: SQL-like API (вчиш SQL неявно), нуль runtime codegen (HMR-friendly), edge-compatible, схема прямо в TS. Prisma все ще валідний, але важчий, і екосистема зміщується.\n\nДля БД беремо PGlite — Postgres, скомпільований у WebAssembly, in-process. СПРАВЖНІЙ синтаксис Postgres (window functions, JSONB, generated columns) без Docker, без install. Коли перейдемо в production на Neon/Supabase/RDS, query Drizzle не зміняться: тільки driver.",
            snippet: `// Обраний стек:
// • Drizzle ORM   — TS-схема + SQL-like query + type inference
// • PGlite        — Postgres у WASM, in-process Node
// • drizzle-orm/pglite — офіційний адаптер

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

const pglite = new PGlite();          // in-memory; передай path для персистенції
export const db = drizzle(pglite, { schema });

// Та сама query на будь-якому Postgres-driver:
const notes = await db.query.notes.findMany({ with: { tags: true } });`,
        },
        schema: {
            heading: '§2 Схема в TypeScript',
            description: "Drizzle оголошує схему в TypeScript: ні окремого .sql файлу, ні codegen. Модуль `pg-core` дає хелпери (`pgTable`, `serial`, `text`, `timestamp`, ...), що мапляться 1-в-1 на типи Postgres. API `relations()` декларує асоціації і вмикає relational queries `findMany({ with: { tags: true } })`.\n\nДва золоті правила:\n• `serial('id').primaryKey()` для auto-increment PK (добре виглядає в навчальному UI). У production часто беруть `uuid('id').defaultRandom()`, щоб не показувати лічильники.\n• `references(() => parent.id, { onDelete: 'cascade' })` — FK + on-delete поведінка ENFORCED ядром Postgres. Без app-side cleanup.",
            snippet: `// app/_db/schema.ts
import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull().defaultNow(),
});

export const noteTags = pgTable('note_tags', {
  id: serial('id').primaryKey(),
  noteId: integer('note_id').notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
});

export const notesRelations = relations(notes, ({ many }) => ({
  tags: many(noteTags),
}));

// Типи виведені зі схеми — нуль дублювання:
export type Note    = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;`,
        },
        threeCallers: {
            heading: '§3 Одна БД, три call-site',
            description: "Decision table з Лекції 1 називала три шляхи читання/запису server-side даних. Із справжньою БД бачимо всі три на одній сторінці:\n\n1. SERVER COMPONENT — `import { listNotesWithTags } from '@/app/_db/queries'`. Без HTTP, без JSON-серіалізації. У Cache Components режимі uncached-читання має жити всередині `<Suspense>` (список нижче обгорнутий).\n\n2. SERVER ACTION — `'use server'` модуль кличе `createNote()`, потім `revalidatePath('/lessons/database-orm')` для re-render RSC. HTML-форма з `action={createNoteAction}` → POST, який трекає фреймворк, без `fetch()`.\n\n3. ROUTE HANDLER — endpoint `/api/notes` з Лекції 1 тепер кличе той самий `queries.ts`. Вони існують для клієнтів, які НЕ можуть імпортувати server-side код: TanStack Query в браузері, mobile apps, зовнішні webhook.",
            snippet: `// 1️⃣ RSC — прямий імпорт, без HTTP
import { listNotesWithTags } from '@/app/_db/queries';
async function NotesList() {
  const notes = await listNotesWithTags();
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// 2️⃣ Server Action — form action + revalidatePath
'use server';
import { revalidatePath } from 'next/cache';
import { createNote } from '@/app/_db/queries';
export async function createNoteAction(formData: FormData) {
  await createNote({ title: String(formData.get('title')) });
  revalidatePath('/lessons/database-orm');
}

// 3️⃣ Route Handler — та сама функція, але через HTTP
export async function POST(request: NextRequest) {
  const { title } = await request.json();
  const note = await createNote({ title });
  return Response.json({ note }, { status: 201 });
}`,
        },
        transactions: {
            heading: '§4 Транзакції & relations',
            description: "Створення нотатки РАЗОМ із тегами — це два INSERT: один у `notes`, один у `note_tags`. Якщо другий впаде, перший треба rollback-нути — інакше залишимо нотатку-сироту. Розв'язок: ТРАНЗАКЦІЯ.\n\nDrizzle дає `db.transaction(async tx => { ... })`: усередині callback `tx` має той самий API, що й `db`, але всі queries виконуються на одному з'єднанні між `BEGIN` і `COMMIT`. Якщо callback кине помилку, Drizzle сам випустить `ROLLBACK`.\n\nЧитати нотатку разом із тегами: `db.query.notes.findMany({ with: { tags: true } })`. Drizzle згенерує ОДНУ query з LEFT JOIN + aggregation на стороні Postgres — НЕ N+1 цикл. Типи результату виводяться з оголошених `relations()`.",
            snippet: `// Атомарний CREATE у транзакції
export async function createNote(input: { title: string; tags?: string[] }) {
  return db.transaction(async tx => {
    const [row] = await tx.insert(notes).values({
      title: input.title,
    }).returning();

    if (input.tags?.length) {
      await tx.insert(noteTags).values(
        input.tags.map(label => ({ noteId: row.id, label }))
      );
    }
    // Якщо щось впаде → автоматичний ROLLBACK
    return row;
  });
}

// Типізоване relational READ:
const notes = await db.query.notes.findMany({
  with: { tags: true },        // ← один LEFT JOIN
  orderBy: [desc(notes.createdAt)],
});
// Виведений тип:  Array<Note & { tags: NoteTag[] }>`,
        },
        cacheRsc: {
            heading: '§5 DB read у RSC при Cache Components',
            description: "У режимі Cache Components (next.config.ts) Server Component, що викликає `await listNotesWithTags()`, читає uncached дано. Правило: усе, що не prerender-абельне, має жити всередині `<Suspense>`, інакше build впаде з \"Uncached data was accessed outside of <Suspense>\".\n\nДві стратегії:\n\n1. WRAP IN SUSPENSE (тут так): статичний shell prerender-ається, контент стрімиться. Дивись `<Suspense fallback={...}>` у `page.tsx`. Правильно для персоналізованих/часто-змінних даних.\n\n2. `'use cache'` НА ХЕЛПЕРІ: позначаєш query як cacheable + `cacheLife('hours')` + опційно `cacheTag('notes')`, щоб інвалідувати on-demand із Server Action через `updateTag('notes')`. Patтерн Модуля 2 · Лекції 2.\n\nОскільки нотатки тут змінюються часто (лекція їх інтерактивно створює/видаляє), Suspense — правильний вибір. Для рідко-змінних даних (config app, прайси) краще `'use cache'`.",
            snippet: `// page.tsx — Server Component
import { Suspense } from 'react';
import { listNotesWithTags } from '@/app/_db/queries';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <RscNotesList />            {/* ← uncached дано всередині Suspense */}
    </Suspense>
  );
}

async function RscNotesList() {
  const notes = await listNotesWithTags();   // hit DB
  return <ul>{notes.map(n => <li key={n.id}>{n.title}</li>)}</ul>;
}

// Альтернатива: cache + tag-based invalidation
import { cacheLife, cacheTag } from 'next/cache';
async function getCachedNotes() {
  'use cache';
  cacheLife('hours');
  cacheTag('notes');
  return listNotesWithTags();
}
// Після mutation: updateTag('notes') інвалідує → наступне читання регенерує`,
        },
    },
    decisionTable: {
        heading: '§6 Decision table: де живе query',
        intro: "Те саме правило з Лекції 1, але вже з substance: caller обирає шлях. Модуль `queries.ts` агностичний до транспорту.",
        rows: [
            { scenario: 'RSC, що рендерить сторінку', choice: 'Прямий import з @/app/_db/queries · wrap у <Suspense> при Cache Components' },
            { scenario: 'HTML-форма створює/оновлює', choice: "Server Action ('use server') + revalidatePath" },
            { scenario: 'Клієнтська mutation без форми (drag&drop)', choice: 'Програматичний виклик Server Action' },
            { scenario: 'Live-список із polling / debounced search', choice: 'Route Handler + TanStack Query' },
            { scenario: 'Кешоване читання (config, прайси)', choice: "'use cache' helper + cacheTag + updateTag після mutation" },
            { scenario: 'Тяжкі дані для RSC', choice: 'React.cache() усередині query для intra-request dedup' },
            { scenario: 'Зовнішній webhook змінює дано', choice: 'Route Handler POST + Drizzle transaction' },
        ],
    },
    labs: {
        heading: '🧪 Лабораторії',
        rscReader: {
            badge: 'Lab 1 — RSC прямий read',
            description: 'Цей список рендериться Server Component-ом, який викликає `await listNotesWithTags()` напряму. Без HTTP, без JSON на wire. Живе всередині `<Suspense>`, бо Cache Components забороняє uncached дано поза boundary.',
            tagsLabel: 'теги',
            emptyLabel: 'У БД немає нотаток.',
            createdLabel: 'створено',
            deleteLabel: 'Видалити',
            loadingLabel: 'Читання з БД…',
        },
        serverAction: {
            badge: 'Lab 2 — Server Action + транзакція',
            description: 'HTML-форма POST-ить у Server Action. Action кличе `createNote()` (Drizzle: INSERT note + INSERT tags в ОДНІЙ транзакції), потім `revalidatePath` re-fetch-ить список вище без reload.',
            titlePlaceholder: 'Заголовок нотатки',
            bodyPlaceholder: 'Зміст (опційно)…',
            tagsPlaceholder: 'Теги через кому, напр. orm, postgres',
            createLabel: 'Створити (через Server Action)',
            creatingLabel: 'Збереження…',
            resetLabel: 'Reset до seed',
        },
        clientQuery: {
            badge: 'Lab 3 — Client + TanStack Query',
            description: 'Ті самі дані, але читаються TanStack Query через `/api/notes` (Route Handlers з Лекції 1, тепер backed від БД). Саме так браузер/mobile/зовнішній app говорить із нашим сервером, коли не може імпортувати server-side код.',
            refetchLabel: 'Refetch (через HTTP)',
            fetchingLabel: 'Loading…',
            countLabel: 'нотаток',
        },
    },
    debug: {
        heading: '🔬 Debugging Lab',
        description: 'Три спостереження, що показують три call-site у дії:',
        steps: [
            "Відкрий DevTools → Network. Перезавантаж сторінку: НЕ бачиш жодного запиту на `/api/notes` для Lab 1. Список рендериться server-side в RSC, без HTTP.",
            "Створи нотатку з Lab 2. Network показує ОДИН POST на саму сторінку (Server Action — прозорий POST, не виставлений endpoint). Одразу після — RSC-список вище оновлюється без reload — це працює `revalidatePath`.",
            "Refetch у Lab 3. Network показує GET на `/api/notes` зі статусом 200. Це класичний шлях Route Handler + клієнтський fetch.",
            "Термінал `npm run dev`: перший запит до БД друкує створення таблиць + seed. Наступні запити мовчазні — `dbReady` promise resolve-нута один раз.",
            "Видали нотатку: таблиця `note_tags` чиститься автоматично завдяки `ON DELETE CASCADE`. Application-код не видаляє теги — це робить Postgres.",
            "Reset до seed (кнопка Lab 2): бачиш 3 оригінальні записи з тегами. ID починаються з ВИЩИХ чисел, бо SERIAL не скидається на DELETE (тільки на `TRUNCATE ... RESTART IDENTITY`).",
            "⚠️ Hydration caveat: два елементи Lab 1 (`DeleteNoteButton`, `EmptyState`) мають `suppressHydrationWarning`. Причина: вони живуть всередині streamed `<Suspense>`, а `<LangProvider>` (на sessionStorage) міг уже переключити мову на клієнті до того, як streamed контент гідратується. Правильний архітектурний фікс — персистенція через COOKIE (читабельну з сервера) — буде в Модулі 5 · /advanced-routing.",
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
export type { Dictionary };
