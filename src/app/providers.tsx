'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ServiceWorkerRegister />
            {children}
        </SessionProvider>
    )
}
