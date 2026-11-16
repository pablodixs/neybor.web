'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWRInfinite from 'swr/infinite'
import axios from 'axios'
import {
    ChatsCircleIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ShieldCheckIcon,
    TagIcon,
} from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { fetcherWithToken } from '@/lib/swr'
import { ListingSummary, ListingType } from '@/interfaces/marketplace'
import { ListingCard } from '@/components/marketplace/listing-card'
import { TYPE_LABELS } from '@/components/marketplace/labels'
import { feiraError } from '@/components/marketplace/errors'
import { API_URL, useIsAdmin, useListingCategories } from '@/components/marketplace/use-marketplace'

const PAGE_SIZE = 20
const RADII = [
    { km: 0.5, label: '500 m' },
    { km: 1.5, label: '1,5 km (bairro)' },
    { km: 5, label: '5 km' },
    { km: 15, label: '15 km' },
    { km: 50, label: 'Cidade' },
]

function FeiraContent() {
    const router = useRouter()
    const params = useSearchParams()
    const { data: session } = useSession()
    const { categories, labels } = useListingCategories()
    const isAdmin = useIsAdmin()

    const type = params.get('tipo') as ListingType | null
    const category = params.get('categoria')
    const radius = params.get('raio') ?? '1.5'
    const q = params.get('q') ?? ''
    const [search, setSearch] = useState(q)

    function go(next: Record<string, string | null>) {
        const merged = new URLSearchParams(params.toString())
        Object.entries(next).forEach(([k, v]) => (v ? merged.set(k, v) : merged.delete(k)))
        router.replace(`/feira${merged.size ? `?${merged}` : ''}`)
    }

    const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<ListingSummary[]>(
        (index) => {
            if (!session) return null
            const query = new URLSearchParams({
                radiusKm: radius,
                page: String(index),
                size: String(PAGE_SIZE),
            })
            if (type) query.set('type', type)
            if (category) query.set('category', category)
            if (q) query.set('q', q)
            return [`${API_URL}/marketplace/listings?${query}`, session.user.token]
        },
        fetcherWithToken,
        { revalidateFirstPage: false },
    )

    const listings = data?.flat() ?? []
    const lastPage = data?.[data.length - 1]
    const hasMore = !!lastPage && lastPage.length === PAGE_SIZE
    const forbidden = axios.isAxiosError(error) && error.response?.status === 403

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Feira do Bairro" showBackButton={false} />

            <div className="flex flex-wrap gap-2 mb-4">
                <Link href="/feira/novo">
                    <Button icon={PlusIcon} iconPlacement="leading" size="sm">
                        Anunciar
                    </Button>
                </Link>
                <Link href="/feira/minhas">
                    <Button variant="bordered" icon={TagIcon} iconPlacement="leading" size="sm">
                        Meus anúncios
                    </Button>
                </Link>
                {isAdmin && (
                    <Link href="/feira/moderacao">
                        <Button variant="bordered" icon={ShieldCheckIcon} iconPlacement="leading" size="sm">
                            Moderação
                        </Button>
                    </Link>
                )}
                <Link href="/feira/conversas">
                    <Button variant="bordered" icon={ChatsCircleIcon} iconPlacement="leading" size="sm">
                        Conversas
                    </Button>
                </Link>
            </div>

            <form
                className="mb-3"
                onSubmit={(e) => {
                    e.preventDefault()
                    go({ q: search.trim() || null })
                }}
            >
                <Input
                    fullWidth
                    icon={MagnifyingGlassIcon}
                    placeholder="Buscar na vizinhança"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </form>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {[null, 'DONATION', 'SALE', 'WANTED'].map((t) => (
                    <button
                        key={t ?? 'all'}
                        onClick={() => go({ tipo: t })}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition ${(type ?? null) === t ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                    >
                        {t ? TYPE_LABELS[t as ListingType] : 'Tudo'}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 mb-4">
                <select
                    aria-label="Categoria"
                    value={category ?? ''}
                    onChange={(e) => go({ categoria: e.target.value || null })}
                    className="flex-1 px-3 py-2 border-2 border-neutral-100 rounded-lg font-semibold text-neutral-700"
                >
                    <option value="">Todas as categorias</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="Distância"
                    value={radius}
                    onChange={(e) => go({ raio: e.target.value })}
                    className="px-3 py-2 border-2 border-neutral-100 rounded-lg font-semibold text-neutral-700"
                >
                    {RADII.map((r) => (
                        <option key={r.km} value={String(r.km)}>
                            {r.label}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}

            {forbidden && (
                <p className="p-4 rounded-2xl bg-orange-50 text-orange-800 text-sm">
                    {feiraError(error, '')} Se você tem mais de um perfil, troque para o pessoal.
                </p>
            )}

            {error && !forbidden && (
                <p className="text-red-600 text-sm">
                    {feiraError(error, 'Não foi possível carregar os anúncios.')}
                </p>
            )}

            {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-10 text-neutral-600">
                    <p className="font-semibold text-neutral-800">Nada por aqui ainda</p>
                    <p className="text-sm mb-4">
                        Seja o primeiro a anunciar, doar ou pedir algo no seu bairro.
                    </p>
                    <Link href="/feira/novo">
                        <Button size="sm">Anunciar agora</Button>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listings.map((l) => (
                    <ListingCard key={l.id} listing={l} categoryLabels={labels} />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-4">
                    <Button
                        variant="bordered"
                        onClick={() => setSize(size + 1)}
                        activityIndicator={isValidating}
                    >
                        Ver mais
                    </Button>
                </div>
            )}
        </div>
    )
}

export default function FeiraPage() {
    return (
        <Suspense>
            <FeiraContent />
        </Suspense>
    )
}
