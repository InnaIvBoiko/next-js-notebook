// =============================================================================
// app/lessons/database-orm/_components/rsc-notes-list.tsx
// LAB 1 — Server Component that reads the DB DIRECTLY.
// -----------------------------------------------------------------------------
// 🧠 The teaching point
// No 'use client'. No useState. No useEffect. No fetch. This component
// `await`s the DB query at render time, on the server, and ships HTML.
//
// The DELETE button is a tiny Client island (DeleteNoteButton) — only
// interactive bits become client. Everything else is static HTML.
// =============================================================================

import { listNotesWithTags } from '../../../_db/queries';
import DeleteNoteButton from './delete-note-button';
import EmptyState from './empty-state';

export default async function RscNotesList() {
    // ⚠️ This Server Component is async (RSCs are allowed to be).
    // Hooks like useLang only work in Client Components — that's why the
    // empty-state label and the delete button live in separate Client
    // islands: a Server Component can render a Client child, but not the
    // reverse.
    const notes = await listNotesWithTags();

    if (notes.length === 0) {
        return <EmptyState />;
    }

    return (
        <ul className='space-y-2'>
            {notes.map(note => (
                <li
                    key={note.id}
                    className='space-y-1 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
                >
                    <div className='flex items-start justify-between gap-2'>
                        <h3 className='text-sm font-semibold text-slate-100'>
                            {note.title}
                        </h3>
                        <DeleteNoteButton id={note.id} />
                    </div>
                    {note.body && (
                        <p className='text-xs text-slate-400'>{note.body}</p>
                    )}
                    <div className='flex flex-wrap items-center gap-2'>
                        {note.tags.map(tag => (
                            <span
                                key={tag.id}
                                className='rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-200'
                            >
                                #{tag.label}
                            </span>
                        ))}
                        <span className='ml-auto font-mono text-[10px] text-slate-600'>
                            #{note.id} ·{' '}
                            {new Date(note.createdAt).toLocaleString()}
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

