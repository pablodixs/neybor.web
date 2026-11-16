'use client'

import { OfficialAlertBanner } from '@/components/official-alerts/official-alert-banner'
import { Post, PostProps } from '@/components/post'
import { PostSkeleton } from '@/components/post/post-skeleton'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FeedEmptyState, FeedEndState } from '@/components/feed/feed-empty-state'
import { FeedFilter, FeedSort, FeedTabs } from '@/components/feed/feed-tabs'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Feed() {
    const router = useRouter()

    const { data: user } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/auth/login')
        },
    })

    const [filter, setFilter] = useState<FeedFilter>('ALL')
    const [sort, setSort] = useState<FeedSort>('RECENT')

    const { data, isLoading, mutate } = useSWR(
        user ? [`${API_URL}/feed`, user?.user?.token] : null,
        fetcherWithToken,
    )

    const posts: PostProps[] = useMemo(() => {
        const all: PostProps[] = data?.content ?? []
        const filtered =
            filter === 'ALL' ? all : all.filter((p) => p.type === filter)
        if (sort === 'RECENT') return filtered
        return [...filtered].sort((a, b) => b.reactionsCount - a.reactionsCount)
    }, [data, filter, sort])

    return (
        <div className="w-full h-full">
            <OfficialAlertBanner />
            <FeedTabs
                filter={filter}
                onFilterChange={setFilter}
                sort={sort}
                onSortChange={setSort}
            />
            {isLoading ? (
                <div>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            ) : (
                posts.map((postData) => (
                    <Post
                        mutate={mutate}
                        key={postData.id}
                        data={postData}
                        currentUserToken={user?.user?.token || ''}
                    />
                ))
            )}
            {!isLoading && posts.length === 0 && (
                <FeedEmptyState filter={filter} />
            )}
            {!isLoading && posts.length > 0 && <FeedEndState />}
        </div>
    )
}
