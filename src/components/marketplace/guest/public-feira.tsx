'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useState } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Spinner } from '@/components/spinner'
import {
    ListingCategory,
    ListingSummary,
    ListingType,
    PublicListingSummary,
} from '@/interfaces/marketplace'
import { fetcher } from '@/lib/swr'

import { ListingCard } from '../listing-card'
import { ListingTypeFilters, listingFilterButton } from '../listing-type-filters'
import { loginHref, SIGNUP_HREF } from './signup-links'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 20
const CTA_AFTER = 8
const CONTROL = 'min-h-11 min-w-0 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-700'
const ACCOUNT_LINK = 'inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700'
const SIGNUP_LINK = `${ACCOUNT_LINK} bg-green-700 text-white hover:bg-green-800`

/** Adapts the open API shape to the card used by logged-in neighbors. */
function toCardListing(l: PublicListingSummary): ListingSummary {
    return {
        id: l.id,
        type: l.type,
        status: l.status,
        title: l.title,
        category: l.category,
        priceCents: l.priceCents,
        thumbUrl: l.thumbUrl,
        distanceMeters: null,
        neighborhood: [l.neighborhood, l.city].filter(Boolean).join(', ') || null,
        createdAt: l.createdAt,
        author: l.authorName
            ? {
                  id: 0,
                  handle: '',
                  displayName: l.authorName,
                  avatarUrl: null,
                  verified: l.authorVerified,
                  memberSince: l.createdAt,
                  completedCount: null,
              }
            : null,
    }
}

function SignupCard() {
    return (
        <div className="col-span-full rounded-2xl bg-green-50 border border-green-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
                <p className="font-bold text-green-900 text-lg">
                    Gostou do que viu? Entre para o seu bairro.
                </p>
                <p className="text-green-800 text-sm">
                    Com a conta você fala com os vizinhos, reserva itens e anuncia de graça.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Link href={SIGNUP_HREF} className={SIGNUP_LINK}>Criar conta</Link>
                <Link href={loginHref('/feira')} className={`${ACCOUNT_LINK} border border-green-200 bg-white text-green-900 hover:bg-green-100`}>Entrar</Link>
            </div>
        </div>
    )
}

export function PublicFeira() {
    const router = useRouter()
    const params = useSearchParams()

    const type = params.get('tipo') as ListingType | null
    const category = params.get('categoria')
    const city = params.get('cidade') ?? ''
    const freeOnly = params.get('gratis') === '1'
    const q = params.get('q') ?? ''
    const [search, setSearch] = useState(q)
    const [cityInput, setCityInput] = useState(city)

    function go(next: Record<string, string | null>) {
        const merged = new URLSearchParams(params.toString())
        Object.entries(next).forEach(([k, v]) => (v ? merged.set(k, v) : merged.delete(k)))
        router.replace(`/feira${merged.size ? `?${merged}` : ''}`)
    }

    const { data: categories } = useSWR<ListingCategory[]>(
        `${API_URL}/public/marketplace/categories`,
        fetcher,
        { revalidateOnFocus: false },
    )
    const labels: Record<string, string> = {}
    categories?.forEach((c) => (labels[c.id] = c.label))

    const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<
        PublicListingSummary[]
    >(
        (index) => {
            const query = new URLSearchParams({ page: String(index), size: String(PAGE_SIZE) })
            if (type) query.set('type', type)
            if (category) query.set('category', category)
            if (city) query.set('city', city)
            if (q) query.set('q', q)
            if (freeOnly) query.set('freeOnly', 'true')
            return `${API_URL}/public/marketplace/listings?${query}`
        },
        fetcher,
        { revalidateFirstPage: false },
    )

    const listings = data?.flat() ?? []
    const lastPage = data?.[data.length - 1]
    const hasMore = !!lastPage && lastPage.length === PAGE_SIZE

    return (
        <div>
            <header className="mb-5 pt-3 sm:pt-5">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                    Feira do Bairro
                </h1>
                <p className="mt-2 text-pretty text-neutral-600">
                    Encontre itens à venda, doações e pedidos da vizinhança.
                </p>
            </header>

            <form
                role="search"
                aria-label="Buscar na Feira"
                className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_auto]"
                onSubmit={(e) => {
                    e.preventDefault()
                    go({ q: search.trim() || null, cidade: cityInput.trim() || null })
                }}
            >
                <div className="col-span-2 sm:col-span-1">
                    <Input
                        fullWidth
                        type="search"
                        icon={MagnifyingGlassIcon}
                        placeholder="Buscar anúncios"
                        aria-label="Buscar anúncios"
                        className={`${CONTROL} w-full bg-neutral-50 pr-11`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <input
                    aria-label="Cidade"
                    placeholder="Cidade"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className={CONTROL}
                />
                <Button type="submit" variant="secondary">
                    Buscar
                </Button>
            </form>

            <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-neutral-200 pb-4">
                <ListingTypeFilters type={type} onChange={(next) => go({ tipo: next })}>
                    <button
                        type="button"
                        aria-pressed={freeOnly}
                        onClick={() => go({ gratis: freeOnly ? null : '1' })}
                        className={listingFilterButton}
                    >
                        Grátis
                    </button>
                </ListingTypeFilters>
                <select
                    aria-label="Categoria"
                    value={category ?? ''}
                    onChange={(e) => go({ categoria: e.target.value || null })}
                    className={`${CONTROL} max-w-full`}
                >
                    <option value="">Todas as categorias</option>
                    {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}

            {error && (
                <div role="alert" className="space-y-3 py-5 text-sm text-neutral-700">
                    <p>Não foi possível carregar os anúncios agora.</p>
                    <Button variant="secondary" onClick={() => void mutate()}>Tentar de novo</Button>
                </div>
            )}

            {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-10 text-neutral-600">
                    <p className="font-semibold text-neutral-800">Nenhum anúncio encontrado</p>
                    <p className="text-sm mb-4">
                        Tente outra cidade ou categoria, ou seja o primeiro a anunciar no seu bairro.
                    </p>
                    <Link href={SIGNUP_HREF} className={SIGNUP_LINK}>Criar conta e anunciar</Link>
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
                {listings.map((l, i) => (
                    <Fragment key={l.id}>
                        {i === CTA_AFTER && <SignupCard />}
                        <ListingCard listing={toCardListing(l)} categoryLabels={labels} />
                    </Fragment>
                ))}
                {listings.length > 0 && listings.length <= CTA_AFTER && <SignupCard />}
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
