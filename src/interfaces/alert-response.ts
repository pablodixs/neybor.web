import { AlertCategory } from '@/utils/mapping'

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertStatus =
    | 'ACTIVE'
    | 'UNDER_REVIEW'
    | 'RESOLVED'
    | 'EXPIRED'
    | 'REMOVED'
export type AlertContributionType = 'CONFIRM' | 'DENY' | 'RESOLVED'

export interface AlertResponse {
    postId: number
    postContent: string
    latitude?: number | null
    longitude?: number | null
    /** true quando o local é só a região (veio do endereço do autor). */
    locationApproximate?: boolean
    collaborative: boolean
    severity: AlertSeverity
    status: AlertStatus
    category: AlertCategory
    expiresAt: string | null
    confirmations: number
    dismissals: number
    resolvedVotes: number
    views: number
    createdAt?: string
    myContribution?: AlertContributionType | null
}
