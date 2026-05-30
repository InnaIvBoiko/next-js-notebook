// =============================================================================
// app/api/notes/route.ts
// Collection-level endpoint:
//   GET  /api/notes        → list all notes (with tags)
//   POST /api/notes        → create one (JSON body: { title, body?, tags? })
// -----------------------------------------------------------------------------
// 🧠 Status codes that matter (and why)
//   • 200 OK      — successful read
//   • 201 Created — successful create; should include the new resource in body
//   • 400 Bad Request — malformed JSON or missing fields. Client's fault.
//   • 405 Method Not Allowed — Next handles this automatically for verbs we
//                              don't export (e.g. someone sends DELETE here).
//
// 🧠 We DO NOT export DELETE here on purpose: the catch-all 405 from Next is
// part of Lesson 1's Debugging Lab — open DevTools, send a DELETE, watch the
// 405 + Allow header.
//
// 🧠 Module 4 · Lesson 2 — backed by a real database
// The in-memory `_store.ts` of Lesson 1 has been replaced with PGlite +
// Drizzle queries. The route contracts are identical (clients don't notice)
// EXCEPT: IDs are now integers, and each note carries a `tags: { id, label }[]`
// array surfaced by Drizzle's relational query API.
// =============================================================================

import type { NextRequest } from 'next/server';
import {
    createNote,
    listNotesWithTags,
    resetNotes,
} from '../../_db/queries';

export async function GET() {
    const notes = await listNotesWithTags();
    return Response.json({ notes });
}

export async function POST(request: NextRequest) {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return Response.json(
            { error: 'Body must be valid JSON.' },
            { status: 400 },
        );
    }

    // Inline shape-checking. Lesson 1 promised Lesson 2 would switch to Zod —
    // we keep manual validation here on purpose to stay focused on the DB
    // layer; Zod arrives in Module 5 alongside form validation.
    if (
        !payload ||
        typeof payload !== 'object' ||
        typeof (payload as { title?: unknown }).title !== 'string'
    ) {
        return Response.json(
            { error: 'Expected { title: string, body?: string, tags?: string[] }.' },
            { status: 400 },
        );
    }

    const { title, body, tags } = payload as {
        title: string;
        body?: unknown;
        tags?: unknown;
    };
    if (title.trim().length === 0) {
        return Response.json({ error: 'Title cannot be empty.' }, { status: 400 });
    }
    if (body !== undefined && typeof body !== 'string') {
        return Response.json(
            { error: '`body` must be a string when provided.' },
            { status: 400 },
        );
    }
    if (
        tags !== undefined &&
        (!Array.isArray(tags) || tags.some(t => typeof t !== 'string'))
    ) {
        return Response.json(
            { error: '`tags` must be a string[] when provided.' },
            { status: 400 },
        );
    }

    const note = await createNote({
        title: title.trim(),
        body: typeof body === 'string' ? body : '',
        tags: Array.isArray(tags) ? (tags as string[]) : undefined,
    });

    // 201 + `Location` header is the textbook REST answer to a successful POST.
    return Response.json(
        { note },
        { status: 201, headers: { Location: `/api/notes/${note.id}` } },
    );
}

// Convenience for the lab — wipes the DB back to the seed list so the
// student can reset the demo without restarting `next dev`.
//   PUT /api/notes  → reset
export async function PUT() {
    await resetNotes();
    const notes = await listNotesWithTags();
    return Response.json({ notes }, { status: 200 });
}
