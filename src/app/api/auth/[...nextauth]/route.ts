import NextAuth, { AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const authOptions: AuthOptions = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: credentials?.username,
                        password: credentials?.password,
                    }),
                })

                const user = await response.json()

                if (response.ok && user) {
                    return user
                } else {
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

            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
