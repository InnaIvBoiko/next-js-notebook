// =============================================================================
// proxy.ts
// Auth.js v5 edge-runtime handler — runs on every matched request.
// -----------------------------------------------------------------------------
// 🧠 Why `proxy.ts` and not `middleware.ts`
// Next 16 renamed the `middleware` file convention to `proxy`. The
// `middleware.ts` name is deprecated and emits a warning at boot. Same
// runtime, same matcher semantics — just the file name changes.
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
//
// 🧠 Why we instantiate NextAuth a SECOND time here
// `./auth.ts` exports the full `auth` helper, but it imports DrizzleAdapter,
// bcrypt and PGlite — Node-only modules that the edge runtime refuses to
// bundle. So proxy must build its own slim auth instance from the edge-safe
// `authConfig`. This is THE canonical Auth.js v5 split pattern.
//
// 🧠 What this proxy actually does today
// `authConfig.callbacks.authorized` currently returns `true` for everything
// — we don't lock any route. The proxy still RUNS though, because it
// populates `req.auth` for downstream code and refreshes session cookies.
//
// The `matcher` excludes Next internals + static files. Without it, every
// _next/*, favicon, etc. would trip the proxy uselessly.
// 📚 Doc: https://authjs.dev/getting-started/session-management/protecting
// =============================================================================

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// `auth: proxy` aliases the Auth.js handler to the export name Next looks
// for. We also re-export as default to satisfy either convention.
export const { auth: proxy } = NextAuth(authConfig);
export default proxy;

export const config = {
    // Match every path EXCEPT:
    //   • /api/auth/*          — the Auth.js handler routes (must stay free
    //                            of proxy re-entrancy)
    //   • /_next/*             — Next's static + dev assets
    //   • Common static files  — favicon, robots, manifest, sitemap, og
    matcher: ['/((?!api/auth|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
