'use client';
// =============================================================================
// BoomView — Client island for the /boom demo.
// -----------------------------------------------------------------------------
// 🧠 HOW THE THROW WORKS
// The button toggles `shouldThrow` to true. On the NEXT render of this
// component, the synchronous `throw` statement runs at render-time. React
// unwinds, the closest Error Boundary (../boom/error.tsx) catches it and
// renders its fallback.
//
// 🧠 HOW unstable_retry RECOVERS
// When the user clicks "Retry" on the error.tsx fallback, Next calls
// unstable_retry(): the boundary's children subtree is remounted. The fresh
// instance of THIS component re-initializes its useState — `shouldThrow` is
// back to `false`, and the Boom button is available again. That is why the
// retry actually "succeeds" from the user's point of view.
// =============================================================================

import { useState } from 'react';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

export default function BoomView() {
    const { lang } = useLessonLang();
    const t = content[lang].demos.boom;

    const [shouldThrow, setShouldThrow] = useState(false);

    // 💥 The throw happens DURING RENDER. It is caught by the nearest Error
    //    Boundary in the tree, which here is ../boom/error.tsx.
    if (shouldThrow) {
        throw new Error(
            'BoomView intentionally threw during render. Caught by /boom/error.tsx.',
        );
    }

    return (
        <section className='space-y-5'>
            <button
                type='button'
                onClick={() => setShouldThrow(true)}
                className='inline-flex items-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/30 transition-colors hover:bg-rose-400'
            >
                {t.triggerLabel}
            </button>
            <p className='text-sm text-slate-400'>{t.calmLabel}</p>
            <p className='rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 text-xs leading-relaxed text-slate-400'>
                {t.instructions}
            </p>
        </section>
    );
}
