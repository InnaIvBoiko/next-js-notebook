// =============================================================================
// app/api/notes/_store.ts
// In-memory store backing the /api/notes CRUD demo of Module 4 · Lesson 1.
// -----------------------------------------------------------------------------
// 🧠 Why a leading underscore
// `_store.ts` is inside `app/`, so Next would WANT to treat any file in there
// as a route. The leading underscore makes the WHOLE folder/file PRIVATE —
// excluded from the route system. We use that to colocate helpers next to the
// endpoints that depend on them.
//
// ⚠️ Module-scoped mutable state
// On a single Node process (dev or a single Vercel function instance) this
// behaves like an ephemeral DB. Across worker processes / serverless instances
// the state would NOT be shared — there's nothing fancy here, just an array.
// For a real app: replace with Postgres / Drizzle in /database-orm (Mod 4·L2).
// =============================================================================

export type Note = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
};

const SEED: Note[] = [
    {
        id: 'n1',
        title: 'Route Handlers run on the server',
        body: 'They have full Node access — fs, db drivers, secrets.',
        createdAt: new Date(2026, 4, 1, 9, 0).toISOString(),
    },
    {
        id: 'n2',
        title: 'GET is dynamic by default in Next 15+',
        body: "Opt into caching with `'use cache'` (Cache Components) or `revalidate` (classic).",
        createdAt: new Date(2026, 4, 1, 10, 30).toISOString(),
    },
    {
        id: 'n3',
        title: 'Unsupported verbs auto-respond 405',
        body: "If you don't export DELETE, calling DELETE returns 405 Method Not Allowed with the right `Allow:` header.",
        createdAt: new Date(2026, 4, 1, 11, 15).toISOString(),
    },
];

let notes: Note[] = SEED.map(n => ({ ...n }));

// Crypto-quality not needed — a teaching demo. `crypto.randomUUID()` exists
// in Node 19+ and in the edge runtime, so it's always available here.
function genId(): string {
    return 'n_' + crypto.randomUUID().slice(0, 8);
}

export function listNotes(): Note[] {
    return notes.slice();
}

export function getNote(id: string): Note | undefined {
    return notes.find(n => n.id === id);
}

export function createNote(input: { title: string; body: string }): Note {
    const note: Note = {
        id: genId(),
        title: input.title,
        body: input.body,
        createdAt: new Date().toISOString(),
    };
    notes = [note, ...notes];
    return note;
}

export function updateNote(
    id: string,
    patch: { title?: string; body?: string },
): Note | undefined {
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return undefined;
    const next: Note = {
        ...notes[idx],
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.body !== undefined ? { body: patch.body } : {}),
    };
    notes = [...notes.slice(0, idx), next, ...notes.slice(idx + 1)];
    return next;
}

export function deleteNote(id: string): boolean {
    const before = notes.length;
    notes = notes.filter(n => n.id !== id);
    return notes.length !== before;
}

export function resetNotes(): Note[] {
    notes = SEED.map(n => ({ ...n }));
    return notes.slice();
}
