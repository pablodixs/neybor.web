'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import axios from 'axios'
import { fetcherWithToken } from '@/lib/swr'
import { AccountProfile } from '@/interfaces/services'
import { API_URL } from './use-services'

const TYPE_LABELS: Record<string, string> = {
    NEIGHBOR: 'Vizinho',
    BUSINESS: 'Loja',
    PROVIDER: 'Prestador',
}

/** Lists the account's profiles and lets the user act as another one. Hidden with a single profile. */
export function ProfileSwitcher() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [busy, setBusy] = useState(false)
    const { data: profiles, mutate } = useSWR<AccountProfile[]>(
        session ? [`${API_URL}/auth/profiles`, session.user.token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
    )

    if (!profiles || profiles.length < 2) return null

    async function switchTo(profileId: number) {
        setBusy(true)
        try {
            const { data } = await axios.post(
                `${API_URL}/auth/switch-profile`,
                { profileId },
                { headers: { Authorization: `Bearer ${session?.user.token}` } },
            )
            await update({ switchedProfile: data })
            await mutate()
            router.push('/feed')
            router.refresh()
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="mt-2 px-2">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Atuando como
            </label>
            <select
                disabled={busy}
                value={profiles.find((p) => p.active)?.id}
                onChange={(e) => switchTo(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border-2 border-neutral-100 px-3 py-2 font-semibold text-neutral-700 cursor-pointer"
            >
                {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.displayName} · {TYPE_LABELS[p.profileType] ?? p.profileType}
                    </option>
                ))}
            </select>
        </div>
    )
}
