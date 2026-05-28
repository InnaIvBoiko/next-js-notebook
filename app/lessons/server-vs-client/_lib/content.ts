// =============================================================================
// app/lessons/server-vs-client/_lib/content.ts
// Lesson-local i18n dictionary (3 languages: it / en / uk).
// -----------------------------------------------------------------------------
// Only the LESSON PROSE is localized here. The demos (ServerNow,
// ClientCounter, ServerFact) are Server Components rendered ONCE per request:
// they cannot be re-translated by client-side language switching. Their
// internal text stays in the base language (Italian). Full server-side i18n
// per segment is covered in Module 5 (/advanced-routing) with `app/[lang]/...`.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

export type LessonContent = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        capabilities: {
            heading: string;
            colCapability: string;
            colServer: string;
            colClient: string;
            rows: { capability: string; server: string; client: string }[];
            footer: string;
        };
        sideBySide: {
            heading: string;
            description: string;
        };
        boundary: {
            heading: string;
            description: string;
            footer: string;
        };
        childrenSlot: {
            heading: string;
            description: string;
            cardLabel: string;
            footer: string;
        };
        pitfalls: {
            heading: string;
            items: { title: string; body: string }[];
        };
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    badge: 'Modulo 1 · Lezione 1',
    title: 'Server vs Client Components',
    intro: "In App Router ogni file di componente vive in uno dei due mondi: server o client. Il confine è una stringa — la direttiva 'use client'. Tutto quello che sta sopra il confine non viene mai spedito al browser come JavaScript. Vediamolo dal vivo.",
    sections: {
        capabilities: {
            heading: '1 · Cosa può fare ciascun mondo',
            colCapability: 'Capability',
            colServer: 'Server',
            colClient: 'Client',
            rows: [
                {
                    capability: 'async / await diretto nel componente',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'DB / filesystem / API keys',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'useState · useEffect · useContext',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'onClick / onChange / event handlers',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'window · document · localStorage',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'Riduce il bundle JS spedito al browser',
                    server: '✅',
                    client: '—',
                },
            ],
            footer: 'Regola pratica: default Server, e si passa a Client SOLO quando serve interattività, hook di stato, o una browser API. Mai per "abitudine".',
        },
        sideBySide: {
            heading: '2 · I due mondi affiancati (live)',
            description:
                'A sinistra un Server Component che legge headers e process; a destra un Client Component con useState. Ricarica la pagina più volte: il timestamp di sinistra cambia (re-render del server), quello di destra cambia solo se cambia il pid del browser (hard reload).',
        },
        boundary: {
            heading: '3 · Il confine è una direttiva',
            description:
                "Mettere 'use client' in cima a un file dichiara: \"questo modulo (e tutto ciò che importa) è codice client\". È una frontiera, non un'etichetta sul singolo componente.",
            footer: 'I props passati da Server a Client devono essere serializzabili: stringhe, numeri, oggetti plain, Date, Map, Set, RegExp. NON funzioni, classi, simboli — React non sa come trasferirli attraverso il confine.',
        },
        childrenSlot: {
            heading: '4 · Server dentro Client (via children slot)',
            description:
                "Un Client Component può contenere un Server Component se quest'ultimo gli arriva attraverso lo slot children. A quel punto il Server Component è già stato renderizzato a monte: il Client riceve un albero pronto, non una funzione da invocare.",
            cardLabel:
                'Espandi un Server Component dentro un Client Component',
            footer: 'Apri DevTools → View Source: il testo del "Server fact" è già nell\'HTML iniziale, anche se inizialmente è nascosto. È stato deciso sul server, non nel browser.',
        },
        pitfalls: {
            heading: '5 · Tre errori classici da evitare',
            items: [
                {
                    title: "Mettere 'use client' nel layout root.",
                    body: "Tutto l'albero diventa client → bundle gigante, addio ai vantaggi di RSC. Mantieni client solo le isole interattive.",
                },
                {
                    title: "Importare un Server Component dentro un file 'use client'.",
                    body: 'Diventa client. Per "iniettare" un Server in un Client, passalo via children o named slot.',
                },
                {
                    title: 'Passare funzioni come props attraverso il confine.',
                    body: 'Errore di serializzazione. Per "chiamare il server" da un click handler client si usano le Server Actions (Modulo 2).',
                },
            ],
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    badge: 'Module 1 · Lesson 1',
    title: 'Server vs Client Components',
    intro: "In App Router every component file lives in one of two worlds: server or client. The boundary is a string — the 'use client' directive. Everything above the boundary is never shipped to the browser as JavaScript. Let's see it live.",
    sections: {
        capabilities: {
            heading: '1 · What each world can do',
            colCapability: 'Capability',
            colServer: 'Server',
            colClient: 'Client',
            rows: [
                {
                    capability: 'async / await directly in the component',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'DB / filesystem / API keys',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'useState · useEffect · useContext',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'onClick / onChange / event handlers',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'window · document · localStorage',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'Reduces the JS bundle shipped to the browser',
                    server: '✅',
                    client: '—',
                },
            ],
            footer: 'Rule of thumb: default Server, switch to Client ONLY when you need interactivity, state hooks, or a browser API. Never out of habit.',
        },
        sideBySide: {
            heading: '2 · The two worlds, side by side (live)',
            description:
                'On the left, a Server Component that reads headers and process; on the right, a Client Component with useState. Reload the page a few times: the left timestamp changes (server re-render), the right one only changes on a hard reload.',
        },
        boundary: {
            heading: '3 · The boundary is a directive',
            description:
                'Putting \'use client\' at the top of a file declares: "this module (and everything it imports) is client code". It is a frontier, not a label on a single component.',
            footer: 'Props passed from Server to Client must be serializable: strings, numbers, plain objects, Date, Map, Set, RegExp. NOT functions, classes, symbols — React has no way to ship them across the boundary.',
        },
        childrenSlot: {
            heading: '4 · Server inside Client (via children slot)',
            description:
                'A Client Component CAN contain a Server Component if the latter reaches it through the children slot. At that point the Server Component has already been rendered upstream: the Client receives a ready-made tree, not a function to invoke.',
            cardLabel: 'Expand a Server Component inside a Client Component',
            footer: 'Open DevTools → View Source: the "Server fact" text is already in the initial HTML, even when hidden. It was decided on the server, not in the browser.',
        },
        pitfalls: {
            heading: '5 · Three classic mistakes to avoid',
            items: [
                {
                    title: "Putting 'use client' on the root layout.",
                    body: 'The whole tree becomes client → giant bundle, RSC benefits gone. Keep only the interactive islands client.',
                },
                {
                    title: "Importing a Server Component into a 'use client' file.",
                    body: 'It becomes client. To "inject" a Server into a Client, pass it via children or a named slot.',
                },
                {
                    title: 'Passing functions as props across the boundary.',
                    body: 'Serialization error. To "call the server" from a client click handler use Server Actions (Module 2).',
                },
            ],
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    badge: 'Модуль 1 · Лекція 1',
    title: 'Server vs Client Components',
    intro: "В App Router кожен файл компонента живе в одному з двох світів: server або client. Кордон — це рядок, директива 'use client'. Усе, що знаходиться над кордоном, ніколи не надсилається в браузер як JavaScript. Подивимось у дії.",
    sections: {
        capabilities: {
            heading: '1 · Що вміє кожен світ',
            colCapability: 'Можливість',
            colServer: 'Server',
            colClient: 'Client',
            rows: [
                {
                    capability: 'async / await прямо в компоненті',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'БД / файлова система / API keys',
                    server: '✅',
                    client: '❌',
                },
                {
                    capability: 'useState · useEffect · useContext',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'onClick / onChange / обробники подій',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'window · document · localStorage',
                    server: '❌',
                    client: '✅',
                },
                {
                    capability: 'Зменшує JS-бандл, що йде в браузер',
                    server: '✅',
                    client: '—',
                },
            ],
            footer: 'Правило: за замовчуванням Server, переходимо на Client ЛИШЕ коли потрібна інтерактивність, хуки стану або браузерне API. Ніколи "за звичкою".',
        },
        sideBySide: {
            heading: '2 · Два світи поряд (live)',
            description:
                'Зліва — Server Component, що читає headers і process; справа — Client Component із useState. Перезавантажуй сторінку кілька разів: лівий timestamp змінюється (re-render сервера), правий — лише при hard reload.',
        },
        boundary: {
            heading: '3 · Кордон — це директива',
            description:
                'Поставити \'use client\' зверху файла означає: "цей модуль (і все що він імпортує) — клієнтський код". Це кордон, а не мітка на окремому компоненті.',
            footer: "Props, що передаються з Server у Client, мають бути серіалізовані: рядки, числа, plain об'єкти, Date, Map, Set, RegExp. НЕ функції, не класи, не символи — React не вміє їх переносити через кордон.",
        },
        childrenSlot: {
            heading: '4 · Server всередині Client (через слот children)',
            description:
                'Client Component МОЖЕ містити Server Component, якщо той потрапляє до нього через слот children. На цей момент Server Component вже відрендерений вище за течією: Client отримує готове дерево, а не функцію для виклику.',
            cardLabel: 'Розгорнути Server Component всередині Client Component',
            footer: 'DevTools → View Source: текст "Server fact" уже в початковому HTML, навіть коли прихований. Він був вирішений на сервері, а не в браузері.',
        },
        pitfalls: {
            heading: '5 · Три класичні помилки',
            items: [
                {
                    title: "Ставити 'use client' на root layout.",
                    body: 'Усе дерево стає клієнтським → гігантський бандл, прощавай переваги RSC. Тримай client тільки на інтерактивних островах.',
                },
                {
                    title: "Імпортувати Server Component у файл з 'use client'.",
                    body: 'Він стане client. Щоб "вставити" Server у Client, передай його через children або named slot.',
                },
                {
                    title: 'Передавати функції як props через кордон.',
                    body: "Помилка серіалізації. Щоб «викликати сервер» з click handler'а на клієнті, використовуй Server Actions (Модуль 2).",
                },
            ],
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
