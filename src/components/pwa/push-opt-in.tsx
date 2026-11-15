'use client'

import { BellRingingIcon, BellSlashIcon } from '@phosphor-icons/react'

import { Button } from '../button'
import { usePushSubscription } from './use-push-subscription'

/**
 * Card para ativar os avisos de alertas no dispositivo.
 * Some quando o push já está ligado ou não é suportado.
 */
export function PushOptIn() {
    const { state, busy, enable } = usePushSubscription()

    if (state === 'loading' || state === 'on' || state === 'unsupported') {
        return null
    }

    const content: Record<
        Exclude<PushState, 'loading' | 'on' | 'unsupported'>,
        { title: string; body: string }
    > = {
        off: {
            title: 'Receba os alertas na hora',
            body: 'Avisamos quando um vizinho registrar um alerta perto de você.',
        },
        'needs-install': {
            title: 'Instale o app para receber alertas',
            body: 'No iPhone, os avisos só funcionam com o Neybor na tela de início.',
        },
        denied: {
            title: 'Notificações bloqueadas',
            body: 'Libere as notificações do Neybor nas configurações do navegador para receber alertas.',
        },
        unavailable: {
            title: 'Avisos indisponíveis no momento',
            body: 'O servidor ainda não está enviando notificações. Tente mais tarde.',
        },
    }

    const { title, body } = content[state]

    return (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-green-50">
            <div className="p-2 rounded-xl bg-white text-green-600 text-2xl shrink-0">
                {state === 'denied' ? (
                    <BellSlashIcon weight="bold" />
                ) : (
                    <BellRingingIcon weight="bold" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <strong className="block font-semibold text-neutral-800">
                    {title}
                </strong>
                <p className="text-sm text-neutral-600">{body}</p>
                {state === 'off' && (
                    <div className="mt-3">
                        <Button
                            size="sm"
                            onClick={enable}
                            activityIndicator={busy}
                            activityLabel="Ativando..."
                        >
                            Ativar avisos
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

type PushState = ReturnType<typeof usePushSubscription>['state']
