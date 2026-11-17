'use client'

import { MagnifyingGlassIcon, PencilSimpleLineIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect } from 'react'

import { useCompose } from './post/compose-context'

export function Logo() {
    return (
        <svg
            width="27"
            height="32"
            viewBox="0 0 27 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M13.4649 16.7892C12.3716 16.7892 11.4696 17.0625 10.759 17.6092C10.0483 18.1285 9.52898 18.8255 9.20098 19.7002C8.87298 20.5475 8.70899 21.5041 8.70899 22.5701V32H2.88705V21.8731C2.88705 19.9052 3.26972 18.1148 4.03504 16.5022C4.8277 14.8622 6.00302 13.5639 7.561 12.6072C9.11898 11.6232 11.087 11.1313 13.4649 11.1313C15.8429 11.1313 17.8109 11.6232 19.3689 12.6072C20.9542 13.5639 22.1432 14.8485 22.9358 16.4612C23.7285 18.0738 24.1248 19.8778 24.1248 21.8731V32H18.3029V22.5701C18.3029 21.5315 18.1252 20.5748 17.7699 19.7002C17.4145 18.8255 16.8816 18.1285 16.1709 17.6092C15.4876 17.0625 14.5856 16.7892 13.4649 16.7892Z"
                fill="#00A63E"
            />
            <path
                d="M26.6916 7.70492L24.1291 12.1434L13.3454 5.91653L2.56247 12.1434L0 7.70492L13.3454 0L26.6916 7.70492Z"
                fill="#00A63E"
            />
        </svg>
    )
}

function FeedSearch() {
    const router = useRouter()
    const query = useSearchParams().get('q') ?? ''

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const term = String(new FormData(event.currentTarget).get('q') ?? '').trim()
        const params = term ? '?' + new URLSearchParams({ q: term }).toString() : ''
        router.push('/feed' + params)
    }

    return (
        <form role="search" onSubmit={search} className="group flex w-full max-w-md items-center gap-2 rounded-full bg-neutral-100 pr-1 pl-3.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-tint-strong hover:bg-neutral-200/60 focus-within:hover:bg-white lg:bg-white lg:hover:bg-white">
            <MagnifyingGlassIcon size={16} weight="bold" aria-hidden="true" className="shrink-0 text-neutral-500" />
            <label htmlFor="feed-search" className="sr-only">Buscar no feed</label>
            <input
                id="feed-search"
                key={query}
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Buscar no bairro…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 text-base text-neutral-900 outline-none placeholder:text-neutral-500 lg:text-sm"
            />
            <kbd className="mr-2 hidden rounded bg-neutral-100 px-1.5 text-[0.6875rem] font-medium text-neutral-500 lg:inline">/</kbd>
        </form>
    )
}

export function Header() {
    const { openCompose } = useCompose()

    useEffect(() => {
        function focusSearch(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null
            if (event.key !== '/' || event.metaKey || event.ctrlKey || target?.closest('input, textarea, [contenteditable="true"]')) return
            event.preventDefault()
            document.getElementById('feed-search')?.focus()
        }
        window.addEventListener('keydown', focusSearch)
        return () => window.removeEventListener('keydown', focusSearch)
    }, [])

    return (
        <header className="fixed inset-x-0 top-0 z-10 border-b border-neutral-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:border-transparent lg:bg-canvas/90 lg:supports-[backdrop-filter]:bg-canvas/80">
            <div className="flex h-12 w-full items-center gap-3 px-3 sm:px-5 lg:h-14 lg:gap-0 lg:px-0">
                {/* No desktop o logo ocupa a largura do menu lateral, e a busca começa onde começa o feed. */}
                <div className="flex shrink-0 items-center lg:w-60 lg:px-6 lg:in-data-[sidebar=collapsed]:w-[4.5rem] lg:in-data-[sidebar=collapsed]:px-[1.3125rem]">
                    <Link href="/feed" aria-label="Neybor, ir para o início" className="flex items-center gap-2 rounded-md text-neutral-950">
                        <Logo />
                        <span className="hidden text-lg font-bold tracking-tight lg:inline lg:in-data-[sidebar=collapsed]:hidden">Neybor</span>
                    </Link>
                </div>
                <div className="flex min-w-0 flex-1 lg:px-8">
                    <Suspense>
                        <FeedSearch />
                    </Suspense>
                </div>
                <div className="hidden shrink-0 justify-end lg:flex lg:pr-8 xl:w-80 xl:px-6">
                    <button
                        type="button"
                        onClick={() => openCompose()}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-bold text-white transition-[background-color,transform] duration-150 ease-snappy hover:bg-neutral-800 active:scale-[0.97] motion-reduce:active:scale-100"
                    >
                        <PencilSimpleLineIcon size={16} weight="bold" aria-hidden="true" />
                        Publicar
                    </button>
                </div>
            </div>
        </header>
    )
}
