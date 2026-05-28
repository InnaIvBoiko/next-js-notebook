// =============================================================================
// app/lessons/server-vs-client/page.tsx
// LESSON: Server vs Client Components — multilingual server entry
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// This file is a SERVER COMPONENT. Its job is now intentionally tiny:
//   1. Pre-render the three demo trees on the server (ServerNow,
//      ClientCounter, ServerFact). Their server-only work (`headers()`,
//      `process.versions`, async simulated fetches) happens HERE.
//   2. Hand those already-rendered trees to <LessonShell> (a Client
//      island) as named slots.
//
// <LessonShell> owns the language state (it / en / uk) and renders the
// localized prose around the pre-rendered server slots.
//
// This IS the pattern the lesson teaches: Server entry → Client island,
// with Server Components passed as children to a Client Component.
// The page itself is a live example of the §4 demonstration below.
//
// 📚 Doc: node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
// =============================================================================

import type { Metadata } from 'next';
import LessonShell from './_components/lesson-shell';
import ServerNow from './_components/server-now';
import ClientCounter from './_components/client-counter';
import ServerFact from './_components/server-fact';

export const metadata: Metadata = {
    title: 'Server vs Client · Living Notebook',
    description:
        'Module 1 · Lesson 1: the Server/Client boundary in React Server Components, demonstrated live.',
};

export default function ServerVsClientPage() {
    // Server-render the three demo trees and pass them down as slots.
    // The Client shell cannot construct these itself — `ServerNow` calls
    // `headers()`, which is a server-only API.
    return (
        <LessonShell
            slots={{
                serverNow: <ServerNow />,
                clientCounter: <ClientCounter />,
                serverFact: <ServerFact />,
            }}
        />
    );
}
