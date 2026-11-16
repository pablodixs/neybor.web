'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { ClockIcon, WrenchIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Button } from '@/components/button'
import { fetcherWithToken } from '@/lib/swr'
import { ProviderSummary } from '@/interfaces/services'
import { ProviderCard } from '@/components/services/provider-card'
import { API_URL, useCategories } from '@/components/services/use-services'

function ServicosContent() {
    const router = useRouter()
    const params = useSearchParams()
    const { data: session } = useSession()
    const { categories, labels } = useCategories()

    const category = params.get('categoria')
    const emergency = params.get('urgente') === '1'

    const query = new URLSearchParams()
    if (category) query.set('category', category)
    if (emergency) query.set('emergency', 'true')

    const { data: providers, isLoading } = useSWR<ProviderSummary[]>(
        session && (category || emergency)
            ? [`${API_URL}/providers/search?${query}`, session.user.token]
            : null,
        fetcherWithToken,
    )

    function select(next: { categoria?: string | null; urgente?: boolean }) {
        const q = new URLSearchParams()
        if (next.categoria) q.set('categoria', next.categoria)
        if (next.urgente) q.set('urgente', '1')
        router.push(`/servicos${q.size ? `?${q}` : ''}`)
    }

    const browsing = category || emergency

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation
                title={category ? (labels[category] ?? 'Serviços') : 'Serviços'}
                showBackButton={!!browsing}
            />
            {!browsing && (
                <>
                    <p className="text-neutral-600 mb-4">
                        Profissionais que atendem a sua vizinhança, ordenados por
                        quem os vizinhos indicam.
                    </p>
                    <button
                        onClick={() => select({ urgente: true })}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-orange-50 text-orange-700 font-semibold mb-4 hover:bg-orange-100 transition cursor-pointer"
                    >
                        <ClockIcon weight="bold" size={22} />
                        Preciso agora (atendimento 24h)
                    </button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((c) => (
                            <button
                                key={c.slug}
                                onClick={() => select({ categoria: c.slug })}
                                className="text-left p-3 rounded-2xl border border-neutral-100 font-semibold text-neutral-700 hover:bg-green-50 hover:text-green-700 transition cursor-pointer"
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-neutral-100">
                        <p className="font-semibold text-neutral-800">
                            Você presta serviços?
                        </p>
                        <p className="text-neutral-600 text-sm mb-3">
                            Crie um perfil de prestador na mesma conta e seja
                            encontrado pelos vizinhos.
                        </p>
                        <Link href="/servicos/cadastro">
                            <Button icon={WrenchIcon} iconPlacement="leading">
                                Oferecer meus serviços
                            </Button>
                        </Link>
                    </div>
                </>
            )}
            {browsing && (
                <>
                    {category && categories.length > 0 && (
                        <label className="flex items-center gap-2 mb-4 text-sm font-medium text-neutral-600">
                            <input
                                type="checkbox"
                                checked={emergency}
                                onChange={(e) =>
                                    select({
                                        categoria: category,
                                        urgente: e.target.checked,
                                    })
                                }
                            />
                            Somente atendimento 24h
                        </label>
                    )}
                    {isLoading && <Spinner />}
                    {providers?.length === 0 && (
                        <p className="text-neutral-500 py-8 text-center">
                            Ainda não há prestadores nesta categoria perto de você.
                        </p>
                    )}
                    <div className="flex flex-col gap-2">
                        {providers?.map((p) => (
                            <ProviderCard
                                key={p.id}
                                provider={p}
                                categoryLabels={labels}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default function ServicosPage() {
    return (
        <Suspense>
            <ServicosContent />
        </Suspense>
    )
}
