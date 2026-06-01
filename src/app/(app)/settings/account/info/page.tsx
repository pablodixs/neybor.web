'use client'
import Link from 'next/link'
import { formatDate } from 'date-fns'
import {
    CaretRightIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react/dist/ssr'

import { Navigation } from '@/components/navigation'
import { Spinner } from '@/components/spinner'
import { Tooltip } from '@/components/tooltip'
import { genderLabels, useAccountInfo } from '../../account-request'
import { formatPhone } from '@/utils/phone-formatter'
import { formatShortBirthDate } from '@/utils/date-formatters'
import {
    CONTENT_VALUE_STYLES,
    LABEL_STYLES,
    PAGE_DESCRIPTION,
} from '../../styles'

export default function InfoPage() {
    const { data: account, isLoading } = useAccountInfo()

    return (
        <>
            <Navigation title="Informações da conta" />
            <p className={PAGE_DESCRIPTION}>
                Veja e altere os dados pessoais e de contato da sua conta.
            </p>
            {isLoading && (
                <div className="flex flex-col gap-2 items-center">
                    <Spinner />{' '}
                    <span className="text-sm text-neutral-400">
                        Carregando informações da conta...
                    </span>
                </div>
            )}
            {account && (
                <section className="flex flex-col gap-4">
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/handle'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Nome de usuário</b>
                            <p className={CONTENT_VALUE_STYLES}>
                                @{account.username}
                            </p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/name'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Nome</b>
                            <p className={CONTENT_VALUE_STYLES}>
                                {account.displayName.value}
                            </p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/phone'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Celular</b>
                            {account.phone.value === null ? (
                                <NotInformedLabel />
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <p className={CONTENT_VALUE_STYLES}>
                                        {formatPhone(account.phone.value)}
                                    </p>
                                    {!account.phone.verified && (
                                        <Tooltip content="Celular não verificado">
                                            <WarningCircleIcon
                                                className="text-orange-600"
                                                size={18}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/email'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>E-mail</b>
                            {account.email.value === null ? (
                                <NotInformedLabel />
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <p className={CONTENT_VALUE_STYLES}>
                                        {account.email.value}{' '}
                                    </p>
                                    {!account.email.verified && (
                                        <Tooltip content="E-mail não verificado">
                                            <WarningCircleIcon
                                                className="text-orange-600"
                                                size={18}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/birthdate'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Data de nascimento</b>
                            {account.birthDate === null ? (
                                <NotInformedLabel />
                            ) : (
                                <p className={CONTENT_VALUE_STYLES}>
                                    {formatShortBirthDate(account.birthDate)}
                                </p>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/gender'}
                    >
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Gênero</b>
                            {account.gender === null ? (
                                <NotInformedLabel />
                            ) : (
                                <p className={CONTENT_VALUE_STYLES}>
                                    {genderLabels[account.gender]}
                                </p>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <hr className="border-t border-neutral-100" />
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>Verificação da conta</b>
                            <p className={CONTENT_VALUE_STYLES}>Verificado</p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <div className="flex items-center">
                        <div className="flex-1">
                            <b className={LABEL_STYLES}>
                                Data de criação da conta
                            </b>
                            <p className={CONTENT_VALUE_STYLES}>
                                {formatDate(
                                    account.createdAt,
                                    `dd/MM/yyyy HH:mm:ss`,
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </>
    )
}

const NotInformedLabel = () => {
    return (
        <div className="flex items-center gap-1 text-neutral-600">
            <WarningCircleIcon size={18} />
            <p>Não informado</p>
        </div>
    )
}
