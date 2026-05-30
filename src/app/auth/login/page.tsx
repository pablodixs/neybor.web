'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { EyeIcon, EyeSlashIcon, WarningIcon } from '@phosphor-icons/react'

import { Button } from '@/components/button'
import { Input } from '@/components/input'

const ERROR_MESSAGES: Record<string, string> = {
    'Please check the provided fields.':
        'Por favor, verifique os campos fornecidos',
    'Invalid email or password': 'E-mail ou senha incorretos',
}

export default function Page() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const callbackUrl = searchParams.get('callbackUrl') || '/feed'

    const [showPassword, setShowPassword] = useState(false)
    const [authCredentials, setAuthCredentials] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setIsLoading(true)
        setError(null)

        const result = await signIn('credentials', {
            redirect: false,
            username: authCredentials.email,
            password: authCredentials.password,
            callbackUrl,
        })

        if (result?.error) {
            setError(
                ERROR_MESSAGES[result.error] || 'Houve um erro inesperado.',
            )
            setIsLoading(false)
            return
        }

        setIsLoading(false)
        router.replace(result?.url || callbackUrl)
    }

    return (
        <section className="max-w-[500px] w-full bg-white rounded-xl p-8">
            <svg
                width="27"
                height="32"
                viewBox="0 0 27 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M13.4649 16.7892C12.3716 16.7892 11.4696 17.0625 10.759 17.6092C10.0483 18.1285 9.52898 18.8255 9.20098 19.7002C8.87298 20.5475 8.70899 21.5041 8.70899 22.5701V32H2.88705V21.8731C2.88705 19.9052 3.26972 18.1148 4.03504 16.5022C4.8277 14.8622 6.00302 13.5639 7.561 12.6072C9.11898 11.6232 11.087 11.1313 13.4649 11.1313C15.8429 11.1313 17.8109 11.6232 19.3689 12.6072C20.9542 13.5639 22.1432 14.8485 22.9358 16.4612C23.7285 18.0738 24.1248 19.8778 24.1248 21.8731V32H18.3029V22.5701C18.3029 21.5315 18.1252 20.5748 17.7699 19.7002C17.4145 18.8255 16.8816 18.1285 16.1709 17.6092C15.4876 17.0625 14.5856 16.7892 13.4649 16.7892Z"
                    fill="#00A63E"
                />
                <path
                    d="M26.6916 7.70492L24.1291 12.1434L13.3454 5.91653L2.56247 12.1434L0 7.70492L13.3454 0L26.6916 7.70492Z"
                    fill="#00A63E"
                />
            </svg>
            <h1 className="font-semibold text-neutral-800 tracking-tight text-2xl my-4">
                Bem-vindo de volta, vizinho!
            </h1>
            {error && (
                <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-600 font-semibold flex gap-2 items-center">
                    <WarningIcon size={18} weight="bold" /> {String(error)}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    fullWidth
                    data-valid={error ? 'false' : 'true'}
                    type="email"
                    placeholder="Endereço de e-mail"
                    value={authCredentials.email}
                    onChange={(e) =>
                        setAuthCredentials({
                            ...authCredentials,
                            email: e.target.value,
                        })
                    }
                />
                <Input
                    fullWidth
                    data-valid={error ? 'false' : 'true'}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={authCredentials.password}
                    button={
                        showPassword ? (
                            <EyeSlashIcon weight="bold" />
                        ) : (
                            <EyeIcon weight="bold" />
                        )
                    }
                    onButtonClick={() => setShowPassword(!showPassword)}
                    onChange={(e) =>
                        setAuthCredentials({
                            ...authCredentials,
                            password: e.target.value,
                        })
                    }
                />
                <Link className="text-neutral-500" href="/auth/recovery">
                    Esqueceu a senha?
                </Link>
                <Button
                    disabled={isLoading}
                    activityIndicator={isLoading}
                    fullWidth
                    type="submit"
                >
                    Entrar
                </Button>
            </form>
            <div className="flex gap-8 justify-center mt-8">
                <Button variant="secondary">Continuar com o Google</Button>
                <Button variant="secondary">Continuar com a Apple</Button>
            </div>
        </section>
    )
}
