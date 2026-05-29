'use client';
// =============================================================================
// CookieControls — Client island for the /dynamic demo.
// -----------------------------------------------------------------------------
// 🧠 ARCHITECTURE
// The Server page reads `await cookies()` and renders the cookie store as
// seen on the server. But the user has no Server Action yet (Module 2 Lesson 3)
// to write a cookie. So we expose a Client island that:
//
//   1. Writes the cookie on the client side (document.cookie).
//   2. Calls `router.refresh()` to ask Next to RE-RUN the Server Component
//      tree for the current URL. Next picks up the new cookie and re-renders
//      the dynamic page with the updated value.
//
// 💡 Why router.refresh() and not window.location.reload()?
//    - reload() does a FULL navigation — loses Client state (any open modal,
//      input value, scroll position).
//    - router.refresh() does a SERVER-only re-fetch and patches the Client
//      tree in place. The Client state above (LangBar selection, layout
//      pill) is preserved.
//
// 💡 Why setting document.cookie on the client side AT ALL?
//    - Cookies are a shared HTTP construct between the browser and the
//      server. Once written by the browser, every subsequent HTTP request
//      includes them automatically — router.refresh() included. That's why
//      the server sees the new cookie on the next render.
//    - In a real app you would set the cookie via a Server Action with the
//      mutable cookie store. Module 2 Lesson 3 covers that path.
// =============================================================================

import { useRouter } from 'next/navigation';
import { content } from '../_lib/content';
import { useLessonLang } from './lang-provider';

const COOKIE_NAME = 'nb-demo';

export default function CookieControls() {
    const router = useRouter();
    const { lang } = useLessonLang();
    const t = content[lang].demos.dynamic;

    function setCookie() {
        const value = `set-at-${Date.now()}`;
        // Path=/ so the cookie is sent on every navigation under the app.
        // SameSite=Lax keeps it tighter without breaking same-site navigation.
        document.cookie = `${COOKIE_NAME}=${value}; Path=/; SameSite=Lax`;
        router.refresh();
    }

    function clearCookie() {
        // Expire it in the past to remove it from the browser store.
        document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
        router.refresh();
    }

    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap gap-3'>
                <button
                    type='button'
                    onClick={setCookie}
                    className='inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400'
                >
                    🍪 {t.setCookieLabel}
                </button>
                <button
                    type='button'
                    onClick={clearCookie}
                    className='inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800'
                >
                    🧹 {t.clearCookieLabel}
                </button>
            </div>
            <p className='rounded-lg border border-slate-800/60 bg-slate-900/40 p-3 text-xs leading-relaxed text-slate-400'>
                {t.cookieInstructions}
            </p>
        </div>
    );
}
