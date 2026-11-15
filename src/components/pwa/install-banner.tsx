'use client'

import {
    DeviceMobileIcon,
    ExportIcon,
    PlusSquareIcon,
    XIcon,
} from '@phosphor-icons/react'

import { Button } from '../button'
import { useInstallPrompt } from './use-install-prompt'

/**
 * Convite para instalar o Neybor na tela inicial.
 * No celular aparece flutuando acima da barra de navegação;
 * em telas largas aparece como um card na coluna da direita.
 */
export function InstallBanner({ variant }: { variant: 'floating' | 'card' }) {
    const { mode, install, dismiss } = useInstallPrompt()

    if (!mode) return null

    const wrapper =
        variant === 'floating'
            ? 'xl:hidden fixed left-2 right-2 sm:left-auto sm:right-4 sm:w-96 z-30 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-4 shadow-lg'
            : 'mb-4'

    return (
        <div
            className={`${wrapper} bg-white border border-neutral-100 rounded-2xl p-4`}
            role="region"
            aria-label="Instalar o Neybor"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-green-50 text-green-600 text-2xl shrink-0">
                    <DeviceMobileIcon weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                    <strong className="block font-semibold text-neutral-800">
                        Instale o Neybor
                    </strong>
                    {mode === 'prompt' ? (
                        <p className="text-sm text-neutral-500">
                            Abra mais rápido e receba alertas da vizinhança como
                            um app.
                        </p>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            Toque em{' '}
                            <ExportIcon
                                className="inline align-text-bottom"
                                weight="bold"
                                aria-label="Compartilhar"
                            />{' '}
                            e depois em{' '}
                            <span className="font-semibold whitespace-nowrap">
                                <PlusSquareIcon
                                    className="inline align-text-bottom"
                                    weight="bold"
                                />{' '}
                                Adicionar à Tela de Início
                            </span>
                            .
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    className="p-2 -m-1 rounded-full text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                    aria-label="Agora não"
                >
                    <XIcon weight="bold" />
                </button>
            </div>
            {mode === 'prompt' && (
                <div className="mt-3">
                    <Button fullWidth onClick={install}>
                        Instalar app
                    </Button>
                </div>
            )}
        </div>
    )
}
