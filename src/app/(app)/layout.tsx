import { FeedLayout } from '@/components/feed/feed-layout'
import { Header } from '@/components/header'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            <FeedLayout>{children}</FeedLayout>
        </>
    )
}
