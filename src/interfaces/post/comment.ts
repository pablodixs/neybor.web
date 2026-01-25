export interface CommentResponse {
    id: number
    content: string
    authorName: string
    authorHandle: string
    authorId: number
    authorAvatar: string
    createdAt: string
    reactionsCount: number
    likedByMe: boolean
    myReactionType: string
}

export interface CommentRequest {
    content: string
}
