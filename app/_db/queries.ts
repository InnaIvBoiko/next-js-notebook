// =============================================================================
// app/_db/queries.ts
// Reusable typed queries for the `notes` + `note_tags` schema.
// -----------------------------------------------------------------------------
// 🧠 ONE module, THREE call-sites
// Same functions are imported by:
//   • Server Components (RSC direct-read in /lessons/database-orm)
//   • Server Actions    (POST /lessons/database-orm via form action)
//   • Route Handlers    (GET/POST/PATCH/DELETE /api/notes)
//
// This is the canonical App Router pattern: keep the data layer
// transport-agnostic. The CALLER decides if there's an HTTP roundtrip;
// the data layer just returns rows.
//
// Every query awaits `dbReady` first so callers don't need to worry about
// init order — schema push + seed run at most once per dev process.
// =============================================================================

import 'server-only';

import { desc, eq } from 'drizzle-orm';
import { db, dbReady } from './client';
import { noteTags, notes, type NoteWithTags } from './schema';

// -----------------------------------------------------------------------------
// READS
// -----------------------------------------------------------------------------

/**
 * Returns every note ordered newest-first, each with its tag array attached.
 *
 * 🧠 Drizzle's relational `db.query.notes.findMany({ with: { tags: true } })`
 * issues a SINGLE query under the hood (a left join + array_agg) — it's not
 * an N+1 loop. Type inference flows from the `relations()` config.
 */
export async function listNotesWithTags(): Promise<NoteWithTags[]> {
    await dbReady;
    return db.query.notes.findMany({
        with: { tags: true },
        orderBy: [desc(notes.createdAt)],
    });
}

/** Returns one note with its tags, or `undefined` if the id is unknown. */
export async function getNoteWithTags(
    id: number,
): Promise<NoteWithTags | undefined> {
    await dbReady;
    return db.query.notes.findFirst({
        where: eq(notes.id, id),
        with: { tags: true },
    });
}

// -----------------------------------------------------------------------------
// MUTATIONS
// -----------------------------------------------------------------------------

export type CreateNoteInput = {
    title: string;
    body?: string;
    tags?: string[];
};

/**
 * Creates a note + its tags in a SINGLE atomic transaction. If tag insertion
 * fails (e.g. invalid label), the note insert is rolled back as well.
 *
 * 🧠 `db.transaction(async tx => { ... })` is the Drizzle wrapper around
 * `BEGIN`/`COMMIT`/`ROLLBACK`. The `tx` handle is identical to `db` in API,
 * so the SAME queries work inside and outside transactions.
 */
export async function createNote(
    input: CreateNoteInput,
): Promise<NoteWithTags> {
    await dbReady;
    return db.transaction(async tx => {
        const [row] = await tx
            .insert(notes)
            .values({
                title: input.title,
                body: input.body ?? '',
            })
            .returning();

        const tagLabels = (input.tags ?? [])
            .map(t => t.trim())
            .filter(t => t.length > 0);

        if (tagLabels.length > 0) {
            await tx.insert(noteTags).values(
                tagLabels.map(label => ({
                    noteId: row.id,
                    label,
                })),
            );
        }

        // Re-read with relations to return the full shape consistently.
        const created = await tx.query.notes.findFirst({
            where: eq(notes.id, row.id),
            with: { tags: true },
        });
        // `created` is guaranteed defined here — we JUST inserted it inside
        // the same tx. The non-null assertion is the cleanest way to express
        // that invariant to TypeScript.
        return created!;
    });
}

export type UpdateNoteInput = {
    title?: string;
    body?: string;
};

/** Partial update; returns the updated row or `undefined` if id is unknown. */
export async function updateNote(
    id: number,
    patch: UpdateNoteInput,
): Promise<NoteWithTags | undefined> {
    await dbReady;
    if (patch.title === undefined && patch.body === undefined) {
        return getNoteWithTags(id);
    }
    await db
        .update(notes)
        .set({
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.body !== undefined ? { body: patch.body } : {}),
        })
        .where(eq(notes.id, id));
    return getNoteWithTags(id);
}

/** Deletes a note. Tags cascade-delete via the FK constraint. */
export async function deleteNote(id: number): Promise<boolean> {
    await dbReady;
    const result = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning({ id: notes.id });
    return result.length > 0;
}

/** Wipes both tables and re-seeds. Used by the lesson's reset button. */
export async function resetNotes(): Promise<void> {
    await dbReady;
    // ORDER MATTERS: delete children first, parents second — even though
    // `ON DELETE CASCADE` would handle it, an explicit two-step delete is
    // easier to reason about and works regardless of FK config.
    await db.delete(noteTags);
    await db.delete(notes);
    const { seed } = await import('./seed');
    await seed(db);
}
