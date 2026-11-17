'use client'

import {
    BandaidsIcon,
    CatIcon,
    CloudLightningIcon,
    DotsThreeCircleIcon,
    Icon,
    SirenIcon,
    TrafficConeIcon,
    TrafficSignIcon,
    WrenchIcon,
} from '@phosphor-icons/react'

export type AlertCategoryKey =
    | 'SECURITY'
    | 'TRAFFIC'
    | 'WEATHER'
    | 'INFRASTRUCTURE'
    | 'HEALTH'
    | 'ANIMAL'
    | 'UTILITIES'
    | 'OTHER'

export const ALERT_CATEGORIES: {
    key: AlertCategoryKey
    label: string
    icon: Icon
    color: string
}[] = [
    {
        key: 'SECURITY',
        label: 'Segurança',
        icon: SirenIcon,
        color: 'bg-red-500',
    },
    {
        key: 'TRAFFIC',
        label: 'Trânsito',
        icon: TrafficConeIcon,
        color: 'bg-orange-500',
    },
    {
        key: 'WEATHER',
        label: 'Clima',
        icon: CloudLightningIcon,
        color: 'bg-purple-500',
    },
    {
        key: 'UTILITIES',
        label: 'Água e luz',
        icon: WrenchIcon,
        color: 'bg-yellow-500',
    },
    {
        key: 'INFRASTRUCTURE',
        label: 'Infraestrutura',
        icon: TrafficSignIcon,
        color: 'bg-stone-500',
    },
    { key: 'HEALTH', label: 'Saúde', icon: BandaidsIcon, color: 'bg-pink-500' },
    { key: 'ANIMAL', label: 'Animais', icon: CatIcon, color: 'bg-green-500' },
    {
        key: 'OTHER',
        label: 'Outro',
        icon: DotsThreeCircleIcon,
        color: 'bg-neutral-500',
    },
]

export function AlertCategoryPicker({
    value,
    onChange,
}: {
    value: AlertCategoryKey | null
    onChange: (value: AlertCategoryKey) => void
}) {
    return (
        <fieldset className="mt-3 rounded-lg bg-orange-50 p-3">
            <legend className="sr-only">Tipo de alerta</legend>
            <p className="mb-2 text-sm font-semibold text-orange-950">
                Que tipo de alerta é?
            </p>
            <div className="flex flex-wrap gap-2">
                {ALERT_CATEGORIES.map(
                    ({ key, label, icon: CategoryIcon, color }) => {
                        const selected = value === key
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => onChange(key)}
                                data-selected={selected}
                                className="flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-1.5 bg-white font-semibold text-sm text-neutral-700 outline-2 -outline-offset-2 outline-transparent data-[selected=true]:outline-orange-600 data-[selected=true]:text-orange-950 cursor-pointer transition"
                            >
                                <span
                                    className={`flex text-white p-1 rounded-full ${color}`}
                                >
                                    <CategoryIcon weight="bold" />
                                </span>
                                {label}
                            </button>
                        )
                    },
                )}
            </div>
        </fieldset>
    )
}
