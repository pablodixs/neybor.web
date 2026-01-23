import { TrailingAside } from './trailing-aside'
import { LeadingAside } from './leading-aside'

export function FeedLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="pt-20 max-w-7xl mx-auto flex gap-4">
            <LeadingAside />
            <main className="flex-1 min-w-0">{children}</main>
            <TrailingAside />
        </section>
    )
}
