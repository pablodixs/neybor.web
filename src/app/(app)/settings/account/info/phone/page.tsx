'use client'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import {
    DeviceMobileCameraIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useState } from 'react'
import { Button } from '@/components/button'
import { Portal } from '@/components/portal'
import { AddPhoneModal } from './components/add-phone-modal'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { formatPhone } from '@/utils/phone-formatter'

export default function PhoneInfoPage() {
    const { data: user } = useSession()

    const { data: account, mutate } = useAccountInfo()
    const phone = account?.phone

    const [allowEditing, setAllowEditing] = useState(false)
    const [rawphoneNumber, setRawPhoneNumber] = useState(phone?.value || '')
    const [showAddPhoneModal, setShowAddPhoneModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleSavePhoneNumber() {
        setIsLoading(true)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/phone`,
                {
                    phoneNumber: rawphoneNumber.replace(/\D/g, ''),
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
                setError(e.response?.data?.message)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    function handleCancelEdit() {
        setRawPhoneNumber(phone?.value || '')
        setAllowEditing(false)
    }

    const validInput =
        (rawphoneNumber.replace(/\D/g, '').length >= 10 &&
            rawphoneNumber.replace(/\D/g, '').length <= 11) ||
        rawphoneNumber === phone?.value

    if (phone?.value === null)
        return (
            <>
                <Navigation title={'Número de telefone'} />
                <PhoneNotInformedLabel />
                <Button fullWidth onClick={() => setShowAddPhoneModal(true)}>
                    Adicionar número de telefone
                </Button>
                <Portal
                    isOpen={showAddPhoneModal}
                    onClose={() => setShowAddPhoneModal(false)}
                >
                    <AddPhoneModal
                        userToken={user?.user.token}
                        onClose={() => setShowAddPhoneModal(false)}
                    />
                </Portal>
            </>
        )

    return (
        <>
            <Navigation
                title={
                    allowEditing
                        ? 'Editando número de telefone...'
                        : 'Número de telefone'
                }
            />
            <label
                htmlFor="phone"
                className="text-sm font-semibold text-neutral-500"
            >
                Número de telefone
            </label>
            <input
                type="text"
                disabled={!allowEditing}
                readOnly={!allowEditing}
                placeholder="Número de telefone"
                data-valid={[validInput]}
                onChange={(e) => setRawPhoneNumber(e.target.value)}
                value={formatPhone(rawphoneNumber)}
                className="w-full border-b-2 border-neutral-200 py-1 mb-1 outline-none font-semibold focus:border-green-600 disabled:border-neutral-100 read-only:border-0 data-[valid=true]:focus:border-green-600 data-[valid=false]:focus:border-red-500 data-[valid=false]:border-red-500 transition-all duration-100"
            />
            {!allowEditing && !account?.phone.verified && (
                <Button
                    icon={DeviceMobileCameraIcon}
                    iconPlacement="leading"
                    fullWidth
                >
                    Verificar número de telefone
                </Button>
            )}
            {error && allowEditing && (
                <p className="font-semibold text-sm text-red-600">{error}</p>
            )}
            <footer className="flex gap-2 items-center justify-end mt-4">
                {!allowEditing && (
                    <Button
                        iconPlacement="leading"
                        fullWidth
                        variant="bordered"
                        onClick={() => setAllowEditing(true)}
                    >
                        Editar número de telefone
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
                            disabled={!validInput || isLoading}
                        >
                            Salvar
                        </Button>
                    </>
                )}
            </footer>
        </>
    )
}

const PhoneNotInformedLabel = () => {
    return (
        <div className="my-4 text-orange-600 font-medium flex gap-2 items-center">
            <WarningCircleIcon size={20} />
            <p>Você não informou um número de telefone</p>
        </div>
    )
}
