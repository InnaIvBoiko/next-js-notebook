'use server';
// =============================================================================
// app/lessons/auth-setup/_lib/actions.ts
// Server Actions for Module 4 · Lesson 3.
// -----------------------------------------------------------------------------
// Exposes the user-facing flows:
//   • credentialsSignInAction — email/password → Auth.js signIn('credentials')
//   • githubSignInAction      — kicks off the GitHub OAuth redirect flow
//   • signOutAction           — clears the session cookie (+ DB row for OAuth)
//   • signupAction            — creates a Credentials user (email + bcrypt hash)
//   • createMyNoteAction      — protected note creation owned by current user
//   • deleteMyNoteAction      — protected note delete (owner check enforced)
//
// 🧠 Each action revalidates the lesson path so the RSC session display and
// the protected notes list re-render immediately.
// =============================================================================

import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { AuthError } from 'next-auth';
import { auth, signIn, signOut } from '../../../../auth';
import { db, dbReady } from '../../../_db/client';
import { noteTags, notes, users } from '../../../_db/schema';

const PAGE = '/lessons/auth-setup';

// Form-driven sign in via the Credentials provider.
//
// 🧠 Why `redirectTo` (default redirect: true) instead of `redirect: false`
// With `redirect: false`, `signIn()` sets the session cookie BUT the current
// response is already being rendered with the original (empty) cookie.
// `revalidatePath` triggers a re-render — also with the old cookie — so the
// UI keeps showing "not signed in" even though the cookie is set. The user
// has to manually refresh to see the new auth state.
//
// With `redirectTo`, `signIn()` throws a `NEXT_REDIRECT` after setting the
// cookie. Next catches it, sends a 303 to the browser, the browser navigates
// to the target URL CARRYING the new cookie, and the next render of the
// page sees the authenticated session. This is the documented v5 pattern.
//
// We catch only `AuthError` (real auth failures) so the redirect error
// propagates up to the framework.
//
// 📚 Doc: https://authjs.dev/getting-started/authentication/credentials#signin-form
export async function credentialsSignInAction(
    _prev: { error?: string } | undefined,
    formData: FormData,
): Promise<{ error?: string }> {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    if (email.length === 0 || password.length === 0) {
        return { error: 'Email and password are required.' };
    }
    try {
        await signIn('credentials', { email, password, redirectTo: PAGE });
        // Unreachable: signIn either throws NEXT_REDIRECT (success) or AuthError
        // (failure). We return as a safety net for type narrowing only.
        return {};
    } catch (err) {
        if (err instanceof AuthError) {
            return {
                error:
                    err.type === 'CredentialsSignin'
                        ? 'Invalid email or password.'
                        : 'Sign-in failed.',
            };
        }
        // Re-throw NEXT_REDIRECT (and anything else) so Next.js can handle it.
        throw err;
    }
}

// Kicks off the GitHub OAuth flow. The Server Action returns a NEXT_REDIRECT
// which the framework consumes — the browser ends up at github.com/login.
export async function githubSignInAction(): Promise<void> {
    await signIn('github', { redirectTo: PAGE });
}

export async function signOutAction(): Promise<void> {
    await signOut({ redirectTo: PAGE });
}

// Sign up: hashes the password and inserts into `user`. We do NOT auto-login
// after signup — explicit two-step (signup → then login) makes the flow
// auditable in DevTools network tab.
export async function signupAction(
    _prev: { error?: string; ok?: boolean } | undefined,
    formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const name = String(formData.get('name') ?? '').trim();

    if (email.length === 0 || password.length < 6) {
        return { error: 'Email required, password must be ≥6 chars.' };
    }

    await dbReady;
    const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
    });
    if (existing) {
        return { error: 'A user with that email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
        email,
        name: name.length > 0 ? name : null,
        passwordHash,
    });

    revalidatePath(PAGE);
    return { ok: true };
}

// PROTECTED: creates a note OWNED by the current user.
export async function createMyNoteAction(formData: FormData): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) {
        // Server Actions are PUBLIC POST endpoints — anyone can craft a
        // FormData and hit them. ALWAYS re-check session inside the action,
        // never trust UI state.
        throw new Error('Unauthorized');
    }

    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '');
    const rawTags = String(formData.get('tags') ?? '');
    if (title.length === 0) return;

    const tagLabels = rawTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    await dbReady;
    await db.transaction(async tx => {
        const [row] = await tx
            .insert(notes)
            .values({
                title,
                body,
                userId: session.user!.id,
            })
            .returning({ id: notes.id });
        if (tagLabels.length > 0) {
            await tx.insert(noteTags).values(
                tagLabels.map(label => ({ noteId: row.id, label })),
            );
        }
    });

    revalidatePath(PAGE);
}

// PROTECTED: delete only if the note is owned by the current user.
// Cross-user delete attempts silently no-op — the compound WHERE matches
// zero rows, no error, nothing happens. That's the right behaviour
// (don't leak existence of other users' notes via 404 vs 403).
export async function deleteMyNoteAction(id: number): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    await dbReady;
    // `and(eq, eq)` builds the compound predicate. Drizzle stays type-safe
    // and Postgres only deletes the row if BOTH conditions match.
    await db
        .delete(notes)
        .where(
            and(eq(notes.id, id), eq(notes.userId, session.user.id)),
        );
    revalidatePath(PAGE);
}
