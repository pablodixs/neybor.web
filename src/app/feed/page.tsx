'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { PostSkeleton } from '@/components/post/post-skeleton'
import { Post, PostProps } from '@/components/post'

import { fetcherWithToken } from '@/lib/swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export default function Page() {
    const router = useRouter()

    const { data: user } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/auth/login')
        },
    })

    const { data, isLoading } = useSWR(
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
                    <Post key={postData.id} data={postData} />
                ))
            )}
        </div>
    )
}
