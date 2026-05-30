'use client'

import { useCallback, useRef, useState } from 'react'
import Map, { Marker, MapRef } from 'react-map-gl/mapbox'

import { PageContainer } from '@/components/page-container'

import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/button'
import { GpsFixIcon } from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserLocation } from '@/components/feed/my-neighborhood-alerts'
import { fetcherWithToken } from '@/lib/swr'
import { Spinner } from '@/components/spinner'
import { MapAlertResponse } from '@/interfaces/map-alert-response'
import { ALERT_TYPE_INFO, AlertCategory } from '@/utils/mapping'

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

    const { data: alerts = [] } = useSWR<MapAlertResponse[]>(
        userLocation && bounds
            ? [
                  `${process.env.NEXT_PUBLIC_API_URL}/alerts/map?north=${bounds.north}&east=${bounds.east}&south=${bounds.south}&west=${bounds.west}`,
                  session?.user.token,
              ]
            : null,
        fetcherWithToken,
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
            <footer className="absolute w-full p-4 bottom-0 z-100">
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
                        longitude: userLocation.longitude,
                        latitude: userLocation.latitude,
                        zoom: 14,
                    }}
                    style={{
                        zIndex: 0,
                        width: '100%',
                        height: '90dvh',
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                >
                    <Marker
                        latitude={userLocation.latitude}
                        longitude={userLocation.longitude}
                    />

                    {alerts?.map((alert) => {
                        const category = alert.category as AlertCategory
                        if (!ALERT_TYPE_INFO[category]) return null
                        const Icon = ALERT_TYPE_INFO[category].icon

                        return (
                            <Marker
                                key={alert.postId}
                                latitude={alert.latitude}
                                longitude={alert.longitude}
                                style={{ zIndex: 20 }}
                            >
                                <span
                                    className={`p-2 rounded-full ${ALERT_TYPE_INFO[category].color} shadow-lg`}
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
