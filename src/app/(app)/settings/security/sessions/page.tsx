'use client'

import useSWR from 'swr'
import axios from 'axios'
import Link from 'next/link'
import { ptBR } from 'date-fns/locale'
import { signOut, useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import {
    AppleLogoIcon,
    DesktopIcon,
    QuestionMarkIcon,
    SignOutIcon,
    WindowsLogoIcon,
} from '@phosphor-icons/react/dist/ssr'

import { fetcherWithToken } from '@/lib/swr'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'

interface Session {
    id: string
    deviceName: string
    operatingSystem: null | string
    ipAddress: string
    startedAt: string
    expiresAt: string
    current: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SessionsPage() {
    const { data: user } = useSession()

    const { data, isLoading } = useSWR<Session[]>(
        user ? [`${API_URL}/auth/sessions`, user.user.token] : null,
        fetcherWithToken,
    )

    function handleRevokeAllSessions() {
        axios.post(
            `${API_URL}/auth/revoke-all`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${user?.user.token}`,
                },
            },
        )
        signOut()
    }

    return (
        <>
            <Navigation title="Dispositivos conectados" />
            <p className="text-sm text-neutral-500 mb-4">
                Veja os dispositivos onde sua conta do Neybor está conectada ou
                foi utilizada recentemente.{' '}
                <Link className="text-green-600 hover:underline" href="#">
                    Saiba mais...
                </Link>
            </p>
            {isLoading && (
                <div className="flex flex-col gap-2 items-center">
                    <Spinner />{' '}
                    <span className="text-sm text-neutral-400">
                        Carregando sessões...
                    </span>
                </div>
            )}
            {data && (
                <div className="flex flex-col gap-2 ">
                    {data.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                    <Button
                        variant="ghostDestructive"
                        onClick={handleRevokeAllSessions}
                    >
                        Sair de todas as sessões
                    </Button>
                </div>
            )}
        </>
    )
}

const SessionCard = ({ session }: { session: Session }) => {
    return (
        <div
            className={`flex gap-4 items-center p-4 border-2 border-neutral-100 rounded-xl`}
            key={session.id}
        >
            <div>
                <SessionIcon operatingSystem={session.operatingSystem} />
            </div>
            <div className="flex-1">
                <b>{session.deviceName}</b>
                <p className="text-sm">
                    {session.operatingSystem} &bull; {session.ipAddress}
                </p>

                {!session.current && (
                    <>
                        <p className="text-sm">
                            {formatDistanceToNow(session.startedAt, {
                                addSuffix: true,
                                locale: ptBR,
                            })}
                        </p>
                    </>
                )}
            </div>
            {session.current && (
                <span className="inline-block py-1 px-3 bg-green-100 rounded-full text-sm font-semibold text-green-600">
                    Sessão atual
                </span>
            )}
            {!session.current && (
                <Button
                    icon={SignOutIcon}
                    iconPlacement="leading"
                    variant="ghost"
                    size="sm"
                >
                    Sair desse dispositivo
                </Button>
            )}
        </div>
    )
}

const SessionIcon = ({
    operatingSystem,
}: {
    operatingSystem: string | null
}) => {
    const ICONS_MAP = {
        Unknown: <DesktopIcon />,
        Windows: <WindowsLogoIcon />,
        MacOS: <AppleLogoIcon />,
    }

    return (
        <div className="text-lg flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
            {ICONS_MAP[operatingSystem as keyof typeof ICONS_MAP] || (
                <QuestionMarkIcon />
            )}
        </div>
    )
}
