'use client'

import {
    BookmarkSimpleIcon,
    HandshakeIcon,
    HouseLineIcon,
    SealCheckIcon,
    StorefrontIcon,
    WarningIcon,
} from '@phosphor-icons/react'
import {
    ChatCircleIcon,
    GlobeSimpleIcon,
    HeartIcon,
    ShareNetworkIcon,
    WarehouseIcon,
} from '@phosphor-icons/react/dist/ssr'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AlertLocationMap } from '@/components/map/alert-location-map'
import { shareLink } from '@/lib/share'
import { useToast } from '../toast'
import { PostMenu } from './post-menu'

export interface Author {
    id: number
    displayName: string
    handle: string
    avatarUrl: string
    type: 'USER' | string
    isVerified: boolean
    neighborhood: string
    city: string
    locationLabel: string
}

export interface PostProps {
    id: number
    author: Author
    content: string
    createdAt: string
    /** Ausentes quando o post não tem local. */
    latitude?: number | null
    longitude?: number | null
    /** true quando o local é só a região (veio do endereço do autor). */
    locationApproximate?: boolean
    type: 'GENERAL' | 'SAFETY_ALERT' | 'MARKETPLACE' | 'RECOMMENDATION' | string
    visibility: 'NEIGHBORHOOD' | 'PUBLIC' | 'PRIVATE'
    likedByMe: boolean
    myReactionType: string
    reactionsCount: number
    commentsCount: number
    isBookmarked: boolean
}

interface PostComponentProps {
    data: PostProps
    mutate: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const countFormat = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const formatCount = (value: number) => countFormat.format(value)

export function Post({
    data,
    currentUserToken,
    mutate,
}: PostComponentProps & { currentUserToken: string }) {
    const [liked, setLiked] = useState(data.likedByMe)
    const [reactionsCount, setReactionsCount] = useState(data.reactionsCount)
    const [reactionPending, setReactionPending] = useState(false)
    const [saved, setSaved] = useState(data.isBookmarked)
    const toast = useToast()
    const postPath = `/${data.author.handle}/post/${data.id}`

    const handleShare = async () => {
        const result = await shareLink(
            `${window.location.origin}${postPath}`,
            'Post no Neybor',
        )
        if (result === 'copied') toast.show('Link copiado')
        if (result === 'failed')
            toast.show('Não foi possível compartilhar.', 'error')
    }

    const handleBookmark = () => {
        const next = !saved
        setSaved(next)
        axios
            .post(`${API_URL}/post/${data.id}/bookmark`, null, {
                headers: { Authorization: `Bearer ${currentUserToken}` },
            })
            .then(() => toast.show(next ? 'Post salvo' : 'Removido dos salvos'))
            .catch(() => {
                setSaved(!next)
                toast.show('Não foi possível salvar agora.', 'error')
            })
    }

    const handleLike = async () => {
        if (reactionPending) return

        setReactionPending(true)
        setLiked(!liked)
        setReactionsCount(reactionsCount + (liked ? -1 : 1))
        try {
            await axios.post(`${API_URL}/post/${data.id}/react?type=LIKE`, null, {
                headers: { Authorization: `Bearer ${currentUserToken}` },
            })
        } catch {
            setLiked(liked)
            setReactionsCount(reactionsCount)
            toast.show('Não foi possível atualizar a curtida.', 'error')
        } finally {
            setReactionPending(false)
        }
    }

    const onPostDeleted = () => {
        mutate()
    }

    const createdAt = new Date(data.createdAt)
    // Linhas em branco no fim ou repetidas viram vãos no feed com whitespace-pre-wrap.
    const content = data.content.trim().replace(/\n{3,}/g, '\n\n')
    const isLong = content.length > 360 || content.split('\n').length > 6
    const actionClass = 'flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2 text-[1.125rem] text-neutral-600 transition-[color,background-color,transform] duration-150 ease-snappy hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-green-700 active:scale-[0.96] disabled:cursor-default motion-reduce:active:scale-100'
    const typeTag =
        data.type === 'SAFETY_ALERT'
            ? { label: 'Alerta', icon: WarningIcon, className: 'bg-amber-50 text-amber-900' }
            : data.type === 'RECOMMENDATION'
              ? { label: 'Indicação', icon: HandshakeIcon, className: 'bg-neutral-100 text-neutral-700' }
              : data.type === 'MARKETPLACE'
                ? { label: 'Feira', icon: StorefrontIcon, className: 'bg-neutral-100 text-neutral-700' }
                : null

    return (
        <article className="w-full border-b border-neutral-200 py-4">
            <header className="flex items-start justify-between gap-2 text-sm">
                <Link className="flex min-w-0 items-center gap-2 rounded-md" href={`/${data.author.handle}`}>
                    <Image
                        className="size-9 shrink-0 rounded-full bg-neutral-100 object-cover"
                        src={data.author.avatarUrl || '/images/default-avatar.png'}
                        alt=""
                        width={36}
                        height={36}
                    />
                    <span className="min-w-0">
                        <span className="flex items-center gap-1">
                            <strong className="wrap-anywhere font-bold text-neutral-950">{data.author.displayName}</strong>
                            {data.author.isVerified && (
                                <SealCheckIcon weight="fill" className="shrink-0 text-green-700" aria-label="Perfil verificado" />
                            )}
                        </span>
                        {data.author.neighborhood && (
                            <span className="block wrap-anywhere text-xs text-neutral-600">{data.author.neighborhood}</span>
                        )}
                    </span>
                </Link>
                <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs text-neutral-600">
                    {data.visibility === 'PUBLIC' ? (
                        <GlobeSimpleIcon size={14} aria-label="Público" />
                    ) : data.visibility === 'NEIGHBORHOOD' ? (
                        <HouseLineIcon size={14} aria-label="Vizinhança" />
                    ) : (
                        <WarehouseIcon size={14} aria-label="Privado" />
                    )}
                    <time dateTime={data.createdAt} title={createdAt.toLocaleString('pt-BR')}>
                        {formatDistanceToNowStrict(createdAt, { locale: ptBR })}
                    </time>
                </span>
            </header>
            <div className="mt-2.5 sm:ml-11">
                {typeTag && (
                    <span className={`mb-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${typeTag.className}`}>
                        <typeTag.icon weight="bold" aria-hidden="true" />
                        {typeTag.label}
                    </span>
                )}
                <Link href={postPath} className={`block max-w-3xl rounded-sm text-[0.9375rem] leading-relaxed wrap-break-word whitespace-pre-wrap text-neutral-800 sm:text-base ${isLong ? 'line-clamp-6' : ''}`}>
                    {content}
                </Link>
                {isLong && (
                    <Link href={postPath} className="mt-1 inline-flex min-h-8 items-center text-sm font-semibold text-green-800 hover:underline">
                        Ler mais
                    </Link>
                )}
                {data.type === 'SAFETY_ALERT' && (
                    <AlertLocationMap className="mt-3 max-w-3xl overflow-hidden rounded-xl" latitude={data.latitude} longitude={data.longitude} approximate={data.locationApproximate} />
                )}
            </div>
            <footer className="mt-2 -mb-1 -ml-2 flex items-center gap-1 sm:ml-9">
                <button
                    type="button"
                    onClick={handleLike}
                    aria-label="Curtir"
                    aria-pressed={liked}
                    disabled={reactionPending}
                    className={`cursor-pointer hover:text-red-600 aria-pressed:text-red-600 ${actionClass}`}
                >
                    <HeartIcon weight={liked ? 'fill' : 'regular'} aria-hidden="true" />
                    {reactionsCount > 0 && <span className="text-sm font-medium tabular-nums">{formatCount(reactionsCount)}</span>}
                </button>
                <Link href={`${postPath}#comentarios`} aria-label="Comentar" className={actionClass}>
                    <ChatCircleIcon aria-hidden="true" />
                    {data.commentsCount > 0 && <span className="text-sm font-medium tabular-nums">{formatCount(data.commentsCount)}</span>}
                </Link>
                <span className="flex-1" />
                <button type="button" onClick={handleShare} aria-label="Compartilhar" title="Compartilhar" className={`cursor-pointer ${actionClass}`}>
                    <ShareNetworkIcon aria-hidden="true" />
                </button>
                <button type="button" onClick={handleBookmark} aria-pressed={saved} aria-label="Salvar post" title={saved ? 'Remover dos salvos' : 'Salvar'} className={`cursor-pointer aria-pressed:text-green-800 ${actionClass}`}>
                    <BookmarkSimpleIcon weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
                </button>
                <PostMenu
                    buttonSize="small"
                    authorId={data.author.id}
                    postId={data.id}
                    onPostDeleted={onPostDeleted}
                    isBookmarked={saved}
                    shareUrl={postPath}
                    onPostSaved={() => mutate()}
                />
            </footer>
        </article>
    )
}
