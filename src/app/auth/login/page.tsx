'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import { WarningIcon } from '@phosphor-icons/react/dist/ssr'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const ERROR_MESSAGES: Record<string, string> = {
    'Please check the provided fields.':
        'Por favor, verifique os campos fornecidos',
    'Invalid email or password': 'E-mail ou senha incorretos',
}

export default function Page() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [authCredentials, setAuthCredentials] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        const result = await signIn('credentials', {
            redirect: false,
            username: authCredentials.email,
            password: authCredentials.password,
        })

        if (result?.error) {
            setError(
                ERROR_MESSAGES[result.error] || 'Houve um erro inesperado.',
            )
            return
        }

        router.push('/feed')
    }

    return (
        <section className="max-w-[500px] w-full bg-white rounded-xl p-8">
            <h1 className="font-semibold text-neutral-800 tracking-tight text-2xl mb-4">
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
                <Button fullWidth type="submit">
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
