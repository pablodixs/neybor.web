'use client'

import { CommentResponse } from '@/interfaces/post/comment'
import { HeartIcon } from '@phosphor-icons/react'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function Comment({
    currentUserToken,
    ...comment
}: CommentResponse & { currentUserToken: string }) {
    const [liked, setLiked] = useState(comment.likedByMe)
    const [reactionsCount, setReactionsCount] = useState(comment.reactionsCount)

    const handleLike = (commentId: number, currentUserToken: string) => {
        axios
            .post(
                `${API_URL}/post/comment/${commentId}/react?type=LIKE`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${currentUserToken}`,
                    },
                },
            )
            .then(() => {
                setLiked(!liked)
                if (!liked) {
                    setReactionsCount(reactionsCount + 1)
                } else {
                    setReactionsCount(reactionsCount - 1)
                }
            })
            .catch((error) => {
                console.error('Error liking comment:', error)
            })
    }

    return (
        <div className="py-4">
            <section className="flex gap-2 items-start">
                <Link href={`/${comment.authorHandle}`}>
                    <Image
                        src={
                            comment.authorAvatar || '/images/default-avatar.png'
                        }
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full object-fill h-8 w-8"
                    />
                </Link>
                <div>
                    <div className="flex gap-1 items-center leading-tight">
                        <strong className="font-semibold text-neutral-700">
                            {comment.authorName}
                        </strong>
                        <span className="text-neutral-500">
                            {comment.authorHandle}
                        </span>
                        <span className="text-neutral-500">
                            ·{' '}
                            {formatDistanceToNowStrict(
                                new Date(comment.createdAt),
                                {
                                    addSuffix: true,
                                    locale: ptBR,
                                },
                            )}
                        </span>
                    </div>
                    <div>
                        <p>{comment.content}</p>
                    </div>
                </div>
            </section>
            <footer className="ml-10 mt-3 text-neutral-500">
                <button
                    onClick={() => handleLike(comment.id, currentUserToken)}
                    data-liked={liked}
                    className="data-[liked=true]:text-red-600 relative cursor-pointer text-xl flex gap-1 rounded-full items-center text-neutral-500 hover:text-red-600 hover:bg-red-100 transition after:content-[''] after:block after:w-6 after:h-6 after:absolute after:-z-10 after:rounded-full after:transition hover:after:bg-red-50"
                >
                    <HeartIcon size={20} weight={liked ? 'fill' : 'bold'} />{' '}
                    <span className="absolute -right-3 text-base font-medium top-1/2 -translate-y-1/2">
                        {reactionsCount > 0 && reactionsCount}
                    </span>
                </button>
            </footer>
        </div>
    )
}
