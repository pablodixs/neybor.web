'use client'

import {
    MagnifyingGlassIcon,
    MapPinIcon,
    WarningIcon,
    XIcon,
} from '@phosphor-icons/react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { mutate } from 'swr'

import { friendlyApiError } from '@/lib/api-error'

import { Button } from '../button'
import { useToast } from '../toast'
import { AlertCategoryKey, AlertCategoryPicker } from './alert-category-picker'
import { checkKindness, KindnessCheck, KindnessReminder } from './kindness-reminder'

export type ComposeType = 'GENERAL' | 'SAFETY_ALERT'

type PostType = ComposeType | 'RECOMMENDATION'
type PostVisibility = 'PUBLIC' | 'NEAR_NEIGHBORHOODS' | 'NEIGHBORHOOD'

interface Coordinates {
    latitude: number
    longitude: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const FORMATS = [
    { type: 'SAFETY_ALERT', label: 'Alerta', icon: WarningIcon },
    { type: 'RECOMMENDATION', label: 'Recomendação', icon: MagnifyingGlassIcon },
] as const

export function NewPostDialog({
    onClose,
    initialType = 'GENERAL',
}: {
    onClose: () => void
    initialType?: ComposeType
}) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const reminderRef = useRef<HTMLDivElement>(null)
    const [postContent, setPostContent] = useState('')
    const [postType, setPostType] = useState<PostType>(initialType)
    const [selectedVisibility, setSelectedVisibility] = useState<PostVisibility>()
    const [alertCategory, setAlertCategory] = useState<AlertCategoryKey | null>(null)
    const [coords, setCoords] = useState<Coordinates | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isCheckingKindness, setIsCheckingKindness] = useState(false)
    const [isPostSending, setIsPostSending] = useState(false)
    const [kindnessCheck, setKindnessCheck] = useState<KindnessCheck | null>(null)
    const [acknowledgedContent, setAcknowledgedContent] = useState<string | null>(null)
    const { data } = useSession()
    const toast = useToast()
    const isAlert = postType === 'SAFETY_ALERT'
    const visibility = selectedVisibility ?? (isAlert ? 'NEIGHBORHOOD' : 'PUBLIC')
    const token = data?.user.token
    const busy = isCheckingKindness || isPostSending
    const valid = !!token && !isLocating && postContent.trim().length >= 2 &&
        postContent.length <= 300 && (!isAlert || !!alertCategory)

    useEffect(() => {
        const dialog = dialogRef.current
        const trigger = document.activeElement
        dialog?.showModal()

        return () => {
            dialog?.close()
            if (trigger instanceof HTMLElement && trigger.isConnected) {
                trigger.focus({ preventScroll: true })
            }
        }
    }, [])

    useEffect(() => {
        const target = kindnessCheck ? reminderRef.current : editorRef.current
        target?.focus({ preventScroll: true })
    }, [kindnessCheck])

    function handleLocate() {
        if (coords) {
            setCoords(null)
            return
        }
        if (!('geolocation' in navigator)) {
            setErrorMessage('Seu navegador não permite usar a localização.')
            return
        }
        setIsLocating(true)
        setErrorMessage(null)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
                setIsLocating(false)
            },
            () => {
                setErrorMessage('Não foi possível obter sua localização. Você pode publicar com o endereço do perfil.')
                setIsLocating(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        )
    }

    async function sendPost() {
        setIsPostSending(true)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_URL}/post`,
                {
                    content: postContent,
                    type: postType,
                    visibility,
                    alertCategory: isAlert ? alertCategory : undefined,
                    collaborative: isAlert ? true : undefined,
                    latitude: coords?.latitude,
                    longitude: coords?.longitude,
                },
                { headers: { Authorization: `Bearer ${token}` } },
            )

            void mutate(
                (key) =>
                    Array.isArray(key) &&
                    typeof key[0] === 'string' &&
                    /\/(alerts|feed)/.test(key[0]),
            )
            toast.show(
                isAlert ? 'Alerta publicado e adicionado ao mapa.' : 'Post publicado.',
            )
            onClose()
        } catch (error) {
            setErrorMessage(friendlyApiError(error, 'Não foi possível publicar agora. Tente de novo.'))
        } finally {
            setIsPostSending(false)
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!valid || busy) return

        if (acknowledgedContent !== postContent) {
            setIsCheckingKindness(true)
            const check = await checkKindness(postContent, token)
            setIsCheckingKindness(false)
            if (check?.flagged) {
                setKindnessCheck(check)
                return
            }
        }
        await sendPost()
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="compose-title"
            onCancel={(event) => {
                event.preventDefault()
                if (!busy) onClose()
            }}
            className="fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] bottom-auto mx-auto mb-0 max-h-[calc(100dvh-1rem-env(safe-area-inset-top))] w-[calc(100%-1rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 backdrop:bg-black/50 sm:top-16 sm:max-h-[calc(100dvh-5rem)] sm:p-5"
        >
            <header className="flex items-center justify-between gap-3">
                <h2 id="compose-title" className="text-xl font-semibold tracking-tight">Novo post</h2>
                <button type="button" aria-label="Fechar" disabled={busy} onClick={onClose} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:cursor-wait">
                    <XIcon size={18} weight="bold" aria-hidden="true" />
                </button>
            </header>
            {kindnessCheck ? (
                <div ref={reminderRef} tabIndex={-1}>
                    <KindnessReminder
                        check={kindnessCheck}
                        onEdit={() => setKindnessCheck(null)}
                        onPublishAnyway={() => {
                            setAcknowledgedContent(postContent)
                            setKindnessCheck(null)
                            void sendPost()
                        }}
                    />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={busy} className="contents">
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                                <Image className="size-8 shrink-0 rounded-full bg-neutral-100 object-cover" src={data?.user.avatarUrl || '/images/default-avatar.png'} alt="" width={32} height={32} />
                                <span className="truncate">{data?.user.displayName}</span>
                            </span>
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                                Público do post
                                <select value={visibility} onChange={(event) => setSelectedVisibility(event.target.value as PostVisibility)} className="min-h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-2 font-medium text-neutral-900">
                                    <option value="PUBLIC">Todos</option>
                                    <option value="NEAR_NEIGHBORHOODS">Vizinhanças próximas</option>
                                    <option value="NEIGHBORHOOD">Minha vizinhança</option>
                                </select>
                            </label>
                        </div>
                        <label htmlFor="compose-content" className="sr-only">Texto do post</label>
                        <textarea
                            id="compose-content"
                            ref={editorRef}
                            onChange={(event) => setPostContent(event.target.value)}
                            value={postContent}
                            placeholder={isAlert ? 'Descreva o que está acontecendo e onde' : 'O que está acontecendo?'}
                            aria-describedby="compose-limit"
                            aria-invalid={postContent.length > 300 || undefined}
                            className="mt-4 min-h-24 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2 text-base placeholder:text-neutral-600"
                            rows={3}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {FORMATS.map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    type="button"
                                    aria-pressed={postType === type}
                                    onClick={() => setPostType(postType === type ? 'GENERAL' : type)}
                                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 aria-pressed:border-green-200 aria-pressed:bg-green-50 aria-pressed:text-green-800"
                                >
                                    <Icon size={18} weight="bold" aria-hidden="true" /> {label}
                                </button>
                            ))}
                        </div>
                        {isAlert && (
                            <AlertCategoryPicker value={alertCategory} onChange={setAlertCategory} />
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-neutral-200 pb-3">
                            <button
                                type="button"
                                onClick={handleLocate}
                                disabled={isLocating}
                                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-semibold text-green-800 hover:underline disabled:cursor-wait"
                            >
                                <MapPinIcon size={18} weight={coords ? 'fill' : 'bold'} aria-hidden="true" />
                                {isLocating ? 'Obtendo localização…' : coords ? 'Remover localização atual' : 'Usar localização atual'}
                            </button>
                            {coords ? (
                                <span className="text-sm text-neutral-600">Localização atual selecionada</span>
                            ) : isAlert ? (
                                <span className="text-sm text-neutral-600">Local aproximado: endereço do perfil</span>
                            ) : null}
                        </div>
                        {errorMessage && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{errorMessage}</p>}
                        <footer className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <p id="compose-limit" className={`text-sm tabular-nums ${postContent.length > 300 ? 'font-semibold text-red-800' : 'text-neutral-600'}`}>
                                {postContent.length}/300 caracteres
                            </p>
                            <Button type="submit" disabled={!valid || busy} activityIndicator={busy} activityLabel={isPostSending ? 'Publicando…' : 'Verificando…'}>
                                Publicar
                            </Button>
                        </footer>
                    </fieldset>
                </form>
            )}
        </dialog>
    )
}
