'use client'

import { SessionProvider } from 'next-auth/react'

import './globals.css'

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR">
            <SessionProvider>
                {
                    <body
                        className={`antialiased selection:bg-green-600 selection:text-white`}
                    >
                        {children}
                    </body>
                }
            </SessionProvider>
        </html>
    )
}
