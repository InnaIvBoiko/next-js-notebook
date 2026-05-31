'use client';
// =============================================================================
// app/lessons/optimization-media/_components/font-demo.tsx
// Render the same text with --font-sans and --font-mono so the user can
// SEE the two fonts side by side and inspect Computed Styles in DevTools.
// -----------------------------------------------------------------------------
// 🧠 Why 'use client'?
// Only for the language switch — `useLang()` reads from the LangProvider
// (Client Context). The fonts themselves do NOT need a Client Component:
// the CSS variables are inherited from the LESSON LAYOUT wrapper, which is
// rendered on the server. We could split the language-reactive parts into a
// tiny island, but the noise isn't worth it for a single Lab.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

export default function FontDemo() {
    const lang = useLang();
    const t = content[lang].labs.fontDemo;

    return (
        <div className='grid gap-4 lg:grid-cols-2'>
            {/* ============================================================ */}
            {/* SANS — Inter                                                 */}
            {/* ============================================================ */}
            <div className='space-y-3 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-4'>
                <span className='inline-block rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-fuchsia-300 uppercase'>
                    {t.sansLabel}
                </span>
                {/* `font-[var(--font-sans)]` is Tailwind v4's arbitrary-value */}
                {/* syntax: it inlines `font-family: var(--font-sans)`. The   */}
                {/* variable was set by the lesson layout wrapper.            */}
                <p className='text-2xl leading-tight font-(--font-sans) text-slate-100'>
                    {t.sample}
                </p>
                <p className='text-sm leading-relaxed font-(--font-sans) text-slate-400'>
                    abcdefghijklmnopqrstuvwxyz
                    <br />
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </p>
            </div>

            {/* ============================================================ */}
            {/* MONO — JetBrains Mono                                        */}
            {/* ============================================================ */}
            <div className='space-y-3 rounded-lg border border-lime-500/30 bg-lime-500/5 p-4'>
                <span className='inline-block rounded-full bg-lime-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-lime-300 uppercase'>
                    {t.monoLabel}
                </span>
                <p className='text-2xl leading-tight font-(--font-mono) text-slate-100'>
                    {t.sample}
                </p>
                {/* `font-feature-settings: "liga" 0, "calt" 0` disables       */}
                {/* JetBrains Mono's programming ligatures (===, =>, !==, …)  */}
                {/* so `===` renders as three distinct glyphs instead of a    */}
                {/* single horizontal triple-bar. Pedagogically clearer for   */}
                {/* a font lesson — the code sample is supposed to show the   */}
                {/* FONT FAMILY, not the font-feature behaviour.              */}
                <pre
                    className='overflow-x-auto rounded bg-slate-950/60 p-3 text-sm leading-relaxed font-(--font-mono) text-lime-100'
                    style={{ fontFeatureSettings: '"liga" 0, "calt" 0' }}
                >
                    {t.codeSample}
                </pre>
            </div>
        </div>
    );
}
