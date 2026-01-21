'use client'

import { useUserAccount } from '@/hooks/save-credentials'
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter()
    const { userAccount } = useUserAccount()

    if (!userAccount) {
        router.push('/auth/login')
        return null
    }

    return (
        <div>
            <h1>Feed</h1>
        </div>
    )
}
