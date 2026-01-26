'use client'

import { ProfileHeader } from '@/components/profile-page/profile-header'
import { ProfileNavigation } from '@/components/profile-page/profile-navigation'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import Lottie from 'lottie-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

import lottie from '@/assets/lotties/fish.json'
import { Navigation } from '@/components/navigation'
import { Heading } from '@/components/typography/heading'

export default function UserPage() {
    const params = useParams()
    const { data: user } = useSession()

    const { data, isLoading } = useSWR(
        user && params
            ? [`${API_URL}/profile/handle/${params.user}`, user?.user?.token]
            : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
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

    if (!data)
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
                <Navigation />
                <div className="flex gap-2 items-center my-10">
                    <div>
                        <Heading>Este perfil não foi encontrado</Heading>
                        <p className="text-neutral-500">
                            Verifique o nome de usuário e tente novamente.
                        </p>
                    </div>
                    <Lottie className="w-2/5" animationData={lottie} />
                </div>
            </div>
        )

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <ProfileNavigation />
            <ProfileHeader user={data} currentUserId={user?.user?.profileId} />
        </div>
    )
}
