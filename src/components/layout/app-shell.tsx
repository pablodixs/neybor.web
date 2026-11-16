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
            <Header />
            <FeedLayout>{children}</FeedLayout>
            <InstallBanner variant="floating" />
            <BottomNav />
        </ComposeProvider>
    )
}
