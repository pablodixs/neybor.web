'use client'

import { useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { Button } from '@/components/button'
import { INPUT_STYLES, PAGE_DESCRIPTION } from '../../../styles'
import { Divider } from '@/components/divider'

export default function NameInfoPage() {
    const { data: user } = useSession()

    const { data: account, mutate } = useAccountInfo()

    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(account?.displayName?.value || '')
    const [isLoading, setIsLoading] = useState(false)

    function handleSaveName() {
        setIsLoading(true)

        if (!account?.displayName.canBeUpdated) {
            setIsLoading(false)
            return
        }

        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/name`,
                {
                    name: name,
                },
                {
                    headers: {
                        Authorization: `Bearer ${user?.user.token}`,
                    },
                },
            )
            .then(() => {
                setEditing(false)
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
        setName(account?.displayName?.value || '')
        setEditing(false)
    }

    const hasChanged = name !== account?.displayName?.value
    const isNameValid = name.trim() !== ''

    const canSave =
        name.trim() !== '' &&
        hasChanged &&
        isNameValid &&
        account?.displayName.canBeUpdated

    return (
        <>
            <Navigation title={editing ? 'Editando nome...' : 'Nome'} />
            <p className={PAGE_DESCRIPTION}>
                Esse nome aparece no seu perfil e em interações dentro do
                Neybor. Recomendamos usar seu nome real ou um apelido pelo qual
                você seja conhecido para facilitar que seus vizinhos te
                reconheçam.
            </p>
            <Divider />
            <label
                htmlFor="email"
                className="text-sm font-semibold text-neutral-500"
            >
                Nome
            </label>
            <input
                type="text"
                disabled={!editing}
                readOnly={!editing}
                data-valid={[canSave]}
                placeholder="Nome"
                onChange={(e) => setName(e.target.value)}
                value={name}
                autoComplete="name"
                className={INPUT_STYLES}
            />
            {!hasChanged && editing && (
                <p className="font-semibold text-sm text-red-600">
                    O nome não foi alterado
                </p>
            )}
            {!isNameValid && editing && (
                <p className="font-semibold text-sm text-red-600">
                    O nome não é válido
                </p>
            )}
            {!account?.displayName.canBeUpdated && (
                <p className="text-sm text-neutral-500 font-medium">
                    Você atualizou seu nome recentemente. Você só pode alterar
                    seu nome de exibição uma vez a cada 14 dias.
                </p>
            )}
            <footer className="flex gap-2 items-center justify-end mt-4">
                {!editing && account?.displayName.canBeUpdated && (
                    <Button
                        iconPlacement="leading"
                        fullWidth
                        variant="bordered"
                        onClick={() => setEditing(true)}
                        disabled={!account?.displayName.canBeUpdated}
                    >
                        Editar nome de exibição
                    </Button>
                )}
                {editing && (
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
                            onClick={handleSaveName}
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
