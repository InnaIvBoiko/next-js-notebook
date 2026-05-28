'use client';
// ^^^^^^^^^^^
// 🧠 CLIENT COMPONENT — a collapsible "card" with local open/close state.
// The interesting part is the `children` slot: this component does NOT
// know what it's rendering. It just renders whatever was passed in.
//
// In the lesson page we pass <ServerFact /> as children. Even though this
// card is a Client Component, the <ServerFact /> tree was rendered on the
// server and arrived here as an already-baked RSC payload. The card just
// shows/hides it.
//
// This is the foundation pattern for Modals, Drawers, Accordions, Tabs
// that contain server-fetched content without forcing the content itself
// into the client bundle.

import { useState, type ReactNode } from 'react';

export default function ClientCard({
    label,
    children,
}: {
    label: string;
    // ReactNode — could be a Server Component's pre-rendered output.
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className='rounded-lg border border-slate-700/60 bg-slate-900/40'>
            <button
                type='button'
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
                className='flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/40'
            >
                <span>{label}</span>
                <span
                    aria-hidden
                    className={`text-xs text-slate-500 transition-transform ${
                        open ? 'rotate-90' : ''
                    }`}
                >
                    ▶
                </span>
            </button>
            {open && (
                <div className='border-t border-slate-700/60 px-4 py-3'>
                    {/* children is a Server Component's pre-rendered tree */}
                    {children}
                </div>
            )}
        </div>
    );
}
