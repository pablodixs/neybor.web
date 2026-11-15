import axios from 'axios'

/**
 * Converte erros da API em mensagens em português para mostrar na tela.
 * O backend responde em inglês, então usamos o status HTTP como guia.
 */
export function friendlyApiError(error: unknown, fallback: string) {
    if (!axios.isAxiosError(error)) return fallback

    if (!error.response) {
        return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.'
    }

    switch (error.response.status) {
        case 401:
            return 'Sua sessão expirou. Entre de novo para continuar.'
        case 403:
            return 'Só vizinhos próximos ao local podem fazer isso.'
        case 409:
            return 'Esse alerta não está mais ativo.'
        case 412:
        case 428:
            return 'Cadastre seu endereço nas preferências para usar alertas da vizinhança.'
        default:
            return fallback
    }
}
