'use client';
// =============================================================================
// app/lessons/api-routes/_components/echo-playground.tsx
// LAB 1 — interactive playground against /api/echo/[...path].
// -----------------------------------------------------------------------------
// 🧠 What this teaches
// You compose a Request by hand — method, dynamic path segments, query string,
// headers, body — fire it with `fetch()`, and see the response. The echo
// handler reflects everything back so you can SEE exactly what the server
// receives. The cURL preview gives you the shell equivalent of the same call
// for terminal experiments.
//
// 🧠 Why a Client Component
// Route Handlers are HTTP endpoints. The whole point of this lab is to issue
// a real network call from the BROWSER and inspect the request/response cycle
// in DevTools → Network. A Server Component cannot do that.
// =============================================================================

import { useMemo, useState } from 'react';

type EchoLabels = {
    badge: string;
    description: string;
    methodLabel: string;
    pathLabel: string;
    pathHint: string;
    queryLabel: string;
    queryHint: string;
    headersLabel: string;
    headersHint: string;
    bodyLabel: string;
    bodyHint: string;
    sendLabel: string;
    sendingLabel: string;
    statusLabel: string;
    responseLabel: string;
    curlLabel: string;
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type Method = (typeof METHODS)[number];

// Parse the "Name: Value" textarea into a plain object. Skips empty lines and
// malformed entries so the user can leave stray newlines in the field.
function parseHeaderLines(text: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const line of text.split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const name = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        if (name.length > 0) out[name] = value;
    }
    return out;
}

// Build the cURL equivalent of the request the user is about to send. Useful
// for the terminal experiments mentioned in the Debugging Lab.
function buildCurl(
    method: Method,
    url: string,
    headers: Record<string, string>,
    body: string,
): string {
    const parts: string[] = [`curl -X ${method} '${url}'`];
    for (const [name, value] of Object.entries(headers)) {
        parts.push(`-H '${name}: ${value}'`);
    }
    if (body.length > 0 && method !== 'GET') {
        // Single-quote escape for shell. Not perfect, but fine for a teaching demo.
        const escaped = body.replace(/'/g, `'\\''`);
        parts.push(`--data '${escaped}'`);
    }
    return parts.join(' \\\n  ');
}

export default function EchoPlayground({ labels }: { labels: EchoLabels }) {
    const [method, setMethod] = useState<Method>('POST');
    const [path, setPath] = useState('users/42');
    const [query, setQuery] = useState('expand=author&limit=5');
    const [headersText, setHeadersText] = useState(
        'X-Lesson: api-routes\nX-Demo: echo',
    );
    const [body, setBody] = useState('{\n  "hello": "world"\n}');
    const [status, setStatus] = useState<number | null>(null);
    const [response, setResponse] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    // Compute the URL string once for both the cURL preview and the fetch.
    // The leading "/" makes it relative to the current origin in dev.
    const url = useMemo(() => {
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        const base = `/api/echo${cleanPath ? '/' + cleanPath : ''}`;
        const qs = query.trim().replace(/^\?/, '');
        return qs.length > 0 ? `${base}?${qs}` : base;
    }, [path, query]);

    const parsedHeaders = useMemo(
        () => parseHeaderLines(headersText),
        [headersText],
    );

    const curl = useMemo(
        () =>
            buildCurl(
                method,
                `http://localhost:3000${url}`,
                method === 'GET'
                    ? parsedHeaders
                    : {
                          'Content-Type': 'application/json',
                          ...parsedHeaders,
                      },
                body,
            ),
        [method, url, parsedHeaders, body],
    );

    async function send() {
        setIsSending(true);
        setStatus(null);
        setResponse('');
        try {
            const init: RequestInit = {
                method,
                headers: parsedHeaders,
            };
            if (method !== 'GET' && body.length > 0) {
                init.headers = {
                    'Content-Type': 'application/json',
                    ...parsedHeaders,
                };
                init.body = body;
            }
            const res = await fetch(url, init);
            setStatus(res.status);
            // Try to pretty-print JSON; fall back to text for non-JSON bodies.
            const text = await res.text();
            try {
                setResponse(JSON.stringify(JSON.parse(text), null, 2));
            } catch {
                setResponse(text);
            }
        } catch (err) {
            setStatus(null);
            setResponse(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSending(false);
        }
    }

    return (
        <section className='space-y-4 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4'>
            <div className='flex items-start justify-between gap-3'>
                <span className='text-[11px] font-semibold tracking-wide text-sky-300 uppercase'>
                    {labels.badge}
                </span>
                <code className='rounded bg-slate-900/60 px-2 py-0.5 font-mono text-[10px] text-sky-200'>
                    /api/echo/[...path]
                </code>
            </div>
            <p className='text-xs leading-relaxed text-slate-400'>
                {labels.description}
            </p>

            <div className='grid gap-3 sm:grid-cols-[120px_1fr]'>
                <label className='space-y-1'>
                    <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                        {labels.methodLabel}
                    </span>
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value as Method)}
                        className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-xs text-slate-100'
                    >
                        {METHODS.map(m => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>
                <label className='space-y-1'>
                    <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                        {labels.pathLabel}
                    </span>
                    <input
                        type='text'
                        value={path}
                        onChange={e => setPath(e.target.value)}
                        placeholder={labels.pathHint}
                        className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-xs text-slate-100'
                    />
                </label>
            </div>

            <label className='block space-y-1'>
                <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                    {labels.queryLabel}
                </span>
                <input
                    type='text'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={labels.queryHint}
                    className='w-full rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-xs text-slate-100'
                />
            </label>

            <label className='block space-y-1'>
                <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                    {labels.headersLabel}
                </span>
                <textarea
                    value={headersText}
                    onChange={e => setHeadersText(e.target.value)}
                    placeholder={labels.headersHint}
                    rows={3}
                    className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-xs text-slate-100'
                />
            </label>

            {method !== 'GET' && (
                <label className='block space-y-1'>
                    <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                        {labels.bodyLabel}
                    </span>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder={labels.bodyHint}
                        rows={4}
                        className='w-full resize-y rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 font-mono text-xs text-slate-100'
                    />
                </label>
            )}

            <button
                type='button'
                onClick={send}
                disabled={isSending}
                className='inline-flex items-center gap-2 rounded-md border border-sky-500/50 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-100 transition-colors hover:border-sky-400 hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60'
            >
                {isSending ? labels.sendingLabel : labels.sendLabel}
            </button>

            {status !== null && (
                <div className='flex items-center gap-2 text-[11px]'>
                    <span className='text-slate-400 uppercase'>
                        {labels.statusLabel}
                    </span>
                    <code
                        className={`rounded px-2 py-0.5 font-mono ${
                            status >= 200 && status < 300
                                ? 'bg-emerald-500/20 text-emerald-200'
                                : status >= 400
                                  ? 'bg-rose-500/20 text-rose-200'
                                  : 'bg-amber-500/20 text-amber-200'
                        }`}
                    >
                        {status}
                    </code>
                </div>
            )}

            {response && (
                <div className='space-y-1'>
                    <span className='block text-[11px] tracking-wide text-slate-400 uppercase'>
                        {labels.responseLabel}
                    </span>
                    <pre className='max-h-72 overflow-auto rounded-md border border-slate-800 bg-slate-950/60 p-3 font-mono text-[11px] leading-relaxed text-slate-200'>
                        {response}
                    </pre>
                </div>
            )}

            <details className='group'>
                <summary className='cursor-pointer text-[11px] text-slate-400 transition-colors hover:text-slate-200'>
                    {labels.curlLabel}
                </summary>
                <pre className='mt-2 overflow-auto rounded-md border border-slate-800 bg-slate-950/60 p-3 font-mono text-[11px] leading-relaxed text-amber-100'>
                    {curl}
                </pre>
            </details>
        </section>
    );
}
