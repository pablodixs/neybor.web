'use client'

import {
    HouseLineIcon,
    SealCheckIcon,
    SealWarningIcon,
} from '@phosphor-icons/react'
import {
    ChatCircleIcon,
    GlobeSimpleIcon,
    HeartIcon,
    WarehouseIcon,
} from '@phosphor-icons/react/dist/ssr'
import axios from 'axios'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { PostMenu } from './post-menu'

export interface Author {
    id: number
    displayName: string
    handle: string
    avatarUrl: string
    type: 'USER' | string
    isVerified: boolean
    neighborhood: string
    city: string
    locationLabel: string
}

export interface PostProps {
    id: number
    author: Author
    content: string
    createdAt: string
    latitude: number
    longitude: number
    type: 'GENERAL' | 'EVENT' | 'ALERT'
    visibility: 'NEIGHBORHOOD' | 'PUBLIC' | 'PRIVATE'
    likedByMe: boolean
    myReactionType: string
    reactionsCount: number
    commentsCount: number
}

interface PostComponentProps {
    data: PostProps
    mutate: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function Post({
    data,
    currentUserToken,
    mutate,
}: PostComponentProps & { currentUserToken: string }) {
    const [liked, setLiked] = useState(data.likedByMe)
    const [reactionsCount, setReactionsCount] = useState(data.reactionsCount)

    const handleLike = (postId: number, currentUserToken: string) => {
        setLiked(!liked)
        if (!liked) {
            setReactionsCount(reactionsCount + 1)
        } else {
            setReactionsCount(reactionsCount - 1)
        }

        axios
            .post(`${API_URL}/post/${postId}/react?type=LIKE`, null, {
                headers: {
                    Authorization: `Bearer ${currentUserToken}`,
                },
            })
            .then(() => {})
            .catch(() => {
                if (liked) {
                    setReactionsCount(reactionsCount - 1)
                } else {
                    setReactionsCount(reactionsCount + 1)
                }
            })
    }

    const onPostDeleted = () => {
        mutate()
    }

    return (
        <div className="w-full border border-neutral-100 rounded-2xl p-4 bg-white mb-4">
            <header className="flex justify-between items-start">
                <Link
                    className="flex gap-2 items-center"
                    href={`/${data.author.handle}`}
                >
                    <Image
                        className="rounded-full aspect-square object-cover w-9 h-9 mb-1"
                        src={
                            data.author.avatarUrl ||
                            '/images/default-avatar.png'
                        }
                        alt={data.author.displayName || 'User avatar'}
                        width={36}
                        height={36}
                    />
                    <div className="flex flex-col gap-2">
                        <strong className="flex font-semibold leading-3 items-center gap-1">
                            {data.author.displayName}
                            {data.author.isVerified ? (
                                <SealCheckIcon
                                    weight="fill"
                                    className="text-green-500"
                                />
                            ) : (
                                <SealWarningIcon className="text-neutral-500" />
                            )}
                        </strong>
                        <div className="font-medium text-sm text-neutral-500 leading-2 flex gap-1">
                            <p>{data.author.neighborhood}</p>
                        </div>
                    </div>
                </Link>
                <div className="flex gap-2 items-center">
                    <div className="font-medium text-sm text-neutral-500">
                        {data.visibility === 'PUBLIC' ? (
                            <GlobeSimpleIcon size={16} />
                        ) : data.visibility === 'NEIGHBORHOOD' ? (
                            <HouseLineIcon size={16} />
                        ) : (
                            <WarehouseIcon size={16} />
                        )}
                    </div>
                    <p
                        className='className="font-medium text-sm text-neutral-500'
                        title={new Date(data.createdAt).toLocaleString('pt-BR')}
                    >
                        {formatDistanceToNowStrict(new Date(data.createdAt), {
                            locale: ptBR,
                        })}
                    </p>
                    <PostMenu
                        buttonSize="small"
                        authorId={data.author.id}
                        postId={data.id}
                        onPostDeleted={onPostDeleted}
                    />
                </div>
            </header>
            <section className="my-2 pl-11 font-medium text-neutral-800 leading-6">
                <Link href={`/${data.author.handle}/post/${data.id}`}>
                    <p>{data.content}</p>
                </Link>
            </section>
            <footer className="pl-11 flex gap-4 text-neutral-500 items-center -m-2">
                <button
                    onClick={() => handleLike(data.id, currentUserToken)}
                    data-liked={liked}
                    className="text-lg relative cursor-pointer flex items-center gap-1 data-[liked=true]:text-red-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                >
                    <HeartIcon weight={liked ? 'fill' : 'bold'} />{' '}
                    <span className="absolute -right-1 text-sm font-medium top-1/2 -translate-y-1/2">
                        {reactionsCount > 0 && reactionsCount}
                    </span>
                </button>
                <button className="text-lg relative cursor-pointer flex items-center gap-1 hover:text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors">
                    <ChatCircleIcon weight="bold" />{' '}
                    <span className="absolute -right-1 text-sm font-medium top-1/2 -translate-y-1/2">
                        {data.commentsCount > 0 && data.commentsCount}
                    </span>
                </button>
            </footer>
        </div>
    )
}
