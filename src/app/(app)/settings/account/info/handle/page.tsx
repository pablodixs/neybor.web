'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { Button } from '@/components/button'
import { INPUT_STYLES, PAGE_DESCRIPTION } from '../../../styles'
import { Divider } from '@/components/divider'
import { Spinner } from '@/components/spinner'
import {
    CheckCircleIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react/dist/ssr'

export default function HandleInfoPage() {
    const { data: user } = useSession()
    const userToken = user?.user.token

    const { data: account, mutate } = useAccountInfo()

    const [editing, setEditing] = useState(false)
    const [handle, setUserName] = useState(account?.username || '')
    const [isLoading, setIsLoading] = useState(false)
    const [verifyingAvailability, setVerifyingAvailability] = useState(false)
    const [isHandleAvailable, setIsHandleAvailable] = useState<boolean | null>(
        null,
    )

    function handleSaveHandle() {
        setIsLoading(true)

        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/handle`,
                {
                    handle: handle.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                },
            )
            .then(() => {
                mutate()
                setEditing(false)
            })
            .catch((e) => {
                console.error(e)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    function handleCancelEdit() {
        setUserName(account?.username || '')
        setVerifyingAvailability(false)
        setIsHandleAvailable(null)
        setEditing(false)
    }

    const hasChanged = handle !== account?.username
    const isHandleValid = handle.trim() !== ''

    const canSave =
        hasChanged &&
        isHandleValid &&
        isHandleAvailable &&
        !verifyingAvailability

    const handleVerifyAvailability = useCallback(
        (handleToVerify: string, signal?: AbortSignal) => {
            if (!userToken) return

            setVerifyingAvailability(true)
            setIsHandleAvailable(null)

            axios
                .get(
                    `${process.env.NEXT_PUBLIC_API_URL}/account/handle/availability`,
                    {
                        params: {
                            handle: handleToVerify,
                        },
                        headers: {
                            Authorization: `Bearer ${userToken}`,
                        },
                        signal,
                    },
                )
                .then((response) => {
                    setIsHandleAvailable(response.data)
                })
                .catch((e) => {
                    if (axios.isCancel(e)) return

                    console.error('Error checking handle availability', e)
                    setIsHandleAvailable(false)
                })
                .finally(() => {
                    if (signal?.aborted) return

                    setVerifyingAvailability(false)
                })
        },
        [userToken],
    )

    useEffect(() => {
        const trimmedHandle = handle.trim()

        if (!isHandleValid || !hasChanged) return

        const controller = new AbortController()
        const timeout = window.setTimeout(() => {
            handleVerifyAvailability(trimmedHandle, controller.signal)
        }, 400)

        return () => {
            window.clearTimeout(timeout)
            controller.abort()
        }
    }, [handle, handleVerifyAvailability, hasChanged, isHandleValid])

    return (
        <>
            <Navigation
                title={
                    editing ? 'Editando nome de usuário...' : 'Nome de usuário'
                }
            />
            <p className={PAGE_DESCRIPTION}>
                Seu nome de usuário ajuda outras pessoas a encontrarem você no
                Neybor.
            </p>
            <Divider />
            <label
                htmlFor="handle"
                className="text-sm font-semibold text-neutral-500"
            >
                Nome de usuário
            </label>
            <div className="relative">
                <input
                    type="handle"
                    disabled={!editing}
                    readOnly={!editing}
                    data-valid={[canSave]}
                    placeholder="Nome de usuário"
                    onChange={(e) => {
                        setUserName(e.target.value)
                        setVerifyingAvailability(false)
                        setIsHandleAvailable(null)
                    }}
                    value={handle}
                    autoComplete="name"
                    className={INPUT_STYLES}
                />
                {verifyingAvailability && editing && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 ">
                        <Spinner size="md" />
                    </span>
                )}
                {isHandleAvailable === true &&
                    editing &&
                    !verifyingAvailability && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600">
                            <CheckCircleIcon size={20} weight="fill" />
                        </span>
                    )}

                {isHandleAvailable === false &&
                    editing &&
                    !verifyingAvailability && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                            <WarningCircleIcon size={20} weight="fill" />
                        </span>
                    )}
            </div>
            {!hasChanged && editing && (
                <p className="font-semibold text-sm text-red-600">
                    O nome não foi alterado
                </p>
            )}
            {isHandleAvailable === false &&
                hasChanged &&
                editing &&
                !verifyingAvailability && (
                    <p className="font-semibold text-sm text-red-600">
                        Esse nome de usuário não está disponível
                    </p>
                )}
            {isHandleAvailable === true &&
                hasChanged &&
                editing &&
                !verifyingAvailability && (
                    <p className="font-semibold text-sm text-green-600">
                        Esse nome de usuário está disponível
                    </p>
                )}

            <footer className="flex gap-2 items-center justify-end mt-4">
                {!editing && (
                    <Button
                        iconPlacement="leading"
                        fullWidth
                        variant="bordered"
                        onClick={() => setEditing(true)}
                    >
                        Editar nome de usuário
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
                            onClick={handleSaveHandle}
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
