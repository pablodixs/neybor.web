import { PageContainer } from '@/components/page-container'

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <PageContainer>{children}</PageContainer>
}
