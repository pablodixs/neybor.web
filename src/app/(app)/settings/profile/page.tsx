'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Navigation } from '@/components/navigation'
import { ProfileProps } from '@/components/profile-page/profile-header'
import { fetcherWithToken } from '@/lib/swr'
import {
    InfoIcon,
    PencilSimpleIcon,
    TrashIcon,
    UploadSimpleIcon,
} from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SettingsPage() {
    const [userData, setUserData] = useState<ProfileProps | null>(null)

    const { data: user } = useSession()
    const { data } = useSWR<ProfileProps>(
        user
            ? [`${API_URL}/profile/${user.user.profileId}`, user?.user?.token]
            : null,
        fetcherWithToken,
        {
            onSuccess(data) {
                setUserData(data)
            },
        },
    )

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Editar Perfil" />
            <div className="flex flex-col items-center text-center p-4 border-b border-neutral-100">
                <span className="flex text-3xl text-green-600 bg-green-50 p-4 rounded-full aspect-square w-fit">
                    <PencilSimpleIcon weight="bold" />
                </span>
                <p className="mt-2 font-medium text-lg text-balance leading-tight">
                    Altere as informações do seu perfil público como nome, foto
                    e bio.
                </p>
            </div>
            <section className="mt-4">
                <div className="flex flex-col gap-4 items-center py-6">
                    <button>
                        <Image
                            src={
                                userData?.avatarUrl ||
                                '/images/default-avatar.png'
                            }
                            alt=""
                            width={100}
                            height={100}
                            className="rounded-full aspect-square"
                        />
                    </button>
                    <div className="flex gap-2">
                        <Button
                            textAlign="left"
                            iconPlacement="leading"
                            icon={UploadSimpleIcon}
                        >
                            Enviar foto
                        </Button>
                        <Button
                            textAlign="left"
                            variant="secondary"
                            iconPlacement="leading"
                            icon={TrashIcon}
                        >
                            Remover foto
                        </Button>
                    </div>
                </div>
                <span className="px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg flex gap-2 mb-4 items-center">
                    <InfoIcon size={20} />
                    Sua foto de perfil é pública para todos os usuários do
                    Neybor.
                </span>
                <form>
                    <div>
                        <label
                            className="font-medium text-sm text-neutral-600"
                            htmlFor="name"
                        >
                            Nome
                        </label>
                        <Input
                            fullWidth
                            id="name"
                            placeholder="Primeiro nome"
                            onChange={(e) =>
                                setUserData((prev) => ({
                                    ...(prev || data!),
                                    displayName: e.target.value,
                                }))
                            }
                            value={userData?.displayName || ''}
                        />
                        <label
                            className="font-medium text-sm text-neutral-600"
                            htmlFor="name"
                        >
                            Nome
                        </label>
                        <Input
                            fullWidth
                            id="username"
                            placeholder="Nome de usuário"
                            onChange={(e) =>
                                setUserData((prev) => ({
                                    ...(prev || data!),
                                    handle: e.target.value,
                                }))
                            }
                            value={userData?.handle || ''}
                        />
                    </div>
                </form>
            </section>
        </div>
    )
}
