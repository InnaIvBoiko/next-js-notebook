'use server';
// =============================================================================
// app/lessons/middleware-logic/_lib/actions.ts
// Server Actions backing the cookie buttons in Module 4 · Lesson 4.
// -----------------------------------------------------------------------------
// The proxy reads:
//   • `nb-lang`       → set by proxy on first visit (from Accept-Language)
//                       OR by the LangBar on user switch. Read here so the
//                       lesson can show the current value.
//   • `nb-demo-pass`  → required to enter `/lessons/middleware-logic/protected*`.
//                       This file lets the user set/clear it on demand.
// =============================================================================

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const PAGE = '/lessons/middleware-logic';

// Grant access to the /protected subroute by writing the cookie. The proxy
// (proxy.ts) checks for value === '1' on every matching request.
export async function grantDemoPassAction(): Promise<void> {
    const store = await cookies();
    store.set('nb-demo-pass', '1', {
        path: '/',
        sameSite: 'lax',
        httpOnly: false, // visible in DevTools → Application → Cookies
        maxAge: 60 * 30, // 30 minutes — short on purpose to show it expires
    });
    revalidatePath(PAGE);
}

// Revoke access — proxy will redirect back to the lesson on next navigation
// into /protected*.
export async function revokeDemoPassAction(): Promise<void> {
    const store = await cookies();
    store.delete('nb-demo-pass');
    revalidatePath(PAGE);
}

// Forces the proxy to re-sniff Accept-Language on the next request by
// deleting the language cookie. Useful in the lab to see the sniff happen
// in DevTools → Network.
export async function clearLangCookieAction(): Promise<void> {
    const store = await cookies();
    store.delete('nb-lang');
    revalidatePath(PAGE);
}
