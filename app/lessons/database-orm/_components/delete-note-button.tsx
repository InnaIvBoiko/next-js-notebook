'use client';
// =============================================================================
// app/lessons/database-orm/_components/delete-note-button.tsx
// Tiny Client island: invokes the deleteNoteAction Server Action.
// -----------------------------------------------------------------------------
// 🧠 useTransition wraps the action so the button can render a pending
// state without blocking other interactions. The action itself calls
// revalidatePath('/lessons/database-orm') — the RSC list re-renders on
// the server and the new HTML streams back into the page.
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
        >
            {labels.deleteLabel}
        </button>
    );
}
