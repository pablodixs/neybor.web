import Link from 'next/link'
import { ImageIcon, SealCheckIcon } from '@phosphor-icons/react'
import { ListingSummary } from '@/interfaces/marketplace'
import { formatDistance, formatPrice, STATUS_LABELS, TYPE_LABELS } from './labels'

export function ListingCard({
    listing,
    categoryLabels,
}: {
    listing: ListingSummary
    categoryLabels: Record<string, string>
}) {
    const distance = formatDistance(listing.distanceMeters)
    const price = formatPrice(listing.type, listing.priceCents)
    const open = listing.status === 'ACTIVE'

    return (
        <Link
            href={`/feira/${listing.id}`}
            className="flex flex-col rounded-2xl border border-neutral-100 overflow-hidden hover:bg-neutral-50 transition"
        >
            <div className="relative aspect-4/3 bg-neutral-100 flex items-center justify-center text-neutral-300">
                {listing.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.thumbUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <ImageIcon size={40} />
                )}
                <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold ${listing.type === 'DONATION' ? 'bg-green-600 text-white' : listing.type === 'WANTED' ? 'bg-orange-100 text-orange-700' : 'bg-white text-neutral-700'}`}
                >
                    {TYPE_LABELS[listing.type]}
                </span>
                {!open && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-white">
                        {STATUS_LABELS[listing.status]}
                    </span>
                )}
            </div>
            <div className="p-3 flex flex-col gap-0.5">
                <strong className="font-semibold text-neutral-800 truncate">
                    {listing.title}
                </strong>
                {price && (
                    <span
                        className={`font-semibold ${listing.type === 'DONATION' ? 'text-green-700' : 'text-neutral-900'}`}
                    >
                        {price}
                    </span>
                )}
                <p className="text-sm text-neutral-500 flex items-center gap-1 truncate">
                    {listing.author?.verified && (
                        <SealCheckIcon
                            weight="fill"
                            className="text-green-600 shrink-0"
                            aria-label="Vizinho verificado"
                        />
                    )}
                    <span className="truncate">
                        {[distance, listing.neighborhood, categoryLabels[listing.category]]
                            .filter(Boolean)
                            .join(' · ')}
                    </span>
                </p>
            </div>
        </Link>
    )
}
