// next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            profileId: number
            token: string
            type: string
            avatarUrl: string
            displayName: string
        } & DefaultSession['user']
    }

    interface User {
        profileId: number
        token: string
        type: string
        avatarUrl: string
        displayName: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        profileId: number
        token: string
        type: string
        avatarUrl: string
        displayName: string
    }
}
