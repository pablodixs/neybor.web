'use client'

import useSWR from 'swr'
import axios from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Input } from '@/components/input'
import { Navigation } from '@/components/navigation'
import { ProfileProps } from '@/components/profile-page/profile-header'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { InfoIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { PAGE_DESCRIPTION } from '../styles'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SettingsPage() {
    const [userData, setUserData] = useState<ProfileProps | null>(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarUploadError, setAvatarUploadError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: user } = useSession()
    const { data, isLoading, mutate } = useSWR<ProfileProps>(
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

    function handleAvatarButtonClick() {
        fileInputRef.current?.click()
    }

    function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file || !user?.user.token) return

        const formData = new FormData()
        formData.append('file', file)

        setIsUploadingAvatar(true)
        setAvatarUploadError('')

        axios
            .post<{ url: string }>(
                `${API_URL}/storage/upload/avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.user.token}`,
                    },
                },
            )
            .then((response) => {
                setUserData((prev) => ({
                    ...(prev || data!),
                    avatarUrl: response.data.url,
                }))
                mutate(
                    (current) =>
                        current
                            ? {
                                  ...current,
                                  avatarUrl: response.data.url,
                              }
                            : current,
                    false,
                )
            })
            .catch((error) => {
                console.error(error)
                setAvatarUploadError(
                    'Não foi possível enviar a foto. Tente novamente.',
                )
            })
            .finally(() => {
                setIsUploadingAvatar(false)
                event.target.value = ''
            })
    }

    if (isLoading || !data) {
        return (
            <>
                <Navigation title="Editar Perfil" />
                <Spinner />
            </>
        )
    }

    return (
        <>
            <Navigation title="Editar Perfil" />
            <p className={PAGE_DESCRIPTION}>
                Altere as informações do seu perfil público como nome, foto e
                bio.
            </p>
            <Divider />
            <section className="mt-4">
                <div className="flex flex-col gap-4 items-center py-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                    />
                    <button
                        type="button"
                        onClick={handleAvatarButtonClick}
                        disabled={isUploadingAvatar}
                        className="disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span
                            aria-label="Foto de perfil"
                            role="img"
                            className="block size-[100px] rounded-full bg-neutral-100 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${userData?.avatarUrl || '/images/default-avatar.png'})`,
                            }}
                        />
                    </button>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            textAlign="left"
                            iconPlacement="leading"
                            icon={UploadSimpleIcon}
                            onClick={handleAvatarButtonClick}
                            activityIndicator={isUploadingAvatar}
                            activityLabel="Enviando..."
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
                    {avatarUploadError && (
                        <p className="text-sm font-semibold text-red-600">
                            {avatarUploadError}
                        </p>
                    )}
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
        </>
    )
}
