'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallMode = 'prompt' | 'ios' | null

const DISMISS_KEY = 'neybor:install-dismissed-at'
const DISMISS_FOR_MS = 1000 * 60 * 60 * 24 * 14 // 14 dias

/*
 * O evento `beforeinstallprompt` dispara uma vez só e pode chegar antes de
 * qualquer componente montar. Por isso ele é capturado no nível do módulo e
 * compartilhado entre todos os banners por uma store simples.
 */
let deferred: BeforeInstallPromptEvent | null = null
let dismissed = false
let installed = false
const listeners = new Set<() => void>()

function emit() {
    listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault()
        deferred = event as BeforeInstallPromptEvent
        emit()
    })
    window.addEventListener('appinstalled', () => {
        deferred = null
        installed = true
        emit()
    })
}

function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // Safari no iOS
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
}

function isIosSafari() {
    const ua = navigator.userAgent
    const isIos =
        /iPad|iPhone|iPod/.test(ua) ||
        (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
    return isIos && isSafari
}

function wasDismissedRecently() {
    try {
        const raw = localStorage.getItem(DISMISS_KEY)
        if (!raw) return false
        return Date.now() - Number(raw) < DISMISS_FOR_MS
    } catch {
        return false
    }
}

function getMode(): InstallMode {
    if (dismissed || installed) return null
    if (isStandalone() || wasDismissedRecently()) return null
    if (deferred) return 'prompt'
    if (isIosSafari()) return 'ios'
    return null
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/**
 * Controla o convite para instalar o app.
 * - Android/Chrome/Edge: abre o diálogo nativo quando a pessoa toca em "Instalar".
 * - Safari no iOS: não existe API, então mostramos o passo a passo.
 */
export function useInstallPrompt() {
    const mode = useSyncExternalStore(subscribe, getMode, () => null)

    // garante que um banner montado depois do evento leia o estado atual
    useEffect(() => emit(), [])

    const install = useCallback(async () => {
        if (!deferred) return
        const event = deferred
        deferred = null
        await event.prompt()
        await event.userChoice
        emit()
    }, [])

    const dismiss = useCallback(() => {
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()))
        } catch {
            // modo privado ou storage bloqueado: esconde só nesta sessão
        }
        dismissed = true
        emit()
    }, [])

    return { mode, install, dismiss }
}
