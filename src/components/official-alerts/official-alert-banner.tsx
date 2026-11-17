'use client'

import {
    CaretDownIcon,
    PushPinIcon,
    SirenIcon,
    XIcon,
} from '@phosphor-icons/react'
import { format } from 'date-fns'
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
        const ids: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]')
        return Array.isArray(ids) ? ids.filter((id) => typeof id === 'number') : []
    } catch {
        return []
    }
}

/** Avisos oficiais continuam acima dos relatos da comunidade, independentemente da ordenação. */
export function OfficialAlertBanner({ pinned = false }: { pinned?: boolean }) {
    const { alerts } = useOfficialAlerts()
    const [dismissed, setDismissed] = useState<number[]>(() =>
        typeof window === 'undefined' ? [] : readDismissed(),
    )

    const visible = alerts.filter((alert) => !dismissed.includes(alert.id))
    if (visible.length === 0) return null

    function dismiss(id: number) {
        const next = [...dismissed, id]
        setDismissed(next)
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
            // O aviso permanece dispensado enquanto esta tela estiver aberta.
        }
    }

    return (
        <section aria-label="Avisos oficiais" className={`overflow-hidden rounded-2xl bg-canvas ${pinned ? 'mt-3 mb-1' : 'mb-4'}`}>
            <h2 className="flex items-center gap-1.5 px-3 pt-3 text-[0.6875rem] font-bold tracking-wide text-neutral-600 uppercase">
                {pinned && <PushPinIcon weight="fill" size={13} aria-hidden="true" />}
                {pinned ? 'Avisos oficiais fixados' : 'Avisos oficiais'}
            </h2>
            <div className="divide-y-2 divide-white">
                {visible.map((alert) => (
                    <OfficialAlertPost
                        key={alert.id}
                        alert={alert}
                        onDismiss={() => dismiss(alert.id)}
                    />
                ))}
            </div>
        </section>
    )
}

function OfficialAlertPost({
    alert,
    onDismiss,
}: {
    alert: OfficialAlert
    onDismiss: () => void
}) {
    const style = OFFICIAL_SEVERITY_STYLE[alert.severity]
    // No feed a gravidade se lê pelo rótulo e pelo peso, sem cor; o mapa mantém as cores.
    const badge = alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'
    const title = alert.event ?? alert.headline ?? 'Aviso oficial'
    const issuer = OFFICIAL_SOURCE_LABEL[alert.source]
    const source = alert.senderName ?? issuer
    const expiresAt = alert.expiresAt ? new Date(alert.expiresAt) : null
    const hasDetails = alert.description || alert.instruction || alert.areaDesc || alert.webUrl

    const [leaving, setLeaving] = useState(false)

    function dismiss() {
        // Com movimento reduzido não há transição, então o aviso sai na hora.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onDismiss()
        else setLeaving(true)
    }

    return (
        <div
            className={`grid transition-[grid-template-rows,opacity] duration-[220ms] ease-snappy ${leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`}
            onTransitionEnd={(event) => {
                if (leaving && event.target === event.currentTarget && event.propertyName === 'grid-template-rows') onDismiss()
            }}
        >
            <div className="min-h-0 overflow-hidden">
                <article className="flex items-start gap-2.5 px-3 py-2.5" aria-label={title}>
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-white text-neutral-700">
                        <SirenIcon weight="duotone" size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <header>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3 className="text-sm font-bold break-words text-neutral-900">{title}</h3>
                                <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${badge}`}>
                                    {style.label}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-600">
                                {source}
                                {expiresAt && !Number.isNaN(expiresAt.getTime()) && (
                                    <>
                                        {' · até '}
                                        <time dateTime={expiresAt.toISOString()}>{format(expiresAt, "dd/MM 'às' HH:mm")}</time>
                                    </>
                                )}
                            </p>
                        </header>
                        {hasDetails && (
                            <details className="details-animate group">
                                <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1 rounded text-xs font-semibold text-green-800 hover:underline [&::-webkit-details-marker]:hidden">
                                    <span className="group-open:hidden">Ver detalhes</span>
                                    <span className="hidden group-open:inline">Ocultar detalhes</span>
                                    <CaretDownIcon weight="bold" aria-hidden="true" className="group-open:rotate-180" />
                                </summary>
                                <div className="max-w-prose space-y-2 pt-1 text-sm leading-relaxed wrap-break-word text-neutral-700">
                                    {alert.instruction && <p><strong>O que fazer</strong><br />{alert.instruction}</p>}
                                    {alert.description && <p>{alert.description}</p>}
                                    {alert.areaDesc && <p><strong>Área</strong> {alert.areaDesc}</p>}
                                    {alert.webUrl && (
                                        <a href={alert.webUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center font-semibold text-green-800 underline">
                                            Ver no site oficial
                                        </a>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label={`Dispensar aviso: ${title}`}
                        className="-mt-1 -mr-1.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-900"
                    >
                        <XIcon size={16} weight="bold" aria-hidden="true" />
                    </button>
                </article>
            </div>
        </div>
    )
}
