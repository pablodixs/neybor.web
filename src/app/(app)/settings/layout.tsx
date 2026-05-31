import { PageContainer } from '@/components/page-container'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'Preferências - Neybor',
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
    return <PageContainer>{children}</PageContainer>
}
