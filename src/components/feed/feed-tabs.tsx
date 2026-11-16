'use client'

import { CaretDownIcon } from '@phosphor-icons/react'

export type FeedFilter = 'ALL' | 'SAFETY_ALERT' | 'GENERAL' | 'MARKETPLACE'
export type FeedSort = 'RECENT' | 'TOP'

const FILTERS: { key: FeedFilter; label: string }[] = [
    { key: 'ALL', label: 'Tudo' },
    { key: 'SAFETY_ALERT', label: 'Alertas' },
    { key: 'GENERAL', label: 'Conversas' },
    { key: 'MARKETPLACE', label: 'Feira' },
]

interface FeedTabsProps {
    filter: FeedFilter
    onFilterChange: (filter: FeedFilter) => void
    sort: FeedSort
    onSortChange: (sort: FeedSort) => void
}

/** Abas e ordenação no topo do feed (padrão do Digg: "Meu feed | Todos" + ordenação). */
export function FeedTabs({
    filter,
    onFilterChange,
    sort,
    onSortChange,
}: FeedTabsProps) {
    return (
        <div className="sticky top-12 lg:top-14 z-[5] -mx-2 sm:mx-0 px-2 sm:px-0 py-2 bg-white/90 backdrop-blur-lg flex items-center gap-2 border-b border-neutral-100">
            <div
                role="tablist"
                aria-label="Filtrar o feed"
                className="flex-1 flex gap-1 overflow-x-auto bg-neutral-100 rounded-full p-1"
            >
                {FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={filter === key}
                        onClick={() => onFilterChange(key)}
                        className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition text-neutral-600 aria-selected:bg-white aria-selected:text-neutral-900 aria-selected:shadow-sm"
                    >
                        {label}
                    </button>
                ))}
            </div>
            <label className="relative shrink-0">
                <span className="sr-only">Ordenar por</span>
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value as FeedSort)}
                    className="appearance-none bg-transparent pl-3 pr-7 py-1.5 text-sm font-semibold text-neutral-700 rounded-full border border-neutral-100 cursor-pointer"
                >
                    <option value="RECENT">Recentes</option>
                    <option value="TOP">Mais curtidos</option>
                </select>
                <CaretDownIcon
                    weight="bold"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
            </label>
        </div>
    )
}
