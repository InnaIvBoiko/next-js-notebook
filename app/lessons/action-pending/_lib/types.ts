// =============================================================================
// app/lessons/action-pending/_lib/types.ts
// Shared types + initial state for the /use-action-state demo.
// -----------------------------------------------------------------------------
// Why a separate file? `'use server'` files (actions.ts) may export ONLY
// async functions. Constants and types live here so both the Server Action
// signature and the Client component can import them.
// =============================================================================

export type SignupState = {
    ok: boolean;
    code: 'idle' | 'success' | 'error_empty' | 'error_duplicate';
    submittedName: string;
};

export const SIGNUP_INITIAL_STATE: SignupState = {
    ok: false,
    code: 'idle',
    submittedName: '',
};
