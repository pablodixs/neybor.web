import type { Metadata, Viewport } from 'next'

import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
    title: 'Neybor',
    description: 'Alertas e conversas da sua vizinhança.',
    applicationName: 'Neybor',
    appleWebApp: {
        capable: true,
        title: 'Neybor',
        statusBarStyle: 'default',
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        apple: '/icons/apple-touch-icon.png',
    },
}

export const viewport: Viewport = {
    themeColor: '#00A63E',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR">
            <body className="antialiased selection:bg-green-600 selection:text-white">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
