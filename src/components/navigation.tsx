'use client'

import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

interface NavigationProps {
    title?: string
    showBackButton?: boolean
}

export function Navigation({ title, showBackButton = true }: NavigationProps) {
    const router = useRouter()
    return (
        <header className="flex justify-between mb-4 min-h-[34px] items-center">
            <div className="flex gap-2 text-neutral-700 text-lg font-semibold items-center">
                {showBackButton && (
                    <button
                        className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition"
                        onClick={() => router.back()}
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon weight="bold" />
                    </button>
                )}
                <p>{title}</p>
            </div>
        </header>
    )
}
