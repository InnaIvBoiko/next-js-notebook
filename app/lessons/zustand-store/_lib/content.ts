// =============================================================================
// app/lessons/zustand-store/_lib/content.ts
// Inline i18n dictionary for Module 3 · Lesson 2 (Zustand Store).
// =============================================================================

import type { Lang } from '../../../_lib/dictionaries';

type Dictionary = {
    badge: string;
    title: string;
    intro: string;
    sections: {
        whatIs: {
            heading: string;
            description: string;
            snippet: string;
        };
        moduleVsFactory: {
            heading: string;
            description: string;
            snippet: string;
        };
        selectors: {
            heading: string;
            description: string;
            snippet: string;
        };
        middleware: {
            heading: string;
            description: string;
            snippet: string;
        };
    };
    themeLab: {
        heading: string;
        description: string;
        themeLabel: string;
        themes: { dark: string; light: string; amber: string };
        previewBody: string;
        readerBadge: string;
        writerBadge: string;
        bulkBadge: string;
        readerNote: string;
        writerNote: string;
        bulkNote: string;
        renderLabel: string;
    };
    todoLab: {
        heading: string;
        description: string;
        placeholder: string;
        addLabel: string;
        clearLabel: string;
        emptyLabel: string;
        listLabel: string;
        statsLabel: string;
        inputLabel: string;
        clearBadgeLabel: string;
        totalLabel: string;
        doneLabel: string;
        pendingLabel: string;
        renderLabel: string;
    };
    debug: {
        heading: string;
        description: string;
        steps: string[];
    };
};

// -----------------------------------------------------------------------------
// IT
// -----------------------------------------------------------------------------
const it: Dictionary = {
    badge: 'Modulo 3 · Lezione 2',
    title: 'Zustand Store',
    intro: 'Zustand è uno state manager minimale (4 KB) basato sul pattern del selector. Risolve elegantemente il problema della granularità che nella lezione precedente avevamo affrontato manualmente con split-context: in Zustand un componente si sottoscrive non a un Context intero, ma a una "fetta" precisa dello stato tramite una funzione selector. Costruiremo due demo: una piccola mirror della lezione 1 (Theme con Reader/Writer/Bulk), e una lista todo con il pattern di produzione raccomandato per Next App Router (store factory + provider + persist + devtools).',
    sections: {
        whatIs: {
            heading: '§1 Cos\'è Zustand',
            description: 'Zustand crea uno store esterno a React. Il hook `useStore(selector)` legge una porzione dello stato e sottoscrive il componente SOLO a quella porzione. Quando un\'azione chiama `set(...)`, Zustand confronta ogni selector con il risultato precedente via `Object.is`: se uguali, niente re-render; se diversi, re-render. Niente Provider obbligatorio (se lo store è module-scoped), niente reducer/dispatch, niente boilerplate. Le azioni sono semplici funzioni dentro lo state.',
            snippet: `import { create } from 'zustand';

type ThemeState = {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
};

export const useThemeStore = create<ThemeState>()(set => ({
  theme: 'dark',
  setTheme: t => set({ theme: t }),
}));

// In un componente:
const theme = useThemeStore(s => s.theme);     // sottoscrive a "theme"
const setTheme = useThemeStore(s => s.setTheme); // sottoscrive solo al setter`,
        },
        moduleVsFactory: {
            heading: '§2 Module-scoped vs Factory + Provider (la trappola App Router)',
            description: 'Il `create(...)` produce uno store che vive a livello di modulo. Su Next App Router il modulo è cachato per tutta la vita del processo Node: lo stesso store è condiviso tra TUTTE le richieste server concorrenti. Se inizializzi lo store con dati per-utente (cookie, session, db), l\'utente A può finire per vedere i dati dell\'utente B. Per stato puramente client (come il tema) il rischio è zero — lo store viene scritto solo dopo l\'idratazione. Ma per qualsiasi stato che potrebbe essere SSR-inizializzato, usa il pattern factory + provider: una nuova store per ogni provider montato (cioè per ogni richiesta server / sessione client).',
            snippet: `// PATTERN PRODUZIONE — factory + provider
'use client';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';

export const createTodoStore = () =>
  createStore<TodoState>()(set => ({ /* ...stato... */ }));

const TodoStoreContext = createContext<TodoStore | null>(null);

export function TodoStoreProvider({ children }) {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createTodoStore(); // creato UNA VOLTA per provider
  }
  return (
    <TodoStoreContext.Provider value={storeRef.current}>
      {children}
    </TodoStoreContext.Provider>
  );
}

export function useTodoStore<T>(selector: (s: TodoState) => T) {
  const store = useContext(TodoStoreContext);
  if (!store) throw new Error('useTodoStore inside <TodoStoreProvider>');
  return useStore(store, selector);
}`,
        },
        selectors: {
            heading: '§3 Selector: granularità per default',
            description: 'Il selector è il cuore del modello di re-render. Tre regole:\n\n1) **Restituisci la cosa più piccola possibile.** `s => s.theme` (primitive) > `s => s.todos` (array reference) > `s => s` (whole state, antipattern).\n\n2) **Non creare oggetti dentro al selector.** `s => ({ a: s.a, b: s.b })` ritorna un NUOVO oggetto ad ogni read → `Object.is` è sempre false → re-render infiniti. Soluzione: usa `useShallow` per shallow compare, oppure due selector separati.\n\n3) **Le azioni hanno reference stabile.** `s => s.addTodo` ritorna sempre la stessa funzione → il componente che usa solo azioni non si re-renderizza mai. Questo è il "Vittoria del split" della lezione 1, gratis.',
            snippet: `// ✅ Selector narrow su primitive
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme); // mai re-render

// ❌ Object literal nel selector — re-render infiniti
const { theme, setTheme } = useThemeStore(s => ({
  theme: s.theme,
  setTheme: s.setTheme,
}));

// ✅ Fix: useShallow per shallow compare
import { useShallow } from 'zustand/react/shallow';
const { theme, setTheme } = useThemeStore(
  useShallow(s => ({ theme: s.theme, setTheme: s.setTheme }))
);

// ✅ ANCORA MEGLIO: due selector separati
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme);`,
        },
        middleware: {
            heading: '§4 Middleware: persist + devtools',
            description: 'Zustand è composto da middleware: ogni middleware avvolge lo store e aggiunge un comportamento. L\'ordine conta — il più esterno avvolge tutti gli interni.\n\n**`persist`**: salva lo stato in localStorage/sessionStorage e lo idrata al mount. Stesso pattern flicker della sessionStorage della lezione 1 — il server non può leggere localStorage, quindi l\'HTML iniziale ha sempre lo stato di default. Per evitare il flicker su SSR puro c\'è `skipHydration: true` e `useStore.persist.rehydrate()` manuale; lo affronteremo in `/advanced-routing` insieme ai cookie.\n\n**`devtools`**: integra Redux DevTools (estensione browser). Vedi ogni mutation con il nome dell\'azione, lo stato prima/dopo, e puoi fare "time travel" (riavvolgi a uno state passato). È il quick-win più visibile di Zustand vs Context.',
            snippet: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useThemeStore = create<ThemeState>()(
  // 🪆 Pipeline esterno → interno:
  devtools(                              // ← Redux DevTools
    persist(                             // ← localStorage hydrate/write
      set => ({
        theme: 'dark',
        // Il 3° argomento di set è il nome azione per DevTools
        setTheme: t => set({ theme: t }, false, 'theme/set'),
      }),
      { name: 'living-notebook:zustand-theme' },
    ),
    { name: 'living-notebook/theme-store' },
  ),
);`,
        },
    },
    themeLab: {
        heading: '🧪 Laboratorio 1: Theme mirror (module-scoped)',
        description: 'Le stesse tre card della lezione 1, ma con Zustand al posto di Context split. Clicca i tema e confronta i counter di re-render: il "Writer" Zustand resta a 1 senza che noi abbiamo splittato nulla, solo grazie al selector.',
        themeLabel: 'Tema',
        themes: { dark: 'scuro', light: 'chiaro', amber: 'ambra' },
        previewBody: 'Questa card legge SOLO `state.theme`. Si rerenda quando il tema cambia → cambia colore.',
        readerBadge: 'Reader — useThemeStore(s => s.theme)',
        writerBadge: 'Writer — useThemeStore(s => s.setTheme)',
        bulkBadge: 'Bulk — useThemeStore(s => s) ❌',
        readerNote: 'Sottoscritto a `state.theme`. Si rerenda solo al cambio tema. ✅ Atteso.',
        writerNote: 'Sottoscritto a `state.setTheme`. La reference dell\'azione è stabile → MAI re-render. ✅ Vittoria gratis del selector.',
        bulkNote: 'Selector ritorna l\'intero stato. `Object.is` confronta la nuova reference della radice → re-render ad ogni set. ❌ Antipattern.',
        renderLabel: 'render n.',
    },
    todoLab: {
        heading: '🧪 Laboratorio 2: Todo store (factory + provider)',
        description: 'Pattern di produzione: store factory creato in `<TodoStoreProvider>` (vedi `layout.tsx`), hook `useTodoStore(selector)` per leggere. Aggiungi todo, toggla, rimuovi, e osserva quali componenti si re-renderizzano. Persist scrive su localStorage — refresh e i todo sopravvivono.',
        placeholder: 'Cosa devi fare?',
        addLabel: 'Aggiungi',
        clearLabel: 'Rimuovi completati',
        emptyLabel: 'Nessun todo ancora. Aggiungine uno!',
        listLabel: 'Lista — sottoscritta a state.todos',
        statsLabel: 'Stats — derived counts',
        inputLabel: 'Input — solo addTodo (mai re-render)',
        clearBadgeLabel: 'Clear — solo clearCompleted (mai re-render)',
        totalLabel: 'Totale',
        doneLabel: 'Fatti',
        pendingLabel: 'Da fare',
        renderLabel: 'render n.',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Apri i DevTools del browser e segui:',
        steps: [
            'Installa l\'estensione **Redux DevTools** (Chrome/Firefox). Apre una tab "Redux" nei DevTools. Vedrai due store: `living-notebook/theme-store` e `living-notebook/todo-store`. Clicca tra i tema → vedi azioni `theme/set` con stato before/after. Aggiungi un todo → vedi `todo/add`.',
            'Nella tab Application → Local Storage → localhost: vedi le chiavi `living-notebook:zustand-theme` e `living-notebook:zustand-todos` aggiornarsi ad ogni mutazione.',
            'Apri React DevTools → Profiler, premi REC, clicca un tema. Stop. Nella commit list vedi che si re-renderizzano solo Reader e Bulk; il Writer no. Stesso esperimento per Todo: aggiungi un item → si re-renderizzano List e Stats; Input e Clear no.',
            'Refresh la pagina. I todo sopravvivono (persist + localStorage). Anche il tema. Apri Redux DevTools → vedi un\'azione `@@INIT` seguita da `theme/set` (hydration).',
            'In Redux DevTools, scegli uno stato passato e clicca "Jump" — vedi lo state della UI tornare indietro. Time travel debugging gratuito.',
            'Test del leak module-scoped: apri due tab al `localhost:3000/lessons/zustand-store`. I temi sono indipendenti (lo store è module-scoped LATO CLIENT, ogni tab ha il suo modulo). I todo invece condividono localStorage → cambiamenti in una tab non si vedono nell\'altra finché non refreshi (persist non sincronizza tra tab; serve middleware `subscribeWithSelector` + storage events).',
        ],
    },
};

// -----------------------------------------------------------------------------
// EN
// -----------------------------------------------------------------------------
const en: Dictionary = {
    badge: 'Module 3 · Lesson 2',
    title: 'Zustand Store',
    intro: 'Zustand is a minimal (4 KB) state manager built on the selector pattern. It elegantly solves the granularity problem we tackled manually with split-contexts in the previous lesson: in Zustand a component subscribes not to a whole Context but to a precise "slice" of the state via a selector function. We will build two demos: a small mirror of Lesson 1 (Theme with Reader/Writer/Bulk), and a todo list with the production pattern recommended for the Next App Router (store factory + provider + persist + devtools).',
    sections: {
        whatIs: {
            heading: '§1 What is Zustand',
            description: 'Zustand creates a store outside of React. The hook `useStore(selector)` reads a slice of the state and subscribes the component ONLY to that slice. When an action calls `set(...)`, Zustand compares each selector with its previous result via `Object.is`: equal → no re-render, different → re-render. No mandatory Provider (if module-scoped), no reducer/dispatch, no boilerplate. Actions are plain functions inside the state.',
            snippet: `import { create } from 'zustand';

type ThemeState = {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
};

export const useThemeStore = create<ThemeState>()(set => ({
  theme: 'dark',
  setTheme: t => set({ theme: t }),
}));

// In a component:
const theme = useThemeStore(s => s.theme);     // subscribes to "theme"
const setTheme = useThemeStore(s => s.setTheme); // subscribes only to the setter`,
        },
        moduleVsFactory: {
            heading: '§2 Module-scoped vs Factory + Provider (the App Router trap)',
            description: '`create(...)` produces a module-level store. On Next App Router a module is cached for the lifetime of the Node process: the same store is shared across ALL concurrent server requests. If you initialise the store with per-user data (cookies, session, db), user A could end up seeing user B\'s data. For purely client state (like theme) the risk is zero — the store is only written after hydration. But for any state that might be SSR-initialised, use the factory + provider pattern: a fresh store for every mounted provider (i.e. per server request / client session).',
            snippet: `// PRODUCTION PATTERN — factory + provider
'use client';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';

export const createTodoStore = () =>
  createStore<TodoState>()(set => ({ /* ...state... */ }));

const TodoStoreContext = createContext<TodoStore | null>(null);

export function TodoStoreProvider({ children }) {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createTodoStore(); // created ONCE per provider
  }
  return (
    <TodoStoreContext.Provider value={storeRef.current}>
      {children}
    </TodoStoreContext.Provider>
  );
}

export function useTodoStore<T>(selector: (s: TodoState) => T) {
  const store = useContext(TodoStoreContext);
  if (!store) throw new Error('useTodoStore inside <TodoStoreProvider>');
  return useStore(store, selector);
}`,
        },
        selectors: {
            heading: '§3 Selectors: granularity by default',
            description: 'The selector is the heart of the re-render model. Three rules:\n\n1) **Return the smallest thing possible.** `s => s.theme` (primitive) > `s => s.todos` (array reference) > `s => s` (whole state, antipattern).\n\n2) **Do not create objects inside the selector.** `s => ({ a: s.a, b: s.b })` returns a NEW object on every read → `Object.is` is always false → infinite re-renders. Solution: use `useShallow` for shallow compare, or two separate selectors.\n\n3) **Actions have a stable reference.** `s => s.addTodo` always returns the same function → a component using only actions never re-renders. This is Lesson 1\'s "split win" for free.',
            snippet: `// ✅ Narrow selector returning a primitive
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme); // never re-renders

// ❌ Object literal in selector — infinite re-renders
const { theme, setTheme } = useThemeStore(s => ({
  theme: s.theme,
  setTheme: s.setTheme,
}));

// ✅ Fix: useShallow for shallow compare
import { useShallow } from 'zustand/react/shallow';
const { theme, setTheme } = useThemeStore(
  useShallow(s => ({ theme: s.theme, setTheme: s.setTheme }))
);

// ✅ EVEN BETTER: two separate selectors
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme);`,
        },
        middleware: {
            heading: '§4 Middleware: persist + devtools',
            description: 'Zustand is composed of middleware: each middleware wraps the store and adds a behaviour. Order matters — the outermost wraps all the inner ones.\n\n**`persist`**: saves state to localStorage/sessionStorage and hydrates it on mount. Same flicker pattern as Lesson 1\'s sessionStorage — the server can\'t read localStorage, so initial HTML always has the default state. To avoid flicker on pure SSR there is `skipHydration: true` + manual `useStore.persist.rehydrate()`; we\'ll tackle this in `/advanced-routing` together with cookies.\n\n**`devtools`**: integrates with Redux DevTools (browser extension). You see every mutation with its action name, the before/after state, and you can "time travel" (rewind to a past state). It\'s the most visible quick-win of Zustand vs Context.',
            snippet: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useThemeStore = create<ThemeState>()(
  // 🪆 Pipeline outer → inner:
  devtools(                              // ← Redux DevTools
    persist(                             // ← localStorage hydrate/write
      set => ({
        theme: 'dark',
        // The 3rd argument to set is the DevTools action name
        setTheme: t => set({ theme: t }, false, 'theme/set'),
      }),
      { name: 'living-notebook:zustand-theme' },
    ),
    { name: 'living-notebook/theme-store' },
  ),
);`,
        },
    },
    themeLab: {
        heading: '🧪 Lab 1: Theme mirror (module-scoped)',
        description: 'The same three cards from Lesson 1, but with Zustand instead of split Context. Click the themes and compare the re-render counters: the Zustand "Writer" stays at 1 without us having to split anything, just thanks to the selector.',
        themeLabel: 'Theme',
        themes: { dark: 'dark', light: 'light', amber: 'amber' },
        previewBody: 'This card reads ONLY `state.theme`. It re-renders when the theme changes → it changes color.',
        readerBadge: 'Reader — useThemeStore(s => s.theme)',
        writerBadge: 'Writer — useThemeStore(s => s.setTheme)',
        bulkBadge: 'Bulk — useThemeStore(s => s) ❌',
        readerNote: 'Subscribes to `state.theme`. Re-renders only on theme change. ✅ Expected.',
        writerNote: 'Subscribes to `state.setTheme`. The action reference is stable → NEVER re-renders. ✅ Free selector win.',
        bulkNote: 'Selector returns the whole state. `Object.is` compares the new root reference → re-render on every set. ❌ Antipattern.',
        renderLabel: 'render #',
    },
    todoLab: {
        heading: '🧪 Lab 2: Todo store (factory + provider)',
        description: 'Production pattern: store factory created in `<TodoStoreProvider>` (see `layout.tsx`), `useTodoStore(selector)` hook to read. Add todos, toggle, remove, and observe which components re-render. Persist writes to localStorage — refresh and the todos survive.',
        placeholder: 'What do you need to do?',
        addLabel: 'Add',
        clearLabel: 'Clear completed',
        emptyLabel: 'No todos yet. Add one!',
        listLabel: 'List — subscribes to state.todos',
        statsLabel: 'Stats — derived counts',
        inputLabel: 'Input — only addTodo (never re-renders)',
        clearBadgeLabel: 'Clear — only clearCompleted (never re-renders)',
        totalLabel: 'Total',
        doneLabel: 'Done',
        pendingLabel: 'Pending',
        renderLabel: 'render #',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Open the browser DevTools and follow:',
        steps: [
            'Install the **Redux DevTools** extension (Chrome/Firefox). It opens a "Redux" tab in DevTools. You\'ll see two stores: `living-notebook/theme-store` and `living-notebook/todo-store`. Click through themes → see `theme/set` actions with before/after state. Add a todo → see `todo/add`.',
            'In the Application tab → Local Storage → localhost: you\'ll see the keys `living-notebook:zustand-theme` and `living-notebook:zustand-todos` update on every mutation.',
            'Open React DevTools → Profiler, hit REC, click a theme. Stop. In the commit list only Reader and Bulk re-render; Writer doesn\'t. Same experiment for Todo: add an item → List and Stats re-render; Input and Clear don\'t.',
            'Refresh the page. The todos survive (persist + localStorage). So does the theme. Open Redux DevTools → you see an `@@INIT` action followed by `theme/set` (hydration).',
            'In Redux DevTools, pick a past state and click "Jump" — see the UI state rewind. Free time-travel debugging.',
            'Module-scoped leak test: open two tabs at `localhost:3000/lessons/zustand-store`. The themes are independent (the store is module-scoped CLIENT-SIDE, each tab has its own module). The todos share localStorage → changes in one tab aren\'t reflected in the other until you refresh (persist doesn\'t sync across tabs; you\'d need `subscribeWithSelector` middleware + storage events).',
        ],
    },
};

// -----------------------------------------------------------------------------
// UK
// -----------------------------------------------------------------------------
const uk: Dictionary = {
    badge: 'Модуль 3 · Лекція 2',
    title: 'Zustand Store',
    intro: 'Zustand — це мінімальний (4 КБ) state manager, побудований на патерні селектора. Він елегантно розв\'язує проблему гранулярності, яку в попередній лекції ми вирішували вручну через split-context: у Zustand компонент підписується не на цілий Context, а на точну "частину" стану через функцію селектора. Побудуємо два демо: маленьке дзеркало Лекції 1 (Theme з Reader/Writer/Bulk) і список todo з виробничим патерном, рекомендованим для Next App Router (store factory + provider + persist + devtools).',
    sections: {
        whatIs: {
            heading: '§1 Що таке Zustand',
            description: 'Zustand створює store зовні React. Хук `useStore(selector)` читає частину стану та підписує компонент ТІЛЬКИ на цю частину. Коли дія викликає `set(...)`, Zustand порівнює кожен селектор з попереднім результатом через `Object.is`: рівні → немає re-render, різні → re-render. Немає обов\'язкового Provider (якщо module-scoped), немає reducer/dispatch, немає boilerplate. Дії — це звичайні функції всередині state.',
            snippet: `import { create } from 'zustand';

type ThemeState = {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
};

export const useThemeStore = create<ThemeState>()(set => ({
  theme: 'dark',
  setTheme: t => set({ theme: t }),
}));

// У компоненті:
const theme = useThemeStore(s => s.theme);     // підписка на "theme"
const setTheme = useThemeStore(s => s.setTheme); // підписка тільки на setter`,
        },
        moduleVsFactory: {
            heading: '§2 Module-scoped vs Factory + Provider (пастка App Router)',
            description: '`create(...)` створює store на рівні модуля. У Next App Router модуль кешується на весь час життя Node-процесу: один store розділяється МІЖ ВСІМА конкурентними серверними запитами. Якщо ініціалізуєш store даними per-user (cookies, session, db), користувач А може побачити дані користувача B. Для чисто клієнтського стану (як theme) ризик нульовий — store пишеться лише після hydration. Але для будь-якого стану, який може бути SSR-ініціалізований, використовуй патерн factory + provider: свіжий store для кожного змонтованого provider (тобто на кожен server request / client session).',
            snippet: `// ВИРОБНИЧИЙ ПАТЕРН — factory + provider
'use client';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { createContext, useContext, useRef } from 'react';

export const createTodoStore = () =>
  createStore<TodoState>()(set => ({ /* ...стан... */ }));

const TodoStoreContext = createContext<TodoStore | null>(null);

export function TodoStoreProvider({ children }) {
  const storeRef = useRef(null);
  if (storeRef.current === null) {
    storeRef.current = createTodoStore(); // створено ОДИН РАЗ на provider
  }
  return (
    <TodoStoreContext.Provider value={storeRef.current}>
      {children}
    </TodoStoreContext.Provider>
  );
}

export function useTodoStore<T>(selector: (s: TodoState) => T) {
  const store = useContext(TodoStoreContext);
  if (!store) throw new Error('useTodoStore inside <TodoStoreProvider>');
  return useStore(store, selector);
}`,
        },
        selectors: {
            heading: '§3 Селектори: гранулярність за замовчуванням',
            description: 'Селектор — це серце моделі re-render. Три правила:\n\n1) **Повертай найменше можливе.** `s => s.theme` (primitive) > `s => s.todos` (array reference) > `s => s` (цілий state, антипатерн).\n\n2) **Не створюй об\'єкти всередині селектора.** `s => ({ a: s.a, b: s.b })` повертає НОВИЙ об\'єкт на кожен read → `Object.is` завжди false → нескінченні re-render. Рішення: `useShallow` для shallow compare, або два окремі селектори.\n\n3) **Дії мають стабільну reference.** `s => s.addTodo` завжди повертає ту ж функцію → компонент, що використовує лише дії, ніколи не re-render. Це безкоштовний "split win" Лекції 1.',
            snippet: `// ✅ Вузький селектор повертає primitive
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme); // ніколи не re-render

// ❌ Object literal у селекторі — нескінченні re-render
const { theme, setTheme } = useThemeStore(s => ({
  theme: s.theme,
  setTheme: s.setTheme,
}));

// ✅ Фікс: useShallow для shallow compare
import { useShallow } from 'zustand/react/shallow';
const { theme, setTheme } = useThemeStore(
  useShallow(s => ({ theme: s.theme, setTheme: s.setTheme }))
);

// ✅ ЩЕ КРАЩЕ: два окремі селектори
const theme = useThemeStore(s => s.theme);
const setTheme = useThemeStore(s => s.setTheme);`,
        },
        middleware: {
            heading: '§4 Middleware: persist + devtools',
            description: 'Zustand складається з middleware: кожне обгортає store і додає поведінку. Порядок має значення — найзовнішнє обгортає всі внутрішні.\n\n**`persist`**: зберігає state у localStorage/sessionStorage і hydrate його на mount. Той же flicker патерн, що й sessionStorage Лекції 1 — сервер не може читати localStorage, тому початковий HTML завжди має default state. Щоб уникнути flicker на чистому SSR, є `skipHydration: true` + ручний `useStore.persist.rehydrate()`; розглянемо в `/advanced-routing` разом з cookies.\n\n**`devtools`**: інтеграція з Redux DevTools (browser extension). Бачиш кожну mutation з назвою дії, state before/after, і можеш "time travel" (перемотати в минулий state). Це найбільш видимий швидкий виграш Zustand vs Context.',
            snippet: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useThemeStore = create<ThemeState>()(
  // 🪆 Pipeline зовнішній → внутрішній:
  devtools(                              // ← Redux DevTools
    persist(                             // ← localStorage hydrate/write
      set => ({
        theme: 'dark',
        // 3-й аргумент set — назва дії для DevTools
        setTheme: t => set({ theme: t }, false, 'theme/set'),
      }),
      { name: 'living-notebook:zustand-theme' },
    ),
    { name: 'living-notebook/theme-store' },
  ),
);`,
        },
    },
    themeLab: {
        heading: '🧪 Лабораторія 1: Theme mirror (module-scoped)',
        description: 'Ті ж три картки з Лекції 1, але з Zustand замість split Context. Натисни теми і порівняй лічильники re-render: Zustand "Writer" залишається на 1 без того, щоб ми щось розділяли — лише завдяки селектору.',
        themeLabel: 'Тема',
        themes: { dark: 'темна', light: 'світла', amber: 'amber' },
        previewBody: 'Ця картка читає ЛИШЕ `state.theme`. Перерендерюється при зміні теми → змінює колір.',
        readerBadge: 'Reader — useThemeStore(s => s.theme)',
        writerBadge: 'Writer — useThemeStore(s => s.setTheme)',
        bulkBadge: 'Bulk — useThemeStore(s => s) ❌',
        readerNote: 'Підписаний на `state.theme`. Перерендерюється лише при зміні теми. ✅ Очікувано.',
        writerNote: 'Підписаний на `state.setTheme`. Reference дії стабільна → НІКОЛИ не re-render. ✅ Безкоштовна перемога селектора.',
        bulkNote: 'Селектор повертає весь state. `Object.is` порівнює нову root reference → re-render на кожен set. ❌ Антипатерн.',
        renderLabel: 'рендер №',
    },
    todoLab: {
        heading: '🧪 Лабораторія 2: Todo store (factory + provider)',
        description: 'Виробничий патерн: store factory створений у `<TodoStoreProvider>` (див. `layout.tsx`), хук `useTodoStore(selector)` для читання. Додай todo, toggle, видали і поспостерігай, які компоненти re-render. Persist пише в localStorage — refresh, і todo переживають.',
        placeholder: 'Що треба зробити?',
        addLabel: 'Додати',
        clearLabel: 'Очистити завершені',
        emptyLabel: 'Ще немає todo. Додай!',
        listLabel: 'List — підписка на state.todos',
        statsLabel: 'Stats — derived counts',
        inputLabel: 'Input — лише addTodo (ніколи не re-render)',
        clearBadgeLabel: 'Clear — лише clearCompleted (ніколи не re-render)',
        totalLabel: 'Всього',
        doneLabel: 'Готово',
        pendingLabel: 'Чекає',
        renderLabel: 'рендер №',
    },
    debug: {
        heading: '🛠 Debug Lab',
        description: 'Відкрий DevTools браузера і слідуй:',
        steps: [
            'Встанови розширення **Redux DevTools** (Chrome/Firefox). Воно відкриває вкладку "Redux" у DevTools. Побачиш два store: `living-notebook/theme-store` і `living-notebook/todo-store`. Натискай теми → бачиш дії `theme/set` зі станом before/after. Додай todo → бачиш `todo/add`.',
            'У вкладці Application → Local Storage → localhost: бачиш ключі `living-notebook:zustand-theme` і `living-notebook:zustand-todos`, що оновлюються при кожній mutation.',
            'Відкрий React DevTools → Profiler, натисни REC, натисни тему. Stop. У commit list re-render лише Reader і Bulk; Writer — ні. Той же експеримент для Todo: додай item → re-render List і Stats; Input і Clear — ні.',
            'Refresh сторінку. Todo переживають (persist + localStorage). Тема також. Відкрий Redux DevTools → бачиш дію `@@INIT`, потім `theme/set` (hydration).',
            'У Redux DevTools обери минулий state і натисни "Jump" — побачиш, як UI state перемотується. Безкоштовний time-travel debugging.',
            'Тест leak module-scoped: відкрий дві вкладки на `localhost:3000/lessons/zustand-store`. Теми незалежні (store module-scoped НА КЛІЄНТІ, кожна вкладка має свій модуль). Todo ж розділяють localStorage → зміни в одній вкладці не видно в іншій до refresh (persist не синхронізує між вкладками; треба middleware `subscribeWithSelector` + storage events).',
        ],
    },
};

export const content: Record<Lang, Dictionary> = { it, en, uk };
