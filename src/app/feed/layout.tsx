import { Header } from '@/components/header'
import { FeedLayout } from './components/feed-layout'

export const metadata = {
    title: 'Neybor',
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <FeedLayout>{children}</FeedLayout>
        </>
    )
}
