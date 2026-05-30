'use client';
// =============================================================================
// app/lessons/middleware-logic/_components/headers-display.tsx
// LAB 2 — renders the headers injected by the proxy.
// -----------------------------------------------------------------------------
// 🧠 The headers themselves are READ server-side (page.tsx → headers()) and
// passed in as plain props. This component just labels & styles them — no
// `next/headers` import on the client (would fail).
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Injected = {
    pathname: string | null;
    lang: string | null;
    country: string | null;
};

export default function HeadersDisplay({
    injected,
}: {
    injected: Injected;
}) {
    const lang = useLang();
    const labels = content[lang].labs.headers;

    const rows: Array<{ label: string; value: string | null }> = [
        { label: labels.pathnameLabel, value: injected.pathname },
        { label: labels.langLabel, value: injected.lang },
        { label: labels.countryLabel, value: injected.country },
    ];

    return (
        <div className='overflow-hidden rounded-md border border-slate-700/60'>
            <table className='w-full text-sm'>
                <tbody>
                    {rows.map(({ label, value }) => (
                        <tr
                            key={label}
                            className='border-t border-slate-800 first:border-t-0'
                        >
                            <td className='w-1/3 bg-slate-900/40 px-3 py-1.5 font-mono text-xs text-slate-300'>
                                {label}
                            </td>
                            <td className='px-3 py-1.5'>
                                <code
                                    className={`rounded px-2 py-0.5 font-mono text-xs ${
                                        value
                                            ? 'bg-sky-500/20 text-sky-200'
                                            : 'bg-slate-700/50 text-slate-500'
                                    }`}
                                >
                                    {value ?? '(missing)'}
                                </code>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
