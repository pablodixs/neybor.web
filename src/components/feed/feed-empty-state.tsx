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
        title: 'Nenhum alerta por aqui',
        text: 'Boa notícia: nada de errado foi avisado. Viu algo? Avise os vizinhos.',
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
        <div className="text-center py-12 px-4">
            <div
                aria-hidden
                className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl"
            >
                ✦
            </div>
            <p className="font-semibold text-lg text-neutral-800">{title}</p>
            <p className="text-neutral-500 mb-5">{text}</p>
            <div className="flex gap-2 justify-center">
                {filter === 'MARKETPLACE' ? (
                    <Link href="/feira">
                        <Button>Abrir a Feira</Button>
                    </Link>
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
                <Link href="/convidar">
                    <Button variant="bordered">Convidar vizinhos</Button>
                </Link>
            </div>
        </div>
    )
}

export function FeedEndState() {
    return (
        <div className="text-center py-10 text-neutral-500">
            <p className="font-semibold text-neutral-700">
                Você viu tudo por enquanto
            </p>
            <p className="text-sm">Volte mais tarde para novidades do bairro.</p>
        </div>
    )
}
