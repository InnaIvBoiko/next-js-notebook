// =============================================================================
// app/api/notes/[id]/route.ts
// Resource-level endpoint:
//   GET    /api/notes/:id  → read one (with tags)
//   PATCH  /api/notes/:id  → partial update (JSON body: { title?, body? })
//   DELETE /api/notes/:id  → remove one (tags cascade-delete via FK)
// -----------------------------------------------------------------------------
// 🧠 `RouteContext<'/api/notes/[id]'>` — typed params for free
// The global `RouteContext` helper derives the `{ id: string }` shape from
// the route literal. URL segments are always strings — we coerce to integer
// because the underlying Postgres column is SERIAL (4-byte int).
//
// 🧠 PATCH vs PUT
//   PUT     — replaces the resource (client must send the FULL representation)
//   PATCH   — applies a partial mutation (client sends only the changed fields)
// Pick the one whose semantics match your endpoint. Mixing them confuses
// caches, retries, and idempotency contracts.
// =============================================================================

import type { NextRequest } from 'next/server';
import {
    deleteNote,
    getNoteWithTags,
    updateNote,
} from '../../../_db/queries';

// URL segments are strings; the DB column is SERIAL (integer). Returns
// `null` for non-numeric input so the handler can answer 400 cleanly.
function parseId(raw: string): number | null {
    const n = Number.parseInt(raw, 10);
    return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(
    _request: NextRequest,
    ctx: RouteContext<'/api/notes/[id]'>,
) {
    const { id } = await ctx.params;
    const numericId = parseId(id);
    if (numericId === null) {
        return Response.json({ error: 'Invalid id.' }, { status: 400 });
    }
    const note = await getNoteWithTags(numericId);
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
    const numericId = parseId(id);
    if (numericId === null) {
        return Response.json({ error: 'Invalid id.' }, { status: 400 });
    }

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

    const updated = await updateNote(numericId, {
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
    const numericId = parseId(id);
    if (numericId === null) {
        return Response.json({ error: 'Invalid id.' }, { status: 400 });
    }
    const ok = await deleteNote(numericId);
    if (!ok) {
        return Response.json({ error: 'Note not found.' }, { status: 404 });
    }
    // 204 No Content is the canonical REST answer to a successful DELETE.
    // Body MUST be empty — `Response.json()` would send `null`, so we don't.
    return new Response(null, { status: 204 });
}
