'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChatCircleIcon, FlagIcon, SealCheckIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { PublicListing } from '@/components/marketplace/guest/public-listing'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { fetcherWithToken } from '@/lib/swr'
import { ListingDetails, ListingInterest } from '@/interfaces/marketplace'
import {
    CONDITION_LABELS,
    formatDistance,
    formatPrice,
    PICKUP_LABELS,
    REPORT_LABELS,
    SAFETY_TIPS,
    STATUS_LABELS,
    TYPE_LABELS,
} from '@/components/marketplace/labels'
import { authHeaders, feiraError } from '@/components/marketplace/errors'
import { API_URL, useListingCategories } from '@/components/marketplace/use-marketplace'

function MemberListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { data: session } = useSession()
    const token = session?.user.token
    const { labels } = useListingCategories()

    const { data: listing, error, isLoading, mutate } = useSWR<ListingDetails>(
        token ? [`${API_URL}/marketplace/listings/${id}`, token] : null,
        fetcherWithToken,
    )
    const { data: interests, mutate: mutateInterests } = useSWR<ListingInterest[]>(
        token && listing?.mine ? [`${API_URL}/marketplace/listings/${id}/interests`, token] : null,
        fetcherWithToken,
    )

    const [photo, setPhoto] = useState(0)
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [reporting, setReporting] = useState(false)
    const [reason, setReason] = useState('SCAM')

    async function run(action: () => Promise<unknown>, done?: string) {
        setBusy(true)
        setMessage(null)
        try {
            await action()
            await Promise.all([mutate(), mutateInterests()])
            if (done) setMessage(done)
        } catch (e) {
            setMessage(feiraError(e, 'Não foi possível concluir a ação.'))
        } finally {
            setBusy(false)
        }
    }

    const base = `${API_URL}/marketplace/listings/${id}`
    const post = (path: string, body?: unknown) => axios.post(`${base}${path}`, body ?? {}, authHeaders(token))

    async function showInterest() {
        setBusy(true)
        setMessage(null)
        try {
            const { data } = await post('/interest')
            router.push(`/feira/conversas/${data.conversationId}`)
        } catch (e) {
            setMessage(feiraError(e, 'Não foi possível enviar seu interesse.'))
            setBusy(false)
        }
    }

    if (isLoading || !token) {
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white flex justify-center py-16">
                <Spinner />
            </div>
        )
    }

    if (error || !listing) {
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
                <Navigation title="Anúncio" />
                <p className="text-neutral-600">{feiraError(error, 'Não foi possível carregar o anúncio.')}</p>
            </div>
        )
    }

    const open = listing.status === 'ACTIVE' || listing.status === 'RESERVED'
    const distance = formatDistance(listing.distanceMeters)
    const wanted = listing.type === 'WANTED'

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title={TYPE_LABELS[listing.type]} />

            {listing.photos.length > 0 && (
                <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={listing.photos[photo]?.url}
                        alt={listing.title}
                        className="w-full max-h-96 object-contain rounded-2xl bg-neutral-100"
                    />
                    {listing.photos.length > 1 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                            {listing.photos.map((p, i) => (
                                <button
                                    key={p.url}
                                    onClick={() => setPhoto(i)}
                                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 ${i === photo ? 'border-green-600' : 'border-transparent'}`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.thumbUrl ?? p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {listing.status !== 'ACTIVE' && (
                <p
                    className={`mb-3 px-3 py-2 rounded-2xl text-sm font-semibold ${listing.status === 'UNDER_REVIEW' ? 'bg-orange-50 text-orange-800' : 'bg-neutral-100 text-neutral-700'}`}
                >
                    {listing.status === 'UNDER_REVIEW'
                        ? 'Este anúncio está em análise e não aparece para os vizinhos.'
                        : listing.reservedForMe
                          ? 'Reservado para você. Combine a entrega no chat.'
                          : STATUS_LABELS[listing.status]}
                </p>
            )}

            <h1 className="text-xl font-bold text-neutral-900">{listing.title}</h1>
            <p className={`text-lg font-semibold ${listing.type === 'DONATION' ? 'text-green-700' : 'text-neutral-800'}`}>
                {formatPrice(listing.type, listing.priceCents)}
                {listing.acceptsOffers && <span className="text-sm font-medium text-neutral-500"> · aceita ofertas</span>}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
                {[
                    distance,
                    listing.neighborhood,
                    labels[listing.category],
                    listing.condition && !wanted ? CONDITION_LABELS[listing.condition] : null,
                    `publicado há ${formatDistanceToNowStrict(new Date(listing.createdAt), { locale: ptBR })}`,
                ]
                    .filter(Boolean)
                    .join(' · ')}
            </p>

            {listing.description && (
                <p className="mt-4 text-neutral-700 whitespace-pre-wrap">{listing.description}</p>
            )}
            <p className="mt-3 text-sm text-neutral-600">
                <strong>Entrega:</strong> {PICKUP_LABELS[listing.pickupOption]}
            </p>

            {listing.author && (
                <div className="mt-4 p-3 rounded-2xl border border-neutral-100 flex items-center gap-3">
                    <div className="min-w-0">
                        <p className="font-semibold text-neutral-800 flex items-center gap-1">
                            {listing.author.displayName}
                            {listing.author.verified && (
                                <SealCheckIcon weight="fill" className="text-green-600" aria-label="Vizinho verificado" />
                            )}
                        </p>
                        <p className="text-sm text-neutral-500">
                            {listing.author.verified ? 'Vizinho verificado' : 'Endereço não verificado'} · no Neybor há{' '}
                            {formatDistanceToNowStrict(new Date(listing.author.memberSince), { locale: ptBR })}
                            {listing.author.completedCount ? ` · ${listing.author.completedCount} concluídos` : ''}
                        </p>
                    </div>
                </div>
            )}

            {message && <p className="mt-3 text-sm text-neutral-700 bg-neutral-100 rounded-2xl px-3 py-2">{message}</p>}

            {/* ----- visitante ----- */}
            {!listing.mine && open && (
                <div className="mt-4 flex flex-col gap-2">
                    {listing.conversationId ? (
                        <Link href={`/feira/conversas/${listing.conversationId}`}>
                            <Button fullWidth icon={ChatCircleIcon} iconPlacement="leading">
                                Abrir conversa
                            </Button>
                        </Link>
                    ) : (
                        <Button fullWidth icon={ChatCircleIcon} iconPlacement="leading" activityIndicator={busy} onClick={showInterest}>
                            {wanted ? 'Posso ajudar' : listing.type === 'DONATION' ? 'Quero' : 'Tenho interesse'}
                        </Button>
                    )}
                    {listing.interested && (
                        <Button
                            variant="ghost"
                            disabled={busy}
                            onClick={() => run(() => axios.delete(`${base}/interest`, authHeaders(token)), 'Interesse removido.')}
                        >
                            Retirar meu interesse
                        </Button>
                    )}
                </div>
            )}

            {/* ----- dono ----- */}
            {listing.mine && (
                <div className="mt-4 flex flex-col gap-3">
                    {open && (
                        <div>
                            <p className="font-semibold text-neutral-700 mb-1">
                                Interessados ({listing.interestCount ?? 0})
                            </p>
                            {interests && interests.length === 0 && (
                                <p className="text-sm text-neutral-500">Ninguém ainda. Os vizinhos que responderem aparecem aqui.</p>
                            )}
                            <div className="flex flex-col gap-2">
                                {interests?.map((i) => (
                                    <div key={i.profileId} className="flex items-center justify-between gap-2 p-2 rounded-xl border border-neutral-100">
                                        <span className="font-semibold text-neutral-800 truncate">
                                            {i.displayName ?? 'Vizinho'}
                                            {i.status === 'RESERVED' && <span className="text-green-700 font-medium"> · reservado</span>}
                                        </span>
                                        {listing.status === 'ACTIVE' && (
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                disabled={busy}
                                                onClick={() => run(() => post('/reserve', { profileId: i.profileId }), 'Reservado. A pessoa foi avisada.')}
                                            >
                                                Reservar
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Link href="/feira/conversas" className="text-sm text-green-700 font-semibold underline">
                                Ver conversas
                            </Link>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {open && (
                            <Button disabled={busy} onClick={() => run(() => post('/complete'), 'Anúncio concluído.')}>
                                {listing.type === 'DONATION' ? 'Marcar como doado' : wanted ? 'Consegui' : 'Marcar como vendido'}
                            </Button>
                        )}
                        {listing.status === 'RESERVED' && (
                            <Button variant="bordered" disabled={busy} onClick={() => run(() => post('/release'), 'Reserva desfeita.')}>
                                Liberar reserva
                            </Button>
                        )}
                        {(listing.status === 'ACTIVE' || listing.status === 'EXPIRED') && (
                            <Button variant="bordered" disabled={busy} onClick={() => run(() => post('/renew'), 'Anúncio renovado.')}>
                                Renovar
                            </Button>
                        )}
                        {listing.status !== 'COMPLETED' && (
                            <Button
                                variant="borderedDestructive"
                                disabled={busy}
                                onClick={() =>
                                    run(async () => {
                                        await axios.delete(base, authHeaders(token))
                                        router.push('/feira/minhas')
                                    })
                                }
                            >
                                Remover
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ----- segurança e denúncia ----- */}
            <div className="mt-6 flex gap-2 p-3 rounded-2xl bg-green-50 text-green-900 text-sm">
                <ShieldCheckIcon weight="bold" size={20} className="shrink-0" />
                <ul className="list-disc pl-4">
                    {SAFETY_TIPS.map((t) => (
                        <li key={t}>{t}</li>
                    ))}
                </ul>
            </div>

            {!listing.mine && (
                <div className="mt-3">
                    {!reporting ? (
                        <button
                            onClick={() => setReporting(true)}
                            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-600 cursor-pointer"
                        >
                            <FlagIcon /> Denunciar anúncio
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center flex-wrap">
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="px-3 py-2 border-2 border-neutral-100 rounded-lg font-semibold text-sm"
                            >
                                {Object.entries(REPORT_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                            <Button
                                size="sm"
                                variant="danger"
                                disabled={busy}
                                onClick={() =>
                                    run(async () => {
                                        await post('/report', { reason })
                                        setReporting(false)
                                    }, 'Obrigado. Vamos analisar a denúncia.')
                                }
                            >
                                Enviar denúncia
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setReporting(false)}>
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { status } = useSession()
    return status === 'authenticated' ? (
        <MemberListingPage params={params} />
    ) : (
        <PublicListing params={params} />
    )
}
