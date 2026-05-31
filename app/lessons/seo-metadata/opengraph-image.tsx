// =============================================================================
// app/lessons/seo-metadata/opengraph-image.tsx
// LESSON-SPECIFIC Open Graph image. OVERRIDES the site default at this segment.
// -----------------------------------------------------------------------------
// 🧠 OVERRIDE BEHAVIOUR
// `app/opengraph-image.tsx` provides the site default. The mere presence of
// THIS file inside `/lessons/seo-metadata` makes Next inject this PNG as
// `<meta property="og:image">` for every URL under `/lessons/seo-metadata/*`
// (including the [slug] sub-routes) — UNLESS a deeper segment defines its
// own override. No imports needed, no config to wire up. Pure file convention.
//
// 🧠 EDGE-RUNTIME CONSTRAINTS RECAP
//   • `display: 'flex'` on every container (Satori has no block layout).
//   • Inline `style` only (no Tailwind, no CSS modules, no className).
//   • `process.cwd()` works (for shipping fonts/images). `fs` does not.
//   • The function can be `async` to await `fetch` or `readFile`.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md
// =============================================================================

import { ImageResponse } from 'next/og';

export const alt = 'SEO & Metadata · Module 5 · Lesson 2 of Living Notebook';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
                        'linear-gradient(135deg, #020617 0%, #1e3a8a 50%, #5b21b6 100%)',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            color: 'rgba(186, 230, 253, 0.85)',
                            fontSize: 22,
                            fontWeight: 500,
                        }}
                    >
                        📓 Living Notebook
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            padding: '6px 14px',
                            borderRadius: 9999,
                            border: '1px solid rgba(168, 85, 247, 0.6)',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: 'rgba(233, 213, 255, 0.95)',
                            fontSize: 20,
                            fontWeight: 500,
                        }}
                    >
                        Module 5 · Lesson 2
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 104,
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: -3,
                        }}
                    >
                        SEO & Metadata
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            maxWidth: 900,
                            fontSize: 30,
                            lineHeight: 1.3,
                            color: 'rgba(203, 213, 225, 0.95)',
                        }}
                    >
                        generateMetadata · ImageResponse · sitemap.ts · JSON-LD
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        fontSize: 22,
                        color: 'rgba(148, 163, 184, 0.85)',
                    }}
                >
                    <span style={{ display: 'flex' }}>
                        How the App Router builds &lt;head&gt;
                    </span>
                    <span style={{ display: 'flex' }}>
                        /lessons/seo-metadata
                    </span>
                </div>
            </div>
        ),
        size,
    );
}
