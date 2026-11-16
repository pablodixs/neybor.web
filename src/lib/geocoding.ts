/**
 * Endereço no cadastro, só com fontes que podemos guardar:
 * - CEP pelo ViaCEP (gratuito, dados dos Correios) para rua, bairro e cidade;
 * - ponto aproximado pelo Nominatim/OpenStreetMap (ODbL, pode ser guardado
 *   com atribuição), usado só para posicionar o pino;
 * - o ponto final é o GPS do aparelho ou onde a pessoa coloca o pino.
 * Não usamos o geocoding do Mapbox: os termos dele proíbem guardar resultados
 * temporários.
 */

export type CepAddress = {
    zipCode: string
    street: string
    neighborhood: string
    city: string
    state: string
}

export type LatLng = { latitude: number; longitude: number }

export function onlyDigits(value: string) {
    return value.replace(/\D/g, '')
}

export function formatCep(value: string) {
    const digits = onlyDigits(value).slice(0, 8)
    return digits.length > 5
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : digits
}

/** null quando o CEP não existe. Lança erro quando o serviço não responde. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
    const digits = onlyDigits(cep)
    if (digits.length !== 8) return null

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) {
        if (response.status === 400) return null
        throw new Error(`ViaCEP ${response.status}`)
    }
    const data = (await response.json()) as {
        erro?: boolean | string
        logradouro?: string
        bairro?: string
        localidade?: string
        uf?: string
    }
    if (data.erro) return null

    return {
        zipCode: digits,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
    }
}

/**
 * Ponto aproximado do endereço, só para centralizar o mapa. Tenta a rua e,
 * se não achar, o bairro/cidade. Poucas chamadas por cadastro, dentro da
 * política de uso do Nominatim (máx. 1 por segundo).
 */
export async function approximatePoint(
    address: Partial<CepAddress> & { number?: string },
): Promise<{ point: LatLng; precise: boolean } | null> {
    const attempts: Array<{ query: Record<string, string>; precise: boolean }> =
        []
    if (address.street && address.city) {
        attempts.push({
            query: {
                street: [address.number, address.street]
                    .filter(Boolean)
                    .join(' '),
                city: address.city,
                state: address.state || '',
            },
            precise: true,
        })
    }
    if (address.city) {
        attempts.push({
            query: {
                q: [address.neighborhood, address.city, address.state]
                    .filter(Boolean)
                    .join(', '),
            },
            precise: false,
        })
    }

    for (const attempt of attempts) {
        try {
            const params = new URLSearchParams({
                ...attempt.query,
                countrycodes: 'br',
                format: 'jsonv2',
                limit: '1',
                'accept-language': 'pt-BR',
            })
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params}`,
            )
            if (!response.ok) continue
            const [first] = (await response.json()) as Array<{
                lat: string
                lon: string
            }>
            if (first) {
                return {
                    point: {
                        latitude: Number(first.lat),
                        longitude: Number(first.lon),
                    },
                    precise: attempt.precise,
                }
            }
        } catch {
            // tenta a próxima forma
        }
    }
    return null
}

export function getDevicePosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('unsupported'))
            return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
        })
    })
}
