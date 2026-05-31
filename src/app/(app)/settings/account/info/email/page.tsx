'use client'

import { useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { Button } from '@/components/button'

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
                className="w-full border-b-2 border-neutral-200 py-1 mb-1 outline-none font-semibold focus:border-green-600 disabled:border-neutral-100 read-only:border-0 data-[valid=true]:focus:border-green-600 data-[valid=false]:focus:border-red-500 data-[valid=false]:border-red-500 transition-all duration-100"
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
                        Editar e-mail
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
