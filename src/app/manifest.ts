import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: '/',
        name: 'Neybor',
        short_name: 'Neybor',
        description:
            'Alertas e conversas da sua vizinhança, direto no celular.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/feed?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#00A63E',
        categories: ['social', 'news', 'lifestyle'],
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icons/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Alertas próximos',
                short_name: 'Alertas',
                url: '/alerts?source=pwa',
                icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'Mapa',
                url: '/map?source=pwa',
                icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
        ],
    }
}
