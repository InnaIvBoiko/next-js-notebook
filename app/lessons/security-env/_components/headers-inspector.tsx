'use client';
// =============================================================================
// app/lessons/security-env/_components/headers-inspector.tsx
// Cards showing the security headers applied to the current response.
// -----------------------------------------------------------------------------
// 🧠 SOURCE OF TRUTH
// The values come from the SERVER page (which read them via `headers()`).
// We pass them down as props rather than re-reading from `document` so the
// inspector matches EXACTLY what the proxy + next.config.ts produced — no
// JS-introduced drift.
// =============================================================================

import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';

type Props = {
    headers: {
        csp: string;
        hsts: string;
        xFrame: string;
        referrer: string;
        permissions: string;
        nonce: string;
    };
};

export default function HeadersInspector({ headers }: Props) {
    const lang = useLang();
    const t = content[lang].labs.headers;

    return (
        <div className='space-y-3'>
            <HeaderCard
                label={t.cspLabel}
                value={headers.csp}
                tone='sky'
                wrap
            />
            <HeaderCard label={t.nonceLabel} value={headers.nonce} tone='violet' />
            <HeaderCard label={t.hstsLabel} value={headers.hsts} tone='emerald' />
            <HeaderCard label={t.frameLabel} value={headers.xFrame} tone='amber' />
            <HeaderCard
                label={t.referrerLabel}
                value={headers.referrer}
                tone='cyan'
            />
            <HeaderCard
                label={t.permissionsLabel}
                value={headers.permissions}
                tone='fuchsia'
            />
        </div>
    );
}

const toneMap = {
    sky: 'border-sky-500/30 bg-sky-500/5 text-sky-200',
    violet: 'border-violet-500/30 bg-violet-500/5 text-violet-200',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
    cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-200',
    fuchsia: 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-200',
} as const;

function HeaderCard({
    label,
    value,
    tone,
    wrap = false,
}: {
    label: string;
    value: string;
    tone: keyof typeof toneMap;
    wrap?: boolean;
}) {
    return (
        <div
            className={`rounded-lg border p-3 ${toneMap[tone]}`}
        >
            <div className='font-(--font-mono) text-[10px] tracking-wide text-slate-400 uppercase'>
                {label}
            </div>
            <div
                className={`mt-1 font-(--font-mono) text-[11px] leading-relaxed ${
                    wrap ? 'break-all whitespace-pre-wrap' : 'truncate'
                }`}
            >
                {value || (
                    <span className='text-slate-500 italic'>(not set)</span>
                )}
            </div>
        </div>
    );
}
