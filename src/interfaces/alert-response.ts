import { AlertCategory } from '@/utils/mapping'

export interface AlertResponse {
    postId: number
    postContent: string
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
