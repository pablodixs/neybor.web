import Image from 'next/image'
import Link from 'next/link'
import { ClockIcon, HandsClappingIcon, SealCheckIcon } from '@phosphor-icons/react'
import { ProviderSummary } from '@/interfaces/services'

export function endorsementLabel(p: {
    endorsementCount: number
    neighborEndorsementCount: number
}) {
    if (p.endorsementCount === 0) return 'Ainda sem indicações'
    if (p.neighborEndorsementCount > 0) {
        return `${p.neighborEndorsementCount} ${p.neighborEndorsementCount === 1 ? 'vizinho indica' : 'vizinhos indicam'}`
    }
    return `${p.endorsementCount} ${p.endorsementCount === 1 ? 'indicação' : 'indicações'}`
}

export function ProviderCard({
    provider,
    categoryLabels,
}: {
    provider: ProviderSummary
    categoryLabels: Record<string, string>
}) {
    return (
        <Link
            href={`/servicos/${provider.handle}`}
            className="flex gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50 transition"
        >
            <Image
                src={provider.avatarUrl || '/images/default-avatar.png'}
                alt={provider.displayName}
                width={56}
                height={56}
                className="rounded-full w-14 h-14 object-cover bg-neutral-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <strong className="font-semibold text-neutral-800 truncate">
                        {provider.displayName}
                    </strong>
                    {provider.verified && (
                        <SealCheckIcon
                            weight="fill"
                            className="text-green-600 shrink-0"
                            aria-label="Verificado"
                        />
                    )}
                </div>
                <p className="text-neutral-600 text-sm leading-snug truncate">
                    {provider.headline}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm">
                    <span
                        className={`flex items-center gap-1 font-medium ${provider.neighborEndorsementCount > 0 ? 'text-green-700' : 'text-neutral-500'}`}
                    >
                        <HandsClappingIcon weight="bold" />
                        {endorsementLabel(provider)}
                    </span>
                    {provider.emergency24h && (
                        <span className="flex items-center gap-1 font-medium text-orange-600">
                            <ClockIcon weight="bold" /> 24h
                        </span>
                    )}
                    {provider.priceHint && (
                        <span className="text-neutral-500">{provider.priceHint}</span>
                    )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                    {provider.categories.map((c) => (
                        <span
                            key={c}
                            className="text-xs font-semibold bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5"
                        >
                            {categoryLabels[c] ?? c}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    )
}
