'use client';
// =============================================================================
// app/lessons/database-orm/_components/delete-note-button.tsx
// Tiny Client island: invokes the deleteNoteAction Server Action.
// -----------------------------------------------------------------------------
// 🧠 useTransition wraps the action so the button can render a pending
// state without blocking other interactions. The action itself calls
// revalidatePath('/lessons/database-orm') — the RSC list re-renders on
// the server and the new HTML streams back into the page.
//
// 🛑 suppressHydrationWarning on the label — and WHY
//
// This component is rendered INSIDE a streaming <Suspense> boundary
// (`<RscNotesList />` in page.tsx). The streaming order is:
//   1. Initial HTML arrives: just the skeleton (no buttons yet).
//   2. Client hydrates the layout. <LangProvider> mounts with `useState('it')`
//      (matches the server's default). Hydration succeeds.
//   3. <LangProvider>'s useEffect fires, reads `sessionStorage`, finds
//      `'uk'` (chosen in a prior session) → `setLang('uk')` → re-render.
//   4. THE STREAMED CONTENT now arrives. It was server-rendered with
//      `lang='it'` (server cannot read sessionStorage), so the HTML says
//      "Elimina". But the client's <LangProvider> has already moved to
//      `'uk'`, so React expects "Видалити". → HYDRATION MISMATCH.
//
// React's mismatch error tears the streamed tree apart, which in turn
// aborts the Server-Action streaming response → the user sees "Failed to
// fetch" on the next click.
//
// `suppressHydrationWarning` tells React: "I know the SSR text won't match
// the client; trust the client's render". The button text reconciles to
// the correct localised label on the immediately-following client render.
//
// 🧠 The PROPER fix is migrating <LangProvider> from sessionStorage to a
// COOKIE — cookies are readable from a Server Component, so the server
// could render with the user's actual language and SSR + client would
// match. That's exactly what Module 5 · `/advanced-routing` will teach.
// See the comment block in app/lessons/_components/lang-provider.tsx.
// =============================================================================

import { useTransition } from 'react';
import { useLang } from '../../_components/lang-provider';
import { deleteNoteAction } from '../_lib/actions';
import { content } from '../_lib/content';

export default function DeleteNoteButton({ id }: { id: number }) {
    const lang = useLang();
    const labels = content[lang].labs.rscReader;
    const [isPending, startTransition] = useTransition();

    return (
        <button
            type='button'
            disabled={isPending}
            onClick={() => startTransition(() => deleteNoteAction(id))}
            className='shrink-0 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-200 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            suppressHydrationWarning
        >
            {labels.deleteLabel}
        </button>
    );
}
