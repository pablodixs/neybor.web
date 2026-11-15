import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'github.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'assets-neybor.s3.amazonaws.com',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                // o navegador precisa sempre buscar a versão mais nova do
                // service worker para que as atualizações cheguem rápido
                source: '/sw.js',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        // geolocalização liberada só para o próprio site (alertas com local atual)
                        value: 'camera=(), microphone=(), geolocation=(self)',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains',
                    },
                ],
            },
        ]
    },
}

export default nextConfig

// Disponibiliza os bindings do Cloudflare (getCloudflareContext) no `next dev`.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
