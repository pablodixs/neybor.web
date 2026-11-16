'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import axios from 'axios'
import { PaperPlaneRightIcon, ShieldWarningIcon, WarningIcon } from '@phosphor-icons/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/button'
import { fetcherWithToken } from '@/lib/swr'
import { ChatMessage, Conversation } from '@/interfaces/marketplace'
import { authHeaders, feiraError } from '@/components/marketplace/errors'
import { API_URL } from '@/components/marketplace/use-marketplace'

const POLL_MS = 5000

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const token = session?.user.token
    const me = session?.user.profileId

    const { data: conversations } = useSWR<Conversation[]>(
        token ? [`${API_URL}/conversations`, token] : null,
        fetcherWithToken,
    )
    const conversation = conversations?.find((c) => String(c.id) === id)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const lastId = useRef(0)
    const bottom = useRef<HTMLDivElement>(null)

    const poll = useCallback(async () => {
        if (!token || document.hidden) return
        try {
            const { data } = await axios.get<ChatMessage[]>(
                `${API_URL}/conversations/${id}/messages?after=${lastId.current}`,
                authHeaders(token),
            )
            if (data.length > 0) {
                lastId.current = data[data.length - 1].id
                setMessages((current) => [...current, ...data.filter((m) => !current.some((c) => c.id === m.id))])
            }
        } catch {
            // próxima tentativa acontece sozinha
        }
    }, [id, token])

    useEffect(() => {
        poll()
        const timer = setInterval(poll, POLL_MS)
        const onVisible = () => !document.hidden && poll()
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [poll])

    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages.length])

    async function send() {
        const body = text.trim()
        if (!body) return
        setSending(true)
        setError(null)
        try {
            const { data } = await axios.post<ChatMessage>(
                `${API_URL}/conversations/${id}/messages`,
                { body },
                authHeaders(token),
            )
            lastId.current = Math.max(lastId.current, data.id)
            setMessages((current) => (current.some((m) => m.id === data.id) ? current : [...current, data]))
            setText('')
        } catch (e) {
            setError(feiraError(e, 'Não foi possível enviar a mensagem.', 'chat'))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-4 border border-neutral-100 rounded-2xl bg-white flex flex-col min-h-[70vh]">
            <Navigation title={conversation?.otherDisplayName ?? 'Conversa'} />
            {conversation && (
                <Link
                    href={`/feira/${conversation.listingId}`}
                    className="text-sm text-green-700 font-semibold underline mb-2 truncate"
                >
                    Anúncio: {conversation.listingTitle}
                </Link>
            )}
            <div className="flex gap-2 p-3 rounded-2xl bg-green-50 text-green-900 text-sm mb-3">
                <ShieldWarningIcon weight="bold" size={20} className="shrink-0" />
                <p>
                    Pague só na entrega, olhando o item. Nunca envie sinal, Pix antecipado ou códigos recebidos por SMS.
                </p>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {messages.map((m) => {
                    const mine = m.senderId === me
                    return (
                        <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                            <p
                                className={`max-w-[80%] px-3 py-2 rounded-2xl whitespace-pre-wrap wrap-break-word ${mine ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-800'}`}
                            >
                                {m.body}
                            </p>
                            {m.warning && (
                                <p className="max-w-[80%] mt-1 flex gap-1 text-xs text-red-600 font-semibold">
                                    <WarningIcon weight="bold" className="shrink-0 mt-0.5" />
                                    Cuidado: parece um golpe comum. Pague só na entrega e nunca passe códigos.
                                </p>
                            )}
                        </div>
                    )
                })}
                <div ref={bottom} />
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <form
                className="flex gap-2 mt-3"
                onSubmit={(e) => {
                    e.preventDefault()
                    send()
                }}
            >
                <input
                    value={text}
                    maxLength={2000}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escreva uma mensagem"
                    className="flex-1 px-4 py-3 border-2 border-neutral-100 rounded-full font-medium outline-transparent focus:outline-green-600"
                />
                <Button type="submit" icon={PaperPlaneRightIcon} aria-label="Enviar" disabled={!text.trim()} activityIndicator={sending} />
            </form>
        </div>
    )
}
