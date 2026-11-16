'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

import { PendingInviteAcceptor } from '@/components/invites/pending-invite'
import { ToastProvider } from '@/components/toast'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ToastProvider>
                <ServiceWorkerRegister />
                <PendingInviteAcceptor />
                {children}
            </ToastProvider>
        </SessionProvider>
    )
}
