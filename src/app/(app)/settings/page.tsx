'use client'

import { Navigation } from '@/components/navigation'
import {
    LockSimpleIcon,
    PasswordIcon,
    PencilSimpleIcon,
    UserListIcon,
} from '@phosphor-icons/react'
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function SettingsPage() {
    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation showBackButton={false} title="Preferências" />
            <section className="flex flex-col gap-1">
                <Link
                    href={'/settings/profile'}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <PencilSimpleIcon size={20} weight="bold" /> Editar perfil
                </Link>
                <Link
                    href={'/settings/profile'}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <UserListIcon size={20} weight="bold" /> Informações da
                    conta
                </Link>
                <Link
                    href={'/settings/profile'}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <LockSimpleIcon size={20} weight="bold" /> Privacidade
                </Link>
                <Link
                    href={'/settings/profile'}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <PasswordIcon size={20} weight="bold" /> Segurança
                </Link>
                <button
                    onClick={() => signOut()}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                    <SignOutIcon size={20} weight="bold" /> Sair
                </button>
            </section>
        </div>
    )
}
