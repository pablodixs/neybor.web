'use client'

import { FeedLayout } from '@/components/feed/feed-layout'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ComposeProvider } from '@/components/post/compose-context'
import { InstallBanner } from '@/components/pwa/install-banner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
    const router = useRouter()

    const {} = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/auth/login?callbackUrl=/')
        },
    })

    return (
        <ComposeProvider>
            <Header />
            <FeedLayout>{children}</FeedLayout>
            <InstallBanner variant="floating" />
            <BottomNav />
        </ComposeProvider>
    )
}
