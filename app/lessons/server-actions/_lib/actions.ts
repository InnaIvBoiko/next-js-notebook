'use server';
// =============================================================================
// app/lessons/server-actions/_lib/actions.ts
// File-level `'use server'`: every export is a Server Action — an async
// function callable from Client Components and forms via a POST round-trip.
// -----------------------------------------------------------------------------
// ⚠️  SECURITY WARNING (production reminder, not enforced here)
// Server Actions are PUBLIC POST endpoints. Anyone can craft a POST with
// arbitrary FormData. In real apps you MUST authenticate and authorize
// inside every action body before mutating anything. Module 4 (auth-setup)
// covers the pattern.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md
// =============================================================================

import { cookies } from 'next/headers';
import { refresh, revalidatePath, updateTag } from 'next/cache';
import * as store from './store';

// -----------------------------------------------------------------------------
// /form actions — direct revalidatePath, no caching involved.
// -----------------------------------------------------------------------------

export async function addItemAction(formData: FormData): Promise<void> {
    const name = String(formData.get('name') ?? '');
    store.addItem(name);
    // /form uses getItemsUncached(), but revalidatePath also forces the
    // segment to re-render so the new HTML reaches the browser.
    revalidatePath('/lessons/server-actions/form');
}

export async function removeItemAction(formData: FormData): Promise<void> {
    const name = String(formData.get('name') ?? '');
    store.removeItem(name);
    revalidatePath('/lessons/server-actions/form');
}

// -----------------------------------------------------------------------------
// /revalidate actions — the cache-invalidation lesson.
// -----------------------------------------------------------------------------

// Adds without touching the 'items' cache tag. The CACHED list will stay
// stale. The UNCACHED list will see the new value.
//
// 🧠 CRITICAL CHOICE: refresh() vs revalidatePath()
//   • revalidatePath('/route') ALSO invalidates `'use cache'` entries
//     that contributed to rendering that route. That would defeat the
//     demo — both cards would update.
//   • refresh() re-renders the client router for the current path WITHOUT
//     invalidating tagged data. The cached function keeps returning the
//     cached value; only the uncached function reflects the mutation.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/refresh.md
export async function addItemNoInvalidateAction(
    formData: FormData,
): Promise<void> {
    const name = String(formData.get('name') ?? '');
    store.addItem(name);
    refresh();
}

// The manual invalidation button. updateTag immediately expires entries
// tagged 'items', so the next call to getItemsCached() re-executes.
export async function invalidateItemsTagAction(): Promise<void> {
    updateTag('items');
    revalidatePath('/lessons/server-actions/revalidate');
}

// -----------------------------------------------------------------------------
// /programmatic action — mutable cookies() store + return value.
// -----------------------------------------------------------------------------

const COUNTER_COOKIE = 'nb-counter';

// Called from an onClick handler in a Client Component. Returns the new
// value so the caller can update its useState. Demonstrates the modern
// Next 16 mutable cookies() API — only available inside a Server Action.
export async function bumpCounterAction(): Promise<number> {
    const cookieStore = await cookies();
    const current = Number.parseInt(
        cookieStore.get(COUNTER_COOKIE)?.value ?? '0',
        10,
    );
    const next = Number.isFinite(current) ? current + 1 : 1;
    cookieStore.set(COUNTER_COOKIE, String(next), {
        path: '/',
        sameSite: 'lax',
    });
    return next;
}

export async function resetCounterAction(): Promise<number> {
    const cookieStore = await cookies();
    cookieStore.delete(COUNTER_COOKIE);
    return 0;
}
