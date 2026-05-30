// =============================================================================
// app/api/notes/route.ts
// Collection-level endpoint:
//   GET  /api/notes        → list all notes
//   POST /api/notes        → create one (JSON body: { title, body })
// -----------------------------------------------------------------------------
// 🧠 Status codes that matter (and why)
//   • 200 OK      — successful read
//   • 201 Created — successful create; should include the new resource in body
//   • 400 Bad Request — malformed JSON or missing fields. Client's fault.
//   • 405 Method Not Allowed — Next handles this automatically for verbs we
//                              don't export (e.g. someone sends DELETE here).
//
// 🧠 We DO NOT export DELETE here on purpose: the catch-all 405 from Next is
// part of the Debugging Lab — open DevTools, send a DELETE, watch the 405.
//
// 🧠 Why we don't `revalidatePath('/api/notes')`
// In Cache Components mode, GET handlers run at request time by default — so
// there's nothing to invalidate. The Notes lab is purely live: every list
// refetch hits the handler fresh. If we wanted these reads cached, we'd wrap
// `listNotes()` in a `'use cache'` helper and call `updateTag()` after
// mutations (Module 2 · Lesson 2 pattern).
// =============================================================================

import type { NextRequest } from 'next/server';
import { createNote, listNotes, resetNotes } from './_store';

export async function GET() {
    return Response.json({ notes: listNotes() });
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

    // Inline shape-checking. In Module 4 · Lesson 2 we'll replace this with
    // a Zod schema — it's the same idea, just declarative.
    if (
        !payload ||
        typeof payload !== 'object' ||
        typeof (payload as { title?: unknown }).title !== 'string' ||
        typeof (payload as { body?: unknown }).body !== 'string'
    ) {
        return Response.json(
            { error: 'Expected { title: string, body: string }.' },
            { status: 400 },
        );
    }

    const { title, body } = payload as { title: string; body: string };
    if (title.trim().length === 0) {
        return Response.json({ error: 'Title cannot be empty.' }, { status: 400 });
    }

    const note = createNote({ title: title.trim(), body });
    // 201 + `Location` header is the textbook REST answer to a successful POST.
    return Response.json(
        { note },
        { status: 201, headers: { Location: `/api/notes/${note.id}` } },
    );
}

// Convenience for the lab — wipes the store back to the seed list so the
// student can reset the demo without restarting `next dev`.
//   PUT /api/notes  → reset
export async function PUT() {
    return Response.json({ notes: resetNotes() }, { status: 200 });
}
