'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import { Logo } from '@/components/header'

import { loginHref, SIGNUP_HREF } from './signup-links'

const ACCOUNT_LINK = 'inline-flex min-h-9 shrink-0 items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700'
const SIGNUP_LINK = `${ACCOUNT_LINK} bg-green-700 text-white hover:bg-green-800`

/** Casca para visitantes sem conta: marca, Entrar / Criar conta e um convite fixo no celular. */
export function PublicShell({ children }: { children: ReactNode }) {
    const path = usePathname()

    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-neutral-100 sticky top-0 z-10 bg-white/90 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
                <div className="max-w-5xl mx-auto h-14 px-4 flex items-center gap-3">
                    <Link href="/" aria-label="Neybor, página inicial" className="shrink-0">
                        <Logo />
                    </Link>
                    <Link href="/feira" className="font-semibold text-neutral-800 truncate">
                        Feira do Bairro
                    </Link>
                    <div className="ml-auto flex gap-2">
                        <Link href={loginHref(path || '/feira')} className={`${ACCOUNT_LINK} bg-neutral-100 text-neutral-900 hover:bg-neutral-200`}>
                            Entrar
                        </Link>
                        <div className="hidden sm:block">
                            <Link href={SIGNUP_HREF} className={SIGNUP_LINK}>Criar conta</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-4 pb-28 sm:pb-10">{children}</main>

            <div className="sm:hidden fixed bottom-0 inset-x-0 z-10 bg-white/95 backdrop-blur-lg border-t border-neutral-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
                <p className="flex-1 text-sm font-semibold text-neutral-700 leading-tight">
                    Fale com os vizinhos e anuncie de graça.
                </p>
                <Link href={SIGNUP_HREF} className={SIGNUP_LINK}>Criar conta</Link>
            </div>
        </div>
    )
}
