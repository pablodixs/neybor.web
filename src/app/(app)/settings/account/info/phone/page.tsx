'use client'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import {
    PencilSimpleIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useState } from 'react'
import { Button } from '@/components/button'
import { data } from 'motion/react-client'

export default function PhoneInfoPage() {
    const { data: account } = useAccountInfo()
    const phone = account?.phone

    const [allowEditing, setAllowEditing] = useState(false)

    async function handleUpdatePhoneNumber() {}

    if (phone?.value === null)
        return (
            <>
                <Navigation title={'Número de telefone'} />
                <PhoneNotInformedLabel />
                <Button fullWidth>Adicionar número de telefone</Button>
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
                className="w-full border-b-2 border-neutral-200 py-1 mb-1 outline-none font-semibold focus:border-green-600 disabled:border-neutral-100 read-only:border-0 transition-all duration-100"
            />
            {phone?.value === null && <PhoneNotInformedLabel />}

            <footer className="flex gap-2 items-center justify-end mt-4">
                {!allowEditing && (
                    <Button
                        iconPlacement="leading"
                        fullWidth
                        variant="bordered"
                        onClick={() => setAllowEditing(true)}
                    >
                        Editar
                    </Button>
                )}
                {allowEditing && (
                    <>
                        <Button
                            variant="ghost"
                            fullWidth
                            onClick={() => setAllowEditing(false)}
                        >
                            Cancelar
                        </Button>
                        <Button fullWidth>Salvar</Button>
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
