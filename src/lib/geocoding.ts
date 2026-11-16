/**
 * Busca de endereços (Mapbox Geocoding v6), restrita ao Brasil e em português.
 * Usada no cadastro para transformar o endereço digitado, ou a posição do
 * aparelho, em rua, bairro, cidade, CEP e coordenadas.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
const GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6'

export type AddressSuggestion = {
    id: string
    label: string
    secondary: string
    street?: string
    number?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    latitude: number
    longitude: number
}

type MapboxFeature = {
    id: string
    properties: {
        mapbox_id?: string
        name?: string
        full_address?: string
        place_formatted?: string
        coordinates: { latitude: number; longitude: number }
        context?: {
            address?: { address_number?: string; street_name?: string }
            street?: { name?: string }
            neighborhood?: { name?: string }
            locality?: { name?: string }
            place?: { name?: string }
            region?: { name?: string; region_code?: string }
            postcode?: { name?: string }
        }
    }
}

export function isGeocodingAvailable() {
    return MAPBOX_TOKEN !== ''
}

function toSuggestion(feature: MapboxFeature): AddressSuggestion {
    const { properties } = feature
    const context = properties.context || {}

    return {
        id: properties.mapbox_id || feature.id,
        label: properties.name || properties.full_address || '',
        secondary: properties.place_formatted || '',
        street: context.address?.street_name || context.street?.name,
        number: context.address?.address_number,
        // em muitas cidades o Mapbox traz o bairro como "locality"
        neighborhood: context.neighborhood?.name || context.locality?.name,
        city: context.place?.name,
        state: context.region?.region_code || context.region?.name,
        zipCode: context.postcode?.name,
        latitude: properties.coordinates.latitude,
        longitude: properties.coordinates.longitude,
    }
}

async function request(
    path: string,
    params: Record<string, string>,
    signal?: AbortSignal,
) {
    const query = new URLSearchParams({
        access_token: MAPBOX_TOKEN,
        country: 'br',
        language: 'pt',
        ...params,
    })
    const response = await fetch(`${GEOCODING_URL}/${path}?${query}`, {
        signal,
    })
    if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`)
    }
    const data = (await response.json()) as { features?: MapboxFeature[] }
    return (data.features || []).map(toSuggestion)
}

export function searchAddress(text: string, signal?: AbortSignal) {
    if (!isGeocodingAvailable() || text.trim().length < 3) {
        return Promise.resolve([])
    }
    return request(
        'forward',
        {
            q: text.trim(),
            types: 'address,street',
            autocomplete: 'true',
            limit: '5',
            // dá preferência a endereços perto de onde a pessoa está
            proximity: 'ip',
        },
        signal,
    )
}

export async function reverseGeocode(latitude: number, longitude: number) {
    if (!isGeocodingAvailable()) return null
    const [first] = await request('reverse', {
        latitude: String(latitude),
        longitude: String(longitude),
        types: 'address,street',
    })
    return first || null
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
