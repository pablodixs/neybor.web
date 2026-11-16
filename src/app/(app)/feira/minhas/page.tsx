'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { ListingSummary } from '@/interfaces/marketplace'
import { ListingCard } from '@/components/marketplace/listing-card'
import { API_URL, useListingCategories } from '@/components/marketplace/use-marketplace'

export default function MyListingsPage() {
    const { data: session } = useSession()
    const { labels } = useListingCategories()
    const { data, isLoading } = useSWR<ListingSummary[]>(
        session ? [`${API_URL}/marketplace/listings/mine`, session.user.token] : null,
        fetcherWithToken,
    )

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Meus anúncios" />
            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}
            {data && data.length === 0 && (
                <p className="text-center py-10 text-neutral-600">Você ainda não anunciou nada.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data?.map((l) => (
                    <ListingCard key={l.id} listing={l} categoryLabels={labels} />
                ))}
            </div>
        </div>
    )
}
