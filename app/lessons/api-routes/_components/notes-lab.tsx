'use client';
// =============================================================================
// app/lessons/api-routes/_components/notes-lab.tsx
// LAB 2 — mini CRUD client for /api/notes.
// -----------------------------------------------------------------------------
// 🧠 What this teaches
// Every interaction is a real HTTP call against the Route Handlers:
//   • GET    /api/notes       — initial load + refresh after mutations
//   • POST   /api/notes       — create (201 + Location header)
//   • PATCH  /api/notes/:id   — partial update
//   • DELETE /api/notes/:id   — remove (204 No Content)
//   • PUT    /api/notes       — reset to seed
//   • DELETE /api/notes       — 405 demo (collection-level DELETE is not exported)
//
// We deliberately don't use TanStack Query here — Module 3 · Lesson 3 already
// covered that pattern. Bare `fetch()` + `useState` keeps the focus on the
// Route Handler contract, not on a query library.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

type Note = {
    // Note: IDs are integers since Module 4 · Lesson 2 (Drizzle + PGlite).
    // Lesson 1 used opaque string IDs from an in-memory store; this lab now
    // talks to a real Postgres `SERIAL` column.
    id: number;
    title: string;
    body: string;
    createdAt: string;
    tags?: { id: number; label: string }[];
};

type NotesLabels = {
    badge: string;
    description: string;
    titlePlaceholder: string;
    bodyPlaceholder: string;
    createLabel: string;
    creatingLabel: string;
    editLabel: string;
    saveLabel: string;
    cancelLabel: string;
    deleteLabel: string;
    resetLabel: string;
    emptyLabel: string;
    error405Label: string;
    try405Label: string;
};

export default function NotesLab({ labels }: { labels: NotesLabels }) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [methodLog, setMethodLog] = useState<
        { method: string; url: string; status: number }[]
    >([]);

    // Centralised fetcher so every call appends to the method log shown at the
    // bottom of the lab. This is the lab's KEY teaching device — students see
    // every HTTP roundtrip a single click triggers.
    const call = useCallback(
        async (
            method: string,
            url: string,
            init?: RequestInit,
        ): Promise<Response> => {
            const res = await fetch(url, { method, ...init });
            setMethodLog(prev =>
                [{ method, url, status: res.status }, ...prev].slice(0, 8),
            );
            return res;
        },
        [],
    );

    const refresh = useCallback(async () => {
        const res = await call('GET', '/api/notes');
        const data = (await res.json()) as { notes: Note[] };
        setNotes(data.notes);
    }, [call]);

    // 🛑 react-hooks/set-state-in-effect — disabled intentionally.
    // The whole point of this lab is to issue a REAL fetch against /api/notes
    // from the browser. The endpoint cannot be called during SSR (it would be
    // a self-call to localhost), so the initial load has to happen on mount.
    // The "cascading render" the rule warns about IS the loading state we
    // teach here — the empty list flickers in for one frame, then notes
    // arrive. Same justification as the sessionStorage hydration in
    // app/lessons/_components/lang-provider.tsx.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only fetch on mount
        refresh();
    }, [refresh]);

    async function create() {
        if (title.trim().length === 0) return;
        setIsPending(true);
        setError(null);
        try {
            const res = await call('POST', '/api/notes', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body }),
            });
            if (!res.ok) {
                const err = (await res.json()) as { error?: string };
                setError(err.error ?? `HTTP ${res.status}`);
                return;
            }
            setTitle('');
            setBody('');
            await refresh();
        } finally {
            setIsPending(false);
        }
    }

    function startEdit(note: Note) {
        setEditingId(note.id);
        setEditTitle(note.title);
        setEditBody(note.body);
    }

    async function save(id: number) {
        setIsPending(true);
        try {
            await call('PATCH', `/api/notes/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, body: editBody }),
            });
            setEditingId(null);
            await refresh();
        } finally {
            setIsPending(false);
        }
    }

    async function remove(id: number) {
        await call('DELETE', `/api/notes/${id}`);
        await refresh();
    }

    async function reset() {
        await call('PUT', '/api/notes');
        await refresh();
    }

    // Triggers the 405. We fire DELETE against the COLLECTION URL (which only
    // exports GET, POST, PUT) so Next answers with 405 + Allow: GET, POST, PUT.
    async function trigger405() {
        const res = await call('DELETE', '/api/notes');
        if (res.status === 405) {
            const allow = res.headers.get('allow');
            setError(`${labels.error405Label} · Allow: ${allow}`);
        }
    }

    return (
        <section className='space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4'>
            <div className='flex items-start justify-between gap-3'>
                <span className='text-[11px] font-semibold tracking-wide text-emerald-300 uppercase'>
                    {labels.badge}
                </span>
                <code className='rounded bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] text-emerald-200'>
                    /api/notes · /api/notes/[id]
                </code>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {labels.description}
            </p>

            {/* CREATE FORM */}
            <div className='space-y-2 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'>
                <input
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={labels.titlePlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                />
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder={labels.bodyPlaceholder}
                    rows={2}
                    className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                />
                <div className='flex flex-wrap gap-2'>
                    <button
                        type='button'
                        onClick={create}
                        disabled={isPending || title.trim().length === 0}
                        className='rounded-md border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {isPending ? labels.creatingLabel : labels.createLabel}
                    </button>
                    <button
                        type='button'
                        onClick={reset}
                        className='rounded-md border border-slate-600 bg-slate-800/50 px-3 py-1 text-xs text-slate-200 transition-colors hover:bg-slate-800'
                    >
                        {labels.resetLabel}
                    </button>
                    <button
                        type='button'
                        onClick={trigger405}
                        className='rounded-md border border-rose-500/50 bg-rose-500/15 px-3 py-1 text-xs text-rose-100 transition-colors hover:bg-rose-500/25'
                    >
                        {labels.try405Label}
                    </button>
                </div>
                {error && (
                    <p className='rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200'>
                        {error}
                    </p>
                )}
            </div>

            {/* NOTES LIST */}
            <ul className='space-y-2'>
                {notes.length === 0 && (
                    <li className='rounded-md border border-dashed border-slate-700 bg-slate-900/30 px-3 py-2 text-xs text-slate-500'>
                        {labels.emptyLabel}
                    </li>
                )}
                {notes.map(note => (
                    <li
                        key={note.id}
                        className='space-y-1 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
                    >
                        {editingId === note.id ? (
                            <div className='space-y-2'>
                                <input
                                    type='text'
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-sm text-slate-100'
                                />
                                <textarea
                                    value={editBody}
                                    onChange={e => setEditBody(e.target.value)}
                                    rows={2}
                                    className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1 text-sm text-slate-100'
                                />
                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => save(note.id)}
                                        className='rounded-md border border-emerald-500/50 bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-100'
                                    >
                                        {labels.saveLabel}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setEditingId(null)}
                                        className='rounded-md border border-slate-600 bg-slate-800/50 px-2 py-0.5 text-[11px] text-slate-300'
                                    >
                                        {labels.cancelLabel}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className='flex items-start justify-between gap-2'>
                                    <h3 className='text-sm font-semibold text-slate-100'>
                                        {note.title}
                                    </h3>
                                    <div className='flex gap-1'>
                                        <button
                                            type='button'
                                            onClick={() => startEdit(note)}
                                            className='rounded-md border border-slate-600 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-800'
                                        >
                                            {labels.editLabel}
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => remove(note.id)}
                                            className='rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-200 hover:bg-rose-500/20'
                                        >
                                            {labels.deleteLabel}
                                        </button>
                                    </div>
                                </div>
                                {note.body && (
                                    <p className='text-xs text-slate-400'>
                                        {note.body}
                                    </p>
                                )}
                                <p className='font-mono text-[10px] text-slate-600'>
                                    {note.id} · {note.createdAt}
                                </p>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* METHOD LOG */}
            {methodLog.length > 0 && (
                <div className='space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-2'>
                    <span className='block text-[10px] tracking-wide text-slate-500 uppercase'>
                        HTTP log
                    </span>
                    <ul className='space-y-0.5'>
                        {methodLog.map((entry, i) => (
                            <li
                                key={i}
                                className='flex items-center gap-2 font-mono text-[10px]'
                            >
                                <span className='w-14 shrink-0 text-amber-300'>
                                    {entry.method}
                                </span>
                                <span className='min-w-0 flex-1 truncate text-slate-300'>
                                    {entry.url}
                                </span>
                                <span
                                    className={`shrink-0 rounded px-1.5 py-0.5 ${
                                        entry.status >= 200 && entry.status < 300
                                            ? 'bg-emerald-500/20 text-emerald-200'
                                            : entry.status >= 400
                                              ? 'bg-rose-500/20 text-rose-200'
                                              : 'bg-amber-500/20 text-amber-200'
                                    }`}
                                >
                                    {entry.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
