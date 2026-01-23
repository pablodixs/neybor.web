'use client'

import { Post, PostProps } from '@/components/post'
import { Spinner } from '@/components/spinner'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const fetcher = ([url, token]: [string, string]) =>
    axios
        .get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.data)

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
        fetcher,
    )

    return (
        <div className="w-full h-full">
            {isLoading ? (
                <Spinner />
            ) : (
                data &&
                data.content.map((postData: PostProps) => (
                    <Post key={postData.id} data={postData} />
                ))
            )}
        </div>
    )
}
