'use client'

import { motion } from 'motion/react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
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
    AddressSuggestion,
    getDevicePosition,
    isGeocodingAvailable,
    reverseGeocode,
    searchAddress,
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

type SelectedAddress = AddressSuggestion & {
    // posição do aparelho no momento da confirmação, usada como verificação básica
    deviceLatitude?: number
    deviceLongitude?: number
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

        const result = await signIn('register', {
            redirect: false,
            name: fullName,
            email: userInfo.email.trim(),
            password: userInfo.password,
        })

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

function AddressStep({
    firstName,
    token,
    onDone,
}: {
    firstName?: string
    token?: string
    onDone: () => void
}) {
    const geocodingAvailable = isGeocodingAvailable()

    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
    const [selected, setSelected] = useState<SelectedAddress | null>(null)
    const [number, setNumber] = useState('')
    const [manual, setManual] = useState({ neighborhood: '', city: '' })
    const [isLocating, setIsLocating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // busca com um pequeno atraso enquanto a pessoa digita
    useEffect(() => {
        if (selected || query.trim().length < 3) return
        const controller = new AbortController()
        const timeout = setTimeout(() => {
            searchAddress(query, controller.signal)
                .then(setSuggestions)
                .catch(() => {})
        }, 300)
        return () => {
            clearTimeout(timeout)
            controller.abort()
        }
    }, [query, selected])

    function choose(suggestion: SelectedAddress) {
        setSelected(suggestion)
        setNumber(suggestion.number || '')
        setSuggestions([])
        setError(null)
    }

    async function useMyLocation() {
        setError(null)
        setIsLocating(true)
        try {
            const position = await getDevicePosition()
            const { latitude, longitude } = position.coords
            const found = await reverseGeocode(latitude, longitude).catch(
                () => null,
            )

            choose({
                ...(found || {
                    id: 'device',
                    label: 'Minha localização atual',
                    secondary: '',
                }),
                // o ponto salvo é onde a pessoa está, não o centro da rua
                latitude,
                longitude,
                deviceLatitude: latitude,
                deviceLongitude: longitude,
            })
        } catch (e) {
            const denied =
                typeof GeolocationPositionError !== 'undefined' &&
                e instanceof GeolocationPositionError &&
                e.code === e.PERMISSION_DENIED
            setError(
                denied
                    ? 'Você não permitiu o acesso à localização. Digite seu endereço ou libere a permissão no navegador.'
                    : 'Não conseguimos pegar sua localização. Tente digitar o endereço.',
            )
        } finally {
            setIsLocating(false)
        }
    }

    async function save() {
        if (!selected) return
        const neighborhood = selected.neighborhood || manual.neighborhood.trim()
        const city = selected.city || manual.city.trim()
        if (!neighborhood || !city) {
            setError('Informe o bairro e a cidade.')
            return
        }

        setIsSaving(true)
        setError(null)

        // Se a pessoa digitou o endereço, tentamos a posição do aparelho só como
        // prova de que está lá; recusar não impede o cadastro.
        let deviceLatitude = selected.deviceLatitude
        let deviceLongitude = selected.deviceLongitude
        if (deviceLatitude == null) {
            try {
                const position = await getDevicePosition()
                deviceLatitude = position.coords.latitude
                deviceLongitude = position.coords.longitude
            } catch {
                // segue sem verificação
            }
        }

        try {
            await axios.put(
                `${API_URL}/profile/me/location`,
                {
                    street: selected.street,
                    number: number.trim() || undefined,
                    neighborhood,
                    city,
                    zipCode: selected.zipCode,
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                    deviceLatitude,
                    deviceLongitude,
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

    const visibleSuggestions =
        selected || query.trim().length < 3 ? [] : suggestions
    const needsManualFields =
        selected && (!selected.neighborhood || !selected.city)

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

            {!selected && (
                <>
                    {geocodingAvailable && (
                        <div className="relative">
                            <Input
                                fullWidth
                                autoFocus
                                type="text"
                                autoComplete="street-address"
                                placeholder="Digite sua rua e número"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {visibleSuggestions.length > 0 && (
                                <ul className="mt-2 border-2 border-neutral-100 rounded-lg divide-y divide-neutral-100">
                                    {visibleSuggestions.map((suggestion) => (
                                        <li key={suggestion.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    choose(suggestion)
                                                }
                                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 cursor-pointer flex gap-2 items-start"
                                            >
                                                <MapPinIcon
                                                    size={18}
                                                    weight="bold"
                                                    className="text-neutral-400 mt-0.5 shrink-0"
                                                />
                                                <span>
                                                    <span className="block font-semibold text-neutral-800">
                                                        {suggestion.label}
                                                    </span>
                                                    <span className="block text-sm text-neutral-500">
                                                        {suggestion.secondary}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="bordered"
                            iconPlacement="leading"
                            icon={NavigationArrowIcon}
                            onClick={useMyLocation}
                            disabled={isLocating}
                            activityIndicator={isLocating}
                        >
                            Usar minha localização atual
                        </Button>
                    </div>
                </>
            )}

            {selected && (
                <div className="flex flex-col gap-4">
                    <div className="border-2 border-green-600 rounded-lg p-4 flex gap-2 items-start">
                        <CheckCircleIcon
                            size={20}
                            weight="fill"
                            className="text-green-600 shrink-0 mt-0.5"
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-800">
                                {selected.label}
                            </p>
                            {selected.secondary && (
                                <p className="text-sm text-neutral-500">
                                    {selected.secondary}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelected(null)
                                setError(null)
                            }}
                            className="text-sm font-semibold text-green-600 cursor-pointer"
                        >
                            Alterar
                        </button>
                    </div>
                    {!selected.number && selected.street && (
                        <Input
                            fullWidth
                            type="text"
                            inputMode="numeric"
                            placeholder="Número (opcional)"
                            maxLength={20}
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    )}
                    {needsManualFields && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {!selected.neighborhood && (
                                <Input
                                    fullWidth
                                    placeholder="Bairro"
                                    value={manual.neighborhood}
                                    onChange={(e) =>
                                        setManual({
                                            ...manual,
                                            neighborhood: e.target.value,
                                        })
                                    }
                                />
                            )}
                            {!selected.city && (
                                <Input
                                    fullWidth
                                    placeholder="Cidade"
                                    value={manual.city}
                                    onChange={(e) =>
                                        setManual({
                                            ...manual,
                                            city: e.target.value,
                                        })
                                    }
                                />
                            )}
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
