'use client'

import { Navigation } from '@/components/navigation'
import { useAccountInfo } from '../../../account-request'
import { INPUT_STYLES, LABEL_STYLES, PAGE_DESCRIPTION } from '../../../styles'
import {
    formatLongBirthDate,
    getAgeFromBirthDate,
} from '@/utils/date-formatters'
import { Divider } from '@/components/divider'

export default function BirthdateInfoPage() {
    const { data: account } = useAccountInfo()

    if (!account?.birthDate) {
        return null
    }

    const age = getAgeFromBirthDate(account.birthDate)

    return (
        <>
            <Navigation title="Data de nascimento e Idade" />
            <p className={PAGE_DESCRIPTION}>
                Usada para confirmar sua idade. Esta informação não será exibida
                publicamente e não pode ser alterada.
            </p>
            <Divider />
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
