'use client'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { INPUT_STYLES, LABEL_STYLES } from '../../../styles'
import {
    formatLongBirthDate,
    getAgeFromBirthDate,
} from '@/utils/date-formatters'

export default function BirthdateInfoPage() {
    const { data: account } = useAccountInfo()

    if (!account?.birthDate) {
        return null
    }

    const age = getAgeFromBirthDate(account.birthDate)

    return (
        <>
            <Navigation title="Data de nascimento e Idade" />
            <p className="text-neutral-500 mb-4">
                Veja ou altere a data de nascimento e a idade do perfil do seu
                perfil. Esta informação não será exibida publicamente e não pode
                ser alterada.
            </p>
            {account?.birthDate && (
                <>
                    <label htmlFor="age" className={LABEL_STYLES}>
                        Data de nascimento
                    </label>
                    <input
                        readOnly
                        disabled
                        className={INPUT_STYLES}
                        value={formatLongBirthDate(account.birthDate)}
                    />
                </>
            )}
            <label htmlFor="age" className={LABEL_STYLES}>
                Idade
            </label>
            <input
                readOnly
                disabled
                className={INPUT_STYLES}
                value={`${age} anos`}
            />
            <main className="flex flex-col gap-4"></main>
        </>
    )
}
