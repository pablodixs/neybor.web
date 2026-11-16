'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import useSWR from 'swr'
import { CheckCircleIcon, MoonStarsIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import { fetcherWithToken } from '@/lib/swr'
import { PresenceStatus } from '@/interfaces/marketplace'
import { authHeaders } from '@/components/marketplace/errors'
import { API_URL } from '@/components/marketplace/use-marketplace'

function currentPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20_000,
            maximumAge: 0,
        }),
    )
}

function checkinError(error: unknown) {
    if (error instanceof GeolocationPositionError) {
        return 'Não consegui ver sua localização. Permita o acesso à localização do navegador e tente de novo.'
    }
    if (axios.isAxiosError(error) && error.response?.status === 409) {
        return 'Não deu para contar esta noite: você parece estar longe do endereço cadastrado ou o GPS está impreciso. Tente de novo em casa, perto de uma janela.'
    }
    return 'Não foi possível registrar sua presença agora. Tente novamente.'
}

export default function VerificationPage() {
    const { data: session } = useSession()
    const token = session?.user.token
    const {
        data,
        error: loadError,
        isLoading,
        mutate,
    } = useSWR<PresenceStatus>(
        token ? [`${API_URL}/profile/me/presence`, token] : null,
        fetcherWithToken,
    )
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [now, setNow] = useState(() => new Date())
    // The screen can stay open for hours: keep the clock fresh so the button opens at 20:00
    // and "tonight already counted" does not carry over to the next night.
    useEffect(() => {
        const tick = () => setNow(new Date())
        const timer = setInterval(tick, 60_000)
        document.addEventListener('visibilitychange', tick)
        window.addEventListener('focus', tick)
        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', tick)
            window.removeEventListener('focus', tick)
        }
    }, [])
    const hour = now.getHours()
    const isNight = data
        ? hour >= data.nightStartHour || hour < data.nightEndHour
        : false
    const todayCounted = data?.nights.length
        ? data.nights.includes(
              new Date(
                  now.getTime() - (hour < data.nightEndHour ? 86_400_000 : 0),
              ).toLocaleDateString('sv-SE'),
          )
        : false

    async function confirm() {
        if (!data) return
        setBusy(true)
        setError(null)
        setMessage(null)
        try {
            const position = await currentPosition()
            const { data: next } = await axios.post<PresenceStatus>(
                `${API_URL}/profile/me/presence`,
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracyMeters: position.coords.accuracy,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                authHeaders(token),
            )
            await mutate(next, { revalidate: false })
            setMessage(
                next.verified
                    ? 'Pronto! Seu endereço está verificado.'
                    : 'Presença registrada. Volte amanhã à noite.',
            )
        } catch (e) {
            setError(checkinError(e))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white flex flex-col gap-4">
            <Navigation title="Verificar endereço" />

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner />
                </div>
            )}

            {loadError && !data && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="text-red-600 text-sm">
                        Não foi possível carregar sua verificação.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => mutate()}
                    >
                        Tentar novamente
                    </Button>
                </div>
            )}

            {data?.verified && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <CheckCircleIcon
                        size={48}
                        weight="fill"
                        className="text-green-600"
                    />
                    <p className="font-semibold">
                        Seu endereço está verificado.
                    </p>
                    <Link href="/feira" className="text-sm underline">
                        Ir para a Feira do Bairro
                    </Link>
                </div>
            )}

            {data && !data.verified && (
                <>
                    <p className="text-neutral-700 text-sm">
                        Para anunciar na Feira, confirmamos que você mora aqui
                        sem cartas nem documentos: basta abrir o Neybor{' '}
                        <b>em casa, à noite</b> (das {data.nightStartHour}h às{' '}
                        {data.nightEndHour}h) em{' '}
                        <b>{data.nightsRequired} noites diferentes</b>, dentro
                        de {data.windowDays} dias, e confirmar sua presença.
                    </p>

                    <div
                        className="flex gap-2"
                        aria-label={`${data.nightsCounted} de ${data.nightsRequired} noites`}
                    >
                        {Array.from({ length: data.nightsRequired }, (_, i) => (
                            <span
                                key={i}
                                className={`flex-1 h-10 rounded-xl grid place-items-center ${
                                    i < data.nightsCounted
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-neutral-100 text-neutral-400'
                                }`}
                            >
                                <MoonStarsIcon
                                    size={18}
                                    weight={
                                        i < data.nightsCounted
                                            ? 'fill'
                                            : 'regular'
                                    }
                                />
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-neutral-600">
                        {data.nightsCounted} de {data.nightsRequired} noites
                        confirmadas.
                    </p>

                    {!data.hasAddress && (
                        <p className="p-4 rounded-2xl bg-orange-50 text-orange-800 text-sm">
                            Cadastre seu endereço antes de começar.{' '}
                            <Link href="/settings" className="underline">
                                Abrir configurações
                            </Link>
                        </p>
                    )}

                    {data.hasAddress && !isNight && (
                        <p className="text-sm text-neutral-600">
                            Agora não é horário de confirmar. Volte a partir das{' '}
                            {data.nightStartHour}h.
                        </p>
                    )}

                    {data.hasAddress && isNight && todayCounted && (
                        <p className="text-sm text-neutral-600">
                            Esta noite já foi contada. Volte amanhã à noite.
                        </p>
                    )}

                    <Button
                        fullWidth
                        disabled={!data.hasAddress || !isNight || todayCounted}
                        activityIndicator={busy}
                        activityLabel="Confirmando..."
                        onClick={confirm}
                    >
                        Confirmar que estou em casa
                    </Button>

                    <p className="text-xs text-neutral-500">
                        Usamos sua localização só no momento do toque, a no
                        máximo {data.radiusMeters} m do endereço cadastrado.
                        Guardamos apenas a noite confirmada, nunca onde você
                        estava.
                    </p>
                </>
            )}

            {message && <p className="text-green-700 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Link href="/lugares" className="text-sm underline text-center">
                Adicionar outros lugares, como o trabalho
            </Link>
        </div>
    )
}
