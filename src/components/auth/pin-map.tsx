'use client'

import Map, {
    Marker,
    MarkerDragEvent,
    MapMouseEvent,
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPinIcon } from '@phosphor-icons/react'

import type { LatLng } from '@/lib/geocoding'

/**
 * Mapa com um pino que a pessoa arrasta (ou toca no mapa) até a casa dela.
 * Só exibe o mapa do Mapbox; o ponto escolhido é dado do usuário, não um
 * resultado de geocoding.
 */
export default function PinMap({
    point,
    zoom,
    onChange,
}: {
    point: LatLng
    zoom: number
    onChange: (point: LatLng) => void
}) {
    return (
        <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            initialViewState={{ ...point, zoom }}
            style={{ width: '100%', height: 220, borderRadius: 8 }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onClick={(event: MapMouseEvent) =>
                onChange({
                    latitude: event.lngLat.lat,
                    longitude: event.lngLat.lng,
                })
            }
        >
            <Marker
                latitude={point.latitude}
                longitude={point.longitude}
                anchor="bottom"
                draggable
                onDragEnd={(event: MarkerDragEvent) =>
                    onChange({
                        latitude: event.lngLat.lat,
                        longitude: event.lngLat.lng,
                    })
                }
            >
                <MapPinIcon
                    size={36}
                    weight="fill"
                    className="text-green-600 drop-shadow"
                />
            </Marker>
        </Map>
    )
}
