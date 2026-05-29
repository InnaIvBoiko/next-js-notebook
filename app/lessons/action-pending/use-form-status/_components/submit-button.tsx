'use client';
// =============================================================================
// SubmitButton — Client island that reads useFormStatus().
// -----------------------------------------------------------------------------
// 🧠 useFormStatus() comes from `react-dom` (NOT `react`). It only works
// inside a Client Component nested under a <form>. It returns:
//   • pending: boolean
//   • data:    FormData currently being submitted
//   • method:  'get' | 'post' (always 'post' for Server Actions)
//   • action:  the action prop reference
//
// The hook reads the implicit Context React attaches to every <form>. There
// is no plumbing — the SubmitButton can sit anywhere inside the form and
// it will pick up the parent's state.
// =============================================================================

import { useFormStatus } from 'react-dom';
import { content } from '../../_lib/content';
import { useLessonLang } from '../../_components/lang-provider';

export default function SubmitButton() {
    const { pending } = useFormStatus();
    const { lang } = useLessonLang();
    const t = content[lang].demos.formStatus;

    return (
        <button
            type='submit'
            disabled={pending}
            className='inline-flex items-center gap-2 rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60'
        >
            {pending && (
                <span
                    className='inline-block h-2 w-2 animate-pulse rounded-full bg-white'
                    aria-hidden
                />
            )}
            {pending ? t.pendingLabel : t.idleLabel}
        </button>
    );
}
