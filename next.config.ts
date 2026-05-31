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

    // 🧠 IMAGE REMOTE PATTERNS — used by Module 5 · Lesson 1 (/optimization-media).
    // `next/image` ships a SERVER endpoint (`/_next/image?url=...&w=...&q=...`)
    // that proxies + optimizes any allowed source. To prevent it from being
    // turned into an open image proxy (DoS, hot-link laundering, SSRF), Next
    // requires every remote host to be ALLOW-LISTED here. A missing host →
    // build/runtime error "url not allowed", NOT a silent fallback.
    //
    // For the lesson we whitelist picsum.photos (Lorem Picsum) to demo the
    // "remote source" pattern. Cloudinary / S3 / a CMS would look identical.
    // Be as specific as you can in real projects — narrow `hostname`,
    // `pathname`, optionally `port` + `search`.
    // 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/12-images.md
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/images.md
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'fastly.picsum.photos',
                pathname: '/**',
            },
        ],
    },

    // 🧠 STATIC SECURITY HEADERS — used by Module 5 · Lesson 3 (/security-env).
    // These apply to EVERY response (including /api/* and static assets),
    // even when the proxy doesn't run (its matcher excludes /api/auth and
    // /_next). The dynamic Content-Security-Policy with per-request nonce
    // is set inside `proxy.ts` because it needs a fresh random value per
    // request — `next.config.ts` only supports static values.
    //
    // Layered defence: prod uses both the static CSP-adjacent headers below
    // AND the proxy's nonce-CSP. If the proxy ever fails, these still hold.
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        // Force HTTPS for one year, including subdomains. Set
                        // ONLY when the site is fully HTTPS-served (HSTS is
                        // sticky — a wrong rollout takes a year to expire).
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        // Stop the browser from MIME-sniffing — keep declared
                        // Content-Type honest. Defeats some XSS techniques.
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        // Legacy clickjacking protection. CSP `frame-ancestors
                        // 'none'` (set by proxy) is the modern equivalent; we
                        // keep this for browsers that don't yet honour CSP3.
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        // Send referrer ONLY on same-origin, just the origin
                        // on cross-origin downgrades. Privacy-friendly default.
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        // Lock down powerful browser APIs nobody on this site
                        // legitimately uses. Add features here only when you
                        // need them.
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), payment=()',
                    },
                    {
                        // Block DNS prefetching to third-party domains the
                        // server didn't whitelist. Tiny perf cost, small
                        // privacy gain.
                        key: 'X-DNS-Prefetch-Control',
                        value: 'off',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
