'use client'

import type { Icon } from '@phosphor-icons/react'
import { MapPinAreaIcon, MapPinIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useState } from 'react'

import { MAP_STYLE_STATIC_PATH } from '@/lib/map-style'
import { NeyborPin } from './neybor-pin'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

/** Tamanhos da imagem estática (pixels lógicos; pedimos @2x). */
const VARIANTS = {
    card: { width: 640, height: 320, aspect: 'aspect-[2/1]' },
    detail: { width: 640, height: 360, aspect: 'aspect-video' },
} as const

/**
 * Zoom do mapa. No aproximado o backend devolve o centro de um hexágono H3
 * res 8 (~460 m de lado), então afastamos e desenhamos a área em volta.
 */
const ZOOM_EXACT = 15
const ZOOM_APPROXIMATE = 13.5

/**
 * Raio do hexágono res 8 (~460 m) em % da largura da imagem no zoom
 * aproximado. Metros por pixel no Static Images (tiles de 512 px):
 * 78271.5 * cos(lat) / 2^zoom.
 */
function approximateAreaPercent(latitude: number, width: number) {
    const metersPerPixel =
        (78271.517 * Math.cos((latitude * Math.PI) / 180)) /
        2 ** ZOOM_APPROXIMATE
    // arredondado para o HTML do servidor e do cliente baterem
    return Math.round(((2 * 460) / metersPerPixel / width) * 1000) / 10
}

export function hasMappableLocation(
    latitude?: number | null,
    longitude?: number | null,
): latitude is number {
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        // posts antigos sem local chegavam como 0,0
        !(latitude === 0 && longitude === 0)
    )
}

/**
 * Mapa pequeno com o local do alerta e o pino do Neybor.
 *
 * É uma imagem estática do Mapbox (uma requisição, sem carregar o mapbox-gl),
 * com lazy loading, para não pesar o feed. O pino é desenhado por cima, no
 * centro, então a imagem pode ser cacheada pelo navegador.
 */
export function AlertLocationMap({
    latitude,
    longitude,
    approximate = false,
    variant = 'card',
    categoryIcon,
    className = '',
}: {
    latitude?: number | null
    longitude?: number | null
    approximate?: boolean | null
    variant?: keyof typeof VARIANTS
    categoryIcon?: Icon
    className?: string
}) {
    const [failed, setFailed] = useState(false)

    if (!MAPBOX_TOKEN || failed || !hasMappableLocation(latitude, longitude)) {
        return null
    }

    const { width, height, aspect } = VARIANTS[variant]
    const zoom = approximate ? ZOOM_APPROXIMATE : ZOOM_EXACT
    // arredonda para a URL se repetir e aproveitar o cache do navegador
    const lon = longitude!.toFixed(5)
    const lat = latitude.toFixed(5)
    const src =
        `https://api.mapbox.com/styles/v1/${MAP_STYLE_STATIC_PATH}/static/` +
        `${lon},${lat},${zoom},0/${width}x${height}@2x` +
        `?access_token=${MAPBOX_TOKEN}`

    const label = approximate ? 'Local aproximado' : 'Local do alerta'
    const areaPercent = approximate
        ? approximateAreaPercent(latitude, width)
        : 0

    return (
        <Link
            href={`/map?lat=${lat}&lng=${lon}`}
            aria-label={`${label}: abrir no mapa`}
            className={`group relative block w-full overflow-hidden rounded-xl border border-neutral-100 bg-neutral-100 ${aspect} ${className}`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem do Mapbox, sem otimização do Next */}
            <img
                src={src}
                alt=""
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />

            {approximate && (
                <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-green-600/70 bg-green-500/15"
                    style={{ width: `${areaPercent}%` }}
                />
            )}

            {/* pino com a ponta no centro do mapa */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <NeyborPin
                    size={variant === 'detail' ? 48 : 40}
                    icon={categoryIcon}
                />
            </span>
            {!approximate && (
                <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-600/40 animate-ping"
                />
            )}

            <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur">
                {approximate ? (
                    <MapPinAreaIcon weight="bold" size={14} />
                ) : (
                    <MapPinIcon weight="bold" size={14} />
                )}
                {label}
            </span>
        </Link>
    )
}
