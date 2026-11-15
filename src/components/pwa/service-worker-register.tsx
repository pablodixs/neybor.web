'use client'

import { useEffect } from 'react'

/**
 * Registra o service worker em produção. Em desenvolvimento ele fica
 * desligado para não servir arquivos antigos do cache durante o hot reload.
 * Use NEXT_PUBLIC_ENABLE_SW=true para testar localmente.
 */
export function ServiceWorkerRegister() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return

        const enabled =
            process.env.NODE_ENV === 'production' ||
            process.env.NEXT_PUBLIC_ENABLE_SW === 'true'

        if (!enabled) return

        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .catch((error) => {
                console.error(
                    '[pwa] falha ao registrar o service worker',
                    error,
                )
            })
    }, [])

    return null
}
