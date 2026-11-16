'use client'

import {
    ChatCircleIcon,
    LinkIcon,
    SealCheckIcon,
    ShieldCheckIcon,
    WhatsappLogoIcon,
} from '@phosphor-icons/react'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { use, useState } from 'react'
import useSWR from 'swr'

import { Button } from '@/components/button'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { useToast } from '@/components/toast'
import { ListingCategory, PublicListingDetails } from '@/interfaces/marketplace'
import { shareLink } from '@/lib/share'
import { fetcher } from '@/lib/swr'

import {
    CONDITION_LABELS,
    formatPrice,
    PICKUP_LABELS,
    SAFETY_TIPS,
    STATUS_LABELS,
    TYPE_LABELS,
} from '../labels'
import { loginHref, SIGNUP_HREF } from './signup-links'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Listing page for visitors: everything public, and the contact box asks them to sign in. */
export function PublicListing({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const toast = useToast()
    const [photo, setPhoto] = useState(0)

    const { data: listing, error, isLoading } = useSWR<PublicListingDetails>(
        `${API_URL}/public/marketplace/listings/${id}`,
        fetcher,
        { shouldRetryOnError: false },
    )
    const { data: categories } = useSWR<ListingCategory[]>(
        `${API_URL}/public/marketplace/categories`,
        fetcher,
        { revalidateOnFocus: false },
    )

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner />
            </div>
        )
    }

    if (error || !listing) {
        return (
            <div>
                <Navigation title="Anúncio" />
                <p className="text-neutral-600 mb-4">
                    Este anúncio não está mais disponível.
                </p>
                <Link href="/feira">
                    <Button variant="bordered">Ver outros anúncios</Button>
                </Link>
            </div>
        )
    }

    const here = `/feira/${listing.id}`
    const open = listing.status === 'ACTIVE'
    const wanted = listing.type === 'WANTED'
    const authorFirstName = listing.authorName?.split(' ')[0] ?? 'o vizinho'
    const category = categories?.find((c) => c.id === listing.category)?.label
    const place = [listing.neighborhood, listing.city].filter(Boolean).join(', ')

    async function share() {
        const result = await shareLink(`${window.location.origin}${here}`, listing?.title)
        if (result === 'copied') toast.show('Link copiado')
        if (result === 'failed') toast.show('Não foi possível compartilhar.', 'error')
    }

    return (
        <div className="grid lg:grid-cols-[1fr_22rem] gap-6">
            <div>
                <Navigation title={TYPE_LABELS[listing.type]} />

                {listing.photos.length > 0 && (
                    <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={listing.photos[photo]?.url}
                            alt={listing.title}
                            className="w-full max-h-[28rem] object-contain rounded-2xl bg-neutral-100"
                        />
                        {listing.photos.length > 1 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto">
                                {listing.photos.map((p, i) => (
                                    <button
                                        key={p.url}
                                        onClick={() => setPhoto(i)}
                                        aria-label={`Foto ${i + 1}`}
                                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 ${i === photo ? 'border-green-600' : 'border-transparent'}`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.thumbUrl ?? p.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!open && (
                    <p className="mt-3 px-3 py-2 rounded-2xl text-sm font-semibold bg-neutral-100 text-neutral-700">
                        {STATUS_LABELS[listing.status]}
                    </p>
                )}

                <h1 className="mt-4 text-2xl font-bold text-neutral-900">{listing.title}</h1>
                <p className={`text-xl font-semibold ${listing.type === 'DONATION' ? 'text-green-700' : 'text-neutral-800'}`}>
                    {formatPrice(listing.type, listing.priceCents)}
                    {listing.acceptsOffers && (
                        <span className="text-sm font-medium text-neutral-500"> · aceita ofertas</span>
                    )}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                    {[
                        place,
                        category,
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

                <div className="mt-6 flex gap-2 p-3 rounded-2xl bg-green-50 text-green-900 text-sm">
                    <ShieldCheckIcon weight="bold" size={20} className="shrink-0" />
                    <ul className="list-disc pl-4">
                        {SAFETY_TIPS.map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <aside className="flex flex-col gap-3 lg:sticky lg:top-20 self-start">
                {listing.authorName && (
                    <div className="p-3 rounded-2xl border border-neutral-100">
                        <p className="font-semibold text-neutral-800 flex items-center gap-1">
                            {listing.authorName}
                            {listing.authorVerified && (
                                <SealCheckIcon weight="fill" className="text-green-600" aria-label="Vizinho verificado" />
                            )}
                        </p>
                        <p className="text-sm text-neutral-500">
                            {listing.authorVerified ? 'Vizinho verificado' : 'Endereço não verificado'}
                            {listing.authorMemberSince &&
                                ` · no Neybor há ${formatDistanceToNowStrict(new Date(listing.authorMemberSince), { locale: ptBR })}`}
                            {listing.authorCompletedCount ? ` · ${listing.authorCompletedCount} concluídos` : ''}
                        </p>
                    </div>
                )}

                {open && (
                    <div className="p-4 rounded-2xl border border-neutral-100 bg-white">
                        <p className="font-semibold text-neutral-800 flex items-center gap-2 mb-1">
                            <ChatCircleIcon weight="bold" />
                            {wanted ? `Ajude ${authorFirstName}` : `Fale com ${authorFirstName}`}
                        </p>
                        <p className="text-sm text-neutral-500 mb-3">
                            Para sua segurança e a dos vizinhos, o contato é feito só dentro do Neybor, por
                            quem tem conta e mora no bairro.
                        </p>
                        <Link href={loginHref(here)}>
                            <Button fullWidth>Entrar para enviar mensagem</Button>
                        </Link>
                        <p className="text-sm text-neutral-500 text-center mt-2">
                            Novo por aqui?{' '}
                            <Link href={SIGNUP_HREF} className="font-semibold text-green-700 underline">
                                Criar conta grátis
                            </Link>
                        </p>
                    </div>
                )}

                <div className="p-3 rounded-2xl border border-neutral-100">
                    <p className="font-semibold text-neutral-700 mb-2">Compartilhar anúncio</p>
                    <div className="flex gap-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`${listing.title} - ${typeof window === 'undefined' ? '' : window.location.origin}${here}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button fullWidth variant="bordered" icon={WhatsappLogoIcon} iconPlacement="leading" size="sm">
                                WhatsApp
                            </Button>
                        </a>
                        <div className="flex-1">
                            <Button
                                fullWidth
                                variant="bordered"
                                icon={LinkIcon}
                                iconPlacement="leading"
                                size="sm"
                                onClick={share}
                            >
                                Copiar link
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    )
}
