'use client'

import { HeartIcon } from '@phosphor-icons/react'
import axios from 'axios'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ReactionButtonProps {
    currentUserToken: string
    id: number
    likedByMe: boolean
    reactionsCount: number
}

export function ReactionButton({
    currentUserToken,
    ...comment
}: ReactionButtonProps) {
    const [liked, setLiked] = useState(comment.likedByMe)
    const [reactionsCount, setReactionsCount] = useState(comment.reactionsCount)

    const handleLike = (commentId: number, currentUserToken: string) => {
        if (!liked) {
            setLiked(true)
            setReactionsCount(reactionsCount + 1)
        } else {
            setLiked(false)
            setReactionsCount(reactionsCount - 1)
        }

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
            .then(() => {})
            .catch(() => {
                if (liked) {
                    setLiked(false)
                    setReactionsCount(reactionsCount - 1)
                } else {
                    setLiked(true)
                    setReactionsCount(reactionsCount + 1)
                }
            })
    }

    return (
        <button
            onClick={() => handleLike(comment.id, currentUserToken)}
            data-liked={liked}
            className="relative data-[liked=true]:text-red-600 cursor-pointer text-xl flex gap-1 rounded-full items-center text-neutral-500 hover:text-red-600 hover:bg-red-100 transition after:content-[''] after:block after:w-6 after:h-6 after:absolute after:-z-10 after:rounded-full after:transition hover:after:bg-red-50"
        >
            <HeartIcon size={20} weight={liked ? 'fill' : 'bold'} />{' '}
            <span className="absolute -right-3 text-base font-medium top-1/2 -translate-y-1/2">
                {reactionsCount > 0 && reactionsCount}
            </span>
        </button>
    )
}
