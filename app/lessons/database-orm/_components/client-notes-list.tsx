'use client';
// =============================================================================
// app/lessons/database-orm/_components/client-notes-list.tsx
// LAB 3 — Client island reading the same DB via the Route Handler.
// -----------------------------------------------------------------------------
// 🧠 Why TanStack Query and not bare fetch
// We could `useEffect(() => fetch('/api/notes')...)` here, but Module 3
// Lesson 3 already showed why that's a regression: no dedup, no auto refetch,
// no cache. TanStack Query is the standard answer for client-side server
// state — and the parent page prefetches this query in a Server Component
// so the first render has data already.
//
// 🧠 The shape match
// `listNotesWithTags()` returns `NoteWithTags[]` from the DB layer. The Route
// Handler echoes the same shape in JSON. The Client can therefore reuse the
// SAME type. We import it from `_db/schema.ts` — that's a server-side module,
// but importing TYPES is free: TS type-only imports are erased at build time
// (so the WASM PGlite never enters the client bundle).
// =============================================================================

import { useQuery } from '@tanstack/react-query';
import type { NoteWithTags } from '../../../_db/schema';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

async function fetchNotes(): Promise<NoteWithTags[]> {
    const res = await fetch('/api/notes');
    if (!res.ok) throw new Error(`GET /api/notes failed: ${res.status}`);
    const { notes } = (await res.json()) as { notes: NoteWithTags[] };
    return notes;
}

export default function ClientNotesList() {
    const lang = useLang();
    const labels = content[lang].labs.clientQuery;

    const { data: notes = [], isFetching, refetch } = useQuery({
        // Same key as the server-side prefetch in page.tsx → HydrationBoundary
        // hands the prefetched data to this query, so first render is instant.
        queryKey: ['notes'],
        queryFn: fetchNotes,
    });

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-between gap-3'>
                <span className='font-mono text-[11px] text-sky-200'>
                    {notes.length} {labels.countLabel}
                </span>
                <button
                    type='button'
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className='inline-flex items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    {isFetching ? labels.fetchingLabel : labels.refetchLabel}
                </button>
            </div>
            <ul className='space-y-1'>
                {notes.map(note => (
                    <li
                        key={note.id}
                        className='flex items-center gap-2 rounded-md border border-slate-700/40 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200'
                    >
                        <span className='font-mono text-[10px] text-slate-500'>
                            #{note.id}
                        </span>
                        <span className='flex-1'>{note.title}</span>
                        <span className='flex gap-1'>
                            {note.tags.slice(0, 3).map(tag => (
                                <span
                                    key={tag.id}
                                    className='rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 font-mono text-[9px] text-emerald-200'
                                >
                                    {tag.label}
                                </span>
                            ))}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
