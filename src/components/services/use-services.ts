'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { fetcherWithToken } from '@/lib/swr'
import { ServiceCategory } from '@/interfaces/services'

export const API_URL = process.env.NEXT_PUBLIC_API_URL

export function useCategories() {
    const { data: session } = useSession()
    const { data } = useSWR<ServiceCategory[]>(
        session ? [`${API_URL}/services/categories`, session.user.token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
    )
    const labels: Record<string, string> = {}
    data?.forEach((c) => (labels[c.slug] = c.label))
    return { categories: data ?? [], labels }
}
