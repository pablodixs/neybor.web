'use client'

import Link from 'next/link'

import { Button } from '../button'
import { useCompose } from '../post/compose-context'
import type { FeedFilter } from './feed-tabs'

const COPY: Record<FeedFilter, { title: string; text: string }> = {
    ALL: {
        title: 'Seu bairro ainda está quieto',
        text: 'Seja o primeiro a postar e convide seus vizinhos para movimentar o feed.',
    },
    SAFETY_ALERT: {
        title: 'Nenhum relato de alerta',
        text: 'Viu algo que o bairro precisa saber? Avise os vizinhos.',
    },
    GENERAL: {
        title: 'Nenhuma conversa ainda',
        text: 'Puxe assunto: pergunte, recomende ou avise algo ao bairro.',
    },
    MARKETPLACE: {
        title: 'Nada à venda nos posts',
        text: 'Veja os anúncios da vizinhança na Feira do Bairro.',
    },
}

export function FeedEmptyState({ filter }: { filter: FeedFilter }) {
    const { openCompose } = useCompose()
    const { title, text } = COPY[filter]

    return (
        <div className="mx-auto max-w-sm px-4 py-14 text-center">
            <p className="text-lg font-semibold text-balance text-neutral-900">{title}</p>
            <p className="mt-1 mb-6 text-pretty text-neutral-600">{text}</p>
            <div className="flex flex-wrap justify-center gap-2">
                {filter === 'MARKETPLACE' ? (
                    <Link href="/feira" className="inline-flex min-h-10 items-center rounded-full bg-green-700 px-4 font-semibold text-white hover:bg-green-800">Abrir a Feira</Link>
                ) : (
                    <Button
                        onClick={() =>
                            openCompose(
                                filter === 'SAFETY_ALERT'
                                    ? 'SAFETY_ALERT'
                                    : 'GENERAL',
                            )
                        }
                    >
                        {filter === 'SAFETY_ALERT'
                            ? 'Avisar os vizinhos'
                            : 'Fazer um post'}
                    </Button>
                )}
                <Link href="/convidar" className="inline-flex min-h-10 items-center rounded-full px-4 font-semibold text-green-800 hover:bg-green-50">Convidar vizinhos</Link>
            </div>
        </div>
    )
}

export function FeedEndState() {
    return (
        <div className="py-12 text-center text-neutral-500">
            <p className="font-semibold text-neutral-700">
                Você viu tudo por enquanto
            </p>
            <p className="text-sm">Volte mais tarde para novidades do bairro.</p>
        </div>
    )
}
