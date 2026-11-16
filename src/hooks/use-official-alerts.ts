import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import type { UserLocation } from '@/components/feed/my-neighborhood-alerts'
import type { OfficialAlert } from '@/interfaces/official-alert'
import { fetcherWithToken } from '@/lib/swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const

/** Alertas oficiais (Defesa Civil, INMET) que cobrem o endereço do usuário. */
export function useOfficialAlerts() {
    const { data: session } = useSession()
    const token = session?.user?.token

    const { data: location } = useSWR<UserLocation>(
        token ? [`${API_URL}/profile/me/location`, token] : null,
        fetcherWithToken,
    )

    const { data, error, isLoading } = useSWR<OfficialAlert[]>(
        token && location
            ? [
                  `${API_URL}/alerts/official?lat=${location.latitude}&lon=${location.longitude}`,
                  token,
              ]
            : null,
        fetcherWithToken,
        { refreshInterval: 5 * 60 * 1000 },
    )

    const alerts = [...(data ?? [])].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    )

    return { alerts, error, isLoading }
}
