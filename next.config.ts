import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Hosts the dev server (HMR + /_next/* assets) accepts cross-origin
    // requests from. `localhost` and `127.0.0.1` are allowed by default; here
    // we add the Mac's LAN IP so the app can be opened from a phone or another
    // device on the same WiFi network.
    //
    // ⚠️  Dev only. This option is ignored in production.
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md
    allowedDevOrigins: ['192.168.0.88'],

    // 🧠 CACHE COMPONENTS — enables the `'use cache'` directive used by
    // Module 2 · Lesson 2 (/lessons/caching). Without this flag, `'use cache'`
    // throws at build time. Side effects:
    //   • Uncached or runtime data access in a LAYOUT must be wrapped in
    //     <Suspense> or moved into a page. Verified safe: no layout in this
    //     repo reads cookies/headers/uncached fetch.
    //   • Pages that read cookies()/headers() (e.g. /server-fetching/dynamic)
    //     continue to work — they just stay dynamic and uncached.
    // 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
    cacheComponents: true,

    // 🧠 SERVER-EXTERNAL PACKAGES — used by Module 4 · Lesson 2 (/database-orm).
    // `@electric-sql/pglite` ships a WASM Postgres engine + native deps that
    // must run under Node's `require`, not Next's bundler. Without this flag
    // the build tries to bundle the WASM and fails. Drizzle ORM is fine to
    // bundle, only the underlying PGlite driver needs to be external.
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md
    serverExternalPackages: ['@electric-sql/pglite'],
};

export default nextConfig;
