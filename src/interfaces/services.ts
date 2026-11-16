export interface ServiceCategory {
    slug: string
    label: string
    emergencyCapable: boolean
}

export interface Endorser {
    profileId: number
    displayName: string
    avatarUrl: string | null
}

export interface ProviderSummary {
    id: number
    handle: string
    displayName: string
    avatarUrl: string | null
    headline: string
    categories: string[]
    emergency24h: boolean
    verified: boolean
    phoneVerified: boolean
    priceHint: string | null
    neighborhood: string | null
    endorsementCount: number
    neighborEndorsementCount: number
    recentEndorsers: Endorser[]
}

export interface ProviderDetails extends Omit<ProviderSummary, 'recentEndorsers'> {
    bio: string | null
    paymentMethods: string[]
    city: string | null
    serviceRadiusKm: number | null
    serviceArea: string[]
    viewerCell: string | null
    recentEndorsers: Endorser[]
    endorsedByMe: boolean
    hasContact: boolean
    isMine: boolean
}

export interface ContactResult {
    channel: 'WHATSAPP' | 'PHONE'
    url: string
    phone: string
}

export interface AccountProfile {
    id: number
    profileType: string
    displayName: string
    handle: string
    avatarUrl: string | null
    active: boolean
}

export const PAYMENT_LABELS: Record<string, string> = {
    PIX: 'Pix',
    CARD: 'Cartão',
    CASH: 'Dinheiro',
}
