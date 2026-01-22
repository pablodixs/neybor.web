'use client'

import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { useUserAccount } from '@/hooks/save-credentials'
import { WarningIcon } from '@phosphor-icons/react/dist/ssr'
import axios from 'axios'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

const ERROR_MESSAGES: Record<string, string> = {
    'Please check the provided fields.':
        'Por favor, verifique os campos fornecidos',
    'Invalid email or password': 'E-mail ou senha incorretos',
}

export default function Page() {
    const [authCredentials, setAuthCredentials] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState<keyof typeof ERROR_MESSAGES | null>(null)
    const { setUserAccount, userAccount } = useUserAccount()

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        axios
            .post('https://neybor-8pb8m.ondigitalocean.app/auth/login', {
                email: authCredentials.email,
                password: authCredentials.password,
            })
            .then((response) => {
                setUserAccount(response.data)
            })
            .catch((error) => {
                setError(ERROR_MESSAGES[error.response?.data?.message] || null)
            })
    }

    if (userAccount) {
        return (
            <section className="max-w-[500px] w-full bg-white rounded-xl p-8">
                <h1 className="font-semibold text-neutral-800 tracking-tight text-2xl mb-4">
                    Tudo certo!
                </h1>
                <Link href={'/feed'}>Ir para o feed</Link>
            </section>
        )
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
                    data-valid={error ? 'false' : 'true'}
                    type="password"
                    placeholder="Senha"
                    value={authCredentials.password}
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
                <Button type="submit">Entrar</Button>
            </form>
            <div className="flex gap-8 justify-center mt-8">
                <Button variant="secondary">Continuar com o Google</Button>
                <Button variant="secondary">Continuar com a Apple</Button>
            </div>
        </section>
    )
}
