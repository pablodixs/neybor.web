import {
    BagSimpleIcon,
    BookmarkSimpleIcon,
    CalendarDotsIcon,
    GearSixIcon,
    Icon,
    PencilSimpleLineIcon,
    UserIcon,
    UsersThreeIcon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

import { isFeatureEnabled } from '@/lib/features'

import { Button } from '../button'
import { useCompose } from '../post/compose-context'

interface AsideLink {
    href: string
    label: string
    icon: Icon
    enabled: boolean
}

export function LeadingAside() {
    const path = usePathname()
    const { data } = useSession({
        required: true,
    })
    const { openCompose } = useCompose()

    if (!data) return null

    const profileHref = `/${data.user.profileId}`

    const links: AsideLink[] = [
        {
            href: '/marketplace',
            label: 'Marketplace',
            icon: BagSimpleIcon,
            enabled: isFeatureEnabled('marketplace'),
        },
        {
            href: '/groups',
            label: 'Grupos',
            icon: UsersThreeIcon,
            enabled: isFeatureEnabled('groups'),
        },
        {
            href: '/events',
            label: 'Eventos',
            icon: CalendarDotsIcon,
            enabled: isFeatureEnabled('events'),
        },
        {
            href: profileHref,
            label: 'Meu perfil',
            icon: UserIcon,
            enabled: true,
        },
        {
            href: '/bookmarks',
            label: 'Itens salvos',
            icon: BookmarkSimpleIcon,
            enabled: true,
        },
        {
            href: '/settings',
            label: 'Preferências',
            icon: GearSixIcon,
            enabled: true,
        },
    ]

    return (
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20 self-start">
            <div className="border border-neutral-100 p-2 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto bg-white">
                <Link
                    href={profileHref}
                    className="flex flex-col items-center p-2 mt-2"
                >
                    <Image
                        className="rounded-full aspect-square object-cover w-14 h-14 mb-1 bg-neutral-100"
                        src={
                            data.user.avatarUrl || '/images/default-avatar.png'
                        }
                        alt={data.user.displayName || 'User avatar'}
                        width={56}
                        height={56}
                    />
                    <strong className="font-semibold text-xl">
                        {data.user.displayName}
                    </strong>
                </Link>
                <nav className="mt-4 flex flex-col gap-2">
                    {links
                        .filter((link) => link.enabled)
                        .map(({ href, label, icon: LinkIcon }) => {
                            const active = path === href
                            return (
                                <Link
                                    key={href}
                                    data-active={active}
                                    aria-current={active ? 'page' : undefined}
                                    href={href}
                                    className="data-[active=true]:text-green-600 flex items-center gap-2 py-3 px-4 font-semibold text-neutral-700 hover:text-green-700 rounded-full hover:bg-green-50 transition-all"
                                >
                                    <LinkIcon
                                        size={20}
                                        weight={active ? 'fill' : 'bold'}
                                    />{' '}
                                    {label}
                                </Link>
                            )
                        })}
                    <Button
                        size="lg"
                        onClick={openCompose}
                        iconPlacement="leading"
                        icon={PencilSimpleLineIcon}
                    >
                        Postar
                    </Button>
                </nav>
            </div>
        </aside>
    )
}
