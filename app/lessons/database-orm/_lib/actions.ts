'use server';
// =============================================================================
// app/lessons/database-orm/_lib/actions.ts
// Server Actions for Module 4 · Lesson 2 (/database-orm).
// -----------------------------------------------------------------------------
// 🧠 What this teaches
// One file, three actions, all writing to the SAME PGlite database via the
// SAME `queries.ts` module the RSC and the Route Handlers use. The lesson's
// north star is the "decision table" from Lesson 1: caller → tool.
//
// Each action ends with `revalidatePath('/lessons/database-orm')` so the
// RSC-rendered server-side list at the top of the page re-fetches and the
// new state is visible to the user without a full reload.
// =============================================================================

import { revalidatePath } from 'next/cache';
import {
    createNote,
    deleteNote,
    resetNotes,
} from '../../../_db/queries';

const PAGE = '/lessons/database-orm';

// Form-driven create. Reads <input name="..."> directly off the FormData and
// splits the comma-separated tag field into the array Drizzle expects.
export async function createNoteAction(formData: FormData): Promise<void> {
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '');
    const rawTags = String(formData.get('tags') ?? '');

    if (title.length === 0) {
        // ⚠️ In a production app you'd return a validation result that the
        // form can render; we skip silently here because Module 5 has the
        // dedicated form-validation lesson.
        return;
    }

    const tags = rawTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    await createNote({ title, body, tags });
    revalidatePath(PAGE);
}

// Programmatic invocation from a Client island. Returns nothing; the caller
// re-renders via revalidatePath above. We accept `id: number` because
// /lessons/database-orm uses integer PKs (SERIAL) from Postgres.
export async function deleteNoteAction(id: number): Promise<void> {
    await deleteNote(id);
    revalidatePath(PAGE);
}

// Reset for the demo's "Start over" button — re-runs the seed so the user
// can experiment without restarting the dev server.
export async function resetNotesAction(): Promise<void> {
    await resetNotes();
    revalidatePath(PAGE);
}
