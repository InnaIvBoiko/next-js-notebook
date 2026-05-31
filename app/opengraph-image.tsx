// =============================================================================
// app/opengraph-image.tsx
// SITE DEFAULT Open Graph image. Renders to a 1200×630 PNG at /opengraph-image.
// -----------------------------------------------------------------------------
// 🧠 WHAT THIS FILE BECOMES
// At build time, Next compiles this into a special Route Handler at the URL
// `/opengraph-image` that returns `Content-Type: image/png`. Then it injects
// the corresponding `<meta property="og:image">` tag into every page's HTML
// that does NOT define its own. Same for `<meta property="og:image:width">`
// and `:height` (taken from `size` below) and `:type` (from `contentType`).
//
// 🧠 PER-ROUTE OVERRIDE
// Any nested segment can drop its own `opengraph-image.tsx` and that one
// wins for that segment subtree. We do exactly that in
// `app/lessons/seo-metadata/opengraph-image.tsx`.
//
// 🧠 EDGE RUNTIME
// `ImageResponse` from `next/og` runs the rendering on a V8 isolate. No
// Node `fs`, no native modules, no Buffer. The few server APIs that work:
// `fetch`, `process.cwd()` (to load font/image bytes the BUILD ships).
//
// 🧠 STATIC BY DEFAULT
// Because we don't read any Request-time data (no cookies/headers/fetch
// without cache), Next renders this PNG ONCE at build time and caches it.
// Adding `await connection()` would force per-request rendering.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md
// =============================================================================

import { ImageResponse } from 'next/og';

// REQUIRED file convention exports. `alt` becomes `<meta property="og:image:alt">`.
export const alt = 'Living Notebook · Learn Next.js by building it';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    // `ImageResponse`'s JSX is NOT React — it's a subset rendered by Satori.
    // Two constraints to remember:
    //   • Every container must have `display: 'flex'` (Satori has no
    //     block/inline layout, only flex).
    //   • Tailwind classes don't work here. Use inline `style` only.
    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 64,
                    background:
                        'linear-gradient(135deg, #020617 0%, #0c4a6e 60%, #1e1b4b 100%)',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'rgba(56, 189, 248, 0.2)',
                            border: '2px solid rgba(56, 189, 248, 0.6)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28,
                        }}
                    >
                        📓
                    </div>
                    <span
                        style={{
                            fontSize: 28,
                            fontWeight: 600,
                            letterSpacing: -0.5,
                            color: 'rgba(186, 230, 253, 0.95)',
                        }}
                    >
                        Living Notebook
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignSelf: 'flex-start',
                            padding: '6px 14px',
                            borderRadius: 9999,
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            background: 'rgba(56, 189, 248, 0.08)',
                            color: 'rgba(186, 230, 253, 0.95)',
                            fontSize: 20,
                            fontWeight: 500,
                        }}
                    >
                        Next.js 16 · React 19 · Tailwind v4
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 88,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: -2,
                        }}
                    >
                        Learn Next.js
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 64,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: -2,
                            color: 'rgba(125, 211, 252, 0.95)',
                        }}
                    >
                        by building it.
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        fontSize: 22,
                        color: 'rgba(148, 163, 184, 0.9)',
                    }}
                >
                    <span style={{ display: 'flex' }}>
                        16 lessons · 5 modules · runs on your Mac
                    </span>
                    <span style={{ display: 'flex' }}>living-notebook.local</span>
                </div>
            </div>
        ),
        size,
    );
}
