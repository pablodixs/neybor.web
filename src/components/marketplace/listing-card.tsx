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
    const location = [distance, listing.neighborhood].filter(Boolean).join(' · ')
    const category = categoryLabels[listing.category]

    return (
        <Link
            href={`/feira/${listing.id}`}
            className="group block min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700"
        >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-neutral-400 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-black/10">
                {listing.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.thumbUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <ImageIcon size={32} aria-hidden="true" />
                )}
                {!open && (
                    <span className="absolute top-2 left-2 rounded-md bg-neutral-900 px-2 py-1 text-xs font-semibold text-white">
                        {STATUS_LABELS[listing.status]}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1 pt-2.5">
                <strong className="wrap-anywhere text-sm leading-snug font-medium text-neutral-800 group-hover:underline">
                    {listing.title}
                </strong>
                {price && (
                    <span
                        className={`wrap-anywhere text-base leading-tight font-bold ${listing.type === 'DONATION' ? 'text-green-800' : 'text-neutral-950'}`}
                    >
                        {price}
                    </span>
                )}
                <p className="flex items-start gap-1 text-xs text-neutral-600">
                    {listing.author?.verified && (
                        <SealCheckIcon
                            weight="fill"
                            className="mt-0.5 shrink-0 text-green-700"
                            aria-label="Vizinho verificado"
                        />
                    )}
                    <span className="min-w-0 wrap-anywhere">{location || category || TYPE_LABELS[listing.type]}</span>
                </p>
                {location && category && <p className="wrap-anywhere text-xs text-neutral-600">{category}</p>}
            </div>
        </Link>
    )
}
