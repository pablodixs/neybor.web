'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import { Logo } from '@/components/header'
import { Button } from '@/components/button'

import { loginHref, SIGNUP_HREF } from './signup-links'

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
                        <Link href={loginHref(path || '/feira')}>
                            <Button variant="secondary" size="sm">
                                Entrar
                            </Button>
                        </Link>
                        <Link href={SIGNUP_HREF} className="hidden sm:block">
                            <Button size="sm">Criar conta</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-4 pb-28 sm:pb-10">{children}</main>

            <div className="sm:hidden fixed bottom-0 inset-x-0 z-10 bg-white/95 backdrop-blur-lg border-t border-neutral-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center gap-3">
                <p className="flex-1 text-sm font-semibold text-neutral-700 leading-tight">
                    Fale com os vizinhos e anuncie de graça.
                </p>
                <Link href={SIGNUP_HREF}>
                    <Button size="sm">Criar conta</Button>
                </Link>
            </div>
        </div>
    )
}
