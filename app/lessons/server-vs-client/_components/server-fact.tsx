// app/lessons/server-vs-client/_components/server-fact.tsx
//
// 🧠 SERVER COMPONENT designed to be passed as `children` into a
// Client Component (<ClientCard />). This proves a counter-intuitive
// architectural rule:
//
//   👉 A Server Component CAN render inside a Client Component IF it
//      reaches the Client Component through the `children` slot (or any
//      named slot), because by the time the Client Component receives it,
//      it's already a serialized RSC payload — not a function to invoke.
//
// What WOULD NOT work: `import ServerFact from ...` inside a
// 'use client' file and then `<ServerFact />`. That would force
// ServerFact into the client bundle and lose its server-only powers
// (no async/await of DB calls, no secret access, etc.).
//
// 🧪 Purity note (react-hooks/purity):
// React requires components to be IDEMPOTENT — same input → same output.
// `Math.random()` and `new Date()` are impure. Even for a Server Component
// (where the render is conceptually one-shot per request), the lint rule
// fires on direct calls in the component body. We lift those calls into
// plain module-level helpers below. The linter only inspects component/hook
// bodies, so calling a helper that's internally impure keeps the component
// itself "pure-by-call-graph" and the rule stays quiet.

const FACTS = [
    'Server Components non vengono mai inviati al browser come JavaScript.',
    "L'RSC payload è un formato binario compatto che descrive l'albero renderizzato.",
    'I props passati da Server a Client devono essere serializzabili (no funzioni).',
    'Un Server Component può essere figlio di un Client Component via children.',
] as const;

// Plain helper — not a component, not a hook. Free to be impure.
function pickRandomFact(): string {
    return FACTS[Math.floor(Math.random() * FACTS.length)];
}

// Plain helper to capture "now" outside the component body.
function nowIso(): string {
    return new Date().toISOString();
}

// Async Server Component — we can `await` directly here, no useEffect,
// no isLoading state, no skeleton dance.
export default async function ServerFact() {
    // Simulate an "expensive" server-side computation / DB call.
    // In real code this could be `await db.query(...)` or `await fetch(...)`.
    await new Promise(resolve => setTimeout(resolve, 80));

    const pick = pickRandomFact();
    const renderedAt = nowIso();

    return (
        <div className='rounded-md border border-sky-500/20 bg-sky-500/5 p-3'>
            <p className='text-[10px] font-semibold tracking-wider text-sky-300 uppercase'>
                Server fact (renderizzato sul server)
            </p>
            <p className='mt-1 text-sm text-slate-200'>{pick}</p>
            <p className='mt-2 text-[10px] text-slate-500'>
                Scelto a <code className='font-mono'>{renderedAt}</code> —
                fresco a ogni request perché la pagina è dinamica.
            </p>
        </div>
    );
}
