export type ListingType = 'SALE' | 'DONATION' | 'WANTED'

export type ListingStatus =
    | 'ACTIVE'
    | 'RESERVED'
    | 'COMPLETED'
    | 'EXPIRED'
    | 'UNDER_REVIEW'
    | 'REMOVED'

export interface ListingCategory {
    id: string
    slug: string
    label: string
}

export interface ListingAuthor {
    id: number
    handle: string
    displayName: string
    avatarUrl: string | null
    verified: boolean
    memberSince: string
    completedCount: number | null
}

export interface ListingSummary {
    id: number
    type: ListingType
    status: ListingStatus
    title: string
    category: string
    priceCents: number | null
    thumbUrl: string | null
    distanceMeters: number | null
    neighborhood: string | null
    createdAt: string
    author: ListingAuthor | null
}

export interface ListingPhoto {
    url: string
    thumbUrl: string | null
}

export interface ListingDetails {
    id: number
    type: ListingType
    status: ListingStatus
    title: string
    description: string | null
    category: string
    condition: string | null
    priceCents: number | null
    acceptsOffers: boolean
    pickupOption: string
    photos: ListingPhoto[]
    distanceMeters: number | null
    neighborhood: string | null
    createdAt: string
    expiresAt: string
    author: ListingAuthor | null
    mine: boolean
    interested: boolean
    reservedForMe: boolean
    conversationId: number | null
    interestCount: number | null
}

export interface ListingInterest {
    profileId: number
    handle: string | null
    displayName: string | null
    avatarUrl: string | null
    status: 'WAITING' | 'RESERVED' | 'DECLINED'
    createdAt: string
}

export interface Conversation {
    id: number
    listingId: number
    listingTitle: string
    otherProfileId: number
    otherHandle: string | null
    otherDisplayName: string | null
    otherAvatarUrl: string | null
    lastMessage: string | null
    lastMessageAt: string | null
}

export interface ChatMessage {
    id: number
    senderId: number
    body: string
    warning: boolean
    createdAt: string
}

export interface ModerationReport {
    reason: string
    details: string | null
    createdAt: string
}

export interface ModerationItem {
    listingId: number
    type: ListingType
    title: string
    description: string | null
    category: string
    priceCents: number | null
    photos: ListingPhoto[]
    author: ListingAuthor | null
    createdAt: string
    reports: ModerationReport[]
}

/** Post published despite the kindness reminder, waiting for an admin. */
export interface PostModerationItem {
    postId: number
    content: string
    authorId: number
    authorHandle: string
    authorName: string
    createdAt: string
    reasons: string[]
}
