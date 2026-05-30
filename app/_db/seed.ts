// =============================================================================
// app/_db/seed.ts
// Initial data for Module 4 · Lesson 2.
// -----------------------------------------------------------------------------
// Runs ONCE per dev-process startup, only if the `notes` table is empty.
// Triggered by `boot()` in `./client.ts` — never called directly.
// =============================================================================

import type { Db } from './client';
import { noteTags, notes } from './schema';

export async function seed(db: Db): Promise<void> {
    // Drizzle's `.returning()` lets the INSERT echo back the generated
    // SERIAL ids, so we can wire the tags to the right parent row without
    // an extra SELECT roundtrip.
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
