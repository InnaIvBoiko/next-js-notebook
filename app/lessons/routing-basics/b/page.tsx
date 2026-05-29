// app/lessons/routing-basics/b/page.tsx
// Server entry for sub-route B. Same parameterized component as /a, with
// `which='b'` selecting the right dictionary entry and accent colors.

import type { Metadata } from 'next';
import SubRouteView from '../_components/sub-route-view';

export const metadata: Metadata = {
    title: 'Sub-route B · Routing Basics · Living Notebook',
};

export default function SubRouteBPage() {
    return <SubRouteView which='b' />;
}
