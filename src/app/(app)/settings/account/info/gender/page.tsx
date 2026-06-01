'use client'

import { useState } from 'react'

import { Navigation } from '@/components/navigation'
import { Gender, genderLabels, useAccountInfo } from '../../../account-request'
import { Button } from '@/components/button'
import { RadioInput } from '@/components/radio-input'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Divider } from '@/components/divider'
import { PAGE_DESCRIPTION } from '../../../styles'

export default function GenderInfoPage() {
    const { data: user } = useSession()
    const { data: account, mutate } = useAccountInfo()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [gender, setGender] = useState<Gender | null>(
        account?.gender || Gender.PREFER_NOT_TO_SAY,
    )

    function handleChangeGender(value: string) {
        setGender(value as Gender)
    }

    function handleCancelEdit() {
        setGender(account?.gender || Gender.PREFER_NOT_TO_SAY)
    }

    function handleSaveChanges() {
        setIsLoading(true)
        axios
            .patch(
                `${process.env.NEXT_PUBLIC_API_URL}/account/info/gender`,
                {
                    gender: gender,
                },
                {
                    headers: {
                        Authorization: `Bearer ${user?.user.token}`,
                    },
                },
            )
            .then(() => {
                mutate()
            })
            .catch((e) => {
                setError(e.response?.data?.message)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <>
            <Navigation title="Informações de gênero" />
            <p className={PAGE_DESCRIPTION}>
                Essa informação é opcional e pode ser usada para melhorar sua
                experiência no Neybor. Esta informação não será exibida
                publicamente.
            </p>
            <Divider />
            <main className="flex flex-col gap-4">
                <RadioInput
                    name="gender"
                    label={genderLabels[Gender.MALE]}
                    value={Gender.MALE}
                    checked={gender === Gender.MALE}
                    onChange={(e) => handleChangeGender(e)}
                />
                <RadioInput
                    name="gender"
                    label={genderLabels[Gender.FEMALE]}
                    value={Gender.FEMALE}
                    checked={gender === Gender.FEMALE}
                    onChange={(e) => handleChangeGender(e)}
                />
                <RadioInput
                    name="gender"
                    label={genderLabels[Gender.OTHER]}
                    value={Gender.OTHER}
                    checked={gender === Gender.OTHER}
                    onChange={(e) => handleChangeGender(e)}
                />
                <RadioInput
                    name="gender"
                    label={genderLabels[Gender.PREFER_NOT_TO_SAY]}
                    value={Gender.PREFER_NOT_TO_SAY}
                    checked={gender === Gender.PREFER_NOT_TO_SAY}
                    onChange={(e) => handleChangeGender(e)}
                />
                {error && <p className="text-red-500">{error}</p>}
            </main>
            {gender !== account?.gender && (
                <footer className="flex gap-2 items-center justify-end mt-4">
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
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                    >
                        Salvar
                    </Button>
                </footer>
            )}
        </>
    )
}
