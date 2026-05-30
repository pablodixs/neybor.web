'use client'

import Link from 'next/link'
import {
    CaretRightIcon,
    PlugsConnectedIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'

export default function SecurityPage() {
    return (
        <>
            <Navigation title="Segurança" />
            <section className="flex flex-col gap-1">
                <Link
                    href={'/settings/security/sessions'}
                    className="flex px-4 py-3 items-center gap-3 font-medium w-full rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <PlugsConnectedIcon size={20} weight="bold" /> Sessões
                    <div className="flex-1"></div>
                    <CaretRightIcon />
                </Link>
            </section>
        </>
    )
}
