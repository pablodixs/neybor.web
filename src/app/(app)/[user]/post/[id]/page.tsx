'use client'

import useSWR from 'swr'

import { useParams, useRouter } from 'next/navigation'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import {
    ArrowLeftIcon,
    ChatCircleIcon,
    GlobeSimpleIcon,
    HeartIcon,
    HouseLineIcon,
    PencilSimpleLineIcon,
    SealWarningIcon,
    WarehouseIcon,
} from '@phosphor-icons/react'
import { Spinner } from '@/components/spinner'
import { PostProps } from '@/components/post'
import Image from 'next/image'
import Link from 'next/link'
import { SealCheckIcon } from '@phosphor-icons/react/dist/ssr'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserProfile } from '@/interfaces/user-profile'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/button'
import { CircularProgressIndicator } from '@/components/circular-progress-indicator'
import { CommentResponse } from '@/interfaces/post/comment'
import { Comment } from '@/components/post/comment'
import axios from 'axios'
import { PostMenu } from '@/components/post/post-menu'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

const POST_VISIBILITY = {
    PUBLIC: (
        <>
            <GlobeSimpleIcon size={14} /> <p>Público</p>
        </>
    ),
    NEIGHBORHOOD: (
        <>
            <HouseLineIcon weight="fill" size={14} /> <p>Vizinhança</p>
        </>
    ),
    PRIVATE: (
        <>
            <WarehouseIcon size={14} /> <p>Local</p>
        </>
    ),
}

export default function PostPage() {
    const router = useRouter()
    const params = useParams<{ user: string; id: string }>()

    const { data: user } = useSession()

    const postId = params?.id

    const { data, isLoading, mutate } = useSWR<PostProps>(
        user && postId
            ? [`${API_URL}/post/${postId}`, user?.user?.token]
            : null,
        fetcherWithToken,
    )

    const onPostDeleted = () => {
        mutate()
        router.back()
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <section className="flex justify-between">
                <div className="flex gap-2 text-neutral-700 text-lg font-semibold items-center">
                    <button
                        className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition"
                        onClick={() => router.back()}
                    >
                        <ArrowLeftIcon weight="bold" />
                    </button>
                    <p>Post</p>
                </div>
                <div>
                    <PostMenu
                        postId={Number(data?.id)}
                        authorId={data?.author.id}
                        onPostDeleted={onPostDeleted}
                    />
                </div>
            </section>

            {isLoading ? (
                <Spinner size="lg" />
            ) : data ? (
                <PostContent post={data} user={user!.user} />
            ) : null}
        </div>
    )
}

const PostContent = ({
    post,
    user,
}: {
    post: PostProps
    user: UserProfile
}) => {
    const [comment, setComment] = useState('')
    const [isCommenting, setIsCommenting] = useState(false)
    const [isSendingComment, setIsSendingComment] = useState(false)

    const commentInputRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        if (isCommenting) {
            commentInputRef.current?.focus()
        }
    }, [isCommenting])

    const [liked, setLiked] = useState(post.likedByMe)
    const [reactionsCount, setReactionsCount] = useState(post.reactionsCount)
    const [commentsCount, setCommentsCount] = useState(post.commentsCount)

    const { data: comments, mutate } = useSWR<CommentResponse[]>(
        user ? [`${API_URL}/post/${post.id}/comments`, user?.token] : null,
        fetcherWithToken,
    )

    const handleSendComment = (e: FormEvent) => {
        e.preventDefault()
        setIsSendingComment(true)

        axios
            .post(
                `${API_URL}/post/${post.id}/comments`,
                {
                    content: comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                },
            )
            .then(() => {
                mutate()
                setComment('')
                setCommentsCount(commentsCount + 1)
                setIsCommenting(false)
            })
            .finally(() => {
                setIsSendingComment(false)
            })
    }

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

    return (
        <section className="mt-4">
            <div>
                <header className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            className="rounded-full object-fill h-11 w-11"
                            src={
                                post.author.avatarUrl ||
                                '/images/default-avatar.png'
                            }
                            alt={post.author.displayName || 'User avatar'}
                            width={44}
                            height={44}
                        />
                        <Link
                            href={`/${post.author.handle}`}
                            className="hover:text-green-600 transition"
                        >
                            <strong className="font-semibold flex items-center gap-1">
                                {post.author.displayName}
                                {post.author.isVerified ? (
                                    <SealCheckIcon
                                        size={18}
                                        weight="fill"
                                        className="text-green-500"
                                    />
                                ) : (
                                    <SealWarningIcon
                                        size={18}
                                        className="text-neutral-500"
                                    />
                                )}
                            </strong>
                            <p className="text-neutral-500 text-sm">
                                {post.author.locationLabel}
                            </p>
                        </Link>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 text-sm px-2 py-1 font-semibold text-green-600 rounded-full">
                        {POST_VISIBILITY[post.visibility]}
                    </div>
                </header>
                <p className="font-medium text-xl my-4">{post.content}</p>
                <footer>
                    <section className="flex items-center gap-4 -ml-2">
                        <button
                            onClick={() => handleLike(post.id, user.token)}
                            data-liked={liked}
                            className="cursor-pointer relative data-[liked=true]:text-red-600 text-2xl p-2 flex gap-1 rounded-full items-center text-neutral-500 hover:text-red-600 hover:bg-red-100 transition"
                        >
                            <HeartIcon weight={liked ? 'fill' : 'bold'} />
                            <span className="absolute -right-2 text-base font-semibold top-1/2 -translate-y-1/2">
                                {reactionsCount > 0 && reactionsCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setIsCommenting(true)}
                            className="cursor-pointer relative text-2xl p-2 flex gap-1 rounded-full items-center text-neutral-500 hover:text-green-600 hover:bg-green-100 transition"
                        >
                            <ChatCircleIcon weight="bold" />
                            <span className="absolute -right-2 text-base font-semibold top-1/2 -translate-y-1/2">
                                {commentsCount > 0 && commentsCount}
                            </span>
                        </button>
                        <button className="cursor-pointer text-2xl p-2 flex gap-1 rounded-full items-center text-neutral-500 hover:text-green-600 hover:bg-green-100 transition">
                            <PencilSimpleLineIcon weight="bold" />
                        </button>
                    </section>
                    <section className="py-2 mt-2 border-t border-neutral-100 flex gap-2 text-sm items-center text-neutral-500">
                        <p>
                            {formatDate(
                                new Date(post.createdAt),
                                "d 'de' MMMM 'de' yyyy 'às' HH:mm",
                                {
                                    locale: ptBR,
                                },
                            )}
                        </p>
                        {/* <p>&bull;</p>
                        <p className="flex gap-1 items-center font-medium">
                            <EyeIcon size={18} /> 0 vizualizações
                        </p> */}
                    </section>
                </footer>
                <form
                    onSubmit={handleSendComment}
                    className={`${isSendingComment && 'opacity-70'} transition`}
                >
                    <div className="py-4 flex gap-2">
                        <Image
                            src={user.avatarUrl || '/images/default-avatar.png'}
                            alt={user.displayName || 'User avatar'}
                            width={36}
                            height={36}
                            className="rounded-full object-fill h-9 w-9"
                        />
                        <textarea
                            ref={commentInputRef}
                            onChange={(e) => setComment(e.target.value)}
                            value={comment}
                            onFocus={() => setIsCommenting(true)}
                            className="flex-1 resize-none field-sizing-content outline-0 py-2 font-medium focus:bg-neutral-100 px-2 rounded-lg hover:bg-neutral-50 transition"
                            placeholder="Escreva um comentário"
                        />
                    </div>
                    {isCommenting && (
                        <div className="flex gap-4 items-center justify-end">
                            <CircularProgressIndicator
                                size={24}
                                value={(comment.length / 300) * 100}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    comment.length < 2 || isSendingComment
                                }
                            >
                                {isSendingComment
                                    ? 'Comentando...'
                                    : 'Comentar'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
            {comments && comments.length > 0 && (
                <section>
                    <h2 className="font-semibold text-neutral-700 text-lg">
                        Comentários
                    </h2>
                    <div>
                        {comments.map((comment) => (
                            <Comment
                                postOwnerId={post.author.id}
                                handle={post.author.handle}
                                key={comment.id}
                                currentUser={user}
                                mutate={mutate}
                                {...comment}
                            />
                        ))}
                    </div>
                </section>
            )}
        </section>
    )
}
