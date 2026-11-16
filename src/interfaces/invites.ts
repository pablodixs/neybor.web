export interface FounderStatus {
    founder: boolean
    number: number | null
}

export interface MyInvite {
    code: string
    invitedCount: number
    founder: FounderStatus
    neighborsInArea: number
    foundersLimit: number
}

export interface InvitePreview {
    inviterName: string
    inviterHandle: string
    inviterAvatarUrl: string | null
    neighborhood: string | null
    city: string | null
    neighborsInArea: number
    foundersSpotsLeft: number
}
