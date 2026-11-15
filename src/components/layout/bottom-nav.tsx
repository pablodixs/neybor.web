'use client'

import {
    HouseIcon,
    Icon,
    MapTrifoldIcon,
    PlusIcon,
    SirenIcon,
    UserCircleIcon,
} from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useCompose } from '../post/compose-context'

function NavItem({
    href,
    label,
    icon: ItemIcon,
    active,
}: {
    href: string
    label: string
    icon: Icon
    active: boolean
}) {
    return (
        <Link
            href={href}
            data-active={active}
            aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-neutral-500 data-[active=true]:text-green-600 text-[11px] font-semibold"
        >
            <ItemIcon size={24} weight={active ? 'fill' : 'regular'} />
            {label}
        </Link>
    )
}

/** Barra de navegação fixa no rodapé, só no celular e tablet. */
export function BottomNav() {
    const path = usePathname()
    const { data } = useSession()
    const { openCompose } = useCompose()

    const profileHref = data ? `/${data.user.profileId}` : '/settings'

    return (
        <nav
            aria-label="Navegação principal"
            className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-lg border-t border-neutral-100 pb-[env(safe-area-inset-bottom)]"
        >
            <div className="flex items-stretch h-16 max-w-xl mx-auto">
                <NavItem
                    href="/feed"
                    label="Início"
                    icon={HouseIcon}
                    active={path === '/feed'}
                />
                <NavItem
                    href="/alerts"
                    label="Alertas"
                    icon={SirenIcon}
                    active={path === '/alerts'}
                />
                <div className="flex-1 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={openCompose}
                        aria-label="Novo post"
                        className="w-12 h-12 rounded-full bg-green-600 active:bg-green-800 text-white flex items-center justify-center shadow-md cursor-pointer"
                    >
                        <PlusIcon size={24} weight="bold" />
                    </button>
                </div>
                <NavItem
                    href="/map"
                    label="Mapa"
                    icon={MapTrifoldIcon}
                    active={path === '/map'}
                />
                <NavItem
                    href={profileHref}
                    label="Perfil"
                    icon={UserCircleIcon}
                    active={
                        path === profileHref || path.startsWith('/settings')
                    }
                />
            </div>
        </nav>
    )
}
