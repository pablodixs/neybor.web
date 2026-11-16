'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { fetcherWithToken } from '@/lib/swr'
import { ModerationItem, PostModerationItem } from '@/interfaces/marketplace'
import { formatPrice, REPORT_LABELS, TYPE_LABELS } from '@/components/marketplace/labels'
import { authHeaders } from '@/components/marketplace/errors'
import { API_URL, useIsAdmin, useListingCategories } from '@/components/marketplace/use-marketplace'

const KINDNESS_LABELS: Record<string, string> = {
    OFFENSIVE_LANGUAGE: 'Xingamento',
    THREAT: 'Ameaça ou justiça com as próprias mãos',
    PROFILING: 'Suspeito descrito por cor, origem ou aparência',
    VAGUE_SUSPICION: 'Suspeita sem dizer o que a pessoa fez',
    SHOUTING: 'Gritaria (maiúsculas e exclamações)',
}

export default function ModerationPage() {
    const { data: session } = useSession()
    const token = session?.user.token
    const isAdmin = useIsAdmin()
    const { labels } = useListingCategories()
    const { data, error, isLoading, mutate } = useSWR<ModerationItem[]>(
        token && isAdmin ? [`${API_URL}/admin/marketplace/review`, token] : null,
        fetcherWithToken,
    )
    const { data: posts, mutate: mutatePosts } = useSWR<PostModerationItem[]>(
        token && isAdmin ? [`${API_URL}/admin/posts/review`, token] : null,
        fetcherWithToken,
    )
    const [busyId, setBusyId] = useState<number | null>(null)
    const [busyPostId, setBusyPostId] = useState<number | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    async function decide(item: ModerationItem, action: 'approve' | 'remove') {
        const note =
            action === 'remove'
                ? (window.prompt('Motivo da remoção (opcional, fica no histórico):') ?? undefined)
                : undefined
        if (action === 'remove' && note === undefined) return

        setBusyId(item.listingId)
        setMessage(null)
        try {
            await axios.post(
                `${API_URL}/admin/marketplace/listings/${item.listingId}/${action}`,
                { note: note || null },
                authHeaders(token),
            )
            await mutate()
        } catch (e) {
            setMessage(
                axios.isAxiosError(e) && e.response?.status === 409
                    ? 'Outro moderador já decidiu este anúncio.'
                    : 'Não foi possível salvar a decisão. Tente de novo.',
            )
            await mutate()
        } finally {
            setBusyId(null)
        }
    }

    async function decidePost(post: PostModerationItem, action: 'keep' | 'remove') {
        if (action === 'remove' && !window.confirm('Remover este post? O autor será avisado.')) return
        setBusyPostId(post.postId)
        setMessage(null)
        try {
            await axios.post(`${API_URL}/admin/posts/${post.postId}/${action}`, {}, authHeaders(token))
        } catch {
            setMessage('Não foi possível salvar a decisão. Tente de novo.')
        } finally {
            await mutatePosts()
            setBusyPostId(null)
        }
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Moderação" />
            <h2 className="font-semibold text-neutral-800 mb-2">Anúncios da Feira</h2>

            {session && !isAdmin && (
                <p className="text-neutral-600">Esta área é só para administradores.</p>
            )}
            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}
            {error && <p className="text-red-600 text-sm">Não foi possível carregar a fila.</p>}
            {message && <p className="mb-3 text-sm bg-neutral-100 rounded-2xl px-3 py-2">{message}</p>}
            {data && data.length === 0 && (
                <p className="text-center py-10 text-neutral-600">Nenhum anúncio esperando revisão.</p>
            )}

            <div className="flex flex-col gap-4">
                {data?.map((item) => (
                    <article key={item.listingId} className="p-3 rounded-2xl border border-neutral-100 flex flex-col gap-2">
                        {item.photos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {item.photos.map((p) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img key={p.url} src={p.thumbUrl ?? p.url} alt={item.title} className="h-24 rounded-xl object-cover" />
                                ))}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-neutral-900">{item.title}</p>
                            <p className="text-sm text-neutral-500">
                                {TYPE_LABELS[item.type]} · {labels[item.category]} ·{' '}
                                {formatPrice(item.type, item.priceCents)} · por{' '}
                                {item.author?.displayName ?? 'desconhecido'}
                                {item.author && !item.author.verified && ' (não verificado)'} · criado há{' '}
                                {formatDistanceToNowStrict(new Date(item.createdAt), { locale: ptBR })}
                            </p>
                        </div>
                        {item.description && (
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{item.description}</p>
                        )}
                        <div className="text-sm">
                            {item.reports.length === 0 ? (
                                <p className="text-orange-700 font-medium">
                                    Sem denúncias: o filtro automático marcou o anúncio como suspeito.
                                </p>
                            ) : (
                                <ul className="list-disc pl-4 text-red-700">
                                    {item.reports.map((r, i) => (
                                        <li key={i}>
                                            {REPORT_LABELS[r.reason] ?? r.reason}
                                            {r.details && <span className="text-neutral-600"> — {r.details}</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                disabled={busyId === item.listingId}
                                onClick={() => decide(item, 'approve')}
                            >
                                Liberar
                            </Button>
                            <Button
                                size="sm"
                                variant="borderedDestructive"
                                disabled={busyId === item.listingId}
                                onClick={() => decide(item, 'remove')}
                            >
                                Remover
                            </Button>
                        </div>
                    </article>
                ))}
            </div>

            <h2 className="font-semibold text-neutral-800 mt-8 mb-1">Posts marcados pelo lembrete de gentileza</h2>
            <p className="text-sm text-neutral-500 mb-3">
                Publicados mesmo depois do lembrete. Seguem no ar até você decidir.
            </p>
            {posts && posts.length === 0 && (
                <p className="text-center py-6 text-neutral-600">Nenhum post esperando revisão.</p>
            )}
            <div className="flex flex-col gap-4">
                {posts?.map((post) => (
                    <article key={post.postId} className="p-3 rounded-2xl border border-neutral-100 flex flex-col gap-2">
                        <p className="text-sm text-neutral-500">
                            {post.authorName} (@{post.authorHandle}) · há{' '}
                            {formatDistanceToNowStrict(new Date(post.createdAt), { locale: ptBR })}
                        </p>
                        <p className="text-neutral-800 whitespace-pre-wrap">{post.content}</p>
                        <ul className="list-disc pl-4 text-sm text-orange-700">
                            {post.reasons.map((r) => (
                                <li key={r}>{KINDNESS_LABELS[r] ?? r}</li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <Button size="sm" variant="bordered" disabled={busyPostId === post.postId} onClick={() => decidePost(post, 'keep')}>
                                Manter
                            </Button>
                            <Button size="sm" variant="borderedDestructive" disabled={busyPostId === post.postId} onClick={() => decidePost(post, 'remove')}>
                                Remover
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}
