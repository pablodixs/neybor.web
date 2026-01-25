'use client'

import { CommentResponse } from '@/interfaces/post/comment'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { ReactionButton } from './reaction-button'
import { CommentMenu } from './comment-menu'

export function Comment({
    currentUserToken,
    handle,
    ...comment
}: CommentResponse & { currentUserToken: string; handle: string }) {
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
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1 items-center leading-tight">
                            <strong className="font-semibold text-neutral-700">
                                {comment.authorName}
                            </strong>
                            {handle === comment.authorHandle ? (
                                <span className="bg-green-50 text-green-600 text-sm font-semibold rounded-full px-2">
                                    Autor
                                </span>
                            ) : (
                                <span className="text-neutral-500">
                                    {comment.authorHandle}
                                </span>
                            )}
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
                        <div className="ml-1">
                            <CommentMenu
                                authorId={comment.authorId}
                                postId={comment.id}
                            />
                        </div>
                    </div>
                    <div>
                        <p>{comment.content}</p>
                    </div>
                </div>
            </section>
            <footer className="ml-10 mt-3 text-neutral-500">
                <ReactionButton
                    currentUserToken={currentUserToken}
                    {...comment}
                />
            </footer>
        </div>
    )
}
