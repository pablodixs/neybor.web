'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { ImageIcon, ShieldCheckIcon, XIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { ListingPhoto, ListingType } from '@/interfaces/marketplace'
import {
    CONDITION_LABELS,
    PICKUP_LABELS,
    SAFETY_TIPS,
    TYPE_LABELS,
} from '@/components/marketplace/labels'
import { authHeaders, feiraError } from '@/components/marketplace/errors'
import { API_URL, useListingCategories } from '@/components/marketplace/use-marketplace'

const MAX_PHOTOS = 8

const TYPE_HINTS: Record<ListingType, string> = {
    SALE: 'Você define o preço e combina a entrega no chat.',
    DONATION: 'De graça para quem precisar. Expira em 14 dias.',
    WANTED: 'Peça algo ao bairro: alguém pode ter sobrando.',
}

export default function NewListingPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { categories } = useListingCategories()
    const fileInput = useRef<HTMLInputElement>(null)

    const [type, setType] = useState<ListingType>('DONATION')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [condition, setCondition] = useState('USED')
    const [price, setPrice] = useState('')
    const [acceptsOffers, setAcceptsOffers] = useState(false)
    const [pickup, setPickup] = useState('SAFE_MEETING_POINT')
    const [photos, setPhotos] = useState<ListingPhoto[]>([])
    const [uploading, setUploading] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const priceCents = price ? Math.round(parseFloat(price.replace(',', '.')) * 100) : null
    const priceValid = type !== 'SALE' || (priceCents !== null && priceCents > 0)
    const valid = title.trim().length >= 3 && category !== '' && priceValid && !uploading

    async function addPhotos(files: FileList | null) {
        if (!files) return
        setError(null)
        setUploading(true)
        try {
            for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
                const body = new FormData()
                body.append('file', file)
                const { data } = await axios.post(`${API_URL}/marketplace/photos`, body, authHeaders(session?.user.token))
                setPhotos((current) => [...current, data])
            }
        } catch (e) {
            setError(feiraError(e, 'Não foi possível enviar a foto. Use JPG ou PNG de até 5 MB.'))
        } finally {
            setUploading(false)
            if (fileInput.current) fileInput.current.value = ''
        }
    }

    async function submit() {
        setBusy(true)
        setError(null)
        try {
            const { data } = await axios.post(
                `${API_URL}/marketplace/listings`,
                {
                    type,
                    title: title.trim(),
                    description: description.trim() || null,
                    category,
                    condition: type === 'WANTED' ? null : condition,
                    priceCents: type === 'DONATION' ? null : priceCents,
                    acceptsOffers: type === 'SALE' && acceptsOffers,
                    pickupOption: pickup,
                    photos,
                },
                authHeaders(session?.user.token),
            )
            router.push(`/feira/${data.id}`)
        } catch (e) {
            setError(feiraError(e, 'Não foi possível publicar o anúncio.', 'listing'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white">
            <Navigation title="Novo anúncio" />
            <div className="flex flex-col gap-5">
                <fieldset>
                    <legend className="font-semibold text-neutral-700 mb-1">O que você quer fazer?</legend>
                    <div className="flex gap-2">
                        {(['DONATION', 'SALE', 'WANTED'] as ListingType[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`flex-1 px-3 py-2 rounded-2xl font-semibold cursor-pointer transition border-2 ${type === t ? 'border-green-600 bg-green-50 text-green-700' : 'border-neutral-100 text-neutral-700 hover:bg-neutral-50'}`}
                            >
                                {t === 'DONATION' ? 'Doar' : t === 'SALE' ? 'Vender' : 'Procurar'}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">{TYPE_HINTS[type]}</p>
                </fieldset>

                <div>
                    <p className="font-semibold text-neutral-700 mb-1">
                        Fotos <span className="font-normal text-neutral-500">(até {MAX_PHOTOS})</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {photos.map((p, i) => (
                            <div key={p.url} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.thumbUrl ?? p.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    aria-label="Remover foto"
                                    onClick={() => setPhotos(photos.filter((x) => x.url !== p.url))}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-neutral-900/70 text-white cursor-pointer"
                                >
                                    <XIcon size={12} weight="bold" />
                                </button>
                            </div>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                disabled={uploading}
                                className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-500 text-xs gap-1 cursor-pointer hover:bg-neutral-50 disabled:opacity-60"
                            >
                                <ImageIcon size={24} />
                                {uploading ? 'Enviando...' : 'Adicionar'}
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        hidden
                        onChange={(e) => addPhotos(e.target.files)}
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                        Removemos a localização das fotos automaticamente.
                    </p>
                </div>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Título
                    <Input
                        fullWidth
                        maxLength={120}
                        placeholder={type === 'WANTED' ? 'Ex.: Preciso de um berço' : 'Ex.: Sofá de 3 lugares'}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Categoria
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-3 border-2 border-neutral-100 rounded-lg font-semibold"
                    >
                        <option value="">Escolha uma categoria</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>

                {type !== 'DONATION' && (
                    <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                        {type === 'SALE' ? 'Preço (R$)' : 'Quanto você paga, no máximo? (opcional)'}
                        <Input
                            fullWidth
                            inputMode="decimal"
                            placeholder="0,00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ''))}
                        />
                    </label>
                )}

                {type === 'SALE' && (
                    <label className="flex items-center gap-2 text-neutral-700 font-medium">
                        <input type="checkbox" checked={acceptsOffers} onChange={(e) => setAcceptsOffers(e.target.checked)} />
                        Aceito ofertas
                    </label>
                )}

                {type !== 'WANTED' && (
                    <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                        Estado
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="px-3 py-3 border-2 border-neutral-100 rounded-lg font-semibold"
                        >
                            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Descrição <span className="font-normal text-neutral-500">(opcional)</span>
                    <textarea
                        value={description}
                        maxLength={2000}
                        rows={4}
                        onChange={(e) => setDescription(e.target.value)}
                        className="px-4 py-3 border-2 border-neutral-100 rounded-lg font-medium"
                    />
                    <span className="text-xs font-normal text-neutral-500">
                        Não coloque telefone nem links: os vizinhos falam com você pelo chat.
                    </span>
                </label>

                <label className="flex flex-col gap-1 font-semibold text-neutral-700">
                    Como combinar a entrega
                    <select
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="px-3 py-3 border-2 border-neutral-100 rounded-lg font-semibold"
                    >
                        {Object.entries(PICKUP_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs font-normal text-neutral-500">
                        O endereço exato nunca aparece: os vizinhos veem só a distância aproximada.
                    </span>
                </label>

                <div className="flex gap-2 p-3 rounded-2xl bg-green-50 text-green-900 text-sm">
                    <ShieldCheckIcon weight="bold" size={20} className="shrink-0" />
                    <ul className="list-disc pl-4">
                        {SAFETY_TIPS.slice(0, 2).map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <Button fullWidth disabled={!valid} activityIndicator={busy} onClick={submit}>
                    Publicar {TYPE_LABELS[type].toLowerCase()}
                </Button>
            </div>
        </div>
    )
}
