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
import { useAccountInfo } from '../../account-request'
import { formatPhone } from '@/utils/phone-formatter'

export default function InfoPage() {
    const { data: account, isLoading } = useAccountInfo()

    return (
        <>
            <Navigation title="Informações da conta" />
            <p className="text-neutral-500 mb-4">
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
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">
                                Nome de usuário
                            </b>
                            <p className="text-neutral-600">
                                @{account.username}
                            </p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">Nome</b>
                            <p className="text-neutral-600">
                                {account.displayName}
                            </p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link
                        className="flex items-center"
                        href={'/settings/account/info/phone'}
                    >
                        <div className="flex-1">
                            <b className="text-sm font-semibold">Celular</b>
                            {account.phone.value === null ? (
                                <NotInformedLabel />
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <p className="text-neutral-600">
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
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">E-mail</b>
                            {account.email.value === null ? (
                                <NotInformedLabel />
                            ) : (
                                <div className="flex gap-1 items-center">
                                    <p className="text-neutral-600">
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
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">
                                Data de nascimento
                            </b>
                            {account.birthDate === null ? (
                                <NotInformedLabel />
                            ) : (
                                <p className="text-neutral-600">
                                    {formatDate(
                                        account.birthDate,
                                        'dd/MM/yyyy',
                                    )}
                                </p>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">Gênero</b>
                            {account.gender === null ? (
                                <NotInformedLabel />
                            ) : (
                                <p className="text-neutral-600">
                                    {account.gender}
                                </p>
                            )}
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <hr className="border-t border-neutral-100" />
                    <Link className="flex items-center" href={'#'}>
                        <div className="flex-1">
                            <b className="text-sm font-semibold">
                                Verificação da conta
                            </b>
                            <p className="text-neutral-600">Verificado</p>
                        </div>
                        <CaretRightIcon className="text-lg text-neutral-400" />
                    </Link>
                    <div className="flex items-center">
                        <div className="flex-1">
                            <b className="text-sm font-semibold">
                                Data de criação da conta
                            </b>
                            <p className="text-neutral-600">
                                {formatDate(account.createdAt, 'dd/MM/yyyy')}
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
