import axios from 'axios'
import { friendlyApiError } from '@/lib/api-error'

/**
 * O backend responde em inglês; aqui os status viram mensagens em português
 * que explicam o que fazer na Feira do Bairro.
 */
export function feiraError(
    error: unknown,
    fallback: string,
    context: 'listing' | 'chat' | 'generic' = 'generic',
) {
    if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
            case 403:
                return 'A Feira é para vizinhos com endereço verificado, usando o perfil pessoal.'
            case 404:
                return 'Esse anúncio não está mais disponível.'
            case 409:
                return 'Você atingiu o limite de anúncios ativos ou o anúncio mudou de estado. Atualize a página.'
            case 422:
                return context === 'chat'
                    ? 'Links não são permitidos no chat. Converse por aqui e combine de se encontrar pessoalmente.'
                    : 'Seu anúncio tem algo que não é permitido: item proibido, telefone, link ou valor acima do limite de contas novas. Revise o texto.'
        }
    }
    return friendlyApiError(error, fallback)
}

export function authHeaders(token?: string) {
    return { headers: { Authorization: `Bearer ${token}` } }
}
