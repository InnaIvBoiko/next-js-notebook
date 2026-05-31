// =============================================================================
// app/lessons/optimization-media/_components/image-layout-demo.tsx
// Two LAYOUT strategies side by side: B1 (width/height) vs B2 (fill + sizes).
// Server Component (no 'use client').
// -----------------------------------------------------------------------------
// 🧠 THE EXPERIMENT
// Both columns load the SAME source file but with different layout strategies.
// Resize the browser and look at DevTools → Network → Img:
//   • B1 keeps fetching the same `&w=...` variant whatever the viewport
//     because its rendered size is intrinsic (fixed aspect ratio + w-full).
//   • B2 picks a SMALLER `&w=...` variant on narrow viewports because its
//     `sizes` query honestly tells the browser "I'm 100vw mobile, 50vw
//     tablet, 33vw desktop". That's where the optimization is paid back.
//
// Common bug shown by the difference: forgetting `sizes` on `fill` makes the
// browser fall back to `100vw` and download the biggest srcset entry — a
// silent performance regression. The B2 figcaption shows the correct value.
// =============================================================================

import Image from 'next/image';

const RESPONSIVE_SRC = '/optimization-media/responsive.jpg';

export default function ImageLayoutDemo() {
    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            {/* ============================================================ */}
            {/* B1 — Explicit width/height                                   */}
            {/* ============================================================ */}
            <figure className='space-y-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3'>
                <span className='inline-block rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cyan-300 uppercase'>
                    B1 · width / height
                </span>
                {/* No special wrapper needed — `width`/`height` reserve space  */}
                {/* via the generated HTML attributes. Tailwind's `w-full       */}
                {/* h-auto` lets CSS resize, while aspect-ratio is preserved.  */}
                <Image
                    src={RESPONSIVE_SRC}
                    alt='Landscape (explicit width/height layout)'
                    width={1600}
                    height={1067}
                    sizes='(max-width: 1024px) 100vw, 50vw'
                    className='h-auto w-full rounded'
                />
                <figcaption className='text-[11px] leading-relaxed font-(--font-mono) text-cyan-200/80'>
                    {`<Image`}
                    <br />
                    {`  src="/optimization-media/responsive.jpg"`}
                    <br />
                    {`  width={1600} height={1067}`}
                    <br />
                    {`/>`}
                </figcaption>
            </figure>

            {/* ============================================================ */}
            {/* B2 — fill + sizes                                            */}
            {/* ============================================================ */}
            <figure className='space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3'>
                <span className='inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-300 uppercase'>
                    B2 · fill + sizes
                </span>
                {/* THE PARENT WRAPPER MUST HAVE `position: relative` (here    */}
                {/* `relative`) AND an explicit aspect ratio. Without these    */}
                {/* the `fill` image collapses to 0×0 or escapes the layout.  */}
                <div className='relative aspect-3/2 w-full overflow-hidden rounded'>
                    <Image
                        src={RESPONSIVE_SRC}
                        alt='Landscape (fill layout, srcset adapts to container)'
                        fill
                        // `sizes` is a CSS media query: "at this viewport, how
                        // wide is this image". Drives which `srcset` entry the
                        // browser downloads. Forgetting it = browser assumes
                        // 100vw and fetches the biggest variant. The numbers
                        // here mirror the grid: 1 col mobile, 2 col desktop.
                        sizes='(max-width: 640px) 100vw,
                               (max-width: 1024px) 100vw,
                               50vw'
                        className='object-cover'
                    />
                </div>
                <figcaption className='text-[11px] leading-relaxed font-(--font-mono) text-amber-200/80'>
                    {`<div className="relative aspect-3/2">`}
                    <br />
                    {`  <Image src={src} fill`}
                    <br />
                    {`    sizes="(max-width: 640px) 100vw, 50vw"`}
                    <br />
                    {`    className="object-cover" />`}
                    <br />
                    {`</div>`}
                </figcaption>
            </figure>
        </div>
    );
}
