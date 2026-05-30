// =============================================================================
// app/_db/client.ts
// PGlite + Drizzle ORM client for Module 4 · Lesson 2.
// -----------------------------------------------------------------------------
// 🧠 PGlite — Postgres compiled to WebAssembly
// Real Postgres SQL semantics (window functions, JSONB, generated columns,
// triggers) running entirely in the Node process. No Docker, no install,
// no network roundtrip. The same Drizzle queries we write here would work
// unchanged against Neon, Supabase, RDS — just by swapping the driver.
//
// 🧠 In-memory vs persistent
// We pass `'memory://'` to keep everything in RAM. Restart the dev server
// → fresh DB → seed re-runs. For persistent storage you'd pass a path
// (e.g. `new PGlite('./.pglite')`) and the data would survive restarts.
// In-memory is the right call for a teaching notebook: predictable seed,
// no .gitignore worries, no stale state across lessons.
//
// 🧠 Module-scoped singleton + push + seed
// This module is imported by every caller that needs the DB:
//   • Server Components (direct import in RSCs)
//   • Server Actions   (inside `'use server'` modules)
//   • Route Handlers   (inside route.ts files)
// All three run in the SAME Node process, so a single PGlite instance is
// shared across requests. We push the schema and seed ONCE per process via
// the `bootPromise` pattern: every caller awaits the same promise.
//
// ⚠️ Multi-process deployments (Vercel / serverless): each worker boots its
// own PGlite. For a real prod app, replace PGlite with a hosted Postgres
// and a connection pool. Same Drizzle code, different driver.
//
// 📚 Doc: https://orm.drizzle.team/docs/get-started-postgresql#pglite
// =============================================================================

import 'server-only';

import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';

// Define globalThis cache for HMR in dev: without this, every fast-refresh
// would create a brand-new PGlite instance and lose all data. The
// `globalThis` trick is the canonical Next.js pattern for "module singleton
// that survives HMR".
const globalForDb = globalThis as unknown as {
    pglite: PGlite | undefined;
    bootPromise: Promise<void> | undefined;
};

const pglite = globalForDb.pglite ?? new PGlite();
if (!globalForDb.pglite) globalForDb.pglite = pglite;

export const db = drizzle(pglite, { schema });
export type Db = typeof db;

// Schema push: create the tables if they don't exist. In production you'd
// use `drizzle-kit migrate` against a generated migrations folder; for a
// teaching notebook with an in-memory DB, raw DDL is simpler and lives
// next to the schema it mirrors.
//
// 🧠 Layout below:
//   • Auth.js v5 Drizzle-adapter tables: user / account / session / verificationToken
//     Column names are quoted because Auth.js expects camelCase column names.
//   • Domain tables: notes (+ user_id FK, Lesson 3) / note_tags.
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS "user" (
    id              TEXT        PRIMARY KEY,
    name            TEXT,
    email           TEXT        UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image           TEXT,
    password_hash   TEXT
  );

  CREATE TABLE IF NOT EXISTS account (
    "userId"            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type                TEXT NOT NULL,
    provider            TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token       TEXT,
    access_token        TEXT,
    expires_at          INTEGER,
    token_type          TEXT,
    scope               TEXT,
    id_token            TEXT,
    session_state       TEXT,
    PRIMARY KEY (provider, "providerAccountId")
  );

  CREATE TABLE IF NOT EXISTS session (
    "sessionToken" TEXT        PRIMARY KEY,
    "userId"       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires        TIMESTAMPTZ NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "verificationToken" (
    identifier TEXT        NOT NULL,
    token      TEXT        NOT NULL,
    expires    TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  CREATE TABLE IF NOT EXISTS notes (
    id          SERIAL      PRIMARY KEY,
    title       TEXT        NOT NULL,
    body        TEXT        NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id     TEXT REFERENCES "user"(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS note_tags (
    id       SERIAL  PRIMARY KEY,
    note_id  INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    label    TEXT    NOT NULL
  );
  CREATE INDEX IF NOT EXISTS note_tags_note_id_idx ON note_tags(note_id);
  CREATE INDEX IF NOT EXISTS notes_user_id_idx     ON notes(user_id);
`;

async function boot(): Promise<void> {
    await pglite.exec(SCHEMA_SQL);
    // Seed only if the table is empty. Restarting the dev server clears the
    // in-memory DB, so the seed will re-run; deleting a note in the UI
    // does NOT cause a re-seed.
    const count = await pglite.query<{ count: number }>(
        'SELECT COUNT(*)::int AS count FROM notes',
    );
    if (count.rows[0]?.count === 0) {
        const { seed } = await import('./seed');
        await seed(db);
    }
}

// Exported boot promise — every public query in `./queries.ts` awaits this
// before issuing its SQL, so callers never need to think about init order.
export const dbReady: Promise<void> =
    globalForDb.bootPromise ?? (globalForDb.bootPromise = boot());
