'use client'

import { CaretDownIcon, SirenIcon, XIcon } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { useOfficialAlerts } from '@/hooks/use-official-alerts'
import {
    OFFICIAL_SEVERITY_STYLE,
    OFFICIAL_SOURCE_LABEL,
    OfficialAlert,
} from '@/interfaces/official-alert'

const STORAGE_KEY = 'neybor:dismissed-official-alerts'

function readDismissed(): number[] {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
        return []
    }
}

function writeDismissed(ids: number[]) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
        // sessionStorage indisponível: o aviso só volta no próximo carregamento
    }
}

/** Faixa com os alertas oficiais ativos na região do usuário. Dispensar vale só para a sessão. */
export function OfficialAlertBanner() {
    const { alerts } = useOfficialAlerts()
    // lido uma vez; sem alertas carregados o componente não renderiza nada, então não há divergência de hidratação
    const [dismissed, setDismissed] = useState<number[]>(() =>
        typeof window === 'undefined' ? [] : readDismissed(),
    )

    const visible = alerts.filter((a) => !dismissed.includes(a.id))
    if (visible.length === 0) return null

    function dismiss(id: number) {
        const next = [...dismissed, id]
        setDismissed(next)
        writeDismissed(next)
    }

    return (
        <section aria-label="Alertas oficiais" className="mb-4 space-y-2">
            {visible.map((alert) => (
                <OfficialAlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={() => dismiss(alert.id)}
                />
            ))}
        </section>
    )
}

function OfficialAlertCard({
    alert,
    onDismiss,
}: {
    alert: OfficialAlert
    onDismiss: () => void
}) {
    const [open, setOpen] = useState(false)
    const style = OFFICIAL_SEVERITY_STYLE[alert.severity]
    const title = alert.event ?? alert.headline ?? 'Alerta oficial'
    const hasDetails = alert.description || alert.instruction

    return (
        <article className={`rounded-2xl border p-3 ${style.box}`}>
            <div className="flex items-start gap-2">
                <SirenIcon
                    weight="bold"
                    className="mt-0.5 shrink-0 text-xl text-neutral-700"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <strong className="font-semibold leading-tight text-neutral-800">
                            {title}
                        </strong>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                        >
                            {style.label}
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-tight text-neutral-600">
                        Fonte: {alert.senderName ?? OFFICIAL_SOURCE_LABEL[alert.source]}
                        {alert.expiresAt &&
                            ` · até ${format(new Date(alert.expiresAt), "dd/MM 'às' HH:mm", { locale: ptBR })}`}
                    </p>
                    {open && (
                        <div className="mt-2 space-y-2 text-sm text-neutral-700">
                            {alert.description && <p>{alert.description}</p>}
                            {alert.instruction && (
                                <p>
                                    <strong className="font-semibold">
                                        O que fazer:{' '}
                                    </strong>
                                    {alert.instruction}
                                </p>
                            )}
                            {alert.areaDesc && (
                                <p className="text-neutral-500">
                                    Área: {alert.areaDesc}
                                </p>
                            )}
                            {alert.webUrl && (
                                <a
                                    href={alert.webUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-green-700"
                                >
                                    Ver no site oficial
                                </a>
                            )}
                        </div>
                    )}
                    {hasDetails && (
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            className="mt-1 flex items-center gap-1 text-sm font-semibold text-neutral-700"
                        >
                            {open ? 'Ocultar' : 'Ver detalhes'}
                            <CaretDownIcon
                                weight="bold"
                                className={open ? 'rotate-180' : ''}
                            />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dispensar alerta"
                    className="shrink-0 rounded-full p-1 text-neutral-500 hover:bg-black/5"
                >
                    <XIcon weight="bold" />
                </button>
            </div>
        </article>
    )
}
