'use client'

import { ReactNode } from 'react'

import { FeedLayout } from '@/components/feed/feed-layout'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ComposeProvider } from '@/components/post/compose-context'
import { InstallBanner } from '@/components/pwa/install-banner'

/** Casca do app para quem tem conta: cabeçalho, colunas, barra inferior e novo post. */
export function AppShell({ children }: { children: ReactNode }) {
    return (
        <ComposeProvider>
            <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">Ir para o conteúdo</a>
            <div className="min-h-dvh bg-white lg:bg-canvas">
                <Header />
                <FeedLayout>{children}</FeedLayout>
            </div>
            <InstallBanner variant="floating" />
            <BottomNav />
        </ComposeProvider>
    )
}
