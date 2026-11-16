'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import { fetcherWithToken } from '@/lib/swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Endereço do perfil do usuário logado. A rota do perfil usa o @handle
 * (e não o id numérico), então buscamos o handle em /profile/me.
 * Enquanto carrega, devolve `null` para a interface não mostrar um link errado.
 */
export function useMyProfileHref() {
    const { data: session } = useSession()
    const token = session?.user?.token

    const { data } = useSWR<{ handle?: string | null }>(
        token ? [`${API_URL}/profile/me`, token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
    )

    return data?.handle ? `/${data.handle}` : null
}
