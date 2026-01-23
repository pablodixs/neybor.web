'use client'

import { Button } from '@/components/button'
import {
    BagSimpleIcon,
    CalendarDotsIcon,
    PencilSimpleLineIcon,
    SealCheckIcon,
    UserIcon,
    UsersThreeIcon,
} from '@phosphor-icons/react/dist/ssr'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export function FeedLayout({ children }: { children: React.ReactNode }) {
    const { data } = useSession({
        required: true,
    })

    if (!data) return null

    return (
        <section className="pt-20 px-4 max-w-7xl mx-auto flex gap-4">
            <aside className="w-80 shrink-0 sticky top-20 self-start">
                <div className="border border-neutral-100 p-2 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
                    <Link
                        href={`/${data.user.profileId}`}
                        className="flex flex-col items-center p-2 mt-2"
                    >
                        <Image
                            className="rounded-full aspect-square object-cover w-14 h-14 mb-1 bg-neutral-100"
                            src={
                                data.user.avatarUrl ||
                                '/images/default-avatar.png'
                            }
                            alt={data.user.displayName || 'User avatar'}
                            width={56}
                            height={56}
                        />
                        <strong className="font-semibold text-xl">
                            {data.user.displayName}
                        </strong>
                        <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                            <SealCheckIcon weight="fill" /> Verificado
                        </span>
                    </Link>
                    <div className="mt-4 flex flex-col gap-2">
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-2 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <BagSimpleIcon size={20} weight="bold" />{' '}
                            Marketplace
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-2 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <UsersThreeIcon size={20} weight="bold" /> Grupos
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-2 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <CalendarDotsIcon size={20} weight="bold" /> Eventos
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-2 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <UserIcon size={20} weight="bold" /> Meu perfil
                        </Link>
                        <Button
                            iconPlacement="leading"
                            icon={PencilSimpleLineIcon}
                        >
                            Postar
                        </Button>
                        <button onClick={() => signOut()}>Sair</button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 min-w-0">{children}</main>
            <aside className="w-80 shrink-0 sticky top-20 self-start">
                <div className="border border-neutral-100 p-2 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto">
                    <footer>
                        <p>&copy; 2026 Neybor</p>
                    </footer>
                </div>
            </aside>
        </section>
    )
}
