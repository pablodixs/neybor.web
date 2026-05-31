'use client'

import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface ContactFieldResponse {
    value: string
    verified: boolean
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export const genderLabels: Record<Gender, string> = {
    [Gender.MALE]: 'Masculino',
    [Gender.FEMALE]: 'Feminino',
    [Gender.OTHER]: 'Outro',
    [Gender.PREFER_NOT_TO_SAY]: 'Prefiro não informar',
}

export interface AccountInfoResponse {
    id: number
    username: string
    displayName: string
    phone: ContactFieldResponse
    email: ContactFieldResponse
    birthDate: string
    gender: Gender | null
    createdAt: string
}

export function useAccountInfo() {
    const { data: session } = useSession()

    return useSWR<AccountInfoResponse>(
        session?.user?.token
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/account/info`,
                  session.user.token,
              ]
            : null,
        fetcherWithToken,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60_000,
        },
    )
}
