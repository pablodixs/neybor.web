/**
 * Funcionalidades que ainda não estão prontas ficam fora da navegação.
 * As rotas continuam existindo, só não aparecem para o usuário.
 * Para reativar uma seção, troque o valor para `true`.
 */
export const FEATURES = {
    marketplace: false,
    groups: false,
    events: false,
    messages: false,
    notifications: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey) {
    return FEATURES[feature]
}
