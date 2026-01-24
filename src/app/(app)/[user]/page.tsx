'use client'

import { ProfileHeader } from '@/components/profile-page/profile-header'
import { ProfileNavigation } from '@/components/profile-page/profile-navigation'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function UserPage() {
    const params = useParams()
    const { data: user } = useSession()

    const { data, isLoading } = useSWR(
        user && params
            ? [`${API_URL}/profile/handle/${params.user}`, user?.user?.token]
            : null,
        fetcherWithToken,
    )

    if (isLoading)
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
                <ProfileNavigation />
                <div className="my-10">
                    <Spinner size="lg" />
                </div>
            </div>
        )

    if (!data) return <div>Usuário não encontrado</div>

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <ProfileNavigation />
            <ProfileHeader user={data} currentUserId={user?.user?.profileId} />
        </div>
    )
}
