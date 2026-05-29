// =============================================================================
// app/lessons/action-pending/_lib/content.ts
// Lesson-local i18n dictionary (it / en / uk) for /action-pending + demos.
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
            useActionState: {
                heading: string;
                description: string;
                snippet: string;
            };
            useFormStatus: {
                heading: string;
                description: string;
                snippet: string;
            };
            useOptimistic: {
                heading: string;
                description: string;
                snippet: string;
            };
            whichOne: {
                heading: string;
                description: string;
                bulletActionState: string;
                bulletFormStatus: string;
                bulletOptimistic: string;
            };
        };
        demosHeading: string;
        demos: {
            actionState: { label: string; route: string; description: string };
            formStatus: { label: string; route: string; description: string };
            optimistic: { label: string; route: string; description: string };
        };
    };
    demos: {
        actionState: DemoCopy & {
            namePlaceholder: string;
            submitLabel: string;
            submittingLabel: string;
            messages: {
                success: string;
                errorEmpty: string;
                errorDuplicate: string;
            };
            subscribersHeading: string;
            removeLabel: string;
            takeaway: string;
            backToIndex: string;
        };
        formStatus: DemoCopy & {
            namePlaceholder: string;
            idleLabel: string;
            pendingLabel: string;
            subscribersHeading: string;
            removeLabel: string;
            takeaway: string;
            backToIndex: string;
        };
        optimistic: DemoCopy & {
            namePlaceholder: string;
            submitLabel: string;
            pendingTag: string;
            subscribersHeading: string;
            removeLabel: string;
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
        badge: 'Modulo 2 · Lezione 4',
        title: 'Pending UI — useActionState, useFormStatus, useOptimistic',
        intro: 'La Lezione 3 ha mostrato il mecanismo: form action → Server Action → revalidation. Mancava un pezzo: cosa mostra il Client mentre la Server Action sta girando? Sentirsi "rotti" per un secondo è un bug UX. React 19 espone tre hook complementari per gestire questo intervallo, ciascuno con un caso d\'uso preciso.',
        sections: {
            useActionState: {
                heading: '1 · useActionState — pending + state ritornato',
                description:
                    "useActionState(action, initialState) wrappa una Server Action e restituisce [state, formAction, pending]. La signature della Action cambia: il primo argomento diventa lo state precedente; il secondo è la FormData. Lo state ritornato è perfetto per validation errors, success messages, o qualsiasi feedback strutturato.",
                snippet:
                    "'use client';\nimport { useActionState } from 'react';\nimport { signupAction } from './actions';\n\nexport function SignupForm() {\n    const [state, formAction, pending] = useActionState(\n        signupAction,\n        { ok: false, message: '' }\n    );\n    return (\n        <form action={formAction}>\n            <input name='name' required />\n            <button disabled={pending}>\n                {pending ? 'Saving…' : 'Sign up'}\n            </button>\n            {state.message && <p>{state.message}</p>}\n        </form>\n    );\n}",
            },
            useFormStatus: {
                heading: '2 · useFormStatus — il figlio legge il padre',
                description:
                    "useFormStatus() vive in un Client Component FIGLIO di un form e legge lo stato di quel form (pending, data, method, action). Pattern: un SubmitButton riutilizzabile che si auto-disabilita. Importante: è esportato da react-dom, NON da react (il form è un concetto DOM).",
                snippet:
                    "// submit-button.tsx — figlio del form\n'use client';\nimport { useFormStatus } from 'react-dom';\n\nexport function SubmitButton() {\n    const { pending } = useFormStatus();\n    return (\n        <button disabled={pending} type='submit'>\n            {pending ? 'Saving…' : 'Subscribe'}\n        </button>\n    );\n}\n\n// page.tsx — il form può restare Server\nimport { slowSubscribeAction } from './actions';\nimport { SubmitButton } from './submit-button';\n\nexport default function Page() {\n    return (\n        <form action={slowSubscribeAction}>\n            <input name='name' />\n            <SubmitButton />\n        </form>\n    );\n}",
            },
            useOptimistic: {
                heading: '3 · useOptimistic — UI istantanea',
                description:
                    "useOptimistic(state, updater) ti permette di aggiornare la UI PRIMA che la Server Action torni. Mostri il valore ottimistico immediatamente; quando la Action completa e refresh() rigenera lo state reale, useOptimistic torna a leggere quello. Se la Action fallisce, la UI torna allo state precedente automaticamente. È il modo idiomatico per far sentire le mutazioni 'istantanee' anche con server lenti.",
                snippet:
                    "'use client';\nimport { useOptimistic } from 'react';\nimport { subscribe } from './actions';\n\nexport function OptimisticList({ items }: { items: string[] }) {\n    const [optimistic, addOptimistic] = useOptimistic(\n        items,\n        (state, newName: string) => [...state, newName]\n    );\n\n    async function formAction(formData: FormData) {\n        const name = String(formData.get('name'));\n        addOptimistic(name);    // ← UI aggiornata SUBITO\n        await subscribe(formData);   // server (lento)\n    }\n\n    return (\n        <>\n            <ul>{optimistic.map(n => <li key={n}>{n}</li>)}</ul>\n            <form action={formAction}>\n                <input name='name' />\n                <button>Send</button>\n            </form>\n        </>\n    );\n}",
            },
            whichOne: {
                heading: '4 · Quale usare quando?',
                description:
                    'I tre hook coprono casi diversi. Scegli in base a cosa ti serve:',
                bulletActionState:
                    "useActionState — quando vuoi sia pending state SIA un valore strutturato di ritorno dalla Action (validation errors, success message, dati derivati). È il più completo.",
                bulletFormStatus:
                    "useFormStatus — quando ti basta sapere SE il form sta inviando, e vuoi un componente FIGLIO riutilizzabile che reagisca (es. SubmitButton in una libreria UI). Non serve cablare props.",
                bulletOptimistic:
                    "useOptimistic — quando l'attesa server-side è troppo lunga per essere sopportata e vuoi aggiornare la UI immediatamente (chat, like, add-to-cart, qualsiasi cosa con feedback visivo importante).",
            },
        },
        demosHeading: 'Tre demo dal vivo',
        demos: {
            actionState: {
                label: 'useActionState + validation',
                route: '/lessons/action-pending/use-action-state',
                description:
                    'Form di iscrizione. Server valida (no nomi vuoti, no duplicati) e ritorna state. pending disabilita il bottone, error/success messages vengono dalla Action.',
            },
            formStatus: {
                label: 'useFormStatus child component',
                route: '/lessons/action-pending/use-form-status',
                description:
                    'Form server-rendered con un SubmitButton riutilizzabile (Client) che legge useFormStatus(). Si auto-disabilita durante il submit.',
            },
            optimistic: {
                label: 'useOptimistic — UI istantanea',
                route: '/lessons/action-pending/use-optimistic',
                description:
                    "Aggiungi un nome: appare SUBITO con tag 'pending' (italic), poi la Action torna (~1s) e l'item diventa committed (normale). Velocità percepita = istantanea.",
            },
        },
    },
    demos: {
        actionState: {
            badge: 'Demo · /use-action-state',
            title: 'useActionState — pending + returned state',
            description:
                "Form di iscrizione con validation server-side. useActionState avvolge signupAction; durante il submit il bottone si disabilita (pending=true). Quando l'Action torna, lo state restituito viene mostrato — o success message, o error message (nome vuoto, duplicato). Server delay artificiale di 1s per rendere il pending visibile.",
            namePlaceholder: 'Il tuo nome',
            submitLabel: 'Iscriviti',
            submittingLabel: 'Iscrivendo…',
            messages: {
                success: '✅ Benvenuto/a, {name}!',
                errorEmpty: '⚠️ Il nome non può essere vuoto.',
                errorDuplicate: '⚠️ {name} è già iscritto/a.',
            },
            subscribersHeading: 'Iscritti (server-side fresh)',
            removeLabel: '×',
            takeaway:
                'Prova: (1) Click Iscriviti con campo vuoto → vedi messaggio errore dopo 1s. (2) Inserisci un nome già presente → errore "già iscritto/a". (3) Nome nuovo → success message + lista aggiornata. Il bottone resta disabilitato durante l\'attesa — niente double-submit possibile.',
            backToIndex: '← Indietro alla lezione',
        },
        formStatus: {
            badge: 'Demo · /use-form-status',
            title: 'useFormStatus — figlio legge padre',
            description:
                "Il form è server-rendered (in questa Server Component page). Il SubmitButton invece è un Client Component figlio che chiama useFormStatus() — legge automaticamente lo stato del form più vicino. Pattern utile per librerie UI: SubmitButton riusabile in qualsiasi <form>, niente props da passare.",
            namePlaceholder: 'Nuovo iscritto',
            idleLabel: 'Aggiungi',
            pendingLabel: 'Salvando…',
            subscribersHeading: 'Iscritti',
            removeLabel: '×',
            takeaway:
                'Compila e premi Aggiungi: il bottone diventa "Salvando…" e si disabilita per ~1s. Il form è server, il SubmitButton è client — il loro accoppiamento avviene via il Context implicito che React crea per ogni <form>.',
            backToIndex: '← Indietro alla lezione',
        },
        optimistic: {
            badge: 'Demo · /use-optimistic',
            title: 'useOptimistic — UI istantanea',
            description:
                'Aggiungi un nome: appare IMMEDIATAMENTE nella lista, marcato come "pending" (in italic). Server lento ~1s. Quando la Action completa e refresh() rigenera lo state reale, useOptimistic torna a leggere quello e l\'item passa da pending a committed. Se la Action fallisse, l\'item ottimistico sparirebbe automaticamente.',
            namePlaceholder: 'Aggiungi nome',
            submitLabel: 'Aggiungi',
            pendingTag: 'in attesa…',
            subscribersHeading: 'Iscritti (con stato ottimistico)',
            removeLabel: '×',
            takeaway:
                "Apri DevTools → Network e throttling a 'Slow 3G'. Aggiungi un nome: appare subito con la tag '(in attesa…)'. Dopo che la richiesta completa, la tag sparisce — useOptimistic ha letto il nuovo state reale. Questo è quello che Twitter/X fa quando posti un tweet: appare istantaneo, anche se in background sta facendo il round-trip.",
            backToIndex: '← Indietro alla lezione',
        },
    },
};

// -----------------------------------------------------------------------------
// EN — translation
// -----------------------------------------------------------------------------
const en: LessonContent = {
    index: {
        badge: 'Module 2 · Lesson 4',
        title: 'Pending UI — useActionState, useFormStatus, useOptimistic',
        intro: 'Lesson 3 showed the mechanism: form action → Server Action → revalidation. One piece was missing: what does the Client show while the Server Action is running? Looking "broken" for a second is a UX bug. React 19 exposes three complementary hooks for handling this interval, each with a specific use case.',
        sections: {
            useActionState: {
                heading: '1 · useActionState — pending + returned state',
                description:
                    'useActionState(action, initialState) wraps a Server Action and returns [state, formAction, pending]. The Action signature changes: the first argument becomes the previous state; the second is FormData. The returned state is perfect for validation errors, success messages, or any structured feedback.',
                snippet:
                    "'use client';\nimport { useActionState } from 'react';\nimport { signupAction } from './actions';\n\nexport function SignupForm() {\n    const [state, formAction, pending] = useActionState(\n        signupAction,\n        { ok: false, message: '' }\n    );\n    return (\n        <form action={formAction}>\n            <input name='name' required />\n            <button disabled={pending}>\n                {pending ? 'Saving…' : 'Sign up'}\n            </button>\n            {state.message && <p>{state.message}</p>}\n        </form>\n    );\n}",
            },
            useFormStatus: {
                heading: '2 · useFormStatus — child reads parent',
                description:
                    'useFormStatus() lives in a Client Component CHILD of a form and reads that form\'s state (pending, data, method, action). Pattern: a reusable SubmitButton that auto-disables. Important: it is exported from react-dom, NOT from react (the form is a DOM concept).',
                snippet:
                    "// submit-button.tsx — child of the form\n'use client';\nimport { useFormStatus } from 'react-dom';\n\nexport function SubmitButton() {\n    const { pending } = useFormStatus();\n    return (\n        <button disabled={pending} type='submit'>\n            {pending ? 'Saving…' : 'Subscribe'}\n        </button>\n    );\n}\n\n// page.tsx — the form can stay Server\nimport { slowSubscribeAction } from './actions';\nimport { SubmitButton } from './submit-button';\n\nexport default function Page() {\n    return (\n        <form action={slowSubscribeAction}>\n            <input name='name' />\n            <SubmitButton />\n        </form>\n    );\n}",
            },
            useOptimistic: {
                heading: '3 · useOptimistic — instant UI',
                description:
                    "useOptimistic(state, updater) lets you update the UI BEFORE the Server Action returns. You show the optimistic value immediately; when the Action completes and refresh() regenerates the real state, useOptimistic switches back to reading that. If the Action fails, the UI reverts automatically. It is the idiomatic way to make mutations feel 'instant' even with slow servers.",
                snippet:
                    "'use client';\nimport { useOptimistic } from 'react';\nimport { subscribe } from './actions';\n\nexport function OptimisticList({ items }: { items: string[] }) {\n    const [optimistic, addOptimistic] = useOptimistic(\n        items,\n        (state, newName: string) => [...state, newName]\n    );\n\n    async function formAction(formData: FormData) {\n        const name = String(formData.get('name'));\n        addOptimistic(name);    // ← UI updates IMMEDIATELY\n        await subscribe(formData);   // server (slow)\n    }\n\n    return (\n        <>\n            <ul>{optimistic.map(n => <li key={n}>{n}</li>)}</ul>\n            <form action={formAction}>\n                <input name='name' />\n                <button>Send</button>\n            </form>\n        </>\n    );\n}",
            },
            whichOne: {
                heading: '4 · Which one to use when?',
                description:
                    'The three hooks cover different cases. Pick based on what you need:',
                bulletActionState:
                    'useActionState — when you want BOTH pending state AND a structured return value from the Action (validation errors, success message, derived data). The most complete.',
                bulletFormStatus:
                    'useFormStatus — when you only need to know IF the form is submitting, and you want a reusable CHILD component to react (e.g. SubmitButton in a UI library). No props to wire.',
                bulletOptimistic:
                    'useOptimistic — when the server-side wait is too long to tolerate and you want to update the UI immediately (chat, likes, add-to-cart, anything with important visual feedback).',
            },
        },
        demosHeading: 'Three live demos',
        demos: {
            actionState: {
                label: 'useActionState + validation',
                route: '/lessons/action-pending/use-action-state',
                description:
                    'Sign-up form. Server validates (no empty, no duplicates) and returns state. pending disables the button, error/success messages come from the Action.',
            },
            formStatus: {
                label: 'useFormStatus child component',
                route: '/lessons/action-pending/use-form-status',
                description:
                    'Server-rendered form with a reusable SubmitButton (Client) reading useFormStatus(). Auto-disables during submit.',
            },
            optimistic: {
                label: 'useOptimistic — instant UI',
                route: '/lessons/action-pending/use-optimistic',
                description:
                    "Add a name: appears INSTANTLY with a 'pending' tag (italic). Action returns (~1s); item becomes committed (normal style). Perceived speed = instant.",
            },
        },
    },
    demos: {
        actionState: {
            badge: 'Demo · /use-action-state',
            title: 'useActionState — pending + returned state',
            description:
                'Sign-up form with server-side validation. useActionState wraps signupAction; during submit the button disables (pending=true). When the Action returns, the returned state is rendered — either a success message or an error (empty name, duplicate). Artificial 1s server delay so pending is visible.',
            namePlaceholder: 'Your name',
            submitLabel: 'Sign up',
            submittingLabel: 'Signing up…',
            messages: {
                success: '✅ Welcome, {name}!',
                errorEmpty: '⚠️ Name cannot be empty.',
                errorDuplicate: '⚠️ {name} is already subscribed.',
            },
            subscribersHeading: 'Subscribers (server-side fresh)',
            removeLabel: '×',
            takeaway:
                'Try: (1) Click Sign up with empty field → error message after 1s. (2) Enter a name that already exists → "already subscribed" error. (3) Brand new name → success message + list updates. The button stays disabled during the wait — no double-submit possible.',
            backToIndex: '← Back to the lesson',
        },
        formStatus: {
            badge: 'Demo · /use-form-status',
            title: 'useFormStatus — child reads parent',
            description:
                'The form is server-rendered (in this Server Component page). The SubmitButton is a Client Component child that calls useFormStatus() — it automatically reads the closest form\'s state. Useful pattern for UI libraries: reusable SubmitButton in any <form>, no props to pass.',
            namePlaceholder: 'New subscriber',
            idleLabel: 'Add',
            pendingLabel: 'Saving…',
            subscribersHeading: 'Subscribers',
            removeLabel: '×',
            takeaway:
                'Fill in and press Add: the button becomes "Saving…" and disables for ~1s. The form is server, the SubmitButton is client — their coupling happens via the implicit Context React creates for every <form>.',
            backToIndex: '← Back to the lesson',
        },
        optimistic: {
            badge: 'Demo · /use-optimistic',
            title: 'useOptimistic — instant UI',
            description:
                'Add a name: it appears IMMEDIATELY in the list, marked as "pending" (italic). Slow server ~1s. When the Action completes and refresh() regenerates the real state, useOptimistic switches back to it and the item moves from pending to committed. If the Action failed, the optimistic item would disappear automatically.',
            namePlaceholder: 'Add name',
            submitLabel: 'Add',
            pendingTag: 'pending…',
            subscribersHeading: 'Subscribers (with optimistic state)',
            removeLabel: '×',
            takeaway:
                "Open DevTools → Network and throttle to 'Slow 3G'. Add a name: it appears instantly with the '(pending…)' tag. Once the request completes, the tag disappears — useOptimistic now reads the real state. This is what Twitter/X does when you post a tweet: it feels instant, even though the round-trip is happening in the background.",
            backToIndex: '← Back to the lesson',
        },
    },
};

// -----------------------------------------------------------------------------
// UK — translation
// -----------------------------------------------------------------------------
const uk: LessonContent = {
    index: {
        badge: 'Модуль 2 · Лекція 4',
        title: 'Pending UI — useActionState, useFormStatus, useOptimistic',
        intro: 'Лекція 3 показала механізм: form action → Server Action → revalidation. Бракувало шматка: що показує Client поки Server Action виконується? "Зламаний" вигляд протягом секунди — це UX баг. React 19 надає три комплементарні хуки для цього інтервалу, кожен зі своїм точним кейсом.',
        sections: {
            useActionState: {
                heading: '1 · useActionState — pending + повернутий state',
                description:
                    'useActionState(action, initialState) обгортає Server Action і повертає [state, formAction, pending]. Сигнатура Action змінюється: перший аргумент стає попереднім state, другий — FormData. Повернутий state ідеальний для validation errors, success messages, чи будь-якого структурованого фідбеку.',
                snippet:
                    "'use client';\nimport { useActionState } from 'react';\nimport { signupAction } from './actions';\n\nexport function SignupForm() {\n    const [state, formAction, pending] = useActionState(\n        signupAction,\n        { ok: false, message: '' }\n    );\n    return (\n        <form action={formAction}>\n            <input name='name' required />\n            <button disabled={pending}>\n                {pending ? 'Saving…' : 'Sign up'}\n            </button>\n            {state.message && <p>{state.message}</p>}\n        </form>\n    );\n}",
            },
            useFormStatus: {
                heading: '2 · useFormStatus — дитина читає батька',
                description:
                    'useFormStatus() живе у Client Component ДИТИНІ форми і читає її стан (pending, data, method, action). Патерн: SubmitButton, який сам себе вимикає. Важливо: експортується з react-dom, НЕ з react (form — це DOM концепт).',
                snippet:
                    "// submit-button.tsx — дитина форми\n'use client';\nimport { useFormStatus } from 'react-dom';\n\nexport function SubmitButton() {\n    const { pending } = useFormStatus();\n    return (\n        <button disabled={pending} type='submit'>\n            {pending ? 'Saving…' : 'Subscribe'}\n        </button>\n    );\n}\n\n// page.tsx — форма може лишатися Server\nimport { slowSubscribeAction } from './actions';\nimport { SubmitButton } from './submit-button';\n\nexport default function Page() {\n    return (\n        <form action={slowSubscribeAction}>\n            <input name='name' />\n            <SubmitButton />\n        </form>\n    );\n}",
            },
            useOptimistic: {
                heading: '3 · useOptimistic — миттєвий UI',
                description:
                    'useOptimistic(state, updater) дозволяє оновити UI ДО того, як Server Action повернеться. Ти показуєш optimistic value одразу; коли Action завершується і refresh() регенерує реальний state, useOptimistic перемикається на нього. Якщо Action провалюється — UI повертається назад автоматично. Ідіоматичний спосіб зробити мутації "миттєвими" навіть з повільним сервером.',
                snippet:
                    "'use client';\nimport { useOptimistic } from 'react';\nimport { subscribe } from './actions';\n\nexport function OptimisticList({ items }: { items: string[] }) {\n    const [optimistic, addOptimistic] = useOptimistic(\n        items,\n        (state, newName: string) => [...state, newName]\n    );\n\n    async function formAction(formData: FormData) {\n        const name = String(formData.get('name'));\n        addOptimistic(name);    // ← UI оновлюється ОДРАЗУ\n        await subscribe(formData);   // server (повільно)\n    }\n\n    return (\n        <>\n            <ul>{optimistic.map(n => <li key={n}>{n}</li>)}</ul>\n            <form action={formAction}>\n                <input name='name' />\n                <button>Send</button>\n            </form>\n        </>\n    );\n}",
            },
            whichOne: {
                heading: '4 · Який використовувати коли?',
                description:
                    'Три хуки покривають різні кейси. Обирай залежно від того, що тобі потрібно:',
                bulletActionState:
                    'useActionState — коли треба ОДНОЧАСНО pending state ТА структуроване повернуте значення з Action (validation errors, success message, похідні дані). Найповніший.',
                bulletFormStatus:
                    'useFormStatus — коли потрібно лише знати, ЧИ форма надсилається, і потрібен ДИТЯЧИЙ компонент-перевикористовуваний (напр. SubmitButton у UI бібліотеці). Жодних props.',
                bulletOptimistic:
                    'useOptimistic — коли server-side очікування занадто довге і треба оновити UI миттєво (chat, likes, add-to-cart, будь-що з важливим візуальним фідбеком).',
            },
        },
        demosHeading: 'Три живі демо',
        demos: {
            actionState: {
                label: 'useActionState + validation',
                route: '/lessons/action-pending/use-action-state',
                description:
                    'Sign-up форма. Server валідує (порожнє, дублікати) і повертає state. pending вимикає кнопку, error/success messages приходять із Action.',
            },
            formStatus: {
                label: 'useFormStatus child component',
                route: '/lessons/action-pending/use-form-status',
                description:
                    'Server-rendered форма з перевикористовуваним SubmitButton (Client), що читає useFormStatus(). Сам себе вимикає на submit.',
            },
            optimistic: {
                label: 'useOptimistic — миттєвий UI',
                route: '/lessons/action-pending/use-optimistic',
                description:
                    "Додай імʼя: зʼявляється ОДРАЗУ з тегом 'pending' (italic), потім Action повертається (~1с) і item стає committed (звичайний). Сприйнята швидкість = миттєва.",
            },
        },
    },
    demos: {
        actionState: {
            badge: 'Demo · /use-action-state',
            title: 'useActionState — pending + повернутий state',
            description:
                'Sign-up форма з server-side валідацією. useActionState обгортає signupAction; під час submit кнопка вимикається (pending=true). Коли Action повертається, повернутий state рендериться — або success message, або error (порожнє імʼя, дублікат). Штучний 1с delay щоб pending був видимим.',
            namePlaceholder: 'Твоє імʼя',
            submitLabel: 'Підписатися',
            submittingLabel: 'Підписую…',
            messages: {
                success: '✅ Ласкаво просимо, {name}!',
                errorEmpty: '⚠️ Імʼя не може бути порожнім.',
                errorDuplicate: '⚠️ {name} вже підписаний/а.',
            },
            subscribersHeading: 'Підписники (server-side fresh)',
            removeLabel: '×',
            takeaway:
                'Спробуй: (1) Click Підписатися з порожнім полем → помилка через 1с. (2) Введи імʼя, яке вже є → "вже підписаний/а". (3) Нове імʼя → success message + список оновлюється. Кнопка залишається disabled під час очікування — жодних double-submit.',
            backToIndex: '← Назад до лекції',
        },
        formStatus: {
            badge: 'Demo · /use-form-status',
            title: 'useFormStatus — дитина читає батька',
            description:
                'Форма server-rendered (у цій Server Component page). SubmitButton — Client Component дитина, що викликає useFormStatus(), автоматично читає стан найближчої форми. Корисний патерн для UI бібліотек: перевикористовуваний SubmitButton у будь-якій <form>, без props.',
            namePlaceholder: 'Новий підписник',
            idleLabel: 'Додати',
            pendingLabel: 'Зберігаю…',
            subscribersHeading: 'Підписники',
            removeLabel: '×',
            takeaway:
                'Заповни і натисни Додати: кнопка стає "Зберігаю…" і вимикається на ~1с. Форма — server, SubmitButton — client; їх зчеплення — через неявний Context, який React створює для кожного <form>.',
            backToIndex: '← Назад до лекції',
        },
        optimistic: {
            badge: 'Demo · /use-optimistic',
            title: 'useOptimistic — миттєвий UI',
            description:
                'Додай імʼя: зʼявляється ОДРАЗУ у списку, маркований "pending" (italic). Повільний server ~1с. Коли Action завершується і refresh() регенерує реальний state, useOptimistic перемикається на нього і item проходить з pending у committed. Якби Action провалився, optimistic item зник би автоматично.',
            namePlaceholder: 'Додай імʼя',
            submitLabel: 'Додати',
            pendingTag: 'очікує…',
            subscribersHeading: 'Підписники (з optimistic state)',
            removeLabel: '×',
            takeaway:
                "Відкрий DevTools → Network з throttling 'Slow 3G'. Додай імʼя: зʼявляється одразу з тегом '(очікує…)'. Після завершення запиту тег зникає — useOptimistic прочитав новий реальний state. Це те, що Twitter/X робить при пості: відчувається миттєво, хоча round-trip відбувається у фоні.",
            backToIndex: '← Назад до лекції',
        },
    },
};

export const content: Record<Lang, LessonContent> = { it, en, uk };
