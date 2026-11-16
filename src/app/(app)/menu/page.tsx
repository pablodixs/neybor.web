'use client'

import {
    BagSimpleIcon,
    BookmarkSimpleIcon,
    CalendarDotsIcon,
    CaretRightIcon,
    GearSixIcon,
    Icon,
    UserIcon,
    UserPlusIcon,
    UsersThreeIcon,
    WrenchIcon,
} from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

import { Navigation } from '@/components/navigation'
import { ProfileSwitcher } from '@/components/services/profile-switcher'
import { useMyProfileHref } from '@/hooks/use-my-profile-href'
import { isFeatureEnabled } from '@/lib/features'

/**
 * Menu do celular: reúne o que no desktop fica na coluna da esquerda
 * (perfil, itens salvos, preferências e a saída da conta).
 */
export default function MenuPage() {
    const { data } = useSession()
    const profileHref = useMyProfileHref()

    const links: {
        href: string
        label: string
        icon: Icon
        enabled: boolean
    }[] = [
        {
            href: profileHref ?? '#',
            label: 'Meu perfil',
            icon: UserIcon,
            enabled: profileHref !== null,
        },
        {
            href: '/servicos',
            label: 'Serviços',
            icon: WrenchIcon,
            enabled: true,
        },
        {
            href: '/convidar',
            label: 'Convidar vizinhos',
            icon: UserPlusIcon,
            enabled: true,
        },
        {
            href: '/bookmarks',
            label: 'Itens salvos',
            icon: BookmarkSimpleIcon,
            enabled: true,
        },
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
            href: '/settings',
            label: 'Preferências e sair da conta',
            icon: GearSixIcon,
            enabled: true,
        },
    ]

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Menu" showBackButton={false} />
            {data && (
                <div className="flex items-center gap-3 mb-4">
                    <Image
                        className="rounded-full aspect-square object-cover w-12 h-12 bg-neutral-100"
                        src={
                            data.user.avatarUrl || '/images/default-avatar.png'
                        }
                        alt=""
                        width={48}
                        height={48}
                    />
                    <strong className="font-semibold text-lg">
                        {data.user.displayName}
                    </strong>
                </div>
            )}
            <ProfileSwitcher />
            <nav className="flex flex-col mt-2">
                {links
                    .filter((link) => link.enabled)
                    .map(({ href, label, icon: LinkIcon }) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-3 py-4 border-b border-neutral-100 last:border-0 font-semibold text-neutral-700"
                        >
                            <LinkIcon size={22} weight="bold" />
                            <span className="flex-1">{label}</span>
                            <CaretRightIcon
                                size={16}
                                weight="bold"
                                className="text-neutral-400"
                            />
                        </Link>
                    ))}
            </nav>
        </div>
    )
}
