'use client';
// =============================================================================
// SignupForm — useActionState in action.
// -----------------------------------------------------------------------------
// 🧠 useActionState(action, initialState) returns [state, formAction, pending].
//   • state: whatever the Action returned the last time it completed.
//   • formAction: the wrapped Action to pass to <form action={}>.
//   • pending: true while the Action is in flight.
//
// The Action signature CHANGES: the first arg is the previous state, the
// second is the FormData. See ../../_lib/actions.ts → signupAction.
// =============================================================================

import { useActionState } from 'react';
import { content } from '../../_lib/content';
import { useLessonLang } from '../../_components/lang-provider';
import { signupAction } from '../../_lib/actions';
import { SIGNUP_INITIAL_STATE } from '../../_lib/types';

export default function SignupForm() {
    const { lang } = useLessonLang();
    const t = content[lang].demos.actionState;

    const [state, formAction, pending] = useActionState(
        signupAction,
        SIGNUP_INITIAL_STATE,
    );

    // Translate the server-returned code into the user's chosen language.
    let message: string | null = null;
    let messageTone: 'success' | 'error' | null = null;
    switch (state.code) {
        case 'success':
            message = t.messages.success.replace(
                '{name}',
                state.submittedName,
            );
            messageTone = 'success';
            break;
        case 'error_empty':
            message = t.messages.errorEmpty;
            messageTone = 'error';
            break;
        case 'error_duplicate':
            message = t.messages.errorDuplicate.replace(
                '{name}',
                state.submittedName,
            );
            messageTone = 'error';
            break;
    }

    return (
        <form action={formAction} className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
                <input
                    type='text'
                    name='name'
                    placeholder={t.namePlaceholder}
                    disabled={pending}
                    className='min-w-0 flex-1 rounded-md border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none disabled:opacity-50'
                />
                <button
                    type='submit'
                    disabled={pending}
                    className='inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    {pending && (
                        <span
                            className='inline-block h-2 w-2 animate-pulse rounded-full bg-white'
                            aria-hidden
                        />
                    )}
                    {pending ? t.submittingLabel : t.submitLabel}
                </button>
            </div>
            {message && (
                <p
                    role='status'
                    aria-live='polite'
                    className={
                        messageTone === 'success'
                            ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200'
                            : 'rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200'
                    }
                >
                    {message}
                </p>
            )}
        </form>
    );
}
