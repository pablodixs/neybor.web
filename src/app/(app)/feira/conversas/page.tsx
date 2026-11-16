'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { formatDistanceToNowStrict } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { Conversation } from '@/interfaces/marketplace'
import { API_URL } from '@/components/marketplace/use-marketplace'

export default function ConversationsPage() {
    const { data: session } = useSession()
    const { data, isLoading } = useSWR<Conversation[]>(
        session ? [`${API_URL}/conversations`, session.user.token] : null,
        fetcherWithToken,
        { refreshInterval: 15000 },
    )

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Conversas" />
            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}
            {data && data.length === 0 && (
                <p className="text-center py-10 text-neutral-600">
                    Quando você demonstrar interesse em um anúncio, a conversa aparece aqui.
                </p>
            )}
            <div className="flex flex-col gap-2">
                {data?.map((c) => (
                    <Link
                        key={c.id}
                        href={`/feira/conversas/${c.id}`}
                        className="flex gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50 transition"
                    >
                        <Image
                            src={c.otherAvatarUrl || '/images/default-avatar.png'}
                            alt={c.otherDisplayName ?? 'Vizinho'}
                            width={48}
                            height={48}
                            className="rounded-full w-12 h-12 object-cover bg-neutral-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-2">
                                <strong className="font-semibold text-neutral-800 truncate">
                                    {c.otherDisplayName ?? 'Vizinho'}
                                </strong>
                                {c.lastMessageAt && (
                                    <span className="text-xs text-neutral-500 shrink-0">
                                        {formatDistanceToNowStrict(new Date(c.lastMessageAt), { locale: ptBR })}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 truncate">Sobre: {c.listingTitle}</p>
                            {c.lastMessage && (
                                <p className="text-sm text-neutral-700 truncate">{c.lastMessage}</p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
