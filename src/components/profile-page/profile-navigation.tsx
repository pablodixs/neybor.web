'use client'

import { ArrowLeftIcon, DotsThreeIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export function ProfileNavigation() {
    const router = useRouter()
    return (
        <header className="flex justify-between">
            <div className="flex gap-2 text-neutral-700 text-lg font-semibold items-center">
                <button
                    className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition"
                    onClick={() => router.back()}
                >
                    <ArrowLeftIcon weight="bold" />
                </button>
                <p>Perfil</p>
            </div>
            <div>
                <button className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition">
                    <DotsThreeIcon weight="bold" />
                </button>
            </div>
        </header>
    )
}
