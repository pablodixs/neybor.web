'use client'

import useSWR from 'swr'

import { Navigation } from '@/components/navigation'
import { fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/button'

interface Session {
    current: boolean
    deviceName: string
    expiresAt: string
    id: string
    ipAddress: string
    operatingSystem: null | string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SessionsPage() {
    const { data: user } = useSession()

    const { data } = useSWR<Session[]>(
        user ? [`${API_URL}/auth/sessions`, user.user.token] : null,
        fetcherWithToken,
    )

    console.log(data)

    return (
        <>
            <Navigation title="Sessões" />
            {data && (
                <div className="flex flex-col gap-2 ">
                    {data.map((session) => (
                        <div
                            className={`pb-2 border-b border-neutral-100`}
                            key={session.id}
                        >
                            <b>{session.deviceName}</b>
                            {session.current && (
                                <span className="ml-2 text-xs text-green-500">
                                    Essa sessão
                                </span>
                            )}
                            <p>{session.operatingSystem}</p>
                            <p>IP {session.ipAddress}</p>
                            <p>
                                Expira em{' '}
                                {formatDate(
                                    session.expiresAt,
                                    'MM/dd/yyyy HH:mm:ss',
                                    { locale: ptBR },
                                )}
                            </p>
                            <Button variant="bordered">
                                Sair desse dispositivo
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
