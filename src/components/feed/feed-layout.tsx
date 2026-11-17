'use client'

import { LeadingAside } from './leading-aside'
import { TrailingAside } from './trailing-aside'

/** No desktop, três colunas coladas no header: menu, feed e coluna da vizinhança. */
export function FeedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full px-3 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-5 lg:p-0 lg:pt-14">
            <LeadingAside />
            <main id="conteudo-principal" className="mx-auto w-full max-w-2xl min-w-0 flex-1 lg:mb-6 lg:max-w-none lg:rounded-3xl lg:bg-white lg:px-8 lg:pt-6 lg:pb-10">
                {children}
            </main>
            <TrailingAside />
        </div>
    )
}
