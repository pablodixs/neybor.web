'use client'

import { Navigation } from '@/components/navigation'
import { Post, PostProps } from '@/components/post'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface BookmarksApiResponse {
    content: PostProps[]
}

export default function BookmarksPage() {
    const { data: user } = useSession()

    const {
        data: bookmarks,
        isLoading,
        mutate,
    } = useSWR<BookmarksApiResponse>(
        user ? [`${API_URL}/profile/me/bookmarks`, user?.user?.token] : null,
        fetcherWithToken,
    )

    return (
        <div className="bg-white">
            <Navigation title="Itens salvos" showBackButton={false} />
            {isLoading && <Spinner size="lg" />}
            {bookmarks && bookmarks.content.length === 0 ? (
                <section>
                    <h1 className="font-semibold text-xl text-center text-neutral-500 my-10">
                        Você não tem itens salvos
                    </h1>
                </section>
            ) : (
                bookmarks?.content.map((post) => (
                    <Post
                        currentUserToken={user?.user.token || ''}
                        key={post.id}
                        data={post}
                        mutate={mutate}
                    />
                ))
            )}
        </div>
    )
}
