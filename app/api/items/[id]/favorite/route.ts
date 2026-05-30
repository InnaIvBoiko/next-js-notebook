// =============================================================================
// app/api/items/[id]/favorite/route.ts
// POST /api/items/:id/favorite — toggles the favorite flag.
// Randomly fails ~25% of the time so the lesson can demonstrate the
// optimistic-update rollback pattern.
// =============================================================================

import { toggleFavorite } from '../../../_db/mock-items';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        const item = await toggleFavorite(id);
        return Response.json({ item });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        return Response.json({ error: message }, { status: 500 });
    }
}
