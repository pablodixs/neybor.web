'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { MapPinIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { PAYMENT_LABELS } from '@/interfaces/services'
import { API_URL, useCategories } from '@/components/services/use-services'
import { useAccountInfo } from '../../settings/account-request'

export default function ProviderSignupPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { categories } = useCategories()
    const { data: account } = useAccountInfo()

    const [displayName, setDisplayName] = useState('')
    const [headline, setHeadline] = useState('')
    const [bio, setBio] = useState('')
    const [selected, setSelected] = useState<string[]>([])
    const [emergency24h, setEmergency24h] = useState(false)
    const [priceHint, setPriceHint] = useState('')
    const [payments, setPayments] = useState<string[]>(['PIX'])
    const [radius, setRadius] = useState(5)
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const hasPhone = !!account?.phone?.value
    const valid =
        displayName.trim().length >= 2 &&
        headline.trim().length > 0 &&
        selected.length > 0 &&
        coords !== null

    function toggle<T>(list: T[], item: T, max = 99) {
        if (list.includes(item)) return list.filter((i) => i !== item)
        return list.length >= max ? list : [...list, item]
    }

    function locate() {
        setError(null)
        navigator.geolocation.getCurrentPosition(
            (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => setError('Não foi possível obter sua localização. Libere o acesso no navegador.'),
        )
    }

    async function submit() {
        setBusy(true)
        setError(null)
        try {
            const { data } = await axios.post(
                `${API_URL}/providers`,
                {
                    displayName: displayName.trim(),
                    headline: headline.trim(),
                    bio: bio.trim() || null,
                    categories: selected,
                    emergency24h,
                    priceHint: priceHint.trim() || null,
                    paymentMethods: payments,
                    serviceRadiusKm: radius,
                    latitude: coords!.lat,
                    longitude: coords!.lng,
                },
                { headers: { Authorization: `Bearer ${session?.user.token}` } },
            )
            router.push(`/servicos/${data.handle}`)
        } catch (e) {
            setError(
                axios.isAxiosError(e) && e.response?.data?.message
                    ? e.response.data.message
                    : 'Não foi possível criar o perfil.',
            )
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Oferecer meus serviços" />
            <div className="flex flex-col gap-5">
                {account && !hasPhone && (
                    <div className="flex gap-2 p-3 rounded-2xl bg-orange-50 text-orange-800 text-sm">
                        <WarningCircleIcon weight="bold" size={20} className="shrink-0" />
                        <p>
                            Seu perfil só aparece nas buscas depois que você cadastrar um
                            telefone, pois é por ele que os vizinhos entram em contato.{' '}
                            <Link
                                href="/settings/account/info/phone"
                                className="font-semibold underline"
                            >
                                Adicionar telefone
                            </Link>
                        </p>
                    </div>
                )}

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Nome do perfil
                    <Input
                        fullWidth
                        placeholder="Ex.: João Chaveiro"
                        value={displayName}
                        maxLength={100}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </label>

                <fieldset>
                    <legend className="font-semibold text-neutral-700 mb-1">
                        Categorias <span className="font-normal text-neutral-500">(até 3)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button
                                type="button"
                                key={c.slug}
                                data-active={selected.includes(c.slug)}
                                onClick={() => setSelected(toggle(selected, c.slug, 3))}
                                className="px-3 py-1.5 rounded-full border border-neutral-200 font-semibold text-sm text-neutral-700 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[active=true]:border-green-600 cursor-pointer transition"
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Resumo
                    <Input
                        fullWidth
                        placeholder="Ex.: Chaveiro residencial e automotivo"
                        value={headline}
                        maxLength={120}
                        onChange={(e) => setHeadline(e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Sobre o serviço
                    <textarea
                        className="px-4 py-3 border-2 border-neutral-100 rounded-lg font-medium min-h-24 outline-transparent focus:outline-green-600"
                        maxLength={500}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Faixa de preço <span className="font-normal text-neutral-500">(opcional)</span>
                    <Input
                        fullWidth
                        placeholder="Ex.: Visita a partir de R$ 80"
                        value={priceHint}
                        maxLength={120}
                        onChange={(e) => setPriceHint(e.target.value)}
                    />
                </label>

                <fieldset>
                    <legend className="font-semibold text-neutral-700 mb-1">Formas de pagamento</legend>
                    <div className="flex gap-2">
                        {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                            <button
                                type="button"
                                key={key}
                                data-active={payments.includes(key)}
                                onClick={() => setPayments(toggle(payments, key))}
                                className="px-3 py-1.5 rounded-full border border-neutral-200 font-semibold text-sm text-neutral-700 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[active=true]:border-green-600 cursor-pointer transition"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </fieldset>

                <label className="flex items-center gap-2 font-semibold text-neutral-700">
                    <input
                        type="checkbox"
                        checked={emergency24h}
                        onChange={(e) => setEmergency24h(e.target.checked)}
                    />
                    Atendo emergências 24h
                </label>

                <div>
                    <label className="font-semibold text-neutral-700 flex justify-between">
                        Raio de atendimento <span>{radius} km</span>
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full accent-green-600"
                    />
                </div>

                <div>
                    <p className="font-semibold text-neutral-700 mb-1">Ponto central do atendimento</p>
                    <p className="text-sm text-neutral-500 mb-2">
                        Seu endereço exato não é exibido; os vizinhos só veem a região coberta.
                    </p>
                    <Button
                        variant={coords ? 'secondary' : 'bordered'}
                        icon={MapPinIcon}
                        iconPlacement="leading"
                        onClick={locate}
                    >
                        {coords ? 'Localização definida' : 'Usar minha localização atual'}
                    </Button>
                </div>

                {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                <Button
                    size="lg"
                    fullWidth
                    disabled={!valid}
                    activityIndicator={busy}
                    activityLabel="Criando perfil..."
                    onClick={submit}
                >
                    Criar perfil de prestador
                </Button>
            </div>
        </div>
    )
}
