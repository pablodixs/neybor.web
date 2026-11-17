import { AlertCategory } from '@/utils/mapping'

export type OfficialAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface OfficialAlert {
    id: number
    source: 'IDAP' | 'INMET'
    senderName: string | null
    event: string | null
    headline: string | null
    description: string | null
    instruction: string | null
    webUrl: string | null
    category: AlertCategory
    severity: OfficialAlertSeverity
    onset: string | null
    expiresAt: string | null
    sentAt: string | null
    areaDesc: string | null
    /** GeoJSON MultiPolygon, só no endpoint do mapa */
    geometry: {
        type: 'MultiPolygon'
        coordinates: number[][][][]
    } | null
}

export const OFFICIAL_SOURCE_LABEL: Record<OfficialAlert['source'], string> = {
    IDAP: 'Defesa Civil',
    INMET: 'INMET',
}

export const OFFICIAL_SEVERITY_STYLE: Record<
    OfficialAlertSeverity,
    { label: string; badge: string; map: string }
> = {
    CRITICAL: {
        label: 'Extremo',
        badge: 'bg-red-100 text-red-950',
        map: '#dc2626',
    },
    HIGH: {
        label: 'Severo',
        badge: 'bg-orange-100 text-orange-950',
        map: '#f97316',
    },
    MEDIUM: {
        label: 'Moderado',
        badge: 'bg-amber-100 text-amber-950',
        map: '#f59e0b',
    },
    LOW: {
        label: 'Atenção',
        badge: 'bg-sky-100 text-sky-950',
        map: '#0ea5e9',
    },
}
