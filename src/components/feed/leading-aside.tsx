'use client'

import {
    BagSimpleIcon,
    BellIcon,
    BookmarkSimpleIcon,
    CalendarDotsIcon,
    ChatsCircleIcon,
    GearSixIcon,
    HouseIcon,
    MapTrifoldIcon,
    CaretUpDownIcon,
    SidebarSimpleIcon,
    SirenIcon,
    UserIcon,
    UserPlusIcon,
    UsersThreeIcon,
    WrenchIcon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useMyProfileHref } from '@/hooks/use-my-profile-href'
import { isFeatureEnabled } from '@/lib/features'

import { ProfileSwitcher } from '../services/profile-switcher'

const PRIMARY_LINKS = [
    { href: '/feed', label: 'Início', icon: HouseIcon, enabled: true },
    { href: '/alerts', label: 'Alertas', icon: SirenIcon, enabled: true },
    { href: '/map', label: 'Mapa', icon: MapTrifoldIcon, enabled: true },
    { href: '/feira', label: 'Feira do Bairro', icon: BagSimpleIcon, enabled: isFeatureEnabled('marketplace') },
    { href: '/feira/conversas', label: 'Mensagens', icon: ChatsCircleIcon, enabled: isFeatureEnabled('messages') },
    { href: '/notifications', label: 'Notificações', icon: BellIcon, enabled: isFeatureEnabled('notifications') },
]

const SECONDARY_LINKS = [
    { href: '/servicos', label: 'Serviços', icon: WrenchIcon, enabled: true },
    { href: '/bookmarks', label: 'Itens salvos', icon: BookmarkSimpleIcon, enabled: true },
    { href: '/convidar', label: 'Convidar vizinhos', icon: UserPlusIcon, enabled: true },
    { href: '/groups', label: 'Grupos', icon: UsersThreeIcon, enabled: isFeatureEnabled('groups') },
    { href: '/events', label: 'Eventos', icon: CalendarDotsIcon, enabled: isFeatureEnabled('events') },
]

export function LeadingAside() {
    const path = usePathname()
    const { data } = useSession()
    const profileHref = useMyProfileHref()
    const [collapsed, setCollapsed] = useState(false)
    const accountMenu = useRef<HTMLDetailsElement>(null)
    const accountTrigger = useRef<HTMLElement>(null)

    // O header lê este atributo para manter o logo alinhado à largura do menu.
    useEffect(() => {
        document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'expanded'
    }, [collapsed])

    function closeAccountMenu() {
        accountMenu.current?.removeAttribute('open')
    }

    function renderLinks(links: typeof PRIMARY_LINKS) {
        return links.filter((link) => link.enabled).map(({ href, label, icon: LinkIcon }) => {
            const active = path === href || (path.startsWith(href + '/') && (href !== '/feira' || !path.startsWith('/feira/conversas')))
            return (
                <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? label : undefined}
                    className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-black/[0.04] hover:text-neutral-950 aria-[current=page]:bg-tint aria-[current=page]:font-bold aria-[current=page]:text-on-tint group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0"
                >
                    <LinkIcon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" className="shrink-0" />
                    <span className="truncate group-data-[collapsed=true]:sr-only">{label}</span>
                </Link>
            )
        })
    }

    return (
        <aside data-collapsed={collapsed} className="group sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 flex-col px-3 pt-2 pb-3 lg:flex data-[collapsed=true]:w-[4.5rem]">
            <nav id="desktop-navigation" aria-label="Navegação principal" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
                <div className="space-y-0.5">{renderLinks(PRIMARY_LINKS)}</div>
                <div>
                    <p className="mb-1 px-3 text-xs font-medium text-neutral-500 group-data-[collapsed=true]:sr-only">Comunidade</p>
                    <div className="space-y-0.5">{renderLinks(SECONDARY_LINKS)}</div>
                </div>
            </nav>
            <div className="mt-3 flex items-center gap-1 rounded-2xl bg-white p-1 group-data-[collapsed=true]:flex-col">
                {data && (
                    <details
                        ref={accountMenu}
                        className="group/account relative min-w-0 flex-1 group-data-[collapsed=true]:flex-none"
                        onKeyDown={(event) => {
                            if (event.key === 'Escape' && accountMenu.current?.open) {
                                event.stopPropagation()
                                closeAccountMenu()
                                accountTrigger.current?.focus()
                            }
                        }}
                    >
                        <summary ref={accountTrigger} aria-label={`Conta de ${data.user.displayName || 'usuário'}`} className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-xl px-2 text-sm hover:bg-neutral-100 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-1 [&::-webkit-details-marker]:hidden">
                            <Image className="size-7 shrink-0 rounded-full bg-neutral-100 object-cover" src={data.user.avatarUrl || '/images/default-avatar.png'} alt="" width={28} height={28} />
                            <span className="min-w-0 flex-1 truncate font-semibold text-neutral-900 group-data-[collapsed=true]:sr-only">{data.user.displayName}</span>
                            <CaretUpDownIcon size={14} aria-hidden="true" className="shrink-0 text-neutral-400 group-data-[collapsed=true]:hidden" />
                        </summary>
                        <div className="pop-in absolute bottom-full left-0 z-10 mb-1 w-56 rounded-xl bg-white p-1.5 shadow-lg shadow-neutral-900/10 group-data-[collapsed=true]:bottom-0 group-data-[collapsed=true]:left-full group-data-[collapsed=true]:mb-0 group-data-[collapsed=true]:ml-2">
                            <Link href={profileHref ?? '/menu'} onClick={closeAccountMenu} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-neutral-800 hover:bg-neutral-100">
                                <UserIcon size={18} aria-hidden="true" /> Meu perfil
                            </Link>
                            <Link href="/settings" onClick={closeAccountMenu} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-neutral-800 hover:bg-neutral-100">
                                <GearSixIcon size={18} aria-hidden="true" /> Preferências
                            </Link>
                            <ProfileSwitcher />
                        </div>
                    </details>
                )}
                <button
                    type="button"
                    aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                    title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                    aria-expanded={!collapsed}
                    aria-controls="desktop-navigation"
                    onClick={() => setCollapsed((current) => !current)}
                    className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                >
                    <SidebarSimpleIcon size={18} aria-hidden="true" />
                </button>
            </div>
        </aside>
    )
}
