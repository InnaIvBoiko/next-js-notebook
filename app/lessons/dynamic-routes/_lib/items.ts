// =============================================================================
// app/lessons/dynamic-routes/_lib/items.ts
// In-memory "database" for the dynamic-routes lesson.
// -----------------------------------------------------------------------------
// 🧠 Why an in-memory array (and not fetch/Prisma)?
//
// Module 2 covers Server Fetching, Caching, Server Actions. Module 4 covers a
// real ORM. Here, the SUBJECT is the dynamic segment mechanic itself: how the
// URL value `[id]` reaches your code as `params`. Keeping the data source
// trivial (a typed array) removes every confounding variable so the lesson's
// pedagogical surface is exactly one thing: dynamic routing.
//
// 💡 Each item carries its OWN i18n payload so we can render the detail page
//    in the user's chosen language without preempting Module 5's `[locale]`
//    pattern.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

export type ItemTranslation = {
    title: string;
    synopsis: string;
    body: string;
};

export type Item = {
    id: string;
    emoji: string;
    i18n: Record<Lang, ItemTranslation>;
};

export const items: Item[] = [
    {
        id: '1',
        emoji: '🧩',
        i18n: {
            it: {
                title: 'Server Components',
                synopsis:
                    'Componenti che girano solo sul server. Zero JS spedito al browser.',
                body: 'I Server Components vengono renderizzati sul server e serializzati come payload RSC. Il browser riceve markup pronto e zero codice del componente. Ideali per la lettura di dati: tutto resta vicino al database, niente cascade di useEffect.',
            },
            en: {
                title: 'Server Components',
                synopsis:
                    'Components that run only on the server. Zero JS shipped to the browser.',
                body: 'Server Components are rendered on the server and serialized as an RSC payload. The browser receives ready-to-paint markup and zero component code. Perfect for data reads: everything stays close to the database, no useEffect cascades.',
            },
            uk: {
                title: 'Server Components',
                synopsis:
                    'Компоненти, що працюють лише на сервері. Нуль JS у браузері.',
                body: 'Server Components рендеряться на сервері і серіалізуються як RSC payload. Браузер отримує готову до малювання розмітку і нуль коду компонента. Ідеальні для читання даних: усе живе поряд із базою, ніяких каскадів useEffect.',
            },
        },
    },
    {
        id: '2',
        emoji: '⚡',
        i18n: {
            it: {
                title: 'Streaming & Suspense',
                synopsis:
                    'Pezzi di UI che arrivano via streaming man mano che il server li produce.',
                body: 'Avvolgi un componente lento in <Suspense fallback={...}/>: il resto della pagina viene inviato subito, e quando i dati sono pronti il server invia il chunk mancante. Niente più "tutto bloccato perché un componente è lento".',
            },
            en: {
                title: 'Streaming & Suspense',
                synopsis:
                    'Chunks of UI streamed as the server produces them.',
                body: 'Wrap a slow component in <Suspense fallback={...}/>: the rest of the page is sent immediately, and when data is ready the server streams the missing chunk. No more "everything blocks because one component is slow".',
            },
            uk: {
                title: 'Streaming & Suspense',
                synopsis:
                    'Шматки UI стрімляться по мірі їх готовності на сервері.',
                body: 'Обгорни повільний компонент у <Suspense fallback={...}/>: решта сторінки летить одразу, а коли дані готові — сервер дострімить відсутній шматок. Жодного "вся сторінка лежить, бо один компонент повільний".',
            },
        },
    },
    {
        id: '3',
        emoji: '🗺️',
        i18n: {
            it: {
                title: 'App Router',
                synopsis:
                    'Il sistema di routing basato su file e cartelle dentro app/.',
                body: "Ogni cartella sotto app/ può diventare una rotta se contiene page.tsx. I file speciali (layout, loading, error, not-found, route) hanno semantica precisa. È il successore di Pages Router e abilita Server Components nativamente.",
            },
            en: {
                title: 'App Router',
                synopsis:
                    'The file- and folder-based routing system inside app/.',
                body: 'Every folder under app/ can become a route if it contains page.tsx. Special files (layout, loading, error, not-found, route) have precise semantics. It is the successor to Pages Router and supports Server Components natively.',
            },
            uk: {
                title: 'App Router',
                synopsis:
                    'Файлова система маршрутизації всередині app/.',
                body: 'Кожна папка під app/ стає маршрутом, якщо містить page.tsx. Спеціальні файли (layout, loading, error, not-found, route) мають точну семантику. Це наступник Pages Router з нативною підтримкою Server Components.',
            },
        },
    },
    {
        id: '4',
        emoji: '🧪',
        i18n: {
            it: {
                title: 'Hydration',
                synopsis:
                    'Il momento in cui React "anima" il markup statico nel browser.',
                body: "Il server invia HTML pronto (rapido al primo paint). Poi React, sul client, ricollega event handler e stato a quel markup esistente. Quel passaggio si chiama hydration. Solo i componenti 'use client' contribuiscono al bundle di hydration.",
            },
            en: {
                title: 'Hydration',
                synopsis:
                    'The moment React "animates" the static markup in the browser.',
                body: 'The server sends ready-to-paint HTML (fast first paint). Then, on the client, React re-attaches event handlers and state to that existing markup. That step is called hydration. Only "use client" components contribute to the hydration bundle.',
            },
            uk: {
                title: 'Hydration',
                synopsis:
                    'Момент, коли React "оживляє" статичну розмітку в браузері.',
                body: 'Сервер віддає готовий до малювання HTML (швидкий first paint). Потім, у браузері, React під\'єднує обробники подій і стан до вже існуючої розмітки. Цей крок називається hydration. Лише "use client" компоненти потрапляють у hydration-бандл.',
            },
        },
    },
];

// Convenience lookup. Returns undefined if no match — the page uses this to
// decide whether to call `notFound()`.
export function findItem(id: string): Item | undefined {
    return items.find(i => i.id === id);
}
