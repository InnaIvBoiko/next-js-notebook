'use client';
// =============================================================================
// app/lessons/security-env/_components/webhook-demo.tsx
// Send a JSON POST to /api/webhook with either a correct or tampered HMAC.
// -----------------------------------------------------------------------------
// 🧠 NO SECRET ON THE CLIENT
// The signature is computed by a Server Action (`signForWebhookDemo`) so the
// secret never leaves the server bundle. In "tampered" mode another Server
// Action returns a syntactically-valid but bytewise-wrong signature, letting
// the user see the 401 path without us trusting the Client to corrupt
// bytes correctly.
// =============================================================================

import { useState } from 'react';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import {
    signForWebhookDemo,
    tamperedSignature,
} from '../_lib/actions';

type Mode = 'correct' | 'tampered';

type CallState =
    | { status: 'idle' }
    | { status: 'pending' }
    | { status: 'done'; httpStatus: number; body: string };

const DEFAULT_PAYLOAD = JSON.stringify(
    { event: 'demo.ping', at: '2026-05-31T12:00:00Z' },
    null,
    2,
);

export default function WebhookDemo() {
    const lang = useLang();
    const t = content[lang].labs.webhook;

    const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
    const [mode, setMode] = useState<Mode>('correct');
    const [call, setCall] = useState<CallState>({ status: 'idle' });

    async function onSend() {
        setCall({ status: 'pending' });

        // Compute the signature server-side. In "correct" mode the Server
        // Action signs the EXACT payload bytes; in "tampered" it returns a
        // canned wrong hex string.
        const signature =
            mode === 'correct'
                ? await signForWebhookDemo(payload)
                : await tamperedSignature();

        const res = await fetch('/api/webhook', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-nb-signature': signature,
            },
            body: payload,
        });
        const text = await res.text();

        setCall({ status: 'done', httpStatus: res.status, body: text });
    }

    const isPending = call.status === 'pending';

    return (
        <div className='space-y-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4'>
            {/* PAYLOAD ---------------------------------------------------- */}
            <div className='space-y-2'>
                <label className='text-[11px] font-medium tracking-wide text-slate-300 uppercase'>
                    {t.payloadLabel}
                </label>
                <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={5}
                    spellCheck={false}
                    className='w-full rounded-md border border-slate-700/60 bg-slate-950/60 p-2 font-(--font-mono) text-[12px] text-slate-100 focus:border-cyan-500/60 focus:outline-none'
                />
            </div>

            {/* MODE ------------------------------------------------------- */}
            <fieldset className='space-y-2'>
                <legend className='text-[11px] font-medium tracking-wide text-slate-300 uppercase'>
                    {t.modeLabel}
                </legend>
                <div className='flex flex-wrap gap-2'>
                    <ModeButton
                        active={mode === 'correct'}
                        onClick={() => setMode('correct')}
                        tone='emerald'
                    >
                        {t.modeCorrect}
                    </ModeButton>
                    <ModeButton
                        active={mode === 'tampered'}
                        onClick={() => setMode('tampered')}
                        tone='rose'
                    >
                        {t.modeTampered}
                    </ModeButton>
                </div>
            </fieldset>

            {/* SEND ------------------------------------------------------- */}
            <button
                type='button'
                onClick={onSend}
                disabled={isPending}
                className='rounded-md border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50'
            >
                {isPending ? t.sendingLabel : t.sendLabel}
            </button>

            {/* RESULT ----------------------------------------------------- */}
            {call.status === 'done' && (
                <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                        <span className='text-[11px] font-medium tracking-wide text-slate-400 uppercase'>
                            {t.statusLabel}
                        </span>
                        <span
                            className={`rounded-full px-2 py-0.5 font-(--font-mono) text-[12px] ${
                                call.httpStatus >= 200 && call.httpStatus < 300
                                    ? 'bg-emerald-500/15 text-emerald-300'
                                    : 'bg-rose-500/15 text-rose-300'
                            }`}
                        >
                            {call.httpStatus}
                        </span>
                    </div>
                    <details open className='space-y-1'>
                        <summary className='cursor-pointer text-[11px] font-medium tracking-wide text-slate-400 uppercase'>
                            {t.responseLabel}
                        </summary>
                        <pre className='overflow-x-auto rounded-md border border-slate-700/60 bg-slate-950/60 p-2 font-(--font-mono) text-[11px] text-slate-200'>
                            {prettyJson(call.body)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
}

function prettyJson(raw: string) {
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
}

const toneMap = {
    emerald:
        'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 data-[active=true]:bg-emerald-500/30',
    rose: 'border-rose-500/40 bg-rose-500/10 text-rose-200 data-[active=true]:bg-rose-500/30',
} as const;

function ModeButton({
    active,
    onClick,
    tone,
    children,
}: {
    active: boolean;
    onClick: () => void;
    tone: keyof typeof toneMap;
    children: React.ReactNode;
}) {
    return (
        <button
            type='button'
            onClick={onClick}
            data-active={active}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${toneMap[tone]}`}
        >
            {children}
        </button>
    );
}
