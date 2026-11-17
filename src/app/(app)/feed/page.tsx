'use client'

import { MapPinIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import useSWR from 'swr'

import { Button } from '@/components/button'
import { FeedEmptyState, FeedEndState } from '@/components/feed/feed-empty-state'
import { FeedFilter, FeedSort, FeedTabs } from '@/components/feed/feed-tabs'
import type { UserLocation } from '@/components/feed/my-neighborhood-alerts'
import { OfficialAlertBanner } from '@/components/official-alerts/official-alert-banner'
import { Post, PostProps } from '@/components/post'
import { useCompose } from '@/components/post/compose-context'
import { PostSkeleton } from '@/components/post/post-skeleton'
import { fetcherWithToken } from '@/lib/swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function FeedLoading() {
    return (
        <div role="status" aria-label="Carregando publicações">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
        </div>
    )
}

const FILTER_PARAM: Record<FeedFilter, string | null> = {
    ALL: null,
    SAFETY_ALERT: 'relatos',
    GENERAL: 'conversas',
    MARKETPLACE: 'feira',
}

function filterFromParam(value: string | null): FeedFilter {
    const match = (Object.keys(FILTER_PARAM) as FeedFilter[]).find((key) => FILTER_PARAM[key] === value)
    return match ?? 'ALL'
}

function normalize(text: string) {
    return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
}

export default function Feed() {
    return (
        <Suspense fallback={<FeedLoading />}>
            <FeedContent />
        </Suspense>
    )
}

function FeedContent() {
    const { openCompose } = useCompose()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const query = searchParams.get('q')?.trim() ?? ''
    const filter = filterFromParam(searchParams.get('tipo'))
    const { data: user } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/auth/login')
        },
    })

    function setFilter(next: FeedFilter) {
        const params = new URLSearchParams(searchParams.toString())
        const value = FILTER_PARAM[next]
        if (value) params.set('tipo', value)
        else params.delete('tipo')
        const search = params.toString()
        router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
    }
    const [sort, setSort] = useState<FeedSort>('RECENT')
    const token = user?.user.token

    const { data: location } = useSWR<UserLocation>(
        token ? [`${API_URL}/profile/me/location`, token] : null,
        fetcherWithToken,
    )
    const { data, error, isLoading, mutate } = useSWR<{ content: PostProps[] }>(
        token ? [`${API_URL}/feed`, token] : null,
        fetcherWithToken,
    )

    const posts = useMemo(() => {
        const term = normalize(query)
        const filtered = (data?.content ?? []).filter((post) => {
            const matchesFilter =
                filter === 'ALL' ||
                post.type === filter ||
                (filter === 'GENERAL' && post.type === 'RECOMMENDATION')
            return matchesFilter && (!term || normalize(`${post.content} ${post.author.displayName}`).includes(term))
        })
        return sort === 'RECENT' ? filtered : filtered.sort((a, b) => b.reactionsCount - a.reactionsCount)
    }, [data, filter, query, sort])

    return (
        <div className="mx-auto max-w-2xl">
            <header className="pt-5 pb-4 lg:pt-0">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                    {location?.neighborhood || 'Feed da vizinhança'}
                </h1>
                {location?.city && (
                    <Link href="/map" className="mt-1 inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-md text-sm text-neutral-600 hover:underline focus-visible:outline-2 focus-visible:outline-green-700">
                        <MapPinIcon size={16} aria-hidden="true" className="shrink-0 text-green-700" />
                        {location.city}
                    </Link>
                )}
            </header>
            {token && (
                <button
                    type="button"
                    onClick={() => openCompose()}
                    className="mb-3 flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl bg-neutral-100 px-3.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-tint hover:text-on-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                    <PencilSimpleIcon size={20} aria-hidden="true" className="shrink-0 text-green-800" />
                    Compartilhe algo com a vizinhança
                </button>
            )}
            <FeedTabs filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
            <OfficialAlertBanner pinned />
            <div id="feed-posts" role="tabpanel" aria-labelledby={`feed-tab-${filter}`} tabIndex={0}>
                {query && (
                    <p className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-2 py-3 text-sm text-neutral-700">
                        <span className="wrap-break-word">Busca por “{query}”</span>
                        <Link href={FILTER_PARAM[filter] ? `/feed?tipo=${FILTER_PARAM[filter]}` : '/feed'} className="font-semibold text-green-800 underline">Limpar busca</Link>
                    </p>
                )}
                {!token || isLoading ? (
                    <FeedLoading />
                ) : error && !data ? (
                    <div role="alert" className="space-y-3 px-3 py-8 text-neutral-700">
                        <p>Não foi possível carregar os posts do bairro.</p>
                        <Button variant="secondary" onClick={() => void mutate()}>Tentar de novo</Button>
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <Post key={post.id} data={post} mutate={mutate} currentUserToken={token} />
                        ))}
                        <FeedEndState />
                    </>
                ) : query ? (
                    <p role="status" className="px-3 py-8 text-neutral-600">Nenhum post corresponde à busca neste filtro.</p>
                ) : (
                    <FeedEmptyState filter={filter} />
                )}
            </div>
        </div>
    )
}
