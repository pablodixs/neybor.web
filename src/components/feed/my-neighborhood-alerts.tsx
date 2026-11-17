import { fetcher, fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import useSWR from 'swr'
import { Spinner } from '../spinner'
import { Button } from '../button'
import {
    ArrowRightIcon,
    MapPinIcon,
    WarningIcon,
    ArrowClockwiseIcon,
    CloudSunIcon,
    SunIcon,
} from '@phosphor-icons/react/dist/ssr'
import {
    CloudFogIcon,
    CloudLightningIcon,
    CloudRainIcon,
} from '@phosphor-icons/react'
import { ReactNode } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface UserLocation {
    city: string
    neighborhood: string
    longitude: number
    latitude: number
}

interface WeatherData {
    interval: number
    precipitation_probability: number
    relative_humidity_2m: number
    temperature_2m: number
    time: string
    weather_code: number
}

interface WheatherApiResponse {
    current: WeatherData
}

const WHEATHER_CODE_MAP: { [key: number]: ReactNode } = {
    0: <SunIcon className="text-neutral-600 text-2xl" weight="bold" />,
    1: <CloudSunIcon className="text-neutral-600 text-2xl" weight="bold" />,
    2: <CloudSunIcon className="text-neutral-600 text-2xl" weight="bold" />,
    3: <CloudSunIcon className="text-neutral-600 text-2xl" weight="bold" />,
    45: <CloudFogIcon className="text-neutral-600 text-2xl" weight="bold" />,
    48: <CloudFogIcon className="text-neutral-600 text-2xl" weight="bold" />,
    51: <CloudRainIcon className="text-neutral-600 text-2xl" weight="bold" />,
    53: <CloudRainIcon className="text-neutral-600 text-2xl" weight="bold" />,
    55: <CloudRainIcon className="text-neutral-600 text-2xl" weight="bold" />,
    61: (
        <CloudRainIcon className="text-neutral-600 text-2xl" weight="bold" />
    ),
    80: (
        <CloudLightningIcon
            className="text-neutral-600 text-2xl"
            weight="bold"
        />
    ),
    81: (
        <CloudLightningIcon
            className="text-neutral-600 text-2xl"
            weight="bold"
        />
    ),
    82: (
        <CloudLightningIcon
            className="text-neutral-600 text-2xl"
            weight="bold"
        />
    ),
}

export function MyNeighborhoodAlerts() {
    const { data: session } = useSession()

    const { data, isLoading, isValidating, error, mutate } =
        useSWR<UserLocation>(
            session
                ? [`${API_URL}/profile/me/location`, session.user.token]
                : null,
            fetcherWithToken,
        )

    const { data: weatherData } = useSWR<WheatherApiResponse>(
        data && `https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&timezone=America/Sao_Paulo`,
        fetcher,
        { refreshInterval: 15 * 60 * 1000 },
    )

    if (error) {
        return (
            <section className="rounded-2xl bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                    <WarningIcon weight="bold" aria-hidden="true" />
                    Não foi possível carregar sua vizinhança.
                </p>
                <div className="mt-3">
                    <Button activityIndicator={isValidating} onClick={() => mutate()} icon={ArrowClockwiseIcon} variant="bordered" size="sm">
                        Tentar de novo
                    </Button>
                </div>
            </section>
        )
    }

    const weather = weatherData?.current

    return (
        <section aria-labelledby="vizinhanca-titulo" className="rounded-2xl bg-white p-4">
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-500">Sua vizinhança</p>
                        <h2 id="vizinhanca-titulo" className="truncate text-base font-bold text-neutral-950">{data?.neighborhood}</h2>
                        <p className="truncate text-sm text-neutral-500">{data?.city}</p>
                    </div>
                    <Link href="/map" aria-label="Ver no mapa" title="Ver no mapa" className="grid size-9 shrink-0 place-items-center rounded-full bg-tint text-on-tint transition-colors hover:bg-tint-strong">
                        <MapPinIcon size={18} aria-hidden="true" />
                    </Link>
                </div>
            )}
            {weather && (
                <dl className="mt-4 grid grid-cols-3 gap-1 text-center">
                    <div className="rounded-xl bg-canvas py-2.5">
                        <dt className="sr-only">Temperatura</dt>
                        <dd className="flex items-center justify-center gap-1 text-base font-bold text-neutral-900 tabular-nums [&_svg]:text-lg">
                            {WHEATHER_CODE_MAP[weather.weather_code]}
                            {Math.round(weather.temperature_2m)}°
                        </dd>
                        <p aria-hidden="true" className="text-xs text-neutral-500">Agora</p>
                    </div>
                    <div className="rounded-xl bg-canvas py-2.5">
                        <dt className="sr-only">Umidade</dt>
                        <dd className="text-base font-bold text-neutral-900 tabular-nums">{weather.relative_humidity_2m}%</dd>
                        <p aria-hidden="true" className="text-xs text-neutral-500">Umidade</p>
                    </div>
                    <div className="rounded-xl bg-canvas py-2.5">
                        <dt className="sr-only">Chance de chuva</dt>
                        <dd className="text-base font-bold text-neutral-900 tabular-nums">{weather.precipitation_probability}%</dd>
                        <p aria-hidden="true" className="text-xs text-neutral-500">Chuva</p>
                    </div>
                </dl>
            )}
            <Link href="/alerts" className="group mt-3 flex min-h-9 items-center justify-between rounded-lg text-sm font-semibold text-neutral-800 hover:text-neutral-950">
                Ver alertas do bairro
                <ArrowRightIcon weight="bold" aria-hidden="true" className="text-neutral-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
        </section>
    )
}
