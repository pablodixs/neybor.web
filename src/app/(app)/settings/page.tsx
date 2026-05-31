'use client'

import { signOut } from 'next-auth/react'
import {
    LockSimpleIcon,
    PasswordIcon,
    PencilSimpleIcon,
    UserListIcon,
    SignOutIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { SectionLink } from './components/section_link'

const PREFERENCES_LINKS = [
    {
        icon: PencilSimpleIcon,
        label: 'Editar perfil',
        href: '/settings/profile',
    },
    {
        icon: UserListIcon,
        label: 'Sua conta',
        href: '/settings/account',
    },
    {
        icon: LockSimpleIcon,
        label: 'Privacidade',
        href: '/settings/privacy',
    },
    {
        icon: PasswordIcon,
        label: 'Segurança',
        href: '/settings/security',
    },
]

export default function SettingsPage() {
    return (
        <>
            <Navigation showBackButton={false} title="Preferências" />
            <section className="flex flex-col gap-1">
                {PREFERENCES_LINKS.map((link) => (
                    <SectionLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.label}
                    />
                ))}
                <button
                    onClick={() => signOut()}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                    <SignOutIcon size={20} weight="bold" /> Sair
                </button>
            </section>
        </>
    )
}
