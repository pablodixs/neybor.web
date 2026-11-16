'use client'

import { motion } from 'motion/react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    DeviceMobileCameraIcon,
    EyeIcon,
    EyeSlashIcon,
    HandHeartIcon,
    HandPeaceIcon,
    MapPinIcon,
    NavigationArrowIcon,
    ShieldCheckIcon,
    SmileyIcon,
    WarningIcon,
} from '@phosphor-icons/react'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Spinner } from '@/components/spinner'
import { Heading } from '@/components/typography/heading'
import { formatPhone } from '@/utils/phone-formatter'
import {
    approximatePoint,
    formatCep,
    getDevicePosition,
    LatLng,
    lookupCep,
    onlyDigits,
} from '@/lib/geocoding'

const API_URL = process.env.NEXT_PUBLIC_API_URL

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

// Códigos lançados pelo provider "register" do NextAuth (api/auth/[...nextauth]/route.ts)
const REGISTER_ERROR_MESSAGES: Record<string, string> = {
    EMAIL_IN_USE: 'Já existe uma conta com esse e-mail.',
    INVALID_FIELDS: 'Confira seu nome, e-mail e senha e tente de novo.',
    REGISTER_UNAVAILABLE:
        'Não conseguimos criar sua conta agora. Tente de novo em instantes.',
}

const STEPS = {
    name: 1,
    email: 2,
    password: 3,
    creating: 4,
    address: 5,
    phone: 6,
    directives: 7,
} as const
const TOTAL_STEPS = 7

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordProblem(password: string, confirmPassword: string) {
    if (password.length < 8)
        return 'A senha precisa ter pelo menos 8 caracteres.'
    if (password.length > 72) return 'A senha pode ter no máximo 72 caracteres.'
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return 'Use letras e números na senha.'
    }
    if (confirmPassword && password !== confirmPassword) {
        return 'As senhas não são iguais.'
    }
    return null
}

export default function SignUpPage() {
    const router = useRouter()
    const { data: session, status } = useSession()

    const [currentStep, setCurrentStep] = useState<number>(STEPS.name)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    })

    // Quem já tem conta e volta para cá continua de onde parou (endereço);
    // quem já terminou vai direto para o feed.
    const checkedExistingSession = useRef(false)
    useEffect(() => {
        if (status !== 'authenticated' || checkedExistingSession.current) return
        if (currentStep !== STEPS.name) return
        checkedExistingSession.current = true

        axios
            .get(`${API_URL}/profile/me/location`, {
                headers: { Authorization: `Bearer ${session.user.token}` },
            })
            .then(({ data }) => {
                if (data?.latitude != null) {
                    router.replace('/feed')
                } else {
                    setCurrentStep(STEPS.address)
                }
            })
            .catch(() => setCurrentStep(STEPS.address))
    }, [status, session, currentStep, router])

    const token = session?.user?.token

    const goTo = (step: number) => {
        setError(null)
        setCurrentStep(step)
    }

    const handlePreviousStep = () => {
        // depois que a conta existe não faz sentido voltar para nome/e-mail/senha
        if (currentStep <= STEPS.name || currentStep === STEPS.address) return
        goTo(currentStep - 1)
    }

    const fullName = `${userInfo.firstName} ${userInfo.lastName}`
        .trim()
        .replace(/\s+/g, ' ')

    async function createAccount() {
        goTo(STEPS.creating)

        // signIn rejeita (em vez de devolver error) quando a rede cai no meio
        const result = await signIn('register', {
            redirect: false,
            name: fullName,
            email: userInfo.email.trim(),
            password: userInfo.password,
        }).catch(() => null)

        if (!result || result.error) {
            const code = result?.error || 'REGISTER_UNAVAILABLE'
            setCurrentStep(
                code === 'EMAIL_IN_USE' ? STEPS.email : STEPS.password,
            )
            setError(
                REGISTER_ERROR_MESSAGES[code] ||
                    REGISTER_ERROR_MESSAGES.REGISTER_UNAVAILABLE,
            )
            return
        }

        checkedExistingSession.current = true
        setCurrentStep(STEPS.address)
    }

    function handleContinue(event?: FormEvent) {
        event?.preventDefault()
        setError(null)

        switch (currentStep) {
            case STEPS.name:
                if (userInfo.firstName.trim().length < 2) {
                    setError('Conte pra gente pelo menos o seu primeiro nome.')
                    return
                }
                goTo(STEPS.email)
                return
            case STEPS.email:
                if (!EMAIL_PATTERN.test(userInfo.email.trim())) {
                    setError('Esse e-mail não parece válido.')
                    return
                }
                goTo(STEPS.password)
                return
            case STEPS.password: {
                const problem =
                    passwordProblem(userInfo.password, '') ??
                    (!userInfo.confirmPassword
                        ? 'Confirme sua senha.'
                        : passwordProblem(
                              userInfo.password,
                              userInfo.confirmPassword,
                          ))
                if (problem) {
                    setError(problem)
                    return
                }
                void createAccount()
                return
            }
            case STEPS.phone:
                void savePhone()
                return
        }
    }

    async function savePhone() {
        const digits = userInfo.phoneNumber.replace(/\D/g, '')
        if (!/^\d{10,11}$/.test(digits)) {
            setError('Informe o DDD e o número, por exemplo (11) 91234-5678.')
            return
        }

        setIsSubmitting(true)
        try {
            await axios.patch(
                `${API_URL}/account/info/phone`,
                { phoneNumber: digits },
                { headers: { Authorization: `Bearer ${token}` } },
            )
            goTo(STEPS.directives)
        } catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : null
            setError(
                status === 400
                    ? 'Esse número já está em uso em outra conta.'
                    : 'Não conseguimos salvar seu telefone. Tente de novo ou pule por enquanto.',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const canGoBack =
        currentStep > STEPS.name &&
        currentStep !== STEPS.creating &&
        currentStep !== STEPS.address

    return (
        <section className="max-w-[500px] w-full min-h-[min(640px,90dvh)] max-h-[90dvh] flex flex-col bg-white rounded-xl p-6 sm:p-8 overflow-hidden">
            <header className="mb-8 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={!canGoBack}
                    aria-label="Voltar"
                    className="aspect-square bg-neutral-100 p-2 cursor-pointer text-neutral-600 rounded-full disabled:opacity-0 disabled:cursor-default"
                >
                    <ArrowLeftIcon size={20} weight="bold" />
                </button>
                <div className="relative flex-1 max-w-[300px] overflow-hidden h-2 bg-neutral-100 rounded-full">
                    <motion.span
                        initial={{ width: '0%' }}
                        animate={{
                            width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                        }}
                        transition={{ type: 'spring', bounce: 0 }}
                        className="absolute h-2 bg-green-600 rounded-full"
                    />
                </div>
                <span className="w-9" />
            </header>

            {error && (
                <div
                    role="alert"
                    className="bg-red-50 p-4 rounded-lg mb-4 text-red-600 font-semibold flex gap-2 items-start"
                >
                    <WarningIcon
                        size={18}
                        weight="bold"
                        className="mt-0.5 shrink-0"
                    />
                    <span>
                        {error}{' '}
                        {currentStep === STEPS.email &&
                            error === REGISTER_ERROR_MESSAGES.EMAIL_IN_USE && (
                                <Link href="/auth/login" className="underline">
                                    Entrar
                                </Link>
                            )}
                    </span>
                </div>
            )}

            <form
                id="signup-step"
                onSubmit={handleContinue}
                className="flex-1 flex flex-col overflow-hidden"
            >
                {currentStep === STEPS.name && (
                    <div className="flex-1">
                        <Heading>
                            Oi, vizinho!
                            <br /> Qual é o seu nome?
                        </Heading>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                fullWidth
                                autoFocus
                                type="text"
                                autoComplete="given-name"
                                placeholder="Primeiro nome"
                                maxLength={50}
                                value={userInfo.firstName}
                                onChange={(e) =>
                                    setUserInfo({
                                        ...userInfo,
                                        firstName: e.target.value,
                                    })
                                }
                            />
                            <Input
                                fullWidth
                                type="text"
                                autoComplete="family-name"
                                placeholder="Sobrenome"
                                maxLength={50}
                                value={userInfo.lastName}
                                onChange={(e) =>
                                    setUserInfo({
                                        ...userInfo,
                                        lastName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <p className="text-neutral-500 text-sm mt-6">
                            Já tem uma conta?{' '}
                            <Link
                                href="/auth/login"
                                className="text-green-600 font-semibold"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>
                )}

                {currentStep === STEPS.email && (
                    <div className="flex-1">
                        <Heading>Qual é o seu e-mail?</Heading>
                        <div className="mt-8">
                            <Input
                                fullWidth
                                autoFocus
                                type="email"
                                autoComplete="email"
                                inputMode="email"
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

                {currentStep === STEPS.password && (
                    <div className="flex-1">
                        <Heading>Crie uma senha</Heading>
                        <p className="text-neutral-500 text-sm">
                            Use pelo menos 8 caracteres, com letras e números.
                        </p>
                        <div className="mt-8 flex flex-col gap-4">
                            <Input
                                fullWidth
                                autoFocus
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Insira sua senha"
                                value={userInfo.password}
                                button={
                                    showPassword ? (
                                        <EyeSlashIcon weight="bold" />
                                    ) : (
                                        <EyeIcon weight="bold" />
                                    )
                                }
                                onButtonClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                onChange={(e) =>
                                    setUserInfo({
                                        ...userInfo,
                                        password: e.target.value,
                                    })
                                }
                            />
                            <Input
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
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
                        <p className="text-neutral-500 text-xs mt-6">
                            Ao continuar, você concorda em seguir as regras de
                            convivência do Neybor.
                        </p>
                    </div>
                )}

                {currentStep === STEPS.creating && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="mb-8" role="status">
                            <Spinner size="xl" />
                        </div>
                        <Heading textAlign="center">
                            Um instante, estamos criando sua conta...
                        </Heading>
                    </div>
                )}

                {currentStep === STEPS.address && (
                    <AddressStep
                        firstName={
                            userInfo.firstName || session?.user?.displayName
                        }
                        token={token}
                        onDone={() => goTo(STEPS.phone)}
                    />
                )}

                {currentStep === STEPS.phone && (
                    <div className="flex-1">
                        <Heading>Qual é o seu telefone?</Heading>
                        <Input
                            fullWidth
                            autoFocus
                            type="tel"
                            autoComplete="tel-national"
                            inputMode="tel"
                            placeholder="(11) 91234-5678"
                            icon={DeviceMobileCameraIcon}
                            maxLength={15}
                            value={formatPhone(userInfo.phoneNumber)}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    phoneNumber: e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 11),
                                })
                            }
                        />
                        <div className="flex items-start gap-1 mt-3 font-medium text-neutral-500">
                            <ShieldCheckIcon
                                className="w-10 shrink-0"
                                weight="bold"
                                size={16}
                            />
                            <p className="text-sm">
                                Seu telefone fica privado. Ele ajuda a proteger
                                sua conta e é necessário se você quiser oferecer
                                serviços na vizinhança.
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === STEPS.directives && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Heading>
                            Mais uma coisa! Vamos fazer nossa parte para manter
                            o Neybor seguro e divertido.
                        </Heading>
                        <div className="mt-4 overflow-auto flex-1">
                            {NEYBOR_DIRECTIVES.map((directive) => (
                                <div
                                    key={directive.title}
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
                    </div>
                )}
            </form>

            <footer className="mt-8 flex gap-4 justify-end">
                {currentStep === STEPS.phone && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => goTo(STEPS.directives)}
                    >
                        Pular
                    </Button>
                )}
                {currentStep <= STEPS.password && (
                    <Button
                        form="signup-step"
                        type="submit"
                        icon={ArrowRightIcon}
                    >
                        {currentStep === STEPS.password
                            ? 'Criar conta'
                            : 'Continuar'}
                    </Button>
                )}
                {currentStep === STEPS.phone && (
                    <Button
                        form="signup-step"
                        type="submit"
                        icon={ArrowRightIcon}
                        disabled={isSubmitting}
                        activityIndicator={isSubmitting}
                    >
                        Continuar
                    </Button>
                )}
                {currentStep === STEPS.directives && (
                    <Button
                        type="button"
                        fullWidth
                        onClick={() => router.replace('/feed')}
                    >
                        Concordo, explorar minha vizinhança
                    </Button>
                )}
            </footer>
        </section>
    )
}

const PinMap = dynamic(() => import('@/components/auth/pin-map'), {
    ssr: false,
    loading: () => <div className="h-[220px] rounded-lg bg-neutral-100" />,
})

const HAS_MAP = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)

type AddressFields = {
    zipCode: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
}

const EMPTY_ADDRESS: AddressFields = {
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
}

function AddressStep({
    firstName,
    token,
    onDone,
}: {
    firstName?: string
    token?: string
    onDone: () => void
}) {
    const [cep, setCep] = useState('')
    const [address, setAddress] = useState<AddressFields | null>(null)
    const [point, setPoint] = useState<LatLng | null>(null)
    const [pointIsPrecise, setPointIsPrecise] = useState(false)
    const [device, setDevice] = useState<LatLng | null>(null)
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function searchCep(event?: FormEvent) {
        event?.preventDefault()
        if (onlyDigits(cep).length !== 8) {
            setError('O CEP tem 8 números.')
            return
        }
        setError(null)
        setIsLookingUp(true)
        try {
            const found = await lookupCep(cep)
            if (!found) {
                setError('Não encontramos esse CEP. Confira os números.')
                return
            }
            setAddress({ ...EMPTY_ADDRESS, ...found })
            // o GPS, se já veio, vale mais que o ponto aproximado do endereço
            if (!device) {
                const approx = await approximatePoint(found)
                if (approx) {
                    setPoint(approx.point)
                    setPointIsPrecise(approx.precise)
                }
            }
        } catch {
            setError(
                'Não conseguimos consultar o CEP agora. Preencha o endereço abaixo.',
            )
            setAddress({ ...EMPTY_ADDRESS, zipCode: onlyDigits(cep) })
        } finally {
            setIsLookingUp(false)
        }
    }

    async function useMyLocation() {
        setError(null)
        setIsLocating(true)
        try {
            const position = await getDevicePosition()
            const here = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }
            setDevice(here)
            setPoint(here)
            setPointIsPrecise(true)
            if (!address) setAddress({ ...EMPTY_ADDRESS })
        } catch (e) {
            const denied =
                typeof GeolocationPositionError !== 'undefined' &&
                e instanceof GeolocationPositionError &&
                e.code === e.PERMISSION_DENIED
            setError(
                denied
                    ? 'Você não permitiu o acesso à localização. Use o CEP ou libere a permissão no navegador.'
                    : 'Não conseguimos pegar sua localização. Use o CEP.',
            )
        } finally {
            setIsLocating(false)
        }
    }

    async function save() {
        if (!address) return
        if (!address.neighborhood.trim() || !address.city.trim()) {
            setError('Informe o bairro e a cidade.')
            return
        }
        if (!point) {
            setError(
                HAS_MAP
                    ? 'Toque no mapa para marcar onde fica sua casa.'
                    : 'Use sua localização atual para marcar onde fica sua casa.',
            )
            return
        }

        setIsSaving(true)
        setError(null)

        // Se a pessoa não usou o GPS, tentamos a posição do aparelho só como
        // prova de que está lá; recusar não impede o cadastro.
        let proof = device
        if (!proof) {
            try {
                const position = await getDevicePosition()
                proof = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }
            } catch {
                // segue sem verificação
            }
        }

        try {
            await axios.put(
                `${API_URL}/profile/me/location`,
                {
                    street: address.street.trim() || undefined,
                    number: address.number.trim() || undefined,
                    neighborhood: address.neighborhood.trim(),
                    city: address.city.trim(),
                    zipCode: address.zipCode || undefined,
                    latitude: point.latitude,
                    longitude: point.longitude,
                    deviceLatitude: proof?.latitude,
                    deviceLongitude: proof?.longitude,
                },
                { headers: { Authorization: `Bearer ${token}` } },
            )
            onDone()
        } catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : null
            setError(
                status === 400
                    ? 'Por enquanto o Neybor só funciona no Brasil. Confira o endereço.'
                    : 'Não conseguimos salvar seu endereço. Tente de novo.',
            )
        } finally {
            setIsSaving(false)
        }
    }

    const update = (field: keyof AddressFields) => (value: string) =>
        setAddress((current) => ({
            ...(current ?? EMPTY_ADDRESS),
            [field]: value,
        }))

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <Heading>
                {firstName
                    ? `Tudo certo, ${firstName.split(' ')[0]}! `
                    : 'Tudo certo! '}
                Agora vamos encontrar sua vizinhança.
            </Heading>

            {error && (
                <div
                    role="alert"
                    className="bg-red-50 p-3 rounded-lg mb-4 text-red-600 text-sm font-semibold"
                >
                    {error}
                </div>
            )}

            <div className="flex gap-2 items-start">
                <div className="flex-1">
                    <Input
                        fullWidth
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="CEP"
                        value={formatCep(cep)}
                        onChange={(e) =>
                            setCep(onlyDigits(e.target.value).slice(0, 8))
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                void searchCep()
                            }
                        }}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void searchCep()}
                    disabled={isLookingUp}
                    activityIndicator={isLookingUp}
                >
                    Buscar
                </Button>
            </div>

            <div className="mt-3">
                <Button
                    type="button"
                    variant="bordered"
                    iconPlacement="leading"
                    icon={NavigationArrowIcon}
                    onClick={useMyLocation}
                    disabled={isLocating}
                    activityIndicator={isLocating}
                >
                    {device
                        ? 'Localização atualizada'
                        : 'Usar minha localização atual'}
                </Button>
            </div>

            {address && (
                <div className="mt-4 flex flex-col gap-2">
                    <div className="grid grid-cols-[1fr_96px] gap-2">
                        <Input
                            fullWidth
                            placeholder="Rua"
                            autoComplete="address-line1"
                            value={address.street}
                            onChange={(e) => update('street')(e.target.value)}
                        />
                        <Input
                            fullWidth
                            placeholder="Número"
                            inputMode="numeric"
                            maxLength={20}
                            value={address.number}
                            onChange={(e) => update('number')(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_72px] gap-2">
                        <Input
                            fullWidth
                            placeholder="Bairro"
                            value={address.neighborhood}
                            onChange={(e) =>
                                update('neighborhood')(e.target.value)
                            }
                        />
                        <Input
                            fullWidth
                            placeholder="Cidade"
                            autoComplete="address-level2"
                            value={address.city}
                            onChange={(e) => update('city')(e.target.value)}
                        />
                        <Input
                            fullWidth
                            placeholder="UF"
                            maxLength={2}
                            value={address.state}
                            onChange={(e) =>
                                update('state')(e.target.value.toUpperCase())
                            }
                        />
                    </div>

                    {HAS_MAP && point && (
                        <div className="mt-2">
                            <p className="text-sm text-neutral-600 font-medium mb-2 flex items-center gap-1">
                                <MapPinIcon size={16} weight="bold" />
                                {pointIsPrecise
                                    ? 'Confira o pino: arraste ou toque no mapa se não for a sua casa.'
                                    : 'Mostramos a região do seu bairro. Toque no mapa onde fica sua casa.'}
                            </p>
                            <PinMap
                                point={point}
                                zoom={pointIsPrecise ? 16 : 14}
                                onChange={(next) => {
                                    setPoint(next)
                                    setPointIsPrecise(true)
                                }}
                            />
                            <p className="text-[11px] text-neutral-400 mt-1">
                                Endereços: ViaCEP e © OpenStreetMap
                            </p>
                        </div>
                    )}

                    <Button
                        type="button"
                        fullWidth
                        onClick={save}
                        disabled={isSaving}
                        activityIndicator={isSaving}
                    >
                        Confirmar endereço
                    </Button>
                </div>
            )}

            <div className="flex items-start gap-1 mt-4 font-medium text-neutral-500">
                <ShieldCheckIcon
                    className="w-10 shrink-0"
                    weight="bold"
                    size={16}
                />
                <p className="text-sm">
                    Seu endereço fica privado. Ele é usado para mostrar o que
                    acontece perto de você e confirmar que você é da vizinhança.
                    Vizinhos só veem seu bairro.
                </p>
            </div>

            <button
                type="button"
                onClick={onDone}
                className="mt-auto pt-6 text-sm text-neutral-500 underline cursor-pointer self-start"
            >
                Fazer isso depois
            </button>
        </div>
    )
}
