'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'

import { Navigation } from '@/components/navigation'
import { AlertResponse } from '@/interfaces/alert-response'
import { fetcherWithToken } from '@/lib/swr'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import {
    BandaidsIcon,
    CatIcon,
    CheckCircleIcon,
    CloudLightningIcon,
    DotsThreeCircleIcon,
    EyeIcon,
    Icon,
    SirenIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    TrafficConeIcon,
    TrafficSignIcon,
    WrenchIcon,
} from '@phosphor-icons/react'
import { ReactNode } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AlertsPage() {
    const { data: user } = useSession()

    const { data: alerts, isLoading } = useSWR<AlertResponse[]>(
        user ? [`${API_URL}/alerts/nearby`, user?.user?.token] : null,
        fetcherWithToken,
    )

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Alertas próximos" showBackButton={false} />
            {isLoading ? (
                <Spinner />
            ) : (
                alerts?.map((alert) => (
                    <AlertCard key={alert.postId} alert={alert} />
                ))
            )}
        </div>
    )
}

const SeverityBadge = ({ severity }: { severity: string }) => {
    const severityColors: Record<string, string> = {
        LOW: 'bg-green-500',
        MEDIUM: 'bg-yellow-500',
        HIGH: 'bg-red-500',
        CRITICAL: 'bg-purple-500',
    }

    const severityLabels: Record<string, string> = {
        LOW: 'Baixa',
        MEDIUM: 'Média',
        HIGH: 'Alta',
        CRITICAL: 'Crítica',
    }

    return (
        <span
            className={`px-2 py-1 text-white text-xs font-bold rounded-full ${severityColors[severity]}`}
        >
            {severityLabels[severity]}
        </span>
    )
}

const CategoryBadge = ({ category }: { category: string }) => {
    const categoryColors: Record<string, string> = {
        SECURITY: 'bg-blue-500',
        TRAFFIC: 'bg-orange-500',
        WEATHER: 'bg-purple-500',
        INFRASTRUCTURE: 'bg-gray-500',
        HEALTH: 'bg-pink-500',
        ANIMAL: 'bg-green-500',
        UTILITIES: 'bg-yellow-500',
        OTHER: 'bg-purple-500',
    }

    const categoryLabels: Record<string, string> = {
        SECURITY: 'Alerta de Segurança',
        TRAFFIC: 'Alerta de Trânsito',
        WEATHER: 'Alerta de Clima',
        INFRASTRUCTURE: 'Alerta de Infraestrutura',
        HEALTH: 'Alerta de Saúde',
        ANIMAL: 'Alerta de Animais',
        UTILITIES: 'Alerta de Utilidades',
        OTHER: 'Outro',
    }

    const categoryIcons: Record<string, Icon> = {
        SECURITY: SirenIcon,
        TRAFFIC: TrafficConeIcon,
        WEATHER: CloudLightningIcon,
        INFRASTRUCTURE: TrafficSignIcon,
        HEALTH: BandaidsIcon,
        ANIMAL: CatIcon,
        UTILITIES: WrenchIcon,
        OTHER: DotsThreeCircleIcon,
    }

    const IconComponent = categoryIcons[category]

    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex text-white text-lg p-1.5 rounded-full ${categoryColors[category]}`}
            >
                <IconComponent weight="bold" />
            </div>
            <span className="font-semibold text-sm">
                {categoryLabels[category]}
            </span>
        </div>
    )
}

const AlertCard = ({ alert }: { alert: AlertResponse }) => {
    return (
        <div className="p-4 border-2 border-neutral-100 rounded-xl mb-4">
            <header className="flex justify-between items-center mb-2">
                <CategoryBadge category={alert.category.toLocaleString()} />
                <SeverityBadge severity={alert.severity} />
            </header>

            <p className="text-lg font-semibold">{alert.postContent}</p>

            <div className="flex items-center gap-2 mt-2"></div>

            <footer className="flex items-center gap-4">
                <Button
                    iconPlacement="leading"
                    icon={ThumbsUpIcon}
                    variant="ghost"
                    size="sm"
                >
                    {alert.confirmations}
                </Button>
                <Button
                    iconPlacement="leading"
                    icon={ThumbsDownIcon}
                    variant="ghost"
                    size="sm"
                >
                    {alert.dismissals}
                </Button>
                <Button
                    iconPlacement="leading"
                    icon={CheckCircleIcon}
                    variant="ghost"
                    size="sm"
                >
                    Resolvido
                </Button>
                <div className="flex-1"></div>
                <span className="select-n flex gap-2 text-sm font-semibold items-center text-neutral-800">
                    <EyeIcon weight="bold" size={18} /> {alert.views}
                </span>
            </footer>
        </div>
    )
}
