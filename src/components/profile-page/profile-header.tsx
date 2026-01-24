import {
    CalendarBlankIcon,
    ChatCircleIcon,
    MapPinLineIcon,
    PencilSimpleIcon,
    SealCheckIcon,
    SealWarningIcon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import { Button } from '../button'
import { formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProfileProps {
    avatarUrl: string
    bio: string
    city: string
    neighborhood: string
    displayName: string
    handle: string
    id: number
    isVerified: boolean
    type: string
    createdAt: string
}

interface ProfileHeaderProps {
    user?: ProfileProps
    currentUserId?: number
}

export function ProfileHeader({ user, currentUserId }: ProfileHeaderProps) {
    if (!user) {
        return <div>Usuário não encontrado</div>
    }

    return (
        <section className="py-4 mt-2">
            <div>
                <Image
                    src={user.avatarUrl || '/images/default-avatar.png'}
                    alt={`${user.displayName}'s avatar`}
                    width={112}
                    height={112}
                    className="rounded-full object-cover"
                    quality={100}
                    priority
                />
                <section className="flex justify-between mt-2 items-start">
                    <div>
                        <strong className="font-semibold text-2xl">
                            {user.displayName}
                        </strong>
                        <div className="flex gap-1 items-center">
                            <p className="text-neutral-500 font-medium">
                                {user.handle}
                            </p>
                            <span
                                className={`${user.isVerified ? 'text-green-600' : ' text-neutral-500'} rounded-full flex gap-1 items-center font-medium`}
                            >
                                {user.isVerified ? (
                                    <>
                                        <SealCheckIcon weight="fill" />
                                    </>
                                ) : (
                                    <span>
                                        <SealWarningIcon weight="bold" />
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <div>
                        {user.id === currentUserId ? (
                            <Button
                                variant="bordered"
                                iconPlacement="leading"
                                icon={PencilSimpleIcon}
                            >
                                Editar perfil
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                iconPlacement="leading"
                                icon={ChatCircleIcon}
                            >
                                Mensagem
                            </Button>
                        )}
                    </div>
                </section>
                <section className="py-4">
                    <p>{user.bio}</p>
                    <div className="mt-4 flex gap-4">
                        <span className="flex gap-1 items-center font-semibold text-green-800">
                            <MapPinLineIcon size={18} weight="bold" />{' '}
                            <p>
                                {user.neighborhood}, {user.city}
                            </p>
                        </span>
                        <span className="flex gap-1 items-center text-neutral-500">
                            <CalendarBlankIcon size={18} weight="bold" />
                            <p>
                                Entrou em{' '}
                                {formatDate(user.createdAt, "MMMM 'de' yyyy", {
                                    locale: ptBR,
                                })}
                            </p>
                        </span>
                    </div>
                </section>
            </div>
        </section>
    )
}
