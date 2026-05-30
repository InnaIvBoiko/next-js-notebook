// =============================================================================
// app/api/notes/[id]/route.ts
// Resource-level endpoint:
//   GET    /api/notes/:id  → read one
//   PATCH  /api/notes/:id  → partial update (JSON body: { title?, body? })
//   DELETE /api/notes/:id  → remove one
// -----------------------------------------------------------------------------
// 🧠 `RouteContext<'/api/notes/[id]'>` — typed params for free
// The global `RouteContext` helper derives the `{ id: string }` shape from
// the route literal. No hand-rolled type, no `as { id: string }`.
//
// 🧠 PATCH vs PUT
//   PUT     — replaces the resource (client must send the FULL representation)
//   PATCH   — applies a partial mutation (client sends only the changed fields)
// Pick the one whose semantics match your endpoint. Mixing them confuses
// caches, retries, and idempotency contracts.
// =============================================================================

import type { NextRequest } from 'next/server';
import { deleteNote, getNote, updateNote } from '../_store';

export async function GET(
    _request: NextRequest,
    ctx: RouteContext<'/api/notes/[id]'>,
) {
    const { id } = await ctx.params;
    const note = getNote(id);
    if (!note) {
        return Response.json({ error: 'Note not found.' }, { status: 404 });
    }
    return Response.json({ note });
}

export async function PATCH(
    request: NextRequest,
    ctx: RouteContext<'/api/notes/[id]'>,
) {
    const { id } = await ctx.params;

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return Response.json(
            { error: 'Body must be valid JSON.' },
            { status: 400 },
        );
    }

    if (!payload || typeof payload !== 'object') {
        return Response.json(
            { error: 'Expected an object body.' },
            { status: 400 },
        );
    }

    const { title, body } = payload as { title?: unknown; body?: unknown };
    if (title !== undefined && typeof title !== 'string') {
        return Response.json(
            { error: '`title` must be a string when provided.' },
            { status: 400 },
        );
    }
    if (body !== undefined && typeof body !== 'string') {
        return Response.json(
            { error: '`body` must be a string when provided.' },
            { status: 400 },
        );
    }

    const updated = updateNote(id, {
        title: typeof title === 'string' ? title : undefined,
        body: typeof body === 'string' ? body : undefined,
    });
    if (!updated) {
        return Response.json({ error: 'Note not found.' }, { status: 404 });
    }
    return Response.json({ note: updated });
}

export async function DELETE(
    _request: NextRequest,
    ctx: RouteContext<'/api/notes/[id]'>,
) {
    const { id } = await ctx.params;
    const ok = deleteNote(id);
    if (!ok) {
        return Response.json({ error: 'Note not found.' }, { status: 404 });
    }
    // 204 No Content is the canonical REST answer to a successful DELETE.
    // Body MUST be empty — `Response.json()` would send `null`, so we don't.
    return new Response(null, { status: 204 });
}
