'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import MapView, { Layer, Marker, MapRef, Source } from 'react-map-gl/mapbox'

import { MAP_STYLE_URL } from '@/lib/map-style'

import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/button'
import { CrosshairIcon, MapPinIcon, WarningIcon } from '@phosphor-icons/react'
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

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
const alertCategories = new Map<string, (typeof ALERT_CATEGORIES)[number]>(
    ALERT_CATEGORIES.map((category) => [category.key, category]),
)

export default function MapPage() {
    const { data: session, status } = useSession()

    const { data: userLocation, error: locationError, isLoading, mutate: retryLocation } = useSWR<UserLocation>(
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
    const mapViewportRef = useRef<HTMLDivElement>(null)
    const [selectedAlert, setSelectedAlert] = useState<number | null>(null)
    const [mapLoadFailed, setMapLoadFailed] = useState(false)

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

    const { data: alerts, error: reportsError, isLoading: reportsLoading, mutate: retryReports } = useSWR<MapAlertResponse[]>(
        session && userLocation && bounds
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/alerts/map?north=${bounds.north}&east=${bounds.east}&south=${bounds.south}&west=${bounds.west}`,
                  session.user.token,
              ]
            : null,
        fetcherWithToken,
    )

    const { data: officialAlerts, error: officialError, isLoading: officialLoading, mutate: retryOfficial } = useSWR<OfficialAlert[]>(
        session && userLocation && bounds
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/alerts/official/map?north=${bounds.north}&east=${bounds.east}&south=${bounds.south}&west=${bounds.west}`,
                  session.user.token,
              ]
            : null,
        fetcherWithToken,
        { refreshInterval: 5 * 60 * 1000 },
    )

    const officialAreas = useMemo(
        () => ({
            type: 'FeatureCollection' as const,
            features: (officialAlerts ?? [])
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

    const mapReady = bounds !== null && Boolean(userLocation) && !locationError
    useEffect(() => {
        const viewport = mapViewportRef.current
        const map = mapRef.current
        if (!mapReady || !viewport || !map) return

        const observer = new ResizeObserver(() => map.resize())
        observer.observe(viewport)
        return () => observer.disconnect()
    }, [mapReady])

    function focusReport(alert: MapAlertResponse) {
        mapRef.current?.jumpTo({ center: [alert.longitude, alert.latitude] })
        setSelectedAlert(alert.postId)
    }

    function recenter() {
        if (!userLocation) return
        mapRef.current?.jumpTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 14 })
        setSelectedAlert(null)
    }

    const waitingForLocation = status === 'loading' || isLoading
    const waitingForAlerts = !mapLoadFailed && (!bounds || reportsLoading || officialLoading)
    const hasAlerts = Boolean(alerts?.length || officialAlerts?.length)

    return (
        <div className="@container pt-5 lg:pt-0">
            <header className="mb-4">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Mapa de alertas</h1>
                {userLocation?.neighborhood && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-600">
                        <MapPinIcon size={16} className="shrink-0 text-green-700" aria-hidden="true" />
                        {[userLocation.neighborhood, userLocation.city].filter(Boolean).join(' · ')}
                    </p>
                )}
            </header>
            {waitingForLocation ? (
                <div role="status" className="rounded-xl bg-neutral-50 py-16">
                    <Spinner title="Carregando localização" />
                </div>
            ) : locationError ? (
                <div role="alert" className="space-y-3 rounded-xl bg-neutral-50 p-5">
                    <p>Não foi possível carregar sua localização.</p>
                    <Button variant="secondary" onClick={() => void retryLocation()}>Tentar de novo</Button>
                </div>
            ) : !userLocation ? (
                <div className="space-y-3 rounded-xl bg-neutral-50 p-5">
                    <p>Adicione seu endereço para ver os alertas da vizinhança.</p>
                    <Link href="/verificacao" className="font-semibold text-green-800 underline">Verificar meu endereço</Link>
                </div>
            ) : !MAPBOX_TOKEN ? (
                <p role="status" className="rounded-xl bg-neutral-50 p-5">
                    O mapa está indisponível. <Link href="/alerts" className="font-semibold text-green-800 underline">Ver alertas do bairro</Link>
                </p>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 @3xl:grid @3xl:h-[clamp(25rem,69dvh,42rem)] @3xl:grid-cols-[minmax(0,1fr)_17rem]">
                    <div ref={mapViewportRef} className="relative isolate h-[clamp(16rem,42dvh,28rem)] bg-neutral-100 @3xl:h-full">
                        <MapView
                            ref={mapRef}
                            mapboxAccessToken={MAPBOX_TOKEN}
                            onLoad={() => {
                                setMapLoadFailed(false)
                                updateBounds()
                            }}
                            onError={() => {
                                if (!bounds) setMapLoadFailed(true)
                            }}
                            onMoveEnd={updateBounds}
                            initialViewState={{
                                longitude: focus?.longitude ?? userLocation.longitude,
                                latitude: focus?.latitude ?? userLocation.latitude,
                                zoom: focus ? 15 : 14,
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
                                            'fill-opacity': 0.12,
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
                                const info = alertCategories.get(String(alert.category))
                                const Icon = info?.icon ?? WarningIcon
                                const selected = selectedAlert === alert.postId

                                return (
                                    <Marker
                                        key={alert.postId}
                                        latitude={alert.latitude}
                                        longitude={alert.longitude}
                                        style={{ zIndex: selected ? 21 : 20 }}
                                    >
                                        <button
                                            type="button"
                                            aria-label={`${info?.label ?? 'Relato'}: ${alert.postContent}`}
                                            aria-current={selected ? 'location' : undefined}
                                            data-selected={selected}
                                            onClick={() => focusReport(alert)}
                                            className={`grid size-10 cursor-pointer place-items-center rounded-full border-2 border-white text-neutral-950 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 data-[selected=true]:ring-2 data-[selected=true]:ring-neutral-950 ${info?.color ?? 'bg-neutral-400'}`}
                                        >
                                            <Icon size={20} weight="bold" aria-hidden="true" />
                                        </button>
                                    </Marker>
                                )
                            })}
                        </MapView>
                        <button
                            type="button"
                            onClick={recenter}
                            disabled={!bounds}
                            className="absolute top-3 right-3 z-30 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-wait"
                        >
                            <CrosshairIcon size={18} weight="bold" aria-hidden="true" />
                            Centralizar no bairro
                        </button>
                    </div>
                    <section aria-labelledby="map-alerts-heading" className="border-t border-neutral-200 @3xl:flex @3xl:min-h-0 @3xl:flex-col @3xl:overflow-hidden @3xl:border-t-0 @3xl:border-l">
                        <div className="border-b border-neutral-200 px-4 py-3">
                            <h2 id="map-alerts-heading" className="font-bold text-neutral-950">Nesta área do mapa</h2>
                        </div>
                        <div className="max-h-64 overflow-y-auto px-4 @3xl:max-h-none">
                            {mapLoadFailed && !bounds && (
                                <p role="alert" className="py-4 text-sm text-neutral-700">
                                    Não foi possível carregar o mapa. <Link href="/alerts" className="font-semibold text-green-800 underline">Ver alertas do bairro</Link>
                                </p>
                            )}
                            {waitingForAlerts && (
                                <p role="status" className="py-4 text-sm text-neutral-600">Carregando alertas…</p>
                            )}
                            {(reportsError || officialError) && (
                                <div role="alert" className="space-y-2 py-4 text-sm text-neutral-700">
                                    <p>Não foi possível carregar todos os alertas.</p>
                                    <Button variant="secondary" onClick={() => {
                                        if (reportsError) void retryReports()
                                        if (officialError) void retryOfficial()
                                    }}>Tentar de novo</Button>
                                </div>
                            )}
                            {!!bounds && !waitingForAlerts && !reportsError && !officialError && !hasAlerts && (
                                <p role="status" className="py-4 text-sm text-neutral-600">Nenhum alerta nesta área. Mova o mapa para ver outros locais.</p>
                            )}
                            {!!officialAlerts?.length && (
                                <div className="border-b border-neutral-200 py-3">
                                    <h3 className="text-sm font-semibold text-neutral-950">Avisos oficiais</h3>
                                    <ul className="mt-2 space-y-3">
                                        {officialAlerts.map((alert) => {
                                            const severity = OFFICIAL_SEVERITY_STYLE[alert.severity]
                                            return (
                                                <li key={alert.id} className="wrap-anywhere text-sm">
                                                    <p className="font-semibold text-neutral-900">{alert.event || alert.headline || 'Aviso oficial'}</p>
                                                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                                                        <span className={`rounded-sm px-1.5 py-0.5 font-semibold ${severity.badge}`}>{severity.label}</span>
                                                        {OFFICIAL_SOURCE_LABEL[alert.source]}
                                                    </p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                            {!!alerts?.length && (
                                <div className="py-3">
                                    <h3 className="text-sm font-semibold text-neutral-950">Relatos de vizinhos</h3>
                                    <ul className="mt-2 space-y-1">
                                        {alerts.map((alert) => {
                                            const info = alertCategories.get(String(alert.category))
                                            const Icon = info?.icon ?? WarningIcon
                                            const selected = selectedAlert === alert.postId
                                            return (
                                                <li key={alert.postId}>
                                                    <button
                                                        type="button"
                                                        aria-current={selected ? 'location' : undefined}
                                                        data-selected={selected}
                                                        onClick={() => focusReport(alert)}
                                                        className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-green-700 data-[selected=true]:bg-tint data-[selected=true]:outline data-[selected=true]:-outline-offset-1 data-[selected=true]:outline-green-700"
                                                    >
                                                        <Icon size={19} weight="bold" className="mt-0.5 shrink-0 text-neutral-600" aria-hidden="true" />
                                                        <span className="min-w-0 wrap-anywhere">
                                                            <span className="block font-semibold text-neutral-900">{info?.label ?? 'Relato'}</span>
                                                            <span className="block text-neutral-700">{alert.postContent}</span>
                                                            {alert.locationApproximate && <span className="mt-1 block text-xs text-neutral-600">Local aproximado</span>}
                                                        </span>
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
