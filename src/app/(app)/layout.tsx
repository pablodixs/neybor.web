'use client'

import { AppShell } from '@/components/layout/app-shell'
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

    return <AppShell>{children}</AppShell>
}
