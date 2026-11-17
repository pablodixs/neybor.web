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
        <section aria-labelledby="feira-titulo" className="rounded-2xl bg-white p-4">
            <div className="flex items-baseline justify-between mb-3">
                <h2 id="feira-titulo" className="text-base font-bold text-neutral-950">
                    Novidades na Feira
                </h2>
                <Link
                    href="/feira"
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
                >
                    Ver tudo
                </Link>
            </div>
            <ul className="-mx-2 flex flex-col">
                {data.slice(0, 4).map((l) => (
                    <li key={l.id}>
                        <Link
                            href={`/feira/${l.id}`}
                            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas"
                        >
                            <div className="size-11 shrink-0 rounded-lg bg-canvas overflow-hidden flex items-center justify-center text-neutral-300">
                                {l.thumbUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={l.thumbUrl}
                                        alt=""
                                        width={48}
                                        height={48}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon size={18} aria-hidden="true" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                    {l.title}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
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
        </section>
    )
}
