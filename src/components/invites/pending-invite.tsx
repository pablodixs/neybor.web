'use client'

import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'neybor:pending-invite'
const SAVED_EVENT = 'neybor:invite-saved'
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

/** Guarda o código do link de convite até a pessoa ter conta. */
export function rememberInvite(code: string) {
    try {
        localStorage.setItem(STORAGE_KEY, code)
        window.dispatchEvent(new Event(SAVED_EVENT))
    } catch {
        // sem storage (aba anônima): o convite só não é contado
    }
}

function readInvite() {
    try {
        return localStorage.getItem(STORAGE_KEY)
    } catch {
        return null
    }
}

function forgetInvite() {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {}
}

/**
 * Quando quem chegou por um convite já está logado (logo depois de criar a
 * conta), avisa o backend quem convidou. Fica montado no app inteiro para
 * não depender de qual tela o cadastro termina.
 */
export function PendingInviteAcceptor() {
    const { data, status } = useSession()
    const sent = useRef(false)
    // muda quando a página do convite guarda um código com a sessão já aberta
    const [savedAt, setSavedAt] = useState(0)

    useEffect(() => {
        const onSaved = () => {
            sent.current = false
            setSavedAt(Date.now())
        }
        window.addEventListener(SAVED_EVENT, onSaved)
        return () => window.removeEventListener(SAVED_EVENT, onSaved)
    }, [])

    useEffect(() => {
        if (status !== 'authenticated' || sent.current) return
        const code = readInvite()
        if (!code) return
        sent.current = true

        axios
            .post(
                `${API_URL}/invites/${encodeURIComponent(code)}/accept`,
                null,
                {
                    headers: { Authorization: `Bearer ${data.user.token}` },
                },
            )
            .then(forgetInvite)
            .catch((error) => {
                // código inválido ou o próprio convite: não adianta tentar de novo
                const status = axios.isAxiosError(error)
                    ? error.response?.status
                    : undefined
                if (status === 400 || status === 404) forgetInvite()
                else sent.current = false
            })
    }, [status, data, savedAt])

    return null
}
