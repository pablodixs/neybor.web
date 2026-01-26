import { Navigation } from '@/components/navigation'

export default function BookmarksPage() {
    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Itens salvos" showBackButton={false} />
        </div>
    )
}
