'use client';
// =============================================================================
// app/lessons/auth-setup/_components/credentials-forms.tsx
// LAB 2 — Credentials sign-in + signup forms, both via Server Actions.
// -----------------------------------------------------------------------------
// 🧠 useActionState (React 19) for inline error feedback
// Both forms use `useActionState(action, initial)` to receive the action's
// returned value (e.g. { error: '...' } or { ok: true }) and render it
// without lifting state to a parent. This is the textbook pattern for
// progressive-enhancement forms (works without JS) + JS-native UX.
//
// 🧠 If you're already signed in we hide both forms and just say so —
// the page's SessionDisplay above gives the actual identity.
// =============================================================================

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useLang } from '../../_components/lang-provider';
import { credentialsSignInAction, signupAction } from '../_lib/actions';
import { content } from '../_lib/content';
import { DEMO_USER } from '../../../_db/seed';

export default function CredentialsForms({
    isSignedIn,
}: {
    isSignedIn: boolean;
}) {
    const lang = useLang();
    const labels = content[lang].labs.credentials;

    const [signInState, signInDispatch] = useActionState(
        credentialsSignInAction,
        {},
    );
    const [signUpState, signUpDispatch] = useActionState(signupAction, {});

    if (isSignedIn) {
        // Hide the forms — SessionDisplay above already shows identity + sign
        // out. Re-rendering an empty fragment keeps the labs layout stable.
        return null;
    }

    return (
        <div className='grid gap-4 sm:grid-cols-2'>
            {/* SIGN IN ----------------------------------------------------- */}
            <form
                action={signInDispatch}
                className='space-y-2 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
            >
                <p
                    className='text-[10px] tracking-wide text-slate-500 uppercase'
                    suppressHydrationWarning
                >
                    {labels.demoCredsLabel}: {DEMO_USER.email} ·{' '}
                    {DEMO_USER.password}
                </p>
                <input
                    type='email'
                    name='email'
                    required
                    defaultValue={DEMO_USER.email}
                    placeholder={labels.emailPlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <input
                    type='password'
                    name='password'
                    required
                    defaultValue={DEMO_USER.password}
                    placeholder={labels.passwordPlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                {signInState?.error && (
                    <p className='rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200'>
                        {signInState.error}
                    </p>
                )}
                <SubmitButton
                    idleLabel={labels.signInLabel}
                    pendingLabel={labels.signingInLabel}
                    accent='emerald'
                />
            </form>

            {/* SIGN UP ----------------------------------------------------- */}
            <form
                action={signUpDispatch}
                className='space-y-2 rounded-md border border-slate-700/60 bg-slate-900/40 p-3'
            >
                <input
                    type='email'
                    name='email'
                    required
                    placeholder={labels.emailPlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <input
                    type='text'
                    name='name'
                    placeholder={labels.namePlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                <input
                    type='password'
                    name='password'
                    required
                    minLength={6}
                    placeholder={labels.passwordPlaceholder}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-sm text-slate-100'
                    suppressHydrationWarning
                />
                {signUpState?.error && (
                    <p className='rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200'>
                        {signUpState.error}
                    </p>
                )}
                {signUpState?.ok && (
                    <p
                        className='rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200'
                        suppressHydrationWarning
                    >
                        {labels.signUpSuccessLabel}
                    </p>
                )}
                <SubmitButton
                    idleLabel={labels.signUpLabel}
                    pendingLabel={labels.signingUpLabel}
                    accent='sky'
                />
            </form>
        </div>
    );
}

function SubmitButton({
    idleLabel,
    pendingLabel,
    accent,
}: {
    idleLabel: string;
    pendingLabel: string;
    accent: 'emerald' | 'sky';
}) {
    const { pending } = useFormStatus();
    const palette =
        accent === 'emerald'
            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
            : 'border-sky-500/50 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30';
    return (
        <button
            type='submit'
            disabled={pending}
            className={`w-full rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${palette}`}
            suppressHydrationWarning
        >
            {pending ? pendingLabel : idleLabel}
        </button>
    );
}
