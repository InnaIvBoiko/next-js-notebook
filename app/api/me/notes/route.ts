// =============================================================================
// app/api/me/notes/route.ts
// PROTECTED Route Handler — returns ONLY the notes owned by the signed-in user.
// -----------------------------------------------------------------------------
//   GET    /api/me/notes        → list { notes: NoteWithTags[] }, 401 if unauth
//   POST   /api/me/notes        → create owned note, 401 if unauth
//
// 🧠 The Auth.js v5 pattern in a Route Handler
// Call `auth()` (from our root `./auth.ts`) at the top. It returns:
//   • `Session | null` — null when no valid session cookie is present
//   • The session shape includes `user.id`, `user.email`, `user.name`, `user.image`
//
// Returning 401 (Unauthorized) is the canonical answer to a missing/invalid
// session. We deliberately do NOT redirect — Route Handlers serve programmatic
// clients (TanStack Query, mobile apps, curl). The CLIENT decides what to do
// with the 401 (redirect to /lessons/auth-setup, show a toast, ...).
// =============================================================================

import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../_db/client';
import { dbReady } from '../../../_db/client';
import { noteTags, notes } from '../../../_db/schema';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await dbReady;
    const ownedNotes = await db.query.notes.findMany({
        where: eq(notes.userId, session.user.id),
        with: { tags: true },
        orderBy: [desc(notes.createdAt)],
    });
    return Response.json({ notes: ownedNotes });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    // Capture into a local so TS narrows it to `string` inside the
    // transaction closure (where the `session.user.id` narrowing is lost).
    const userId: string = session.user.id;

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return Response.json(
            { error: 'Body must be valid JSON.' },
            { status: 400 },
        );
    }

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

    await dbReady;
    const note = await db.transaction(async tx => {
        const [row] = await tx
            .insert(notes)
            .values({
                title: title.trim(),
                body: typeof body === 'string' ? body : '',
                userId, // ← THE difference vs /api/notes
            })
            .returning();

        const tagLabels = Array.isArray(tags)
            ? (tags as unknown[])
                  .filter(t => typeof t === 'string')
                  .map(t => (t as string).trim())
                  .filter(t => t.length > 0)
            : [];

        if (tagLabels.length > 0) {
            await tx.insert(noteTags).values(
                tagLabels.map(label => ({ noteId: row.id, label })),
            );
        }

        const created = await tx.query.notes.findFirst({
            where: and(eq(notes.id, row.id), eq(notes.userId, userId)),
            with: { tags: true },
        });
        return created!;
    });

    return Response.json(
        { note },
        { status: 201, headers: { Location: `/api/notes/${note.id}` } },
    );
}
