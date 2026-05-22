import { fetcher, fetcherWithToken } from '@/lib/swr'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import useSWR from 'swr'
import { Spinner } from '../spinner'
import { Button } from '../button'
import {
    ArrowRightIcon,
    WarningIcon,
    ArrowClockwiseIcon,
    CloudSunIcon,
    DropIcon,
    SunIcon,
    UmbrellaIcon,
} from '@phosphor-icons/react/dist/ssr'
import {
    CloudFogIcon,
    CloudLightningIcon,
    CloudRainIcon,
} from '@phosphor-icons/react'
import { ReactNode } from 'react'
import { Tooltip } from '../tooltip'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface UserLocation {
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
    0: <SunIcon className="text-yellow-500 text-2xl" weight="bold" />,
    1: <CloudSunIcon className="text-gray-500 text-2xl" weight="bold" />,
    2: <CloudSunIcon className="text-gray-500 text-2xl" weight="bold" />,
    3: <CloudSunIcon className="text-gray-500 text-2xl" weight="bold" />,
    45: <CloudFogIcon className="text-gray-500 text-2xl" weight="bold" />,
    48: <CloudFogIcon className="text-gray-500 text-2xl" weight="bold" />,
    51: <CloudRainIcon className="text-blue-800-500 text-2xl" weight="bold" />,
    53: <CloudRainIcon className="text-blue-800-500 text-2xl" weight="bold" />,
    55: <CloudRainIcon className="text-blue-800-500 text-2xl" weight="bold" />,
    61: (
        <CloudRainIcon className="text-indigo-900-500 text-2xl" weight="bold" />
    ),
    80: (
        <CloudLightningIcon
            className="text-indigo-900-500 text-2xl"
            weight="bold"
        />
    ),
    81: (
        <CloudLightningIcon
            className="text-indigo-900-500 text-2xl"
            weight="bold"
        />
    ),
    82: (
        <CloudLightningIcon
            className="text-indigo-900-500 text-2xl"
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
        `https://api.open-meteo.com/v1/forecast?latitude=${data?.latitude}&longitude=${data?.longitude}&current=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&timezone=America/Sao_Paulo`,
        fetcher,
        { refreshInterval: 15 * 60 * 1000 },
    )

    if (error) {
        return (
            <div className="bg-white border border-neutral-100 p-4 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto mb-4">
                <span className="text-orange-500 font-medium">
                    <div>
                        <WarningIcon weight="bold" className="text-xl" />
                    </div>
                    <p className="leading-tight my-2">
                        Houve um erro ao obter sua vizinhança
                    </p>
                    <Button
                        activityIndicator={isValidating}
                        fullWidth
                        onClick={() => mutate()}
                        icon={ArrowClockwiseIcon}
                        variant="bordered"
                        size="sm"
                    >
                        Tentar novamente
                    </Button>
                </span>
            </div>
        )
    }

    return (
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl max-h-[calc(100vh-5rem)] overflow-y-auto mb-4">
            {isLoading ? (
                <Spinner />
            ) : (
                <section className="flex items-center gap-2">
                    <div className="aspect-square w-12 bg-neutral-200 rounded-full"></div>
                    <div className="flex flex-col">
                        <strong className="font-semibold text-neutral-700 leading-tight">
                            {data?.neighborhood}
                        </strong>
                        <span className="leading-tight text-neutral-500 text-sm font-medium">
                            {data?.city}
                        </span>
                    </div>
                </section>
            )}
            {weatherData && (
                <section className="mt-4">
                    <div className="flex justify-evenly text-neutral-700">
                        <Tooltip
                            placement="bottom"
                            content="Condição e temperatura"
                        >
                            <span className="flex gap-1 items-center">
                                {
                                    WHEATHER_CODE_MAP[
                                        weatherData.current.weather_code
                                    ]
                                }
                                <strong className="font-semibold text-lg select-none">
                                    {weatherData.current.temperature_2m}°C
                                </strong>
                            </span>
                        </Tooltip>
                        <Tooltip placement="bottom" content="Umidade">
                            <span className="flex gap-1 items-center">
                                <DropIcon
                                    weight="bold"
                                    className="text-xl text-blue-900"
                                />
                                <strong className="font-semibold text-lg select-none">
                                    {weatherData.current.relative_humidity_2m}%
                                </strong>
                            </span>
                        </Tooltip>
                        <Tooltip
                            placement="bottom"
                            content="Probabilidade de precipitação"
                        >
                            <span className="flex gap-1 items-center">
                                <UmbrellaIcon
                                    weight="bold"
                                    className="text-xl text-indigo-900"
                                />
                                <strong className="font-semibold text-lg select-none">
                                    {
                                        weatherData.current
                                            .precipitation_probability
                                    }
                                    %
                                </strong>
                            </span>
                        </Tooltip>
                    </div>
                </section>
            )}
            <section className="mt-4 pt-3 border-t border-neutral-100 text-neutral-600 leading-tight">
                <Link
                    href={'/alerts'}
                    className="flex items-center justify-between font-semibold hover:text-green-600 transition"
                >
                    Ver alertas{' '}
                    <ArrowRightIcon className="text-lg" weight="bold" />
                </Link>
            </section>
        </div>
    )
}
