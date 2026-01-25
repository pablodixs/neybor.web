import {
    BagSimpleIcon,
    CalendarDotsIcon,
    GearSixIcon,
    PencilSimpleLineIcon,
    UserIcon,
    UsersThreeIcon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../button'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { NewPostDialog } from '../post/new-post-dialog'
import { AnimatePresence } from 'motion/react'

export function LeadingAside() {
    const { data } = useSession({
        required: true,
    })

    const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)

    if (!data) return null

    return (
        <>
            <aside className="w-80 shrink-0 sticky top-20 self-start ">
                <div className="border border-neutral-100 p-2 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto bg-white">
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
                    </Link>
                    <div className="mt-4 flex flex-col gap-2">
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <BagSimpleIcon size={20} weight="bold" />{' '}
                            Marketplace
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <UsersThreeIcon size={20} weight="bold" /> Grupos
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <CalendarDotsIcon size={20} weight="bold" /> Eventos
                        </Link>
                        <Link
                            href={`#`}
                            className="flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <UserIcon size={20} weight="bold" /> Meu perfil
                        </Link>
                        <Link
                            href={`/settings`}
                            className="flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                        >
                            <GearSixIcon size={20} weight="bold" /> Preferências
                        </Link>
                        <Button
                            size="lg"
                            onClick={() =>
                                setIsNewPostDialogOpen(!isNewPostDialogOpen)
                            }
                            iconPlacement="leading"
                            icon={PencilSimpleLineIcon}
                        >
                            Postar
                        </Button>
                    </div>
                </div>
            </aside>
            <AnimatePresence>
                {isNewPostDialogOpen && (
                    <NewPostDialog
                        isOpen={isNewPostDialogOpen}
                        onClose={() => setIsNewPostDialogOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    )
}
