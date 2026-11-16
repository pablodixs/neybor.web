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
import { TYPE_LABELS } from '../labels'
import { loginHref, SIGNUP_HREF } from './signup-links'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const PAGE_SIZE = 20
const CTA_AFTER = 8

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
            <div className="flex gap-2">
                <Link href={SIGNUP_HREF}>
                    <Button>Criar conta</Button>
                </Link>
                <Link href={loginHref('/feira')}>
                    <Button variant="bordered">Entrar</Button>
                </Link>
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

    const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<
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
            <section className="rounded-2xl bg-green-600 text-white p-5 mb-4">
                <h1 className="text-2xl font-bold leading-tight">
                    Compre, doe e peça coisas aos seus vizinhos
                </h1>
                <p className="text-green-50 mt-1 mb-4">
                    Anúncios de gente do seu bairro. Veja à vontade, sem precisar de conta.
                </p>
                <Link href={SIGNUP_HREF}>
                    <Button variant="secondary">Criar conta grátis</Button>
                </Link>
            </section>

            <form
                className="mb-3 flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault()
                    go({ q: search.trim() || null, cidade: cityInput.trim() || null })
                }}
            >
                <div className="flex-1">
                    <Input
                        fullWidth
                        icon={MagnifyingGlassIcon}
                        placeholder="Buscar anúncios"
                        aria-label="Buscar anúncios"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <input
                    aria-label="Cidade"
                    placeholder="Cidade"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="w-32 sm:w-44 px-3 border-2 border-neutral-100 rounded-lg font-semibold text-neutral-700"
                />
                <Button type="submit" variant="secondary" aria-label="Buscar">
                    Buscar
                </Button>
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
                <button
                    aria-pressed={freeOnly}
                    onClick={() => go({ gratis: freeOnly ? null : '1' })}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition ${freeOnly ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                >
                    Grátis
                </button>
            </div>

            <select
                aria-label="Categoria"
                value={category ?? ''}
                onChange={(e) => go({ categoria: e.target.value || null })}
                className="w-full sm:w-auto mb-4 px-3 py-2 border-2 border-neutral-100 rounded-lg font-semibold text-neutral-700"
            >
                <option value="">Todas as categorias</option>
                {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.label}
                    </option>
                ))}
            </select>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}

            {error && (
                <p className="text-red-600 text-sm">Não foi possível carregar os anúncios agora.</p>
            )}

            {!isLoading && !error && listings.length === 0 && (
                <div className="text-center py-10 text-neutral-600">
                    <p className="font-semibold text-neutral-800">Nenhum anúncio encontrado</p>
                    <p className="text-sm mb-4">
                        Tente outra cidade ou categoria, ou seja o primeiro a anunciar no seu bairro.
                    </p>
                    <Link href={SIGNUP_HREF}>
                        <Button size="sm">Criar conta e anunciar</Button>
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
