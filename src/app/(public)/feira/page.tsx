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
import { PublicFeira } from '@/components/marketplace/guest/public-feira'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { fetcherWithToken } from '@/lib/swr'
import { ListingSummary, ListingType } from '@/interfaces/marketplace'
import { ListingCard } from '@/components/marketplace/listing-card'
import { ListingTypeFilters } from '@/components/marketplace/listing-type-filters'
import { feiraError } from '@/components/marketplace/errors'
import { API_URL, useIsAdmin, useListingCategories } from '@/components/marketplace/use-marketplace'

const PAGE_SIZE = 20
const CONTROL = 'min-h-11 min-w-0 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-700'
const ACTION = 'inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700'
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

    const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<ListingSummary[]>(
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
    const hasFilters = Boolean(type || category || q || params.has('raio'))

    return (
        <div className="pt-5 lg:pt-0">
            <header className="mb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Feira do Bairro</h1>
                    <Link href="/feira/novo" className={`${ACTION} bg-green-700 px-3 text-white hover:bg-green-800`}>
                        <PlusIcon size={18} weight="bold" aria-hidden="true" />
                        Anunciar
                    </Link>
                </div>
                <nav aria-label="Minha Feira" className="-ml-2.5 mt-1 flex flex-wrap gap-x-1">
                    <Link href="/feira/minhas" className={`${ACTION} text-neutral-700 hover:bg-neutral-100`}>
                        <TagIcon size={17} aria-hidden="true" />
                        Meus anúncios
                    </Link>
                    <Link href="/feira/conversas" className={`${ACTION} text-neutral-700 hover:bg-neutral-100`}>
                        <ChatsCircleIcon size={17} aria-hidden="true" />
                        Conversas
                    </Link>
                    {isAdmin && (
                        <Link href="/feira/moderacao" className={`${ACTION} text-neutral-700 hover:bg-neutral-100`}>
                            <ShieldCheckIcon size={17} aria-hidden="true" />
                            Moderação
                        </Link>
                    )}
                </nav>
            </header>

            <form
                role="search"
                aria-label="Buscar na Feira"
                className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    go({ q: search.trim() || null })
                }}
            >
                <Input
                    fullWidth
                    type="search"
                    icon={MagnifyingGlassIcon}
                    placeholder="Buscar na vizinhança"
                    aria-label="Buscar na vizinhança"
                    className={`${CONTROL} w-full bg-neutral-50 pr-11`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" variant="secondary">Buscar</Button>
            </form>

            <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-neutral-200 pb-4">
                <ListingTypeFilters type={type} onChange={(next) => go({ tipo: next })} />
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 sm:w-auto sm:min-w-0">
                    <select
                        aria-label="Categoria"
                        value={category ?? ''}
                        onChange={(e) => go({ categoria: e.target.value || null })}
                        className={CONTROL}
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
                        className={CONTROL}
                    >
                        {RADII.map((r) => (
                            <option key={r.km} value={String(r.km)}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}

            {forbidden && (
                <p className="p-4 rounded-2xl bg-orange-50 text-orange-800 text-sm">
                    {feiraError(error, '')} Se você tem mais de um perfil, troque para o pessoal.{' '}
                    <Link href="/verificacao" className="underline font-semibold">
                        Verificar meu endereço
                    </Link>
                </p>
            )}

            {error && !forbidden && (
                <div role="alert" className="space-y-3 py-5 text-sm text-neutral-700">
                    <p>{feiraError(error, 'Não foi possível carregar os anúncios.')}</p>
                    <Button variant="secondary" onClick={() => void mutate()}>Tentar de novo</Button>
                </div>
            )}

            {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-10 text-neutral-600">
                    <p className="font-semibold text-neutral-800">Nenhum anúncio encontrado</p>
                    <p className="text-sm mb-4">
                        {hasFilters ? 'Tente outra busca ou ajuste os filtros.' : 'Seja o primeiro a anunciar, doar ou pedir algo no seu bairro.'}
                    </p>
                    {hasFilters && (
                        <Button variant="secondary" onClick={() => {
                            setSearch('')
                            go({ tipo: null, categoria: null, raio: null, q: null })
                        }}>Limpar filtros</Button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
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
    const { status } = useSession()
    return (
        <Suspense>
            {status === 'authenticated' ? <FeiraContent /> : <PublicFeira />}
        </Suspense>
    )
}
