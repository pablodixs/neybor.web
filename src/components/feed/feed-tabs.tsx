'use client'

import { CaretDownIcon } from '@phosphor-icons/react'
import type { KeyboardEvent } from 'react'

export type FeedFilter = 'ALL' | 'SAFETY_ALERT' | 'GENERAL' | 'MARKETPLACE'
export type FeedSort = 'RECENT' | 'TOP'

const FILTERS: { key: FeedFilter; label: string; accessibleLabel?: string }[] = [
    { key: 'ALL', label: 'Tudo' },
    { key: 'SAFETY_ALERT', label: 'Relatos', accessibleLabel: 'Relatos de alerta' },
    { key: 'GENERAL', label: 'Conversas' },
    { key: 'MARKETPLACE', label: 'Feira' },
]

interface FeedTabsProps {
    filter: FeedFilter
    onFilterChange: (filter: FeedFilter) => void
    sort: FeedSort
    onSortChange: (sort: FeedSort) => void
}

export function FeedTabs({
    filter,
    onFilterChange,
    sort,
    onSortChange,
}: FeedTabsProps) {
    function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
        const last = FILTERS.length - 1
        const nextByKey: Record<string, number> = {
            ArrowRight: index === last ? 0 : index + 1,
            ArrowLeft: index === 0 ? last : index - 1,
            Home: 0,
            End: last,
        }
        const next = nextByKey[event.key]
        if (typeof next !== 'number') return

        event.preventDefault()
        onFilterChange(FILTERS[next].key)
        event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
    }

    return (
        <div className="sticky top-[calc(3rem+env(safe-area-inset-top))] z-[5] mb-3 flex flex-wrap items-center gap-x-3 border-b border-neutral-200 bg-white lg:top-14">
            <div role="tablist" aria-label="Filtrar o feed" className="flex w-full flex-wrap gap-x-2.5 min-[375px]:w-auto min-[375px]:flex-1 min-[480px]:gap-x-4 sm:gap-x-6">
                {FILTERS.map(({ key, label, accessibleLabel }, index) => (
                    <button
                        key={key}
                        id={`feed-tab-${key}`}
                        type="button"
                        role="tab"
                        aria-label={accessibleLabel}
                        aria-controls="feed-posts"
                        aria-selected={filter === key}
                        tabIndex={filter === key ? 0 : -1}
                        onClick={() => onFilterChange(key)}
                        onKeyDown={(event) => moveTab(event, index)}
                        className="min-h-11 cursor-pointer border-b-2 border-transparent text-sm font-semibold whitespace-nowrap text-neutral-600 hover:text-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-green-700 aria-selected:border-green-700 aria-selected:text-green-800"
                    >
                        {label}
                    </button>
                ))}
            </div>
            <label className="relative ml-auto shrink-0">
                <span className="sr-only">Ordenar por</span>
                <select
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as FeedSort)}
                    className="min-h-11 cursor-pointer appearance-none rounded-md bg-white py-1 pr-7 pl-2 text-sm font-medium text-neutral-700 hover:text-neutral-950 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-green-700"
                >
                    <option value="RECENT">Recentes</option>
                    <option value="TOP">Mais curtidos</option>
                </select>
                <CaretDownIcon
                    weight="bold"
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-neutral-500"
                />
            </label>
        </div>
    )
}
