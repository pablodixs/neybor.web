'use client'

import { useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { Button } from '@/components/button'
import { INPUT_STYLES, PAGE_DESCRIPTION } from '../../../styles'
import { Divider } from '@/components/divider'

export default function MailInfoPage() {
    const { data: user } = useSession()

    const { data: account, mutate } = useAccountInfo()
    const email = account?.email

    const [allowEditing, setAllowEditing] = useState(false)
    const [rawEmail, setRawEmail] = useState(email?.value || '')
    const [isLoading, setIsLoading] = useState(false)

    function handleSavePhoneNumber() {
        setIsLoading(true)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/email`,
                {
                    email: rawEmail.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${user?.user.token}`,
                    },
                },
            )
            .then(() => {
                setAllowEditing(false)
                mutate()
            })
            .catch((e) => {
                console.error(e)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    function handleCancelEdit() {
        setRawEmail(email?.value || '')
        setAllowEditing(false)
    }

    const hasChanged = rawEmail !== email?.value
    const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)

    const canSave = rawEmail.trim() !== '' && hasChanged && isEmailFormatValid

    return (
        <>
            <Navigation
                title={
                    allowEditing ? 'Editando endereço de e-mail...' : 'E-mail'
                }
            />
            <p className={PAGE_DESCRIPTION}>
                Esse email é usado para login, recuperação de conta e avisos
                importantes sobre sua conta.
            </p>
            <Divider />
            <label
                htmlFor="email"
                className="text-sm font-semibold text-neutral-500"
            >
                Endereço de e-mail
            </label>
            <input
                type="email"
                disabled={!allowEditing}
                readOnly={!allowEditing}
                data-valid={[canSave]}
                placeholder="Endereço de e-mail"
                onChange={(e) => setRawEmail(e.target.value)}
                value={rawEmail}
                autoComplete="email"
                className={INPUT_STYLES}
            />
            {!hasChanged && allowEditing && (
                <p className="font-semibold text-sm text-red-600">
                    O endereço de e-mail não foi alterado
                </p>
            )}
            {!isEmailFormatValid && (
                <p className="font-semibold text-sm text-red-600">
                    O endereço de e-mail não é válido
                </p>
            )}
            {!allowEditing && !account?.email.verified && (
                <Button
                    icon={EnvelopeSimpleIcon}
                    iconPlacement="leading"
                    fullWidth
                >
                    Verificar endereço de e-mail
                </Button>
            )}
            <footer className="flex gap-2 items-center justify-end mt-4">
                {!allowEditing && (
                    <Button
                        iconPlacement="leading"
                        fullWidth
                        variant="bordered"
                        onClick={() => setAllowEditing(true)}
                    >
                        Atualizar endereço de e-mail
                    </Button>
                )}
                {allowEditing && (
                    <>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={handleCancelEdit}
                        >
                            Cancelar
                        </Button>
                        <Button
                            activityIndicator={isLoading}
                            fullWidth
                            onClick={handleSavePhoneNumber}
                            disabled={!canSave || isLoading}
                        >
                            Salvar
                        </Button>
                    </>
                )}
            </footer>
        </>
    )
}
