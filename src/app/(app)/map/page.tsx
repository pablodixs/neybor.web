'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Map, { Layer, Marker, MapRef, Source } from 'react-map-gl/mapbox'

import { PageContainer } from '@/components/page-container'
import { MAP_STYLE_URL } from '@/lib/map-style'

import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/button'
import { GpsFixIcon } from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserLocation } from '@/components/feed/my-neighborhood-alerts'
import { fetcherWithToken } from '@/lib/swr'
import { Spinner } from '@/components/spinner'
import { MapAlertResponse } from '@/interfaces/map-alert-response'
import { ALERT_CATEGORIES } from '@/components/post/alert-category-picker'
import {
    OFFICIAL_SEVERITY_STYLE,
    OFFICIAL_SOURCE_LABEL,
    OfficialAlert,
} from '@/interfaces/official-alert'

export default function MapPage() {
    const { data: session } = useSession()

    const { data: userLocation, isLoading } = useSWR<UserLocation>(
        session
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/profile/me/location`,
                  session.user.token,
              ]
            : null,
        fetcherWithToken,
    )

    const [bounds, setBounds] = useState<{
        north: number
        south: number
        east: number
        west: number
    } | null>(null)

    const mapRef = useRef<MapRef>(null)

    // ?lat=&lng= vem do mapa pequeno dos alertas: abre centrado no alerta
    const [focus] = useState(() => {
        if (typeof window === 'undefined') return null
        const params = new URLSearchParams(window.location.search)
        const latitude = Number(params.get('lat'))
        const longitude = Number(params.get('lng'))
        if (!params.get('lat') || !params.get('lng')) return null
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
            return null
        return { latitude, longitude }
    })

    const { data: alerts = [] } = useSWR<MapAlertResponse[]>(
        userLocation && bounds
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/alerts/map?north=${bounds.north}&east=${bounds.east}&south=${bounds.south}&west=${bounds.west}`,
                  session?.user.token,
              ]
            : null,
        fetcherWithToken,
    )

    const { data: officialAlerts = [] } = useSWR<OfficialAlert[]>(
        userLocation && bounds
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/alerts/official/map?north=${bounds.north}&east=${bounds.east}&south=${bounds.south}&west=${bounds.west}`,
                  session?.user.token,
              ]
            : null,
        fetcherWithToken,
        { refreshInterval: 5 * 60 * 1000 },
    )

    const officialAreas = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: officialAlerts
                .filter((alert) => alert.geometry)
                .map((alert) => ({
                    type: 'Feature' as const,
                    properties: { id: alert.id, severity: alert.severity },
                    geometry: alert.geometry!,
                })),
        }),
        [officialAlerts],
    )

    const updateBounds = useCallback(() => {
        const map = mapRef.current?.getMap()

        if (!map) return

        const nextBounds = map.getBounds()

        if (!nextBounds) return

        setBounds((current) => {
            const updated = {
                north: nextBounds.getNorth(),
                south: nextBounds.getSouth(),
                east: nextBounds.getEast(),
                west: nextBounds.getWest(),
            }

            if (
                current &&
                current.north === updated.north &&
                current.south === updated.south &&
                current.east === updated.east &&
                current.west === updated.west
            ) {
                return current
            }

            return updated
        })
    }, [])

    return (
        <PageContainer padding="none">
            <header className="absolute w-full p-4 text-white bg-linear-to-b from-black/50 to-black/0 z-100">
                <h1 className="text-xl font-bold">Mapa</h1>
            </header>
            <footer className="absolute w-full p-4 bottom-0 z-100 flex flex-col items-start gap-2">
                {officialAlerts.length > 0 && (
                    <ul
                        aria-label="Alertas oficiais na área do mapa"
                        className="max-h-40 w-full max-w-sm overflow-y-auto rounded-2xl bg-white/95 p-3 text-sm shadow-lg"
                    >
                        {officialAlerts.map((alert) => (
                            <li
                                key={alert.id}
                                className="flex items-center gap-2 py-0.5"
                            >
                                <span
                                    className="size-3 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor:
                                            OFFICIAL_SEVERITY_STYLE[
                                                alert.severity
                                            ].map,
                                    }}
                                />
                                <span className="font-medium text-neutral-800">
                                    {alert.event ?? alert.headline}
                                </span>
                                <span className="text-neutral-500">
                                    {OFFICIAL_SOURCE_LABEL[alert.source]}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                <Button icon={GpsFixIcon} />
            </footer>
            {isLoading && <Spinner />}
            {userLocation && (
                <Map
                    ref={mapRef}
                    mapboxAccessToken={
                        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
                    }
                    onLoad={updateBounds}
                    onMoveEnd={updateBounds}
                    initialViewState={{
                        longitude: focus?.longitude ?? userLocation.longitude,
                        latitude: focus?.latitude ?? userLocation.latitude,
                        zoom: focus ? 15 : 14,
                    }}
                    style={{
                        zIndex: 0,
                        width: '100%',
                        height: '90dvh',
                    }}
                    mapStyle={MAP_STYLE_URL}
                >
                    {officialAreas.features.length > 0 && (
                        <Source
                            id="official-alert-areas"
                            type="geojson"
                            data={officialAreas}
                        >
                            <Layer
                                id="official-alert-fill"
                                type="fill"
                                paint={{
                                    'fill-color': [
                                        'match',
                                        ['get', 'severity'],
                                        'CRITICAL',
                                        OFFICIAL_SEVERITY_STYLE.CRITICAL.map,
                                        'HIGH',
                                        OFFICIAL_SEVERITY_STYLE.HIGH.map,
                                        'MEDIUM',
                                        OFFICIAL_SEVERITY_STYLE.MEDIUM.map,
                                        OFFICIAL_SEVERITY_STYLE.LOW.map,
                                    ],
                                    'fill-opacity': 0.2,
                                }}
                            />
                            <Layer
                                id="official-alert-outline"
                                type="line"
                                paint={{
                                    'line-color': [
                                        'match',
                                        ['get', 'severity'],
                                        'CRITICAL',
                                        OFFICIAL_SEVERITY_STYLE.CRITICAL.map,
                                        'HIGH',
                                        OFFICIAL_SEVERITY_STYLE.HIGH.map,
                                        'MEDIUM',
                                        OFFICIAL_SEVERITY_STYLE.MEDIUM.map,
                                        OFFICIAL_SEVERITY_STYLE.LOW.map,
                                    ],
                                    'line-width': 2,
                                }}
                            />
                        </Source>
                    )}

                    <Marker
                        latitude={userLocation.latitude}
                        longitude={userLocation.longitude}
                    />

                    {alerts?.map((alert) => {
                        // a API manda a categoria como texto ("SECURITY")
                        const info = ALERT_CATEGORIES.find(
                            (item) => item.key === String(alert.category),
                        )
                        if (!info) return null
                        const Icon = info.icon

                        return (
                            <Marker
                                key={alert.postId}
                                latitude={alert.latitude}
                                longitude={alert.longitude}
                                style={{ zIndex: 20 }}
                            >
                                <span
                                    className={`flex p-2 rounded-full text-white ${info.color} shadow-lg`}
                                >
                                    <Icon size={24} />
                                </span>
                            </Marker>
                        )
                    })}
                </Map>
            )}
        </PageContainer>
    )
}
