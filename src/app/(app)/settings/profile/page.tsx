'use client'

import useSWR from 'swr'
import axios from 'axios'
import { ChangeEvent, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Navigation } from '@/components/navigation'
import { ProfileProps } from '@/components/profile-page/profile-header'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { InfoIcon, TrashIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { INPUT_STYLES, LABEL_STYLES, PAGE_DESCRIPTION } from '../styles'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SettingsPage() {
    const [userData, setUserData] = useState<ProfileProps | null>(null)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarUploadError, setAvatarUploadError] = useState('')
    const [allowEditing, setAllowEditing] = useState(false)
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
                <span className="px-4 py-3 bg-neutral-100 text-neutral-700 text-sm rounded-lg flex gap-2 mb-4 items-center">
                    <InfoIcon size={20} />
                    Sua foto de perfil é pública para todos os usuários do
                    Neybor.
                </span>
                <form>
                    <div>
                        <label className={LABEL_STYLES} htmlFor="name">
                            Nome
                        </label>
                        <input
                            className={`${INPUT_STYLES} mb-4`}
                            disabled={!allowEditing}
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
                        <label className={LABEL_STYLES} htmlFor="name">
                            Nome de usuário
                        </label>
                        <input
                            className={`${INPUT_STYLES} mb-4`}
                            disabled={!allowEditing}
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
                        <label className={LABEL_STYLES} htmlFor="bio">
                            Bio
                        </label>
                        <textarea
                            className={`${INPUT_STYLES} resize-none`}
                            disabled={!allowEditing}
                            id="bio"
                            value={userData?.bio || ''}
                            placeholder="Fale um pouco sobre você"
                        />
                    </div>
                </form>
                <footer className="flex gap-2 items-center justify-end mt-4">
                    {allowEditing ? (
                        <>
                            <Button
                                onClick={() => setAllowEditing(false)}
                                variant="secondary"
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled
                                onClick={() => setAllowEditing(false)}
                            >
                                Salvar alterações
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setAllowEditing(true)}
                            variant="bordered"
                        >
                            Editar
                        </Button>
                    )}
                </footer>
            </section>
        </>
    )
}
