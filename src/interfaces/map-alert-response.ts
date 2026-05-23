import { AlertCategory } from '@/utils/mapping'

export interface MapAlertResponse {
    postId: number
    postContent: string
    latitude: number
    longitude: number
    collaborative: boolean
    severity: string
    status: string
    category: AlertCategory
    expiresAt: string | null
    confirmations: number
    dismissals: number
    resolvedVotes: number
    views: number
}
