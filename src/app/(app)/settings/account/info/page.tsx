import { Navigation } from '@/components/navigation'
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export default function InfoPage() {
    return (
        <>
            <Navigation title="Informações da conta" />
            <p className="text-neutral-500 mb-4">
                Veja e altere os dados pessoais e de contato da sua conta.
            </p>
            <section className="flex flex-col gap-4">
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">Nome de usuário</b>
                        <p className="text-neutral-600">@john_doe</p>
                    </div>
                    <CaretRightIcon className="text-lg text-neutral-400" />
                </Link>
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">Nome</b>
                        <p className="text-neutral-600">John Doe</p>
                    </div>
                    <CaretRightIcon className="text-lg text-neutral-400" />
                </Link>
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">Celular</b>
                        <p className="text-neutral-600">1234567890</p>
                    </div>
                    <CaretRightIcon className="text-lg text-neutral-400" />
                </Link>
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">E-mail</b>
                        <p className="text-neutral-600">john.doe@example.com</p>
                    </div>
                    <CaretRightIcon className="text-lg text-neutral-400" />
                </Link>
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">
                            Data de nascimento
                        </b>
                        <p className="text-neutral-600">11/12/1999</p>
                    </div>
                    <CaretRightIcon className="text-lg text-neutral-400" />
                </Link>
                <Link className="flex items-center" href={'#'}>
                    <div className="flex-1">
                        <b className="text-sm font-semibold">Gênero</b>
                        <p className="text-neutral-600">Masculino</p>
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
                        <p className="text-neutral-600">01/01/2020</p>
                    </div>
                </div>
            </section>
        </>
    )
}
