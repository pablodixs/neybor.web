'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

import { AppShell } from '@/components/layout/app-shell'
import { PublicShell } from '@/components/marketplace/guest/public-shell'
import { Spinner } from '@/components/spinner'

/**
 * Páginas abertas a visitantes (Feira do Bairro). Quem tem conta continua vendo
 * o app completo; quem não tem vê uma casca pública com convite para entrar.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
    const { status } = useSession()

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (status === 'authenticated') {
        return <AppShell>{children}</AppShell>
    }

    return <PublicShell>{children}</PublicShell>
}
