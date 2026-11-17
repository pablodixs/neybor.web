'use client'

import { ArrowRightIcon, UserPlusIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { InstallBanner } from '../pwa/install-banner'
import { MyNeighborhoodAlerts } from './my-neighborhood-alerts'
import { NewInFeira } from './new-in-feira'

export function TrailingAside() {
    const pathname = usePathname()

    if (pathname === '/map') return null

    return (
        <aside aria-label="Sua vizinhança" className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-80 shrink-0 space-y-3 overflow-y-auto pr-6 pb-8 pl-2 xl:block">
            <MyNeighborhoodAlerts />
            {pathname !== '/feira' && <NewInFeira />}
            <InstallBanner variant="card" />
            <section>
                <Link href="/convidar" className="group flex items-center gap-3 rounded-2xl bg-white p-4 transition-colors hover:bg-tint/60">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-on-tint">
                        <UserPlusIcon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-neutral-900">Convide seus vizinhos</span>
                        <span className="block text-xs text-neutral-500">Quanto mais gente, mais útil o feed.</span>
                    </span>
                    <ArrowRightIcon size={16} aria-hidden="true" className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </section>
        </aside>
    )
}
