'use client'

import {
    CheckCircleIcon,
    EyeIcon,
    PlusIcon,
    ShieldCheckIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    WarningIcon,
} from '@phosphor-icons/react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'

import { Button } from '@/components/button'
import { Navigation } from '@/components/navigation'
import { ALERT_CATEGORIES } from '@/components/post/alert-category-picker'
import { useCompose } from '@/components/post/compose-context'
import { Spinner } from '@/components/spinner'
import {
    AlertContributionType,
    AlertResponse,
    AlertSeverity,
} from '@/interfaces/alert-response'
import { friendlyApiError } from '@/lib/api-error'
import { fetcherWithToken } from '@/lib/swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AlertsPage() {
    const { data: session } = useSession()
    const { openCompose } = useCompose()
    const token = session?.user?.token

    const key = token ? [`${API_URL}/alerts/nearby`, token] : null
    const {
        data: alerts,
        isLoading,
        error,
        mutate,
    } = useSWR<AlertResponse[]>(key, fetcherWithToken)

    function replaceAlert(updated: AlertResponse) {
        mutate(
            (current) =>
                current
                    ?.map((alert) =>
                        alert.postId === updated.postId ? updated : alert,
                    )
                    // resolvido ou em revisão sai da lista de ativos
                    .filter((alert) => alert.status === 'ACTIVE'),
            { revalidate: false },
        )
    }

    const needsAddress =
        axios.isAxiosError(error) &&
        (error.response?.status === 412 || error.response?.status === 428)

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <div className="flex items-start justify-between gap-2">
                <Navigation title="Alertas próximos" showBackButton={false} />
                <Button
                    size="sm"
                    iconPlacement="leading"
                    icon={PlusIcon}
                    onClick={() => openCompose('SAFETY_ALERT')}
                >
                    Criar alerta
                </Button>
            </div>

            {isLoading && <Spinner />}

            {needsAddress && (
                <EmptyState
                    title="Cadastre seu endereço"
                    description="Precisamos saber onde você mora para mostrar os alertas da sua vizinhança."
                    action={
                        <Link
                            href="/settings/account/info"
                            className="font-semibold text-green-700"
                        >
                            Ir para as preferências
                        </Link>
                    }
                />
            )}

            {error && !needsAddress && (
                <EmptyState
                    title="Não foi possível carregar os alertas"
                    description={friendlyApiError(
                        error,
                        'Tente de novo em alguns instantes.',
                    )}
                    action={
                        <Button variant="secondary" onClick={() => mutate()}>
                            Tentar de novo
                        </Button>
                    }
                />
            )}

            {alerts && alerts.length === 0 && (
                <EmptyState
                    icon
                    title="Tudo tranquilo por aqui"
                    description="Nenhum alerta ativo perto de você. Se vir algo, avise seus vizinhos."
                />
            )}

            {token &&
                alerts?.map((alert) => (
                    <AlertCard
                        key={alert.postId}
                        alert={alert}
                        token={token}
                        onUpdated={replaceAlert}
                    />
                ))}
        </div>
    )
}

function EmptyState({
    title,
    description,
    action,
    icon,
}: {
    title: string
    description: string
    action?: React.ReactNode
    icon?: boolean
}) {
    return (
        <div className="flex flex-col items-center text-center py-10 px-4 gap-2">
            {icon && (
                <ShieldCheckIcon
                    size={48}
                    weight="duotone"
                    className="text-green-600"
                />
            )}
            <strong className="text-lg text-neutral-800">{title}</strong>
            <p className="text-neutral-500 max-w-sm">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}

const SEVERITY: Record<AlertSeverity, { label: string; className: string }> = {
    LOW: { label: 'Baixa', className: 'bg-green-500' },
    MEDIUM: { label: 'Média', className: 'bg-yellow-500' },
    HIGH: { label: 'Alta', className: 'bg-red-500' },
    CRITICAL: { label: 'Crítica', className: 'bg-purple-600' },
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
    const info = SEVERITY[severity] ?? SEVERITY.LOW
    return (
        <span
            className={`px-2 py-1 text-white text-xs font-bold rounded-full ${info.className}`}
        >
            {info.label}
        </span>
    )
}

function CategoryBadge({ category }: { category: string }) {
    const info =
        ALERT_CATEGORIES.find((item) => item.key === category) ??
        ALERT_CATEGORIES[ALERT_CATEGORIES.length - 1]
    const CategoryIcon = info.icon

    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex text-white text-lg p-1.5 rounded-full ${info.color}`}
            >
                <CategoryIcon weight="bold" />
            </div>
            <span className="font-semibold text-sm">{info.label}</span>
        </div>
    )
}

function AlertCard({
    alert,
    token,
    onUpdated,
}: {
    alert: AlertResponse
    token: string
    onUpdated: (alert: AlertResponse) => void
}) {
    const [pending, setPending] = useState<AlertContributionType | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function vote(type: AlertContributionType) {
        setPending(type)
        setErrorMessage(null)
        const url = `${API_URL}/alerts/${alert.postId}/contributions`
        const headers = { Authorization: `Bearer ${token}` }
        try {
            const response =
                alert.myContribution === type
                    ? await axios.delete<AlertResponse>(url, { headers })
                    : await axios.post<AlertResponse>(
                          url,
                          { type },
                          { headers },
                      )
            onUpdated(response.data)
        } catch (error) {
            setErrorMessage(
                friendlyApiError(error, 'Não foi possível registrar seu voto.'),
            )
        } finally {
            setPending(null)
        }
    }

    const createdAgo = alert.createdAt
        ? formatDistanceToNow(new Date(alert.createdAt), {
              addSuffix: true,
              locale: ptBR,
          })
        : null

    const voteButton = (
        type: AlertContributionType,
        label: string,
        icon: typeof ThumbsUpIcon,
    ) => {
        const selected = alert.myContribution === type
        return (
            <Button
                iconPlacement="leading"
                icon={icon}
                variant={selected ? 'secondary' : 'ghost'}
                size="sm"
                aria-pressed={selected}
                disabled={pending !== null}
                activityIndicator={pending === type}
                onClick={() => vote(type)}
            >
                {label}
            </Button>
        )
    }

    return (
        <article className="p-4 border-2 border-neutral-100 rounded-xl mb-4">
            <header className="flex justify-between items-center mb-2 gap-2">
                <CategoryBadge category={String(alert.category)} />
                <SeverityBadge severity={alert.severity} />
            </header>

            <p className="text-lg font-semibold break-words">
                {alert.postContent}
            </p>
            {createdAgo && (
                <p className="text-sm text-neutral-500 mt-1">{createdAgo}</p>
            )}

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-2 flex gap-2 items-center text-red-700 font-semibold text-sm"
                >
                    <WarningIcon weight="bold" size={18} /> {errorMessage}
                </p>
            )}

            <footer className="flex flex-wrap items-center gap-1 sm:gap-4 mt-3">
                {voteButton(
                    'CONFIRM',
                    `Confirmo · ${alert.confirmations}`,
                    ThumbsUpIcon,
                )}
                {voteButton(
                    'DENY',
                    `Não vi · ${alert.dismissals}`,
                    ThumbsDownIcon,
                )}
                {voteButton('RESOLVED', 'Resolvido', CheckCircleIcon)}
                <div className="flex-1" />
                <span className="flex gap-2 text-sm font-semibold items-center text-neutral-800">
                    <EyeIcon weight="bold" size={18} /> {alert.views}
                </span>
            </footer>
        </article>
    )
}
