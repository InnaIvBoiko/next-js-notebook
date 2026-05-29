// app/lessons/routing-basics/a/page.tsx
// Server entry for sub-route A. Reuses the parameterized <SubRouteView>
// Client component, which reads lang from the layout's <LangProvider>.

import type { Metadata } from 'next';
import SubRouteView from '../_components/sub-route-view';

export const metadata: Metadata = {
    title: 'Sub-route A · Routing Basics · Living Notebook',
};

export default function SubRouteAPage() {
    return <SubRouteView which='a' />;
}
