'use client'

import { Post, PostProps } from '@/components/post'
import { PostSkeleton } from '@/components/post/post-skeleton'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

    const { data, isLoading, mutate } = useSWR(
        user ? [`${API_URL}/feed`, user?.user?.token] : null,
        fetcherWithToken,
    )

    return (
        <div className="w-full h-full">
            {isLoading ? (
                <div>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            ) : (
                data &&
                data.content.map((postData: PostProps) => (
                    <Post
                        mutate={mutate}
                        key={postData.id}
                        data={postData}
                        currentUserToken={user?.user?.token || ''}
                    />
                ))
            )}
            {!isLoading && data?.content.length === 0 && (
                <div className="text-center font-semibold text-lg text-neutral-500 mt-10">
                    Poxa, não há posts para mostrar.
                </div>
            )}
        </div>
    )
}
