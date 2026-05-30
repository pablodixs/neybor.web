import NextAuth, { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cookies } from 'next/headers'
import type { JWT } from 'next-auth/jwt'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000

type BackendAuthResponse = {
    accessToken: string
    tokenType: string
    profileId: number
    displayName: string
    avatarUrl: string
}

type SessionInfo = {
    ipAddress: string
    userAgent: string
    deviceName: string
    browser: string
    os: string
}

type RequestHeaders = Record<string, string | string[] | undefined>

function getHeader(headers: RequestHeaders, name: string) {
    const value =
        headers[name] ||
        headers[name.toLowerCase()] ||
        headers[name.toUpperCase()]

    return Array.isArray(value) ? value[0] : value
}

function getClientIp(headers: RequestHeaders) {
    const forwardedFor = getHeader(headers, 'x-forwarded-for')
    const realIp = getHeader(headers, 'x-real-ip')
    const vercelIp = getHeader(headers, 'x-vercel-forwarded-for')

    return (
        forwardedFor?.split(',')[0]?.trim() ||
        realIp ||
        vercelIp?.split(',')[0]?.trim() ||
        'unknown'
    )
}

function detectBrowser(userAgent: string) {
    if (/Edg\//.test(userAgent)) return 'Edge'
    if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) {
        return 'Chrome'
    }
    if (/Firefox\//.test(userAgent)) return 'Firefox'
    if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) {
        return 'Safari'
    }

    return 'Unknown browser'
}

function detectOs(userAgent: string) {
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
    if (/Android/.test(userAgent)) return 'Android'
    if (/Mac OS X|Macintosh/.test(userAgent)) return 'macOS'
    if (/Windows NT/.test(userAgent)) return 'Windows'
    if (/Linux/.test(userAgent)) return 'Linux'

    return 'Unknown OS'
}

function getDeviceName(userAgent: string) {
    if (/iPhone/.test(userAgent)) return 'iPhone'
    if (/iPad/.test(userAgent)) return 'iPad'
    if (/Android/.test(userAgent) && /Mobile/.test(userAgent)) {
        return 'Android phone'
    }
    if (/Android/.test(userAgent)) return 'Android tablet'
    if (/Macintosh|Windows NT|Linux/.test(userAgent)) return 'Desktop'

    return 'Unknown device'
}

function getSessionInfo(headers: RequestHeaders): SessionInfo {
    const userAgent = getHeader(headers, 'user-agent') || 'unknown'

    return {
        ipAddress: getClientIp(headers),
        userAgent,
        deviceName: getDeviceName(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOs(userAgent),
    }
}

function getSessionInfoHeaders(sessionInfo?: SessionInfo): Record<string, string> {
    if (!sessionInfo) {
        return {}
    }

    return {
        'X-Client-IP': sessionInfo.ipAddress,
        'X-Device-Name': sessionInfo.deviceName,
        'X-User-Agent': sessionInfo.userAgent,
    }
}

function getAccessTokenExpiration(accessToken: string) {
    try {
        const [, payload] = accessToken.split('.')
        const decodedPayload = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf-8'),
        ) as { exp?: number }

        return decodedPayload.exp ? decodedPayload.exp * 1000 : Date.now()
    } catch {
        return Date.now()
    }
}

function getSetCookieHeaders(response: Response) {
    const headersWithGetSetCookie = response.headers as Headers & {
        getSetCookie?: () => string[]
    }

    return (
        headersWithGetSetCookie.getSetCookie?.() ||
        [response.headers.get('set-cookie')].filter(Boolean)
    )
}

async function saveRefreshTokenCookie(response: Response) {
    const setCookieHeader = getSetCookieHeaders(response).find((cookie) =>
        cookie?.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`),
    )

    if (!setCookieHeader) {
        return
    }

    const [cookiePair, ...attributes] = setCookieHeader.split(';')
    const [, refreshToken] = cookiePair.split('=')
    const maxAgeAttribute = attributes.find((attribute) =>
        attribute.trim().toLowerCase().startsWith('max-age='),
    )
    const sameSiteAttribute = attributes.find((attribute) =>
        attribute.trim().toLowerCase().startsWith('samesite='),
    )
    const maxAge = maxAgeAttribute
        ? Number(maxAgeAttribute.trim().split('=')[1])
        : undefined
    const sameSite = sameSiteAttribute
        ? sameSiteAttribute.trim().split('=')[1].toLowerCase()
        : 'strict'
    const cookieStore = await cookies()

    cookieStore.set({
        name: REFRESH_TOKEN_COOKIE_NAME,
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:
            sameSite === 'lax' || sameSite === 'none' ? sameSite : 'strict',
        path: '/',
        maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
    })
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

        if (!refreshToken) {
            return { ...token, error: 'RefreshAccessTokenError' }
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
                ...getSessionInfoHeaders(token.sessionInfo),
            },
        })

        if (!response.ok) {
            return { ...token, error: 'RefreshAccessTokenError' }
        }

        await saveRefreshTokenCookie(response)

        const refreshedUser = (await response.json()) as BackendAuthResponse

        return {
            ...token,
            profileId: refreshedUser.profileId,
            token: refreshedUser.accessToken,
            type: refreshedUser.tokenType,
            avatarUrl: refreshedUser.avatarUrl,
            displayName: refreshedUser.displayName,
            accessTokenExpires: getAccessTokenExpiration(
                refreshedUser.accessToken,
            ),
            error: undefined,
        }
    } catch (error) {
        console.error('Refresh token error:', error)
        return { ...token, error: 'RefreshAccessTokenError' }
    }
}

async function revokeRefreshToken() {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

    if (!refreshToken) {
        return
    }

    try {
        const response = await fetch(`${API_URL}/auth/revoke`, {
            method: 'POST',
            headers: {
                Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
            },
        })

        await saveRefreshTokenCookie(response)
    } catch (error) {
        console.error('Refresh token revoke error:', error)
        cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
    }
}

export const authOptions: AuthOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, request) {
                try {
                    const sessionInfo = getSessionInfo(request.headers || {})

                    console.log('Attempting login to:', `${API_URL}/auth/login`)
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getSessionInfoHeaders(sessionInfo),
                        },
                        body: JSON.stringify({
                            email: credentials?.username,
                            password: credentials?.password,
                        }),
                    })

                    const text = await response.text()

                    if (!response.ok) {
                        console.error(
                            'Login failed:',
                            response.status,
                            response.statusText,
                        )
                        return null
                    }

                    const user = JSON.parse(text) as BackendAuthResponse

                    if (user) {
                        await saveRefreshTokenCookie(response)

                        return {
                            id: String(user.profileId),
                            profileId: user.profileId,
                            token: user.accessToken,
                            type: user.tokenType,
                            avatarUrl: user.avatarUrl,
                            displayName: user.displayName,
                            accessTokenExpires: getAccessTokenExpiration(
                                user.accessToken,
                            ),
                            sessionInfo,
                        }
                    } else {
                        return null
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.profileId = user.profileId
                token.token = user.token
                token.type = user.type
                token.avatarUrl = user.avatarUrl
                token.displayName = user.displayName
                token.accessTokenExpires = user.accessTokenExpires
                token.sessionInfo = user.sessionInfo
                token.error = undefined
            }

            if (
                token.accessTokenExpires &&
                Date.now() <
                    token.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
            ) {
                return token
            }

            if (token.token) {
                return refreshAccessToken(token)
            }

            return token
        },
        async session({ session, token }) {
            session.user = {
                profileId: token.profileId,
                token: token.token,
                type: token.type,
                avatarUrl: token.avatarUrl,
                displayName: token.displayName,
            }
            session.info = token.sessionInfo
            session.error = token.error

            return session
        },
    },
    events: {
        async signOut() {
            await revokeRefreshToken()
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
