'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import axios from 'axios'
import {
    ChatCircleDotsIcon,
    ClockIcon,
    HandsClappingIcon,
    PhoneIcon,
    SealCheckIcon,
    WhatsappLogoIcon,
} from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { Portal } from '@/components/portal'
import { fetcherWithToken } from '@/lib/swr'
import { ContactResult, PAYMENT_LABELS, ProviderDetails } from '@/interfaces/services'
import { ServiceArea } from '@/components/services/service-area'
import { endorsementLabel } from '@/components/services/provider-card'
import { API_URL, useCategories } from '@/components/services/use-services'

export default function ProviderPage() {
    const { handle } = useParams<{ handle: string }>()
    const { data: session } = useSession()
    const { labels } = useCategories()
    const token = session?.user.token

    const { data: provider, isLoading, mutate } = useSWR<ProviderDetails>(
        token ? [`${API_URL}/providers/${handle}`, token] : null,
        fetcherWithToken,
        { revalidateOnFocus: false },
    )

    const [sheetOpen, setSheetOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const auth = { headers: { Authorization: `Bearer ${token}` } }

    async function toggleEndorse() {
        if (!provider) return
        setBusy(true)
        setError(null)
        try {
            if (provider.endorsedByMe) {
                await axios.delete(`${API_URL}/providers/${provider.id}/endorse`, auth)
            } else {
                await axios.post(`${API_URL}/providers/${provider.id}/endorse`, {}, auth)
            }
            await mutate()
        } catch (e) {
            setError(
                axios.isAxiosError(e) && e.response?.data?.message
                    ? e.response.data.message
                    : 'Não foi possível registrar sua indicação.',
            )
        } finally {
            setBusy(false)
        }
    }

    async function contact(channel: 'WHATSAPP' | 'PHONE') {
        if (!provider) return
        setBusy(true)
        setError(null)
        try {
            const { data } = await axios.post<ContactResult>(
                `${API_URL}/providers/${provider.id}/contact`,
                { channel },
                auth,
            )
            setSheetOpen(false)
            window.open(data.url, channel === 'PHONE' ? '_self' : '_blank', 'noopener')
        } catch (e) {
            setError(
                axios.isAxiosError(e) && e.response?.data?.message
                    ? e.response.data.message
                    : 'Não foi possível abrir o contato.',
            )
        } finally {
            setBusy(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
                <Navigation />
                <Spinner size="lg" />
            </div>
        )
    }

    if (!provider) {
        return (
            <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
                <Navigation />
                <p className="text-neutral-600 py-8">Prestador não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Prestador" />
            <div className="flex gap-4 items-center">
                <Image
                    src={provider.avatarUrl || '/images/default-avatar.png'}
                    alt={provider.displayName}
                    width={80}
                    height={80}
                    className="rounded-full w-20 h-20 object-cover bg-neutral-100"
                />
                <div>
                    <h1 className="text-xl font-semibold flex items-center gap-1">
                        {provider.displayName}
                        {provider.verified && (
                            <SealCheckIcon weight="fill" className="text-green-600" />
                        )}
                    </h1>
                    <p className="text-neutral-600">{provider.headline}</p>
                    <p className="text-sm text-neutral-500">
                        {[provider.neighborhood, provider.city].filter(Boolean).join(' · ')}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                {provider.categories.map((c) => (
                    <span
                        key={c}
                        className="text-sm font-semibold bg-neutral-100 text-neutral-700 rounded-full px-3 py-1"
                    >
                        {labels[c] ?? c}
                    </span>
                ))}
                {provider.emergency24h && (
                    <span className="flex items-center gap-1 text-sm font-semibold bg-orange-50 text-orange-700 rounded-full px-3 py-1">
                        <ClockIcon weight="bold" /> Atende 24h
                    </span>
                )}
            </div>

            <section className="mt-4 p-3 rounded-2xl bg-green-50">
                <p className="flex items-center gap-2 font-semibold text-green-800">
                    <HandsClappingIcon weight="bold" />
                    {endorsementLabel(provider)}
                </p>
                {provider.recentEndorsers.length > 0 && (
                    <p className="text-sm text-green-800/80 mt-1">
                        {provider.recentEndorsers
                            .map((e) => e.displayName)
                            .join(', ')}
                        {provider.endorsementCount > provider.recentEndorsers.length &&
                            ` e mais ${provider.endorsementCount - provider.recentEndorsers.length}`}
                    </p>
                )}
            </section>

            {provider.bio && <p className="mt-4 text-neutral-700 whitespace-pre-line">{provider.bio}</p>}

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {provider.priceHint && (
                    <div>
                        <dt className="text-neutral-500">Preço</dt>
                        <dd className="font-semibold text-neutral-800">{provider.priceHint}</dd>
                    </div>
                )}
                {provider.paymentMethods.length > 0 && (
                    <div>
                        <dt className="text-neutral-500">Pagamento</dt>
                        <dd className="font-semibold text-neutral-800">
                            {provider.paymentMethods.map((m) => PAYMENT_LABELS[m] ?? m).join(', ')}
                        </dd>
                    </div>
                )}
            </dl>

            <section className="mt-4">
                <h2 className="font-semibold text-neutral-800 mb-2">
                    Área de atendimento
                    {provider.serviceRadiusKm ? ` · ${provider.serviceRadiusKm} km` : ''}
                </h2>
                <ServiceArea cells={provider.serviceArea} viewerCell={provider.viewerCell} />
            </section>

            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

            {!provider.isMine && (
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <Button
                        fullWidth
                        size="lg"
                        icon={ChatCircleDotsIcon}
                        iconPlacement="leading"
                        disabled={!provider.hasContact}
                        onClick={() => setSheetOpen(true)}
                    >
                        Entrar em contato
                    </Button>
                    <Button
                        fullWidth
                        size="lg"
                        variant={provider.endorsedByMe ? 'secondary' : 'bordered'}
                        icon={HandsClappingIcon}
                        iconPlacement="leading"
                        activityIndicator={busy}
                        onClick={toggleEndorse}
                    >
                        {provider.endorsedByMe ? 'Indicado por você' : 'Já usei e indico'}
                    </Button>
                </div>
            )}

            <Portal isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
                <div className="p-6 flex flex-col gap-3 min-w-72">
                    <h3 className="text-lg font-semibold">Como você quer falar com {provider.displayName}?</h3>
                    <Button
                        size="lg"
                        fullWidth
                        icon={WhatsappLogoIcon}
                        iconPlacement="leading"
                        activityIndicator={busy}
                        onClick={() => contact('WHATSAPP')}
                    >
                        WhatsApp
                    </Button>
                    <Button
                        size="lg"
                        fullWidth
                        variant="bordered"
                        icon={PhoneIcon}
                        iconPlacement="leading"
                        disabled={busy}
                        onClick={() => contact('PHONE')}
                    >
                        Ligar
                    </Button>
                </div>
            </Portal>
        </div>
    )
}
