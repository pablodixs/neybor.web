'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import useSWR from 'swr'
import { BriefcaseIcon, CheckCircleIcon, MapPinIcon, TrashIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { PlaceKind, SavedPlace } from '@/interfaces/marketplace'
import { authHeaders } from '@/components/marketplace/errors'
import { API_URL } from '@/components/marketplace/use-marketplace'

const MAX_PLACES = 3

function currentPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20_000,
            maximumAge: 0,
        }),
    )
}

function placeError(error: unknown) {
    if (typeof GeolocationPositionError !== 'undefined' && error instanceof GeolocationPositionError) {
        return 'Não consegui ver sua localização. Permita o acesso à localização do navegador e tente de novo.'
    }
    if (axios.isAxiosError(error) && error.response?.status === 409) {
        return 'Não deu para contar agora: você parece estar longe do local, o GPS está impreciso, está fora do horário ou você atingiu o limite de locais.'
    }
    return 'Não foi possível concluir agora. Tente novamente.'
}

export default function PlacesPage() {
    const { data: session } = useSession()
    const token = session?.user.token
    const {
        data: places,
        error: loadError,
        isLoading,
        mutate,
    } = useSWR<SavedPlace[]>(
        token ? [`${API_URL}/profile/me/places`, token] : null,
        fetcherWithToken,
    )

    const [kind, setKind] = useState<PlaceKind>('WORK')
    const [label, setLabel] = useState('Trabalho')
    const [busyId, setBusyId] = useState<number | 'new' | null>(null)
    const [error, setError] = useState<string | null>(null)

    // The screen can stay open for hours: keep the clock fresh for the daytime window.
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const tick = () => setNow(new Date())
        const timer = setInterval(tick, 60_000)
        document.addEventListener('visibilitychange', tick)
        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', tick)
        }
    }, [])

    async function run(id: number | 'new', action: () => Promise<unknown>) {
        setBusyId(id)
        setError(null)
        try {
            await action()
            await mutate()
        } catch (e) {
            setError(placeError(e))
        } finally {
            setBusyId(null)
        }
    }

    const addHere = () =>
        run('new', async () => {
            const position = await currentPosition()
            await axios.post(
                `${API_URL}/profile/me/places`,
                {
                    kind,
                    label: label.trim() || (kind === 'WORK' ? 'Trabalho' : 'Outro local'),
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                authHeaders(token),
            )
        })

    const checkIn = (place: SavedPlace) =>
        run(place.id, async () => {
            const position = await currentPosition()
            await axios.post(
                `${API_URL}/profile/me/places/${place.id}/presence`,
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracyMeters: position.coords.accuracy,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                authHeaders(token),
            )
        })

    const remove = (place: SavedPlace) =>
        run(place.id, () =>
            axios.delete(`${API_URL}/profile/me/places/${place.id}`, authHeaders(token)),
        )

    const hour = now.getHours()
    const today = now.toLocaleDateString('sv-SE')

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white flex flex-col gap-4">
            <Navigation title="Meus lugares" />
            <p className="text-sm text-neutral-700">
                Salve lugares onde você passa o dia, como o trabalho. Eles são só seus: ninguém
                vê. Para confirmar, abra o Neybor <b>no local</b> e toque em confirmar em{' '}
                <b>5 dias diferentes</b>, dentro de 14 dias.
            </p>

            {isLoading && (
                <div className="flex justify-center py-6">
                    <Spinner />
                </div>
            )}
            {loadError && !places && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <p className="text-red-600 text-sm">Não foi possível carregar seus lugares.</p>
                    <Button variant="secondary" size="sm" onClick={() => mutate()}>
                        Tentar novamente
                    </Button>
                </div>
            )}

            {places?.map((place) => {
                const inHours = hour >= place.dayStartHour && hour < place.dayEndHour
                const counted = place.days.includes(today)
                return (
                    <div
                        key={place.id}
                        className="p-4 rounded-2xl border border-neutral-100 flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-2">
                            {place.kind === 'WORK' ? (
                                <BriefcaseIcon size={20} />
                            ) : (
                                <MapPinIcon size={20} />
                            )}
                            <span className="font-semibold flex-1">{place.label}</span>
                            {place.verified && (
                                <span className="flex items-center gap-1 text-green-700 text-sm">
                                    <CheckCircleIcon size={18} weight="fill" /> Confirmado
                                </span>
                            )}
                            <button
                                aria-label={`Remover ${place.label}`}
                                className="text-neutral-500 hover:text-red-600 cursor-pointer"
                                disabled={busyId === place.id}
                                onClick={() => {
                                    if (window.confirm(`Remover "${place.label}"?`)) remove(place)
                                }}
                            >
                                <TrashIcon size={18} />
                            </button>
                        </div>

                        {!place.verified && (
                            <>
                                <p className="text-sm text-neutral-600">
                                    {place.daysCounted} de {place.daysRequired} dias confirmados.
                                    {!inHours &&
                                        ` Confirme entre ${place.dayStartHour}h e ${place.dayEndHour}h.`}
                                    {inHours && counted && ' Hoje já foi contado.'}
                                </p>
                                <Button
                                    size="sm"
                                    disabled={!inHours || counted}
                                    activityIndicator={busyId === place.id}
                                    activityLabel="Confirmando..."
                                    onClick={() => checkIn(place)}
                                >
                                    Confirmar que estou aqui
                                </Button>
                            </>
                        )}
                    </div>
                )
            })}

            {places && places.length < MAX_PLACES && (
                <div className="p-4 rounded-2xl bg-neutral-50 flex flex-col gap-3">
                    <p className="font-semibold text-sm">Adicionar o lugar onde estou agora</p>
                    <div className="flex gap-2">
                        {(['WORK', 'OTHER'] as const).map((k) => (
                            <button
                                key={k}
                                className={`flex-1 rounded-full py-2 text-sm font-semibold cursor-pointer ${
                                    kind === k
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-white text-neutral-700 border border-neutral-100'
                                }`}
                                onClick={() => {
                                    setKind(k)
                                    setLabel(k === 'WORK' ? 'Trabalho' : 'Outro local')
                                }}
                            >
                                {k === 'WORK' ? 'Trabalho' : 'Outro'}
                            </button>
                        ))}
                    </div>
                    <input
                        value={label}
                        maxLength={60}
                        onChange={(e) => setLabel(e.target.value)}
                        aria-label="Nome do lugar"
                        className="rounded-xl border border-neutral-100 bg-white px-3 py-2 text-sm"
                    />
                    <Button
                        variant="secondary"
                        activityIndicator={busyId === 'new'}
                        activityLabel="Salvando..."
                        onClick={addHere}
                    >
                        Salvar minha localização atual
                    </Button>
                    <p className="text-xs text-neutral-500">
                        Guardamos só o ponto do lugar e os dias confirmados, nunca onde você
                        estava.
                    </p>
                </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
    )
}
