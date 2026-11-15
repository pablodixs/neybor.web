'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export type PushState =
    | 'loading'
    | 'unsupported' // navegador sem push
    | 'needs-install' // iPhone/iPad: push só funciona com o app instalado
    | 'unavailable' // backend sem chaves VAPID
    | 'denied'
    | 'off'
    | 'on'

function urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
    const output = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
    return output
}

function isIos() {
    const ua = navigator.userAgent
    return (
        /iPad|iPhone|iPod/.test(ua) ||
        (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
    )
}

function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
}

/** Liga e desliga as notificações push deste dispositivo. */
export function usePushSubscription() {
    const { data: session } = useSession()
    const token = session?.user?.token
    const [state, setState] = useState<PushState>('loading')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function check() {
            const supported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window

            if (!supported) {
                setState(
                    isIos() && !isStandalone()
                        ? 'needs-install'
                        : 'unsupported',
                )
                return
            }
            if (Notification.permission === 'denied') {
                setState('denied')
                return
            }

            const registration = await navigator.serviceWorker.getRegistration()
            const subscription =
                await registration?.pushManager.getSubscription()
            if (!cancelled) setState(subscription ? 'on' : 'off')
        }

        check().catch(() => !cancelled && setState('unsupported'))
        return () => {
            cancelled = true
        }
    }, [])

    const enable = useCallback(async () => {
        if (!token) return
        setBusy(true)
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setState(permission === 'denied' ? 'denied' : 'off')
                return
            }

            let publicKey: string
            try {
                const { data } = await axios.get<{ publicKey: string }>(
                    `${API_URL}/push/vapid-public-key`,
                    { headers: { Authorization: `Bearer ${token}` } },
                )
                publicKey = data.publicKey
            } catch {
                setState('unavailable')
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription =
                (await registration.pushManager.getSubscription()) ??
                (await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                }))

            await axios.post(
                `${API_URL}/push/subscriptions`,
                subscription.toJSON(),
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            setState('on')
        } catch (error) {
            console.error('[push] falha ao ativar', error)
            setState('off')
        } finally {
            setBusy(false)
        }
    }, [token])

    const disable = useCallback(async () => {
        setBusy(true)
        try {
            const registration = await navigator.serviceWorker.getRegistration()
            const subscription =
                await registration?.pushManager.getSubscription()
            if (subscription) {
                if (token) {
                    await axios
                        .delete(`${API_URL}/push/subscriptions`, {
                            data: { endpoint: subscription.endpoint },
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .catch(() => {})
                }
                await subscription.unsubscribe()
            }
            setState('off')
        } finally {
            setBusy(false)
        }
    }, [token])

    return { state, busy, enable, disable }
}
