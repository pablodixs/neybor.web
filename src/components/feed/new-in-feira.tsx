'use client'

import { ImageIcon } from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import useSWR from 'swr'

import { ListingSummary } from '@/interfaces/marketplace'
import { isFeatureEnabled } from '@/lib/features'
import { fetcherWithToken } from '@/lib/swr'

import { formatPrice } from '../marketplace/labels'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** "Novidades na Feira": módulo da coluna direita, como os "Featured Posts" do Digg. */
export function NewInFeira() {
    const { data: session } = useSession()
    const enabled = isFeatureEnabled('marketplace')
    const { data } = useSWR<ListingSummary[]>(
        enabled && session
            ? [
                  `${API_URL}/marketplace/listings?radiusKm=5&size=4`,
                  session.user.token,
              ]
            : null,
        fetcherWithToken,
        { revalidateOnFocus: false, shouldRetryOnError: false },
    )

    if (!enabled || !data || data.length === 0) return null

    return (
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl mb-4">
            <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-lg font-semibold text-neutral-700">
                    Novidades na Feira
                </h2>
                <Link
                    href="/feira"
                    className="text-sm font-semibold text-green-700 hover:underline"
                >
                    Ver tudo
                </Link>
            </div>
            <ul className="flex flex-col gap-3">
                {data.slice(0, 4).map((l) => (
                    <li key={l.id}>
                        <Link
                            href={`/feira/${l.id}`}
                            className="flex gap-3 items-center hover:bg-neutral-50 rounded-xl -mx-1 p-1 transition"
                        >
                            <div className="w-12 h-12 shrink-0 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center text-neutral-300">
                                {l.thumbUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={l.thumbUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon size={20} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-neutral-800 truncate">
                                    {l.title}
                                </p>
                                <p className="text-sm text-neutral-500 truncate">
                                    {[
                                        formatPrice(l.type, l.priceCents),
                                        l.neighborhood,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
