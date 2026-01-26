import { Navigation } from '@/components/navigation'

export default function MessagesPage() {
    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Mensagens" showBackButton={false} />
        </div>
    )
}
