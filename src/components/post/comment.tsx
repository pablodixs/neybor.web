'use client'

import { CommentResponse } from '@/interfaces/post/comment'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { ReactionButton } from './reaction-button'

export function Comment({
    currentUserToken,
    ...comment
}: CommentResponse & { currentUserToken: string }) {
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
                <ReactionButton
                    currentUserToken={currentUserToken}
                    {...comment}
                />
            </footer>
        </div>
    )
}
