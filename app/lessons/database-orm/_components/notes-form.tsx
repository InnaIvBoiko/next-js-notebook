'use client';
// =============================================================================
// app/lessons/database-orm/_components/notes-form.tsx
// LAB 2 — HTML form that POSTs to a Server Action.
// -----------------------------------------------------------------------------
// 🧠 Three things to notice
//
// 1. `<form action={createNoteAction}>` — the form's action attribute
//    receives the Server Action directly. Next emits a hidden form ID and
//    intercepts the POST; on submit, browsers WITHOUT JS still work (full
//    page POST + redirect). With JS, Next does an RSC re-render in place.
//
// 2. `useFormStatus()` from `react-dom` reads the parent form's pending
//    state — used by the submit button to render its disabled / loading UI
//    without lifting state to the form itself.
//
// 3. The form is reset by passing it a `key` that changes after every
//    successful action. Since `<form>` is stateful in the browser (the
//    DOM holds the field values), this is the textbook way to clear it.
// =============================================================================

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useLang } from '../../_components/lang-provider';
import { createNoteAction, resetNotesAction } from '../_lib/actions';
import { content } from '../_lib/content';

export default function NotesForm() {
    const lang = useLang();
    const labels = content[lang].labs.serverAction;

    // Bump on each successful submit → the form remounts and clears.
    const [formKey, setFormKey] = useState(0);

    async function handleCreate(formData: FormData) {
        await createNoteAction(formData);
        setFormKey(k => k + 1);
    }

    return (
        <form
            key={formKey}
            action={handleCreate}
            className='space-y-3 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
        >
            <input
                type='text'
                name='title'
                required
                placeholder={labels.titlePlaceholder}
                className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
            />
            <textarea
                name='body'
                rows={2}
                placeholder={labels.bodyPlaceholder}
                className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
            />
            <input
                type='text'
                name='tags'
                placeholder={labels.tagsPlaceholder}
                className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
            />
            <div className='flex flex-wrap gap-2'>
                <SubmitButton
                    idleLabel={labels.createLabel}
                    pendingLabel={labels.creatingLabel}
                />
                <ResetButton resetLabel={labels.resetLabel} />
            </div>
        </form>
    );
}

// `useFormStatus()` returns the pending state of the NEAREST <form action>.
// It works only inside a child of a <form> that uses a Server Action.
function SubmitButton({
    idleLabel,
    pendingLabel,
}: {
    idleLabel: string;
    pendingLabel: string;
}) {
    const { pending } = useFormStatus();
    return (
        <button
            type='submit'
            disabled={pending}
            className='rounded-md border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
            {pending ? pendingLabel : idleLabel}
        </button>
    );
}

// Reset uses its own Server Action — invoked via a separate button OUTSIDE
// the form submit flow. We use formAction on the button to point at a
// different action than the form's main one.
function ResetButton({ resetLabel }: { resetLabel: string }) {
    return (
        <button
            type='button'
            onClick={() => resetNotesAction()}
            className='rounded-md border border-slate-600 bg-slate-800/50 px-3 py-1 text-xs text-slate-200 transition-colors hover:bg-slate-800'
        >
            {resetLabel}
        </button>
    );
}
