'use client'

import { useState } from 'react'

export function useUserAccount() {
    const [userAccount, setUserAccount] = useState<{
        avatarUrl: string | null
        displayName: string
        profileId: number
        token: string
        type: 'Bearer'
    } | null>(null)

    return { userAccount, setUserAccount }
}
