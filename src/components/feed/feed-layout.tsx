import { TrailingAside } from './trailing-aside'
import { LeadingAside } from './leading-aside'

export function FeedLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="pt-16 lg:pt-20 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8 px-2 sm:px-4 max-w-7xl mx-auto flex gap-4">
            <LeadingAside />
            <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:max-w-none">
                {children}
            </main>
            <TrailingAside />
        </section>
    )
}
