/** Rotas de entrada para visitantes; `next` volta para o anúncio depois do login. */
export function loginHref(next: string) {
    return `/auth/login?callbackUrl=${encodeURIComponent(next)}`
}

export const SIGNUP_HREF = '/auth/signin'
