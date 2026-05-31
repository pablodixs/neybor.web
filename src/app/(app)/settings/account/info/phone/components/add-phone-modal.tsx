'use client'
import { useState } from 'react'
import Image from 'next/image'
import {
    CheckCircleIcon,
    DeviceMobileCameraIcon,
    XIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Heading } from '@/components/typography/heading'
import { Button } from '@/components/button'
import { formatPhone } from '@/utils/phone-formatter'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface AddPhoneModalProps {
    userToken?: string
    onClose: () => void
}

export function AddPhoneModal({ onClose, userToken }: AddPhoneModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [rawphoneNumber, setRawPhoneNumber] = useState('')
    const [isValid, setIsValid] = useState(false)

    function handlePhoneChange(value: string) {
        setRawPhoneNumber(value)
        setPhoneNumber(formatPhone(value))

        const digits = rawphoneNumber.replace(/\D/g, '')
        if (!/^\d{10,11}$/.test(digits)) {
            setIsValid(false)
        } else {
            setIsValid(true)
        }
    }

    function handleSavePhoneNumber() {
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/phone`,
                {
                    phoneNumber: rawphoneNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                },
            )
            .then(() => {
                onClose()
            })
            .catch((e) => {
                console.error(e)
            })
    }

    return (
        <div className="max-w-lg">
            <header className="flex gap-2 text-neutral-700 text-lg font-semibold items-center">
                <button
                    className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition"
                    onClick={onClose}
                >
                    <XIcon weight="bold" />
                </button>
                <p> Adicionar número de telefone</p>
            </header>
            <main className="my-4">
                <Heading>Qual o seu número de telefone?</Heading>
                <p className="text-neutral-500 mt-2">
                    Adicione seu telefone para proteger sua conta e facilitar a
                    recuperação de acesso.
                </p>
                <div className="relative flex items-center gap-4">
                    <button className="font-semibold text-2xl">
                        <Image
                            src={'/images/icons/flags/brazil.svg'}
                            alt=""
                            width={32}
                            height={24}
                        />
                    </button>
                    <input
                        autoFocus
                        type="text"
                        autoComplete="tel"
                        placeholder="(61) 11111-1111"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="font-semibold text-xl text-neutral-800 my-4 py-2 border-b-2 border-neutral-100 outline-none focus:border-green-600 transition-all duration-100 w-full"
                    />
                    {isValid ? (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl ">
                            <CheckCircleIcon
                                className="text-green-600"
                                weight="fill"
                            />
                        </span>
                    ) : (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl ">
                            <DeviceMobileCameraIcon
                                className="text-neutral-400"
                                weight="bold"
                            />
                        </span>
                    )}
                </div>

                {isValid && (
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={!isValid}
                            onClick={handleSavePhoneNumber}
                        >
                            Verificar depois
                        </Button>
                    </div>
                )}
            </main>
            <footer className="flex gap-2 items-center justify-end">
                <Button variant="ghost" onClick={onClose}>
                    Cancelar
                </Button>
                <Button disabled={!isValid} onClick={onClose}>
                    Verificar
                </Button>
            </footer>
        </div>
    )
}
