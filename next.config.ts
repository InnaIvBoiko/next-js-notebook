import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Hosts the dev server (HMR + /_next/* assets) accepts cross-origin
    // requests from. `localhost` and `127.0.0.1` are allowed by default; here
    // we add the Mac's LAN IP so the app can be opened from a phone or another
    // device on the same WiFi network.
    //
    // ⚠️  Dev only. This option is ignored in production.
    // 📚 Doc: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md
    allowedDevOrigins: ['192.168.0.88'],
};

export default nextConfig;
