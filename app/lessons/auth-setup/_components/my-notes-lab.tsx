'use client';
// =============================================================================
// app/lessons/auth-setup/_components/my-notes-lab.tsx
// LAB 4 — protected mini-CRUD owned by the signed-in user.
// -----------------------------------------------------------------------------
// 🧠 Receives notes pre-fetched server-side (page.tsx). Mutations call the
// Server Actions `createMyNoteAction` + `deleteMyNoteAction`, which:
//   1. re-check `auth()` (don't trust UI state)
//   2. enforce compound WHERE ownership for deletes
//   3. revalidatePath('/lessons/auth-setup') → RSC refetch on next render
// =============================================================================

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useLang } from '../../_components/lang-provider';
import {
    createMyNoteAction,
    deleteMyNoteAction,
} from '../_lib/actions';
import { content } from '../_lib/content';

type Note = {
    id: number;
    title: string;
    body: string;
    createdAt: string;
};

export default function MyNotesLab({
    isSignedIn,
    notes,
}: {
    isSignedIn: boolean;
    notes: Note[];
}) {
    const lang = useLang();
    const labels = content[lang].labs.myNotes;
    const [formKey, setFormKey] = useState(0);

    if (!isSignedIn) {
        return (
            <p
                className='rounded-md border border-dashed border-slate-700 bg-slate-900/30 px-3 py-2 text-xs text-slate-500'
                suppressHydrationWarning
            >
                {labels.authRequiredLabel}
            </p>
        );
    }

    async function handleCreate(formData: FormData) {
        await createMyNoteAction(formData);
        setFormKey(k => k + 1);
    }

    return (
        <div className='space-y-3'>
            <form
                key={formKey}
                action={handleCreate}
                className='space-y-2 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
            >
                <input
                    type='text'
                    name='title'
                    required
                    placeholder={labels.titlePlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <textarea
                    name='body'
                    rows={2}
                    placeholder={labels.bodyPlaceholder}
                    className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <input
                    type='text'
                    name='tags'
                    placeholder={labels.tagsPlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <CreateButton labels={labels} />
            </form>

            {notes.length === 0 ? (
                <p
                    className='rounded-md border border-dashed border-slate-700 bg-slate-900/30 px-3 py-2 text-xs text-slate-500'
                    suppressHydrationWarning
                >
                    {labels.emptyLabel}
                </p>
            ) : (
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
                                <DeleteButton id={note.id} label={labels.deleteLabel} />
                            </div>
                            {note.body && (
                                <p className='text-xs text-slate-400'>
                                    {note.body}
                                </p>
                            )}
                            <p className='font-mono text-[10px] text-slate-600'>
                                #{note.id} ·{' '}
                                {new Date(note.createdAt).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function CreateButton({
    labels,
}: {
    labels: { createLabel: string; creatingLabel: string };
}) {
    const { pending } = useFormStatus();
    return (
        <button
            type='submit'
            disabled={pending}
            className='rounded-md border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60'
            suppressHydrationWarning
        >
            {pending ? labels.creatingLabel : labels.createLabel}
        </button>
    );
}

function DeleteButton({ id, label }: { id: number; label: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            type='button'
            disabled={isPending}
            onClick={() => startTransition(() => deleteMyNoteAction(id))}
            className='shrink-0 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-200 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            suppressHydrationWarning
        >
            {label}
        </button>
    );
}
