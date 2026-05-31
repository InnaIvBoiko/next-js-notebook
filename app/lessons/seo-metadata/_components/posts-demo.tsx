'use client';
// =============================================================================
// app/lessons/seo-metadata/_components/posts-demo.tsx
// Card grid linking to the dynamic [slug] sub-routes.
// -----------------------------------------------------------------------------
// 🧠 NOTHING SPECIAL HERE
// Pure presentational. We could keep it as a Server Component, but it reads
// the language via useLang(), so it's a Client island. The actual list of
// posts is passed down as a prop (resolved server-side in page.tsx).
// =============================================================================

import Link from 'next/link';
import { useLang } from '../../_components/lang-provider';
import { content } from '../_lib/content';
import { localizePost, type Post } from '../_lib/posts';

type Props = { posts: Post[] };

export default function PostsDemo({ posts }: Props) {
    const lang = useLang();
    const t = content[lang].labs.posts;

    return (
        <div className='space-y-3'>
            <h3 className='text-sm font-semibold tracking-wide text-slate-300 uppercase'>
                {t.listHeading}
            </h3>
            <ul className='grid gap-3 lg:grid-cols-2'>
                {posts.map((post) => {
                    // The post data ships with `title` and `excerpt` as
                    // `Record<Lang, string>`. `localizePost` flattens them
                    // to plain strings for the current language. Switching
                    // language re-renders this island and re-localises.
                    const localized = localizePost(post, lang);
                    return (
                        <li key={post.slug}>
                            <Link
                                href={`/lessons/seo-metadata/posts/${post.slug}`}
                                className='flex h-full flex-col gap-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 transition hover:border-violet-400/60 hover:bg-violet-500/10'
                            >
                                <span className='inline-flex items-center gap-2 self-start rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-300 uppercase'>
                                    {post.tag}
                                </span>
                                <h4 className='text-sm font-semibold text-slate-100'>
                                    {localized.title}
                                </h4>
                                <p className='text-xs leading-relaxed text-slate-400'>
                                    {localized.excerpt}
                                </p>
                                <span className='mt-auto inline-flex items-center gap-1 text-xs text-violet-300'>
                                    {t.visitLabel}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
