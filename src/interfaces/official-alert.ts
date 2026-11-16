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
    { label: string; box: string; badge: string; map: string }
> = {
    CRITICAL: {
        label: 'Extremo',
        box: 'border-red-200 bg-red-50',
        badge: 'bg-red-600 text-white',
        map: '#dc2626',
    },
    HIGH: {
        label: 'Severo',
        box: 'border-orange-200 bg-orange-50',
        badge: 'bg-orange-500 text-white',
        map: '#f97316',
    },
    MEDIUM: {
        label: 'Moderado',
        box: 'border-amber-200 bg-amber-50',
        badge: 'bg-amber-400 text-amber-950',
        map: '#f59e0b',
    },
    LOW: {
        label: 'Atenção',
        box: 'border-sky-200 bg-sky-50',
        badge: 'bg-sky-500 text-white',
        map: '#0ea5e9',
    },
}
