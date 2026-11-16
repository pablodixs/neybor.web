'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { fetcherWithToken } from '@/lib/swr'
import { ListingCategory } from '@/interfaces/marketplace'

export const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Whether the logged account is a marketplace admin (ids come from NEYBOR_ADMIN_ACCOUNT_IDS on the backend). */
export function useIsAdmin() {
    const { data: session } = useSession()
    const { data } = useSWR<{ admin: boolean }>(
        session ? [`${API_URL}/auth/me`, session.user.token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false, dedupingInterval: 60_000 },
    )
    return data?.admin === true
}

export function useListingCategories() {
    const { data: session } = useSession()
    const { data } = useSWR<ListingCategory[]>(
        session ? [`${API_URL}/marketplace/categories`, session.user.token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
    )
    const labels: Record<string, string> = {}
    data?.forEach((c) => (labels[c.id] = c.label))
    return { categories: data ?? [], labels }
}
