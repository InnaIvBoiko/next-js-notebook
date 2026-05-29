'use server';
// =============================================================================
// app/lessons/action-pending/_lib/actions.ts
// File-level `'use server'`: every export is a Server Action.
// =============================================================================

import { refresh } from 'next/cache';
import * as store from './store';
import type { SignupState } from './types';

const ARTIFICIAL_LATENCY_MS = 1000;

// useActionState signature: (prevState, formData) => newState.
// Returns a state object the Client can render — both pending (via the
// third tuple element from useActionState) AND the returned state are
// independent signals.
export async function signupAction(
    _prevState: SignupState,
    formData: FormData,
): Promise<SignupState> {
    const name = String(formData.get('name') ?? '');
    await store.delay(ARTIFICIAL_LATENCY_MS);
    const result = store.addSubscriber(name);
    if (!result.ok) {
        return {
            ok: false,
            code: result.reason === 'empty' ? 'error_empty' : 'error_duplicate',
            submittedName: name,
        };
    }
    refresh();
    return { ok: true, code: 'success', submittedName: name };
}

// -----------------------------------------------------------------------------
// useFormStatus demo: the form action does the slow work; the SubmitButton
// child reads useFormStatus().pending to disable itself.
// -----------------------------------------------------------------------------
export async function slowSubscribeAction(formData: FormData): Promise<void> {
    const name = String(formData.get('name') ?? '');
    await store.delay(ARTIFICIAL_LATENCY_MS);
    store.addSubscriber(name);
    refresh();
}

// -----------------------------------------------------------------------------
// useOptimistic demo: simple add with delay. The Client adds the name to the
// optimistic state instantly, then awaits this action. Once it returns and
// refresh() re-renders the page with the real data, the optimistic state
// is replaced by the real one.
// -----------------------------------------------------------------------------
export async function optimisticSubscribeAction(
    formData: FormData,
): Promise<void> {
    const name = String(formData.get('name') ?? '');
    await store.delay(ARTIFICIAL_LATENCY_MS);
    store.addSubscriber(name);
    refresh();
}

// Used by every demo's list to remove an entry.
export async function removeSubscriberAction(
    formData: FormData,
): Promise<void> {
    const name = String(formData.get('name') ?? '');
    store.removeSubscriber(name);
    refresh();
}
