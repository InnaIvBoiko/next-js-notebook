'use client';
// =============================================================================
// app/lessons/advanced-routing/_components/modal.tsx
// Reusable modal wrapper used by the intercepted route (@modal/(..)photos/[id]).
// -----------------------------------------------------------------------------
// 🧠 CLOSE BEHAVIOUR
// A modal opened via intercepting routes has THREE close paths the user
// expects to "just work":
//   1. Esc key                         → `router.back()`
//   2. Click on the backdrop           → `router.back()`
//   3. Browser back button             → automatic (Next pops the history
//                                         entry, the slot stops matching)
// We use `router.back()` (not `router.push('/gallery')`) so the History
// stack stays sane — back-button cycles work as expected.
//
// 🧠 BODY SCROLL LOCK
// Adding `overflow-hidden` to <body> on mount prevents the background
// gallery from scrolling under the modal. Cleaned up on unmount so soft
// navigation back leaves the page interactive.
//
// 🧠 NO PORTAL
// We don't `createPortal` to document.body because the modal renders inside
// the @modal slot which is already a sibling of children in the parent
// layout — visually it sits on top via CSS (fixed inset-0 + z-50).
// =============================================================================

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    title: string;
    closeLabel: string;
    children: ReactNode;
};

export default function Modal({ title, closeLabel, children }: Props) {
    const router = useRouter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') router.back();
        };
        document.addEventListener('keydown', onKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [router]);

    return (
        <div
            role='dialog'
            aria-modal='true'
            aria-label={title}
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
        >
            {/* Backdrop — click closes via router.back(). `aria-hidden` because
                the dialog itself owns focus / label. */}
            <button
                type='button'
                aria-hidden='true'
                tabIndex={-1}
                onClick={() => router.back()}
                className='absolute inset-0 bg-slate-950/80 backdrop-blur-sm'
            />

            <div className='relative z-10 max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl'>
                <header className='flex items-center justify-between border-b border-slate-700/60 px-4 py-3'>
                    <h2 className='text-sm font-semibold text-slate-100'>
                        {title}
                    </h2>
                    <button
                        type='button'
                        onClick={() => router.back()}
                        className='rounded-md border border-slate-700/60 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100'
                    >
                        {closeLabel} ✕
                    </button>
                </header>
                <div className='p-4'>{children}</div>
            </div>
        </div>
    );
}
