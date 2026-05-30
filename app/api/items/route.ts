// =============================================================================
// app/api/items/route.ts
// GET /api/items?q=<query>&delay=<ms>
// -----------------------------------------------------------------------------
// 🧠 Route Handler basics (Module 4 preview)
// A `route.ts` file exports HTTP method functions (`GET`, `POST`, `PUT`...).
// They receive a standard Web `Request` and return a standard `Response`.
// -----------------------------------------------------------------------------
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
// =============================================================================

import { getItems } from '../_db/mock-items';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? undefined;
    const delayParam = searchParams.get('delay');
    const delay = delayParam ? Math.max(0, Number(delayParam)) : undefined;

    const items = await getItems(q, delay);
    return Response.json({ items });
}
