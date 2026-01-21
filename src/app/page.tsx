import Link from 'next/link'

export default function Home() {
    return (
        <>
            <header className="mx-auto px-8 py-8 flex items-center justify-between">
                <h1 className="text-green-600 font-semibold text-2xl">
                    Neybor
                </h1>
                <div className="flex gap-4 items-center">
                    <Link
                        className="px-4 py-2 cursor-pointer bg-neutral-100  rounded-full font-semibold"
                        href={'/auth/login'}
                    >
                        Entrar
                    </Link>
                    <Link
                        className="px-4 py-2 cursor-pointer bg-green-500 rounded-full font-semibold"
                        href={'/auth/signin'}
                    >
                        Criar uma conta
                    </Link>
                </div>
            </header>
            <section className="mx-8 p-8 rounded-3xl bg-center bg-[url('https://images.unsplash.com/photo-1760019736826-266c0f673d21?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] h-[80dvh] flex items-end justify-between">
                <h2 className="text-6xl text-shadow-lg text-white mb-4 font-semibold tracking-tight leading-tight text-balance">
                    Conecte-se com <br /> quem está ao seu lado
                </h2>
                <div className="bg-white p-8 rounded-2xl w-[500px] max-w-full shadow-lg text-center">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2 justify-between">
                            <button className="px-4 py-3 cursor-pointer bg-neutral-100 rounded-full font-semibold hover:bg-neutral-200 transition">
                                Continuar com o Google
                            </button>
                            <button className="px-4 py-3 cursor-pointer bg-neutral-100 rounded-full font-semibold hover:bg-neutral-200 transition">
                                Continuar com a Apple
                            </button>
                        </div>
                        <span>ou</span>
                        <input
                            className="px-4 py-3 border-2 border-neutral-100 outline-transparent focus:outline-neutral-200 transition-all font-semibold rounded-lg"
                            type="email"
                            placeholder="Endereço de e-mail"
                        />
                        <input
                            className="px-4 py-3 border-2 border-neutral-100 outline-transparent focus:outline-neutral-200 transition-all font-semibold rounded-lg"
                            type="password"
                            placeholder="Senha"
                        />
                        <button className="px-4 py-3 cursor-pointer bg-green-500 rounded-full font-semibold hover:bg-green-600 transition">
                            Continuar
                        </button>
                        <p className="text-neutral-500 text-sm">
                            Ao continuar, você concorda com os nossos Termos de
                            Uso, Política de Cookies e Política de Privacidade.
                        </p>
                        <button className="text-sm mt-4 flex items-center justify-center gap-2 text-green-600 cursor-pointer hover:underline">
                            Tem um código de convite?
                        </button>
                    </div>
                </div>
            </section>
            <section className="max-w-[1000px] mx-auto py-30">
                <p className="font-semibold mb-8 text-center text-4xl tracking-tight leading-tight text-pretty">
                    O Neybor facilita a troca de serviços, o comércio local e a
                    comunicação entre vizinhos. Tudo em um só lugar, de forma
                    segura e intuitiva.
                </p>
            </section>
            <footer className="max-w-[1000px] mx-auto py-4 text-sm text-neutral-500 border-t border-t-neutral-200">
                <p>&copy; 2026 Scriptles</p>
            </footer>
        </>
    )
}
