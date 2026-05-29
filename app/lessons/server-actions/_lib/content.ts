// =============================================================================
// app/lessons/server-actions/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /server-actions + demos.
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type DemoCopy = {
    badge: string;
    title: string;
    description: string;
};

export type LessonContent = {
    index: {
        badge: string;
        title: string;
        intro: string;
        sections: {
            directive: {
                heading: string;
                description: string;
                snippet: string;
            };
            invocation: {
                heading: string;
                description: string;
                formSnippet: string;
                clickSnippet: string;
            };
            invalidation: {
                heading: string;
                description: string;
                snippet: string;
            };
            cookies: {
                heading: string;
                description: string;
                snippet: string;
            };
            security: {
                heading: string;
                description: string;
                postscript: string;
            };
            pendingForward: string;
        };
        demosHeading: string;
        demos: {
            form: { label: string; route: string; description: string };
            programmatic: {
                label: string;
                route: string;
                description: string;
            };
            revalidate: {
                label: string;
                route: string;
                description: string;
            };
        };
    };
    demos: {
        form: DemoCopy & {
            inputPlaceholder: string;
            addLabel: string;
            removeLabel: string;
            listHeading: string;
            takeaway: string;
            backToIndex: string;
        };
        programmatic: DemoCopy & {
            counterLabel: string;
            bumpLabel: string;
            resetLabel: string;
            takeaway: string;
            backToIndex: string;
        };
        revalidate: DemoCopy & {
            inputPlaceholder: string;
            addLabel: string;
            invalidateLabel: string;
            cachedLabel: string;
            uncachedLabel: string;
            cachedHint: string;
            uncachedHint: string;
            takeaway: string;
            backToIndex: string;
        };
    };
};

// -----------------------------------------------------------------------------
// IT — base
// -----------------------------------------------------------------------------
const it: LessonContent = {
    index: {
        badge: 'Modulo 2 · Lezione 3',
        title: 'Server Actions — mutare dati dal Client senza endpoint API',
        intro: 'Server Actions sono funzioni async che girano sul server, ma le chiami dal Client come se fossero funzioni locali. Niente fetch, niente /api routes, niente serializzazione JSON manuale. Next gestisce il round-trip POST sotto al cofano. Sono il modo idiomatico di Next 16 per gestire form, mutazioni e revalidation della cache (la demo promessa nella Lezione 2 arriva qui).',
        sections: {
            directive: {
                heading: "1 · `'use server'` — il direttivo che apre l'endpoint",
                description:
                    "Aggiungi `'use server'` all'inizio di una funzione async (o di un file intero). Quella funzione diventa un endpoint POST: il Client la chiama via network, Next gestisce serializzazione, transito, e re-render della pagina di origine. La funzione deve essere async (perché ogni invocazione è una network call).",
                snippet:
                    "// app/_lib/actions.ts\n'use server';   // ← file-level: ogni export è una Server Action\n\nexport async function addItem(formData: FormData) {\n    const name = formData.get('name');\n    // ... mutate something on the server\n}",
            },
            invocation: {
                heading: '2 · Due modi per invocare',
                description:
                    "Dal Client puoi chiamare una Server Action in due modi: (1) tramite la prop action di un <form> — è il pattern idiomatico, supporta progressive enhancement (funziona anche senza JavaScript caricato). (2) Da un event handler in un Client Component — `await action()` come una normale chiamata async. Il primo è preferibile quando puoi.",
                formSnippet:
                    "// Server Component: zero JS spedito\nimport { addItem } from './actions';\n\nexport default function Page() {\n    return (\n        <form action={addItem}>\n            <input name='name' />\n            <button type='submit'>Add</button>\n        </form>\n    );\n}",
                clickSnippet:
                    "// Client Component: serve onClick + await\n'use client';\nimport { addItem } from './actions';\n\nexport default function Button() {\n    return <button onClick={async () => await addItem(...)}>Add</button>;\n}",
            },
            invalidation: {
                heading: '3 · Dopo la mutazione: invalidare la cache',
                description:
                    "Una Server Action che muta dati DEVE comunicare a Next quali cache invalidare. Tre strumenti, dal più specifico al più ampio: updateTag(tag) (Next 16, solo dalle Actions, immediato — read-your-own-writes), revalidateTag(tag) (anche dai Route Handler, più lento), revalidatePath(path) (invalida tutta la cache della rotta). Per i nostri use case, updateTag è la scelta di default dentro le Actions.",
                snippet:
                    "'use server';\nimport { updateTag } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport async function createPost(formData: FormData) {\n    await db.posts.create({ ... });\n    updateTag('posts');   // ← invalida tutto ciò che era tagged 'posts'\n}",
            },
            cookies: {
                heading: '4 · cookies() restituisce uno store MUTABILE',
                description:
                    'Dentro una Server Action (e SOLO lì), `await cookies()` restituisce uno store mutabile: puoi fare .set() e .delete(). Next gestisce gli header Set-Cookie automaticamente. Subito dopo, Next ri-renderizza la pagina corrente — la nuova lettura via cookies() ricevera il nuovo valore. È il modo idiomatico Next 16 per gestire sessioni, preferenze utente, dark mode, ecc.',
                snippet:
                    "'use server';\nimport { cookies } from 'next/headers';\n\nexport async function setTheme(formData: FormData) {\n    const cookieStore = await cookies();\n    cookieStore.set('theme', formData.get('theme'), { path: '/' });\n    // Next ri-renderizza automaticamente: il prossimo cookies().get('theme')\n    // vede il nuovo valore.\n}",
            },
            security: {
                heading: '5 · ⚠️ Server Actions sono endpoint POST PUBBLICI',
                description:
                    "Una Server Action è un endpoint POST raggiungibile da chiunque sappia che esiste — non solo dal tuo UI. Next deduplicaa il path con un hash della firma della funzione, ma è offuscamento, non sicurezza. In produzione DEVI autenticare e autorizzare DENTRO ogni Action prima di mutare qualsiasi dato.",
                postscript:
                    'La forma minima: chiamare auth() all\'inizio dell\'Action e fare throw se la sessione è nulla. Il pattern completo arriva con Module 4 (auth-setup).',
            },
            pendingForward:
                "Pending state (spinner durante l'attesa, disabilita bottone, useActionState, useFormStatus) è il tema della Lezione 4 — `/lessons/action-pending`. Qui i bottoni restano semplici per mantenere lo scope chiaro.",
        },
        demosHeading: 'Tre demo dal vivo',
        demos: {
            form: {
                label: '<form action={fn}>',
                route: '/lessons/server-actions/form',
                description:
                    'Pattern idiomatico: form HTML con prop action. Aggiungi/rimuovi item dallo store in-memory. revalidatePath ri-renderizza la pagina.',
            },
            programmatic: {
                label: 'onClick + cookies().set()',
                route: '/lessons/server-actions/programmatic',
                description:
                    "Server Action chiamata da onClick. Incrementa un contatore salvato in un cookie. Mostra l'API mutabile di cookies() in Next 16.",
            },
            revalidate: {
                label: 'updateTag + cached vs uncached',
                route: '/lessons/server-actions/revalidate',
                description:
                    'La demo promessa nella Lezione 2. Due liste side-by-side: cached con cacheTag, uncached. Aggiungi un item: solo la uncached si aggiorna. Premi updateTag: la cached recupera.',
            },
        },
    },
    demos: {
        form: {
            badge: 'Demo · /form',
            title: '<form action={addItemAction}>',
            description:
                "Il pattern più puro di Server Action: un form HTML standard con la prop action puntata a una funzione `'use server'`. Niente onClick, niente fetch — Next gestisce il POST round-trip dietro le quinte. Zero JavaScript client necessario per questa form (il rendering della lista usa Suspense; la form è pure markup server-rendered).",
            inputPlaceholder: 'Nome del nuovo item',
            addLabel: 'Aggiungi',
            removeLabel: '×',
            listHeading: 'Items nello store (uncached, fresh)',
            takeaway:
                "Aggiungi 'Linus Torvalds'. La form fa POST a addItemAction, che muta lo store e chiama revalidatePath. Next ri-genera l'HTML della pagina; il browser riceve il nuovo markup e la lista mostra l'item nuovo. Tutto senza una sola riga di useState client. Apri il tab Network: vedrai una sola request POST.",
            backToIndex: '← Indietro alla lezione',
        },
        programmatic: {
            badge: 'Demo · /programmatic',
            title: 'onClick + cookies().set()',
            description:
                "Server Action invocata programmaticamente da un Client Component. Il bottone ha un onClick async che chiama bumpCounterAction(); l'Action incrementa un cookie (usando l'API mutabile di cookies() in Next 16) e ritorna il nuovo valore. Il Client aggiorna useState con il valore ritornato.",
            counterLabel: 'Contatore (memorizzato in cookie nb-counter)',
            bumpLabel: '+1',
            resetLabel: 'Reset',
            takeaway:
                "Clicca +1 tre volte. Ogni click manda una POST al server, il quale: (1) legge il cookie nb-counter, (2) lo incrementa, (3) chiama .set() per scrivere il nuovo valore, (4) ritorna il numero. Il Client riceve la risposta e aggiorna useState. Ricarica la pagina (Cmd+R): il counter mantiene il valore — è memorizzato nel cookie, leggibile dal server al render successivo. Apri DevTools → Application → Cookies per vedere nb-counter.",
            backToIndex: '← Indietro alla lezione',
        },
        revalidate: {
            badge: 'Demo · /revalidate',
            title: 'updateTag — cached vs uncached',
            description:
                'La demo che la Lezione 2 ha promesso. Due liste side-by-side leggono lo stesso store: la sinistra usa getItemsCached() con cacheTag("items"); la destra usa getItemsUncached() senza cache. Aggiungi un item con la form sopra: solo la destra si aggiorna. Premi "Invalida tag items": la sinistra recupera.',
            inputPlaceholder: 'Nome del nuovo item',
            addLabel: 'Aggiungi (senza invalidare cache)',
            invalidateLabel: "Invalida tag 'items' (updateTag)",
            cachedLabel: "CACHED — getItemsCached() con cacheTag('items')",
            uncachedLabel: 'UNCACHED — getItemsUncached()',
            cachedHint:
                "`'use cache'` + cacheTag('items'). Resta stale finché updateTag non scatta.",
            uncachedHint:
                'Nessuna cache. Legge lo store ogni request.',
            takeaway:
                'Sequenza didattica: (1) Aggiungi "Linus Torvalds" con il primo bottone — la card destra mostra 4 item, la sinistra ancora 3 (la sua cache è ancora valida). (2) Premi "Invalida tag" — la sinistra ora mostra 4 item (cache rigenerata, getItemsCached re-eseguito). Guarda il terminale: il log [store] getItemsCached() executed — cache MISS appare solo dopo updateTag.',
            backToIndex: '← Indietro alla lezione',
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 2 · Lesson 3',
        title: 'Server Actions — mutating data from the Client without API endpoints',
        intro: 'Server Actions are async functions that run on the server, but you call them from the Client as if they were local functions. No fetch, no /api routes, no manual JSON serialization. Next handles the POST round-trip under the hood. This is the Next 16 idiomatic way to handle forms, mutations, and cache revalidation (the demo promised in Lesson 2 lives here).',
        sections: {
            directive: {
                heading: "1 · `'use server'` — the directive that opens the endpoint",
                description:
                    "Add `'use server'` at the top of an async function (or an entire file). That function becomes a POST endpoint: the Client calls it via network, Next handles serialization, transit, and re-render of the originating page. The function must be async (every invocation is a network call).",
                snippet:
                    "// app/_lib/actions.ts\n'use server';   // ← file-level: every export is a Server Action\n\nexport async function addItem(formData: FormData) {\n    const name = formData.get('name');\n    // ... mutate something on the server\n}",
            },
            invocation: {
                heading: '2 · Two ways to invoke',
                description:
                    "From the Client you can call a Server Action in two ways: (1) via a <form>'s action prop — the idiomatic pattern, supports progressive enhancement (works even without loaded JavaScript). (2) From an event handler in a Client Component — `await action()` like a regular async call. Prefer the first when you can.",
                formSnippet:
                    "// Server Component: zero JS shipped\nimport { addItem } from './actions';\n\nexport default function Page() {\n    return (\n        <form action={addItem}>\n            <input name='name' />\n            <button type='submit'>Add</button>\n        </form>\n    );\n}",
                clickSnippet:
                    "// Client Component: needs onClick + await\n'use client';\nimport { addItem } from './actions';\n\nexport default function Button() {\n    return <button onClick={async () => await addItem(...)}>Add</button>;\n}",
            },
            invalidation: {
                heading: '3 · After mutation: invalidate the cache',
                description:
                    "A Server Action that mutates data MUST tell Next which caches to invalidate. Three tools, from most specific to broadest: updateTag(tag) (Next 16, Actions only, immediate — read-your-own-writes), revalidateTag(tag) (also from Route Handlers, slower), revalidatePath(path) (invalidates the whole route cache). For our use cases, updateTag is the default choice inside Actions.",
                snippet:
                    "'use server';\nimport { updateTag } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport async function createPost(formData: FormData) {\n    await db.posts.create({ ... });\n    updateTag('posts');   // ← invalidates everything tagged 'posts'\n}",
            },
            cookies: {
                heading: '4 · cookies() returns a MUTABLE store',
                description:
                    "Inside a Server Action (and ONLY there), `await cookies()` returns a mutable store: you can call .set() and .delete(). Next handles Set-Cookie headers automatically. Right after, Next re-renders the current page — the next cookies().get() will see the new value. It is the Next 16 idiomatic way to handle sessions, user preferences, dark mode, etc.",
                snippet:
                    "'use server';\nimport { cookies } from 'next/headers';\n\nexport async function setTheme(formData: FormData) {\n    const cookieStore = await cookies();\n    cookieStore.set('theme', formData.get('theme'), { path: '/' });\n    // Next re-renders automatically: the next cookies().get('theme')\n    // will see the new value.\n}",
            },
            security: {
                heading: '5 · ⚠️ Server Actions are PUBLIC POST endpoints',
                description:
                    'A Server Action is a POST endpoint reachable by anyone who knows it exists — not just your UI. Next obfuscates the path with a hash of the function signature, but that is obfuscation, not security. In production you MUST authenticate and authorize INSIDE every Action before mutating any data.',
                postscript:
                    'Minimal pattern: call auth() at the top of the Action and throw if the session is null. The full pattern arrives in Module 4 (auth-setup).',
            },
            pendingForward:
                'Pending state (spinner while waiting, disable button, useActionState, useFormStatus) is the topic of Lesson 4 — `/lessons/action-pending`. Buttons here stay simple to keep the scope clear.',
        },
        demosHeading: 'Three live demos',
        demos: {
            form: {
                label: '<form action={fn}>',
                route: '/lessons/server-actions/form',
                description:
                    'Idiomatic pattern: HTML form with action prop. Add/remove items from the in-memory store. revalidatePath re-renders the page.',
            },
            programmatic: {
                label: 'onClick + cookies().set()',
                route: '/lessons/server-actions/programmatic',
                description:
                    'Server Action invoked from onClick. Increments a counter stored in a cookie. Showcases the mutable cookies() API in Next 16.',
            },
            revalidate: {
                label: 'updateTag + cached vs uncached',
                route: '/lessons/server-actions/revalidate',
                description:
                    'The demo promised in Lesson 2. Two lists side-by-side: cached with cacheTag, uncached. Add an item: only the uncached updates. Press updateTag: cached catches up.',
            },
        },
    },
    demos: {
        form: {
            badge: 'Demo · /form',
            title: '<form action={addItemAction}>',
            description:
                "The purest Server Action pattern: a standard HTML form whose action prop points at a `'use server'` function. No onClick, no fetch — Next handles the POST round-trip behind the scenes. Zero client JavaScript needed for this form (the list rendering uses Suspense; the form is pure server-rendered markup).",
            inputPlaceholder: 'New item name',
            addLabel: 'Add',
            removeLabel: '×',
            listHeading: 'Items in the store (uncached, fresh)',
            takeaway:
                "Add 'Linus Torvalds'. The form POSTs to addItemAction, which mutates the store and calls revalidatePath. Next regenerates the page HTML; the browser receives the new markup and the list shows the new item. All without a single line of client useState. Open the Network tab: you'll see one POST request.",
            backToIndex: '← Back to the lesson',
        },
        programmatic: {
            badge: 'Demo · /programmatic',
            title: 'onClick + cookies().set()',
            description:
                'Server Action invoked programmatically from a Client Component. The button has an async onClick that calls bumpCounterAction(); the Action increments a cookie (using the mutable cookies() API in Next 16) and returns the new value. The Client updates useState with the returned value.',
            counterLabel: 'Counter (stored in nb-counter cookie)',
            bumpLabel: '+1',
            resetLabel: 'Reset',
            takeaway:
                'Click +1 three times. Each click sends a POST to the server, which: (1) reads nb-counter, (2) increments it, (3) calls .set() to write the new value, (4) returns the number. The Client receives the response and updates useState. Reload the page (Cmd+R): the counter keeps its value — it is in the cookie, readable by the server on the next render. Open DevTools → Application → Cookies to see nb-counter.',
            backToIndex: '← Back to the lesson',
        },
        revalidate: {
            badge: 'Demo · /revalidate',
            title: 'updateTag — cached vs uncached',
            description:
                'The demo Lesson 2 promised. Two lists side-by-side reading the same store: the left uses getItemsCached() with cacheTag("items"); the right uses getItemsUncached() without caching. Add an item with the form above: only the right updates. Press "Invalidate items tag": the left catches up.',
            inputPlaceholder: 'New item name',
            addLabel: 'Add (without invalidating cache)',
            invalidateLabel: "Invalidate 'items' tag (updateTag)",
            cachedLabel: "CACHED — getItemsCached() with cacheTag('items')",
            uncachedLabel: 'UNCACHED — getItemsUncached()',
            cachedHint:
                "`'use cache'` + cacheTag('items'). Stays stale until updateTag fires.",
            uncachedHint: 'No cache. Reads the store every request.',
            takeaway:
                'Pedagogical sequence: (1) Add "Linus Torvalds" with the first button — the right card shows 4 items, the left still 3 (its cache is still valid). (2) Press "Invalidate tag" — the left now shows 4 items (cache regenerated, getItemsCached re-executed). Watch the terminal: the log [store] getItemsCached() executed — cache MISS appears only after updateTag.',
            backToIndex: '← Back to the lesson',
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 2 · Лекція 3',
        title: 'Server Actions — мутація даних із Client без API-endpoint',
        intro: 'Server Actions — це async функції, які виконуються на сервері, але викликаються з Client як локальні. Без fetch, без /api routes, без ручної серіалізації JSON. Next займається POST round-trip під капотом. Це ідіоматичний спосіб Next 16 для форм, мутацій і revalidation кешу (демо, обіцяне в Лекції 2, тут).',
        sections: {
            directive: {
                heading: "1 · `'use server'` — директива, що відкриває endpoint",
                description:
                    "Додай `'use server'` на початок async функції (або всього файлу). Ця функція стає POST endpoint: Client викликає її через мережу, Next займається серіалізацією, передачею і re-render сторінки. Функція має бути async (кожен виклик — мережевий).",
                snippet:
                    "// app/_lib/actions.ts\n'use server';   // ← file-level: усі експорти — Server Actions\n\nexport async function addItem(formData: FormData) {\n    const name = formData.get('name');\n    // ... мутуємо щось на сервері\n}",
            },
            invocation: {
                heading: '2 · Два способи виклику',
                description:
                    "З Client можеш викликати Server Action двома способами: (1) через prop action у <form> — ідіоматичний патерн, підтримує progressive enhancement (працює навіть без завантаженого JS). (2) З event handler у Client Component — `await action()` як звичайний async виклик. Перший — кращий, коли можна.",
                formSnippet:
                    "// Server Component: жодного JS не доставляється\nimport { addItem } from './actions';\n\nexport default function Page() {\n    return (\n        <form action={addItem}>\n            <input name='name' />\n            <button type='submit'>Add</button>\n        </form>\n    );\n}",
                clickSnippet:
                    "// Client Component: треба onClick + await\n'use client';\nimport { addItem } from './actions';\n\nexport default function Button() {\n    return <button onClick={async () => await addItem(...)}>Add</button>;\n}",
            },
            invalidation: {
                heading: '3 · Після мутації: інвалідація кешу',
                description:
                    "Server Action, що мутує дані, ПОВИННА сказати Next, які кеши інвалідувати. Три інструменти, від найточнішого до найширшого: updateTag(tag) (Next 16, лише з Actions, негайно — read-your-own-writes), revalidateTag(tag) (також з Route Handlers, повільніше), revalidatePath(path) (інвалідує весь route cache). Для наших кейсів updateTag — default всередині Actions.",
                snippet:
                    "'use server';\nimport { updateTag } from 'next/cache';\nimport { db } from '@/lib/db';\n\nexport async function createPost(formData: FormData) {\n    await db.posts.create({ ... });\n    updateTag('posts');   // ← інвалідує все, що було tagged 'posts'\n}",
            },
            cookies: {
                heading: '4 · cookies() повертає МУТАБЕЛЬНИЙ store',
                description:
                    "Усередині Server Action (і ЛИШЕ там) `await cookies()` повертає мутабельний store: можна викликати .set() і .delete(). Next автоматично обробляє Set-Cookie заголовки. Одразу після цього Next re-render-ить поточну сторінку — наступний cookies().get() побачить нове значення. Це ідіоматичний спосіб Next 16 для сесій, налаштувань користувача, dark mode тощо.",
                snippet:
                    "'use server';\nimport { cookies } from 'next/headers';\n\nexport async function setTheme(formData: FormData) {\n    const cookieStore = await cookies();\n    cookieStore.set('theme', formData.get('theme'), { path: '/' });\n    // Next re-render-ить автоматично: наступний cookies().get('theme')\n    // побачить нове значення.\n}",
            },
            security: {
                heading: '5 · ⚠️ Server Actions — ПУБЛІЧНІ POST endpoints',
                description:
                    'Server Action — це POST endpoint, доступний будь-кому, хто знає про його існування — не лише твоєму UI. Next обфускує path хешем сигнатури функції, але це обфускація, не безпека. У production ОБОВʼЯЗКОВО автентифікуй і авторизуй ВСЕРЕДИНІ кожної Action перед мутацією будь-яких даних.',
                postscript:
                    'Мінімальний патерн: виклич auth() на початку Action і throw, якщо session — null. Повний патерн — у Модулі 4 (auth-setup).',
            },
            pendingForward:
                'Pending state (spinner під час очікування, disable кнопки, useActionState, useFormStatus) — тема Лекції 4 — `/lessons/action-pending`. Тут кнопки прості для збереження чіткого scope.',
        },
        demosHeading: 'Три живі демо',
        demos: {
            form: {
                label: '<form action={fn}>',
                route: '/lessons/server-actions/form',
                description:
                    'Ідіоматичний патерн: HTML form з prop action. Додавай/видаляй items зі store. revalidatePath re-render сторінку.',
            },
            programmatic: {
                label: 'onClick + cookies().set()',
                route: '/lessons/server-actions/programmatic',
                description:
                    'Server Action викликана з onClick. Інкрементує лічильник у cookie. Показує мутабельний API cookies() у Next 16.',
            },
            revalidate: {
                label: 'updateTag + cached vs uncached',
                route: '/lessons/server-actions/revalidate',
                description:
                    "Демо, обіцяне у Лекції 2. Два списки side-by-side: cached з cacheTag, uncached. Додай item: оновиться лише uncached. Натисни updateTag: cached доганяє.",
            },
        },
    },
    demos: {
        form: {
            badge: 'Demo · /form',
            title: '<form action={addItemAction}>',
            description:
                "Найчистіший патерн Server Action: стандартна HTML form з prop action, що вказує на `'use server'` функцію. Жодного onClick, жодного fetch — Next займається POST round-trip за лаштунками. Жодного клієнтського JavaScript для цієї форми (рендеринг списку через Suspense; форма — чистий server-rendered markup).",
            inputPlaceholder: "Назва нового item",
            addLabel: 'Додати',
            removeLabel: '×',
            listHeading: 'Items у store (uncached, fresh)',
            takeaway:
                "Додай 'Linus Torvalds'. Форма робить POST до addItemAction, який мутує store і викликає revalidatePath. Next регенерує HTML; браузер отримує новий markup і список показує новий item. Усе без жодного useState. Відкрий вкладку Network: побачиш один POST.",
            backToIndex: '← Назад до лекції',
        },
        programmatic: {
            badge: 'Demo · /programmatic',
            title: 'onClick + cookies().set()',
            description:
                'Server Action викликана програмно з Client Component. У кнопки async onClick, який викликає bumpCounterAction(); Action інкрементує cookie (через мутабельний API cookies() у Next 16) і повертає нове значення. Client оновлює useState з результатом.',
            counterLabel: 'Лічильник (зберігається у nb-counter cookie)',
            bumpLabel: '+1',
            resetLabel: 'Reset',
            takeaway:
                'Натисни +1 три рази. Кожен клік шле POST на сервер, який: (1) читає nb-counter, (2) інкрементує, (3) викликає .set() для запису нового значення, (4) повертає число. Client отримує відповідь і оновлює useState. Перезавантаж (Cmd+R): лічильник зберігає значення — воно у cookie, читається сервером на наступному рендері. Відкрий DevTools → Application → Cookies — побачиш nb-counter.',
            backToIndex: '← Назад до лекції',
        },
        revalidate: {
            badge: 'Demo · /revalidate',
            title: 'updateTag — cached vs uncached',
            description:
                'Демо, обіцяне у Лекції 2. Два списки side-by-side читають той самий store: лівий через getItemsCached() з cacheTag("items"); правий через getItemsUncached() без кешу. Додай item формою вгорі: оновиться лише правий. Натисни "Invalidate items tag": лівий доганяє.',
            inputPlaceholder: "Назва нового item",
            addLabel: 'Додати (без інвалідації кешу)',
            invalidateLabel: "Інвалідувати tag 'items' (updateTag)",
            cachedLabel: "CACHED — getItemsCached() з cacheTag('items')",
            uncachedLabel: 'UNCACHED — getItemsUncached()',
            cachedHint:
                "`'use cache'` + cacheTag('items'). Залишається stale до updateTag.",
            uncachedHint: 'Без кешу. Читає store на кожен request.',
            takeaway:
                'Послідовність: (1) Додай "Linus Torvalds" першою кнопкою — права картка показує 4 item-и, ліва ще 3 (її кеш ще валідний). (2) Натисни "Invalidate tag" — ліва тепер показує 4 (кеш регенеровано, getItemsCached перевиконано). Дивись у термінал: лог [store] getItemsCached() executed — cache MISS зʼявляється лише після updateTag.',
            backToIndex: '← Назад до лекції',
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
