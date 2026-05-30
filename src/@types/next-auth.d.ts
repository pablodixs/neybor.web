// next-auth.d.ts
import { DefaultSession } from 'next-auth'

type SessionInfo = {
    ipAddress: string
    userAgent: string
    deviceName: string
    browser: string
    os: string
}

declare module 'next-auth' {
    interface Session {
        user: {
            profileId: number
            token: string
            type: string
            avatarUrl: string
            displayName: string
        } & DefaultSession['user']
        info?: SessionInfo
        error?: 'RefreshAccessTokenError'
    }

    interface User {
        profileId: number
        token: string
        type: string
        avatarUrl: string
        displayName: string
        accessTokenExpires: number
        sessionInfo: SessionInfo
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        profileId: number
        token: string
        type: string
        avatarUrl: string
        displayName: string
        accessTokenExpires?: number
        sessionInfo?: SessionInfo
        error?: 'RefreshAccessTokenError'
    }
}
