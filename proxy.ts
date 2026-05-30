// =============================================================================
// proxy.ts
// Edge-runtime handler — runs on every matched request BEFORE routing decides
// which page/route handler to invoke.
// -----------------------------------------------------------------------------
// 🧠 Why `proxy.ts` and not `middleware.ts`
// Next 16 renamed the `middleware` file convention to `proxy`. Same runtime,
// same matcher semantics — just the file name changes.
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
//
// 🧠 This is what Module 4 · Lesson 4 (/lessons/middleware-logic) teaches.
// Three concerns layered in the order they must execute:
//
//   1. AUTH (delegated to Auth.js v5)
//      Wraps everything else with the `auth()` helper from auth.config.
//      Today `authConfig.callbacks.authorized` returns true for everything —
//      Auth.js still runs to refresh session cookies and inject `req.auth`.
//
//   2. LOCALE
//      Read `nb-lang` cookie. If missing, sniff `Accept-Language` header for
//      `it`/`en`/`uk` (the languages our dictionary supports), default to `it`
//      otherwise. Write the cookie back. Future requests skip the sniff.
//      This is what lets <LangProvider> read the user's language SERVER-SIDE
//      and avoid the SSR/CSR mismatch that Lez. 2 & 3 worked around with
//      `suppressHydrationWarning`.
//
//   3. PROTECTED ZONE
//      `/lessons/middleware-logic/protected*` requires the `nb-demo-pass`
//      cookie. Without it → 307 redirect back to the lesson page.
//
//   4. OBSERVABILITY
//      Inject `x-pathname` and `x-geo-country` request headers so RSCs can
//      read them via `headers()`. The header injection happens by cloning
//      `request.headers` and passing them to `NextResponse.next`.
//
// 📚 Doc: https://authjs.dev/getting-started/session-management/protecting
// =============================================================================

import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const LANG_COOKIE = 'nb-lang';
const DEMO_PASS_COOKIE = 'nb-demo-pass';
const SUPPORTED_LANGS = ['it', 'en', 'uk'] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

// Parse `Accept-Language: it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,uk-UA;q=0.6`
// → pick the first matching code from SUPPORTED_LANGS. Q-values are honoured
// implicitly: the header is already pre-sorted by quality by the browser.
function sniffLangFromHeader(header: string | null): Lang {
    if (!header) return 'it';
    for (const part of header.split(',')) {
        const code = part.split(/[-;]/)[0]?.trim().toLowerCase();
        if (code && (SUPPORTED_LANGS as readonly string[]).includes(code)) {
            return code as Lang;
        }
    }
    return 'it';
}

// The Auth.js handler. `auth()` returns a callback that gets `(request)` and
// returns a Response. We wrap it: do our own work first, then DELEGATE to
// the response Auth.js would have produced — Auth.js mostly returns
// `NextResponse.next()` with refreshed cookies, so we layer onto that.
const { auth } = NextAuth(authConfig);

export default auth(request => {
    const { pathname } = request.nextUrl;

    // ----------------------------------------------------------------------
    // (3) Protected zone gate — short-circuits with redirect if missing pass
    // ----------------------------------------------------------------------
    if (pathname.startsWith('/lessons/middleware-logic/protected')) {
        const pass = request.cookies.get(DEMO_PASS_COOKIE)?.value;
        if (pass !== '1') {
            const url = request.nextUrl.clone();
            // Send the user back to the lesson page with a flag the page can
            // show as an "access denied" banner.
            url.pathname = '/lessons/middleware-logic';
            url.searchParams.set('denied', '1');
            // 307 = method-preserving redirect (vs 308 which is permanent).
            // For a temporary gate, 307 is the right choice.
            return NextResponse.redirect(url, 307);
        }
    }

    // ----------------------------------------------------------------------
    // (2) Locale sniffing — runs only on first request (no cookie yet)
    // ----------------------------------------------------------------------
    const existingLang = request.cookies.get(LANG_COOKIE)?.value as
        | Lang
        | undefined;
    const lang: Lang =
        existingLang && (SUPPORTED_LANGS as readonly string[]).includes(existingLang)
            ? existingLang
            : sniffLangFromHeader(request.headers.get('accept-language'));

    // ----------------------------------------------------------------------
    // (4) Build the response with injected request headers + cookie writeback
    // ----------------------------------------------------------------------
    // Clone the request headers so we can mutate them. `NextResponse.next({
    // request: { headers } })` is the documented incantation to forward
    // headers to the rendering pipeline (RSCs can read them via `headers()`).
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-lang', lang);

    // `request.geo` / NextRequest doesn't expose `geo` on a typed level under
    // the new edge runtime; we read the standard `x-vercel-ip-country` header
    // (present on Vercel) and fall back to 'XX' for local dev.
    const country =
        request.headers.get('x-vercel-ip-country') ??
        request.headers.get('cf-ipcountry') ??
        'XX';
    requestHeaders.set('x-geo-country', country);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // Persist the language cookie. `httpOnly: false` so the LangBar client
    // can also write it on user switch (otherwise client + server would
    // disagree). `path: '/'` so every route can read it.
    if (existingLang !== lang) {
        response.cookies.set(LANG_COOKIE, lang, {
            path: '/',
            sameSite: 'lax',
            // 1 year — language is sticky once chosen.
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    return response;
});

export const config = {
    // Match every path EXCEPT:
    //   • /api/auth/*          — Auth.js own handler routes (avoid re-entrancy)
    //   • /_next/*             — Next's static + dev assets
    //   • Common static files  — favicon, robots, manifest, sitemap, og
    matcher: ['/((?!api/auth|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
