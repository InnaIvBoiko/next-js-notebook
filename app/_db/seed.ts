// =============================================================================
// app/_db/seed.ts
// Initial data for Modules 4 · Lessons 2 & 3.
// -----------------------------------------------------------------------------
// Runs ONCE per dev-process startup, only if the `notes` table is empty.
// Triggered by `boot()` in `./client.ts` — never called directly.
// -----------------------------------------------------------------------------
// 🧠 What we seed:
//   • 3 anonymous notes + their tags (Lesson 2 — userId is NULL)
//   • 1 demo user with a bcrypt-hashed password (Lesson 3 — Credentials flow)
//
// The demo credentials are shown in the lesson UI so the student can sign in
// without first creating an account. In a real app you'd NEVER seed a known
// password — this is a teaching mock.
// =============================================================================

import bcrypt from 'bcryptjs';
import type { Db } from './client';
import { noteTags, notes, users } from './schema';

export const DEMO_USER = {
    email: 'demo@notebook.dev',
    password: 'notebook123',
    name: 'Demo User',
} as const;

export async function seed(db: Db): Promise<void> {
    // ---- Demo user for the Credentials provider ---------------------------
    // bcrypt cost=10 is the sane default. Higher cost = slower auth = better
    // resistance to brute-force, but also slower legitimate logins. 10 is
    // the balance most production codebases settle on.
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    await db.insert(users).values({
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        passwordHash,
    });

    // ---- Anonymous notes (Lesson 2 — userId stays NULL) -------------------
    const inserted = await db
        .insert(notes)
        .values([
            {
                title: 'Drizzle ORM relational queries',
                body: 'Use `db.query.notes.findMany({ with: { tags: true } })` for typed nested reads.',
            },
            {
                title: 'PGlite — Postgres in WASM',
                body: 'Real Postgres semantics, zero infrastructure. Swap the driver to move to Neon.',
            },
            {
                title: 'Cache Components & uncached reads',
                body: 'Any non-cached DB read inside an RSC must live behind a <Suspense> boundary.',
            },
        ])
        .returning({ id: notes.id, title: notes.title });

    const byTitle = new Map(inserted.map(n => [n.title, n.id]));

    await db.insert(noteTags).values([
        { noteId: byTitle.get('Drizzle ORM relational queries')!, label: 'orm' },
        { noteId: byTitle.get('Drizzle ORM relational queries')!, label: 'types' },
        { noteId: byTitle.get('PGlite — Postgres in WASM')!, label: 'database' },
        { noteId: byTitle.get('PGlite — Postgres in WASM')!, label: 'wasm' },
        { noteId: byTitle.get('Cache Components & uncached reads')!, label: 'caching' },
        { noteId: byTitle.get('Cache Components & uncached reads')!, label: 'rsc' },
    ]);
}
