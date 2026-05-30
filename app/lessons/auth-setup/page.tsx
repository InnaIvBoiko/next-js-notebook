// =============================================================================
// app/lessons/auth-setup/page.tsx
// SERVER entry for /lessons/auth-setup — Module 4 · Lesson 3.
// -----------------------------------------------------------------------------
// 🧠 Top-level Suspense + async wrapper (same pattern as Lesson 2)
//
// Under Cache Components, calling `auth()` reads cookies — request-time data.
// That makes the page implicitly dynamic. Wrapping the whole tree in a single
// Suspense + `await connection()` is the documented escape hatch we already
// use in /lessons/database-orm.
//
// Inside the wrapper we resolve the session ONCE (`await auth()`) and pass
// derived shapes (signed-in flag, owned notes, etc.) into Client islands as
// props. The labs themselves are JSX trees rendered server-side and handed
// to <IndexView /> via prop slots.
// =============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { auth } from '../../../auth';
import { db, dbReady } from '../../_db/client';
import { notes } from '../../_db/schema';
import CredentialsForms from './_components/credentials-forms';
import GitHubButton from './_components/github-button';
import IndexView from './_components/index-view';
import MyNotesLab from './_components/my-notes-lab';
import ProtectedApiTest from './_components/protected-api-test';
import SessionDisplay from './_components/session-display';

export const metadata: Metadata = {
    title: 'Auth.js · Living Notebook',
    description:
        'Module 4 · Lesson 3: Auth.js v5 split-config pattern, Credentials + GitHub OAuth, mixed JWT/database sessions via Drizzle adapter, and 4-checkpoint protection (RSC, Server Action, Route Handler, middleware).',
};

export default function AuthSetupPage() {
    return (
        <Suspense fallback={<LessonSkeleton />}>
            <PageContent />
        </Suspense>
    );
}

async function PageContent() {
    // Escape hatch: makes Next treat this branch as request-time. Same
    // rationale as in /lessons/database-orm — `auth()` plus the TanStack
    // QueryClient internals touch non-deterministic APIs that would
    // otherwise break the strict prerender.
    await connection();

    const session = await auth();
    const isSignedIn = !!session?.user?.id;

    // Fetch owned notes ONCE here, then hand them to the protected mini-CRUD
    // as a prop. The Server Action `createMyNoteAction` will revalidatePath
    // this route, so the list re-renders after each mutation.
    let ownedNotes: Array<{
        id: number;
        title: string;
        body: string;
        createdAt: Date;
    }> = [];
    if (isSignedIn) {
        await dbReady;
        ownedNotes = await db
            .select({
                id: notes.id,
                title: notes.title,
                body: notes.body,
                createdAt: notes.createdAt,
            })
            .from(notes)
            .where(eq(notes.userId, session.user!.id!))
            .orderBy(desc(notes.createdAt));
    }

    // Are the GitHub env vars present? Avoid leaking the secret itself —
    // we just check existence to decide whether to enable the button.
    const githubConfigured =
        Boolean(process.env.AUTH_GITHUB_ID) &&
        Boolean(process.env.AUTH_GITHUB_SECRET);

    return (
        <IndexView
            sessionDisplay={<SessionDisplay session={session} />}
            credentialsForms={<CredentialsForms isSignedIn={isSignedIn} />}
            githubButton={
                <GitHubButton
                    isSignedIn={isSignedIn}
                    configured={githubConfigured}
                />
            }
            myNotes={
                <MyNotesLab
                    isSignedIn={isSignedIn}
                    notes={ownedNotes.map(n => ({
                        ...n,
                        createdAt: n.createdAt.toISOString(),
                    }))}
                />
            }
            apiTest={<ProtectedApiTest />}
        />
    );
}

function LessonSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='h-7 w-32 animate-pulse rounded-full bg-slate-800/60' />
            <div className='h-10 w-2/3 animate-pulse rounded bg-slate-800/60' />
            <div className='h-4 w-full animate-pulse rounded bg-slate-800/40' />
            <div className='h-4 w-5/6 animate-pulse rounded bg-slate-800/40' />
        </div>
    );
}
