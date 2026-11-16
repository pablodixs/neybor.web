'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

import { PendingInviteAcceptor } from '@/components/invites/pending-invite'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ServiceWorkerRegister />
            <PendingInviteAcceptor />
            {children}
        </SessionProvider>
    )
}
