import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const handleLike = (commentId: number, currentUserToken: string) => {
    axios
        .post(`${API_URL}/post/comment/${commentId}/react?type=LIKE`, null, {
            headers: {
                Authorization: `Bearer ${currentUserToken}`,
            },
        })
        .then(() => {})
        .catch((error) => {
            console.error('Error liking comment:', error)
        })
}
