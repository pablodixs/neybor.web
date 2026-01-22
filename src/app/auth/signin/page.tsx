'use client'

import { motion } from 'motion/react'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Heading } from '@/components/typography/heading'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    DeviceMobileCameraIcon,
    EnvelopeIcon,
    HandHeartIcon,
    HandPeaceIcon,
    InfoIcon,
    NavigationArrowIcon,
    ShieldCheckIcon,
    SmileyIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import Link from 'next/link'

const NEYBOR_DIRECTIVES = [
    {
        title: 'Seja um bom vizinho',
        description:
            'Mantenha interações respeitosas e construtivas com outros membros da comunidade mesmo quando as opiniões sejam diferentes.',
        icon: HandHeartIcon,
    },
    {
        title: 'Seja respeitoso',
        description:
            'Trate todos com cortesia e consideração, evitando linguagem ofensiva ou comportamento agressivo. Lembre-se que seus vizinhos no Neybor são parte de sua vizinhança.',
        icon: HandPeaceIcon,
    },
    {
        title: 'Todos são bem-vindos',
        description:
            'Racismo, discriminação e discurso de ódio não são tolerados. ',
        icon: SmileyIcon,
    },
]

export default function SignInPage() {
    const [currentStep, setCurrentStep] = useState(1)

    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        addressStreet: '',
        confirmPassword: '',
        phoneNumber: '',
    })

    const handleNextStep = () => {
        if (currentStep === 10) return
        setCurrentStep((prev) => prev + 1)
    }

    const handlePreviousStep = () => {
        if (currentStep === 1) return
        setCurrentStep((prev) => prev - 1)
    }

    function formatPhone(phone: string) {
        const digits = phone.replace(/\D/g, '')

        if (digits.length <= 10) {
            return digits
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2')
        }

        return digits
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
    }

    return (
        <section className="max-w-[500px] w-full h-[90dvh] flex flex-col bg-white rounded-xl p-8 overflow-hidden">
            <header className="mb-8 flex items-center justify-between">
                <button
                    onClick={handlePreviousStep}
                    className="aspect-square bg-neutral-100 p-2 cursor-pointer text-neutral-600 rounded-full"
                >
                    <ArrowLeftIcon size={20} weight="bold" />
                </button>
                <div className="relative w-[300px] overflow-hidden h-2 bg-neutral-100 rounded-full">
                    <motion.span
                        initial={{ width: '0%' }}
                        animate={{
                            width: `${(currentStep / 10) * 100}%`,
                        }}
                        transition={{
                            type: 'spring',
                            bounce: 0,
                        }}
                        className={`absolute w-[20%] h-2 bg-green-600 rounded-full`}
                    ></motion.span>
                </div>
                <button className="aspect-square bg-neutral-100 p-2 cursor-pointer text-neutral-600 rounded-full">
                    <InfoIcon size={20} weight="bold" />
                </button>
            </header>
            {currentStep === 1 && (
                <div className="flex-1">
                    <Heading>
                        Oi, vizinho!
                        <br /> Qual é o seu nome?
                    </Heading>
                    <div className="mt-8 flex justify-between gap-2">
                        <Input
                            type="text"
                            placeholder="Primeiro nome"
                            value={userInfo.firstName}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    firstName: e.target.value,
                                })
                            }
                        />
                        <Input
                            type="text"
                            placeholder="Sobrenome"
                            value={userInfo.lastName}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    lastName: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
            {currentStep === 2 && (
                <div className="flex-1">
                    <Heading>Qual é o seu e-mail?</Heading>
                    <div className="mt-8">
                        <Input
                            fullWidth
                            type="email"
                            placeholder="Insira seu e-mail"
                            value={userInfo.email}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
            {currentStep === 3 && (
                <div className="flex-1">
                    <Heading>Crie uma senha</Heading>
                    <p className="text-neutral-500 text-sm">
                        Sua senha deve ter pelo menos 8 caracteres e conter um
                        número, caractere especial e uma letra maiúscula.
                    </p>
                    <div className="mt-8 flex flex-col gap-4">
                        <Input
                            fullWidth
                            type="password"
                            placeholder="Insira sua senha"
                            value={userInfo.password}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    password: e.target.value,
                                })
                            }
                        />
                        <Input
                            fullWidth
                            type="password"
                            placeholder="Confirme sua senha"
                            value={userInfo.confirmPassword}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    confirmPassword: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            )}
            {currentStep === 4 && (
                <div className="flex-1">
                    <div className="mb-8" role="status">
                        <svg
                            aria-hidden="true"
                            className="w-10 h-10 text-neutral-100 animate-spin fill-green-600 mx-auto"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                            />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                    <Heading textAlign="center">
                        Um instante, estamos criando sua conta...
                    </Heading>
                </div>
            )}
            {currentStep === 5 && (
                <div className="flex-1">
                    <Heading>
                        Tudo certo! Agora vamos encontrar sua vizinhança.
                    </Heading>
                    <Input
                        type="text"
                        fullWidth
                        placeholder="Insira o nome da rua ou quadra"
                        button={<NavigationArrowIcon size={20} weight="bold" />}
                        value={userInfo.addressStreet}
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                addressStreet: e.target.value,
                            })
                        }
                    />
                    <div className="flex items-start gap-1 mt-3 font-medium text-neutral-500">
                        <ShieldCheckIcon
                            className="w-10"
                            weight="bold"
                            size={16}
                        />
                        <p className="text-sm">
                            Seu endereço permanece privado. Ele é usado para
                            fornecer conteúdo local e verificar que você
                            pertence à vizinhança.
                        </p>
                    </div>
                </div>
            )}
            {currentStep === 6 && (
                <div className="flex-1">
                    <Heading>Insira seu número de telefone</Heading>
                    <Input
                        fullWidth
                        type="tel"
                        placeholder={'(00) 12345-6789'}
                        icon={DeviceMobileCameraIcon}
                        value={formatPhone(userInfo.phoneNumber)}
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                phoneNumber: e.target.value,
                            })
                        }
                    />
                    <div className="flex items-start gap-1 mt-3 font-medium text-neutral-500">
                        <ShieldCheckIcon
                            className="w-10"
                            weight="bold"
                            size={16}
                        />
                        <p className="text-sm">
                            Seu número de telefone permanece privado. Ele é
                            usado para verificação de conta e segurança.
                        </p>
                    </div>
                </div>
            )}
            {currentStep === 7 && (
                <div className="flex-1">
                    <Heading>Quase lá! Vamos verificar sua conta.</Heading>
                    <p className="text-neutral-500">
                        Escolha um método para receber o código de verificação:
                    </p>
                    <div className="mt-4 flex flex-col gap-4">
                        <Button
                            iconPlacement="leading"
                            icon={EnvelopeIcon}
                            variant="bordered"
                            textAlign="left"
                        >
                            Enviar para {userInfo.email}
                        </Button>
                        {userInfo.phoneNumber !== '' && (
                            <Button
                                iconPlacement="leading"
                                icon={DeviceMobileCameraIcon}
                                variant="bordered"
                                textAlign="left"
                            >
                                Enviar para {userInfo.phoneNumber}
                            </Button>
                        )}
                    </div>
                </div>
            )}
            {currentStep === 8 && (
                <div className="flex-1">
                    <Heading>
                        Você foi verificado! Vamos dar uma olhada no que está
                        acontecendo em {userInfo.addressStreet}.
                    </Heading>

                    <Link
                        className="flex items-center gap-2 text-green-600 font-medium"
                        href="/feed"
                    >
                        Explorar minha vizinhança{' '}
                        <ArrowRightIcon weight="bold" size={18} />
                    </Link>
                </div>
            )}
            {currentStep === 9 && (
                <div className="flex-1">
                    <Heading>
                        Você foi verificado! Vamos dar uma olhada no que está
                        acontecendo em {userInfo.addressStreet}.
                    </Heading>

                    <Link
                        className="flex items-center gap-2 text-green-600 font-medium"
                        href="/feed"
                    >
                        Explorar minha vizinhança{' '}
                        <ArrowRightIcon weight="bold" size={18} />
                    </Link>
                </div>
            )}
            {currentStep === 10 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Heading>
                        Mais uma coisa! Vamos fazer nossa parte para manter o
                        Neybor seguro e divertido.
                    </Heading>
                    <div className="mt-4 overflow-auto flex-1">
                        {NEYBOR_DIRECTIVES.map((directive, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-2 mt-4"
                            >
                                <directive.icon
                                    size={24}
                                    weight="bold"
                                    className="text-green-600 shrink-0"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {directive.title}
                                    </h3>
                                    <p className="text-neutral-600 text-sm font-medium">
                                        {directive.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button fullWidth>Explorar minha vizinhança</Button>
                </div>
            )}
            <footer className="mt-8 flex gap-4 justify-end">
                {currentStep === 6 && (
                    <Button variant="secondary" onClick={handleNextStep}>
                        Pular
                    </Button>
                )}
                {currentStep === 7 && (
                    <Button variant="secondary" onClick={handleNextStep}>
                        Pular verificação
                    </Button>
                )}
                {currentStep < 10 && (
                    <Button icon={ArrowRightIcon} onClick={handleNextStep}>
                        Continuar
                    </Button>
                )}
            </footer>
        </section>
    )
}
