import { ListingStatus, ListingType } from '@/interfaces/marketplace'

export const TYPE_LABELS: Record<ListingType, string> = {
    SALE: 'Venda',
    DONATION: 'Doação',
    WANTED: 'Procuro',
}

export const CONDITION_LABELS: Record<string, string> = {
    NEW: 'Novo',
    LIKE_NEW: 'Seminovo',
    USED: 'Usado',
    NEEDS_REPAIR: 'Precisa de reparo',
}

export const PICKUP_LABELS: Record<string, string> = {
    AT_MY_PLACE: 'Retirada no meu prédio ou portaria',
    SAFE_MEETING_POINT: 'Ponto de encontro seguro',
    CAN_DELIVER: 'Posso entregar',
}

export const REPORT_LABELS: Record<string, string> = {
    SCAM: 'Parece golpe',
    PROHIBITED_ITEM: 'Item proibido',
    WRONG_CATEGORY: 'Categoria errada',
    OFFENSIVE: 'Conteúdo ofensivo',
    DUPLICATE: 'Anúncio repetido',
    OTHER: 'Outro motivo',
}

export const STATUS_LABELS: Record<ListingStatus, string> = {
    ACTIVE: 'Disponível',
    RESERVED: 'Reservado',
    COMPLETED: 'Concluído',
    EXPIRED: 'Expirado',
    UNDER_REVIEW: 'Em análise',
    REMOVED: 'Removido',
}

export const SAFETY_TIPS = [
    'Pague só na entrega, olhando o item. Nunca envie sinal nem Pix antecipado.',
    'Confira o Pix no app do seu banco, não no print.',
    'Combine em local movimentado e de dia. Para itens caros, vá acompanhado.',
    'Nunca passe códigos recebidos por SMS ou WhatsApp.',
]

export function formatPrice(type: ListingType, cents: number | null) {
    if (type === 'DONATION') return 'Grátis'
    if (cents === null) return type === 'WANTED' ? 'Aceito doação' : ''
    const value = (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })
    return type === 'WANTED' ? `Pago até ${value}` : value
}

export function formatDistance(meters: number | null) {
    if (meters === null) return null
    if (meters < 1000) return `a ~${meters} m`
    return `a ~${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}
