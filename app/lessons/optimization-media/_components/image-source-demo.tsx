// =============================================================================
// app/lessons/optimization-media/_components/image-source-demo.tsx
// Three image SOURCES rendered side by side: static import / public-path / remote.
// Server Component (no 'use client') — pure render, no interactivity.
// -----------------------------------------------------------------------------
// 🧠 WHAT TO INSPECT in DevTools → Network → Img
// All three columns ultimately hit the same `/_next/image?url=...` endpoint,
// the difference is the value of `url`:
//   • A1 static import → `url=%2F_next%2Fstatic%2Fmedia%2Fhero-...jpg`
//                        (the import gave Next a content-hashed file in the
//                         build output, served from /_next/static/media)
//   • A2 /public path  → `url=%2Foptimization-media%2Favatar.jpg`
//   • A3 remote        → `url=https%3A%2F%2Fpicsum.photos%2F...`
// =============================================================================

import Image from 'next/image';
// A1 — STATIC IMPORT: Next's loader returns a `StaticImageData` object with
// width, height and a base64 blurDataURL computed at build time. This is the
// ONLY source where `placeholder="blur"` works without you generating the
// blur yourself.
import heroImage from '../_assets/hero.jpg';

export default function ImageSourceDemo() {
    return (
        <div className='grid gap-4 lg:grid-cols-3'>
            {/* ============================================================ */}
            {/* A1 — STATIC IMPORT                                           */}
            {/* ============================================================ */}
            <figure className='space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3'>
                <span className='inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase'>
                    A1 · Static import
                </span>
                <div className='overflow-hidden rounded'>
                    <Image
                        src={heroImage}
                        alt='Static import hero — dimensions and blurDataURL come from the build-time import'
                        placeholder='blur'
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        className='h-auto w-full'
                    />
                </div>
                <figcaption className='text-[11px] leading-relaxed font-(--font-mono) text-emerald-200/80'>
                    {`import hero from '../_assets/hero.jpg';`}
                    <br />
                    {`<Image src={hero} placeholder="blur" />`}
                </figcaption>
            </figure>

            {/* ============================================================ */}
            {/* A2 — /public PATH                                            */}
            {/* ============================================================ */}
            {/* `flex flex-col` + `flex-1` on the image wrapper makes the     */}
            {/* avatar vertically centered in the LEFTOVER space without      */}
            {/* using `h-full`. The bug: `h-full` on a block child of a        */}
            {/* grid-stretched figure expanded the wrapper to the figure's    */}
            {/* full height and pushed the figcaption past the bottom border  */}
            {/* (overflow: visible), making the caption overlap the next      */}
            {/* section. The fix is to let the figure itself be a flex column */}
            {/* so the centering math stays inside it.                        */}
            <figure className='flex flex-col space-y-2 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3'>
                <span className='inline-block self-start rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-sky-300 uppercase'>
                    A2 · /public path
                </span>
                <div className='flex flex-1 items-center justify-center py-4'>
                    {/* The file is at /public/optimization-media/avatar.jpg.   */}
                    {/* `width` / `height` are MANDATORY for non-static-import  */}
                    {/* sources — Next has no way to know them at build time.  */}
                    <Image
                        src='/optimization-media/avatar.jpg'
                        alt='Avatar served from /public'
                        width={160}
                        height={160}
                        className='rounded-full ring-2 ring-sky-400/50'
                    />
                </div>
                <figcaption className='text-[11px] leading-relaxed font-(--font-mono) text-sky-200/80'>
                    {`<Image`}
                    <br />
                    {`  src="/optimization-media/avatar.jpg"`}
                    <br />
                    {`  width={160} height={160}`}
                    <br />
                    {`/>`}
                </figcaption>
            </figure>

            {/* ============================================================ */}
            {/* A3 — REMOTE URL                                              */}
            {/* ============================================================ */}
            <figure className='space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3'>
                <span className='inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                    A3 · Remote URL
                </span>
                <div className='overflow-hidden rounded'>
                    {/* picsum.photos is whitelisted in next.config.ts's       */}
                    {/* images.remotePatterns. Remove the entry and you get a  */}
                    {/* runtime error: "hostname is not configured".           */}
                    <Image
                        src='https://picsum.photos/seed/notebook-remote/1200/600'
                        alt='Remote image fetched through the Next.js optimizer'
                        width={1200}
                        height={600}
                        sizes='(max-width: 1024px) 100vw, 33vw'
                        className='h-auto w-full'
                    />
                </div>
                <figcaption className='text-[11px] leading-relaxed font-(--font-mono) text-violet-200/80'>
                    {`<Image`}
                    <br />
                    {`  src="https://picsum.photos/..."`}
                    <br />
                    {`  width={1200} height={600}`}
                    <br />
                    {`/>`}
                </figcaption>
            </figure>
        </div>
    );
}
