import type { ReactNode } from 'react'

import type { ListingType } from '@/interfaces/marketplace'

import { TYPE_LABELS } from './labels'

const TYPES = [null, 'DONATION', 'SALE', 'WANTED'] as const

export const listingFilterButton = 'min-h-10 cursor-pointer rounded-full border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 aria-pressed:border-transparent aria-pressed:bg-tint aria-pressed:text-on-tint'

export function ListingTypeFilters({
    type,
    onChange,
    children,
}: {
    type: ListingType | null
    onChange: (type: ListingType | null) => void
    children?: ReactNode
}) {
    return (
        <div role="group" aria-label="Tipo de anúncio" className="flex flex-wrap gap-2">
            {TYPES.map((option) => (
                <button
                    key={option ?? 'all'}
                    type="button"
                    aria-pressed={type === option}
                    onClick={() => onChange(option)}
                    className={listingFilterButton}
                >
                    {option ? TYPE_LABELS[option] : 'Tudo'}
                </button>
            ))}
            {children}
        </div>
    )
}
