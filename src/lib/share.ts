export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

/** Compartilha pelo menu do aparelho (Web Share) ou, sem suporte, copia o link. */
export async function shareLink(url: string, title?: string): Promise<ShareResult> {
    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({ title, url })
            return 'shared'
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return 'cancelled'
            }
        }
    }
    try {
        await navigator.clipboard.writeText(url)
        return 'copied'
    } catch {
        return 'failed'
    }
}
