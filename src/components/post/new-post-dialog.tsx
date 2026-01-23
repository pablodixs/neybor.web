'use client'

import {
    MapPinIcon,
    ImageIcon,
    AtIcon,
    ShoppingCartIcon,
    ChartBarHorizontalIcon,
    XIcon,
    WarningIcon,
    CalendarDotsIcon,
    GlobeIcon,
    CityIcon,
    ArrowLeftIcon,
    InfoIcon,
    DiamondsFourIcon,
    EyeIcon,
    MagnifyingGlassIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { motion } from 'motion/react'

import { CircularProgressIndicator } from '../circular-progress-indicator'
import { Button } from '../button'
import axios from 'axios'

interface NewPostDialogProps {
    isOpen: boolean
    onClose: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function NewPostDialog({ isOpen, onClose }: NewPostDialogProps) {
    const [postContent, setPostContent] = useState('')
    const [postVisibility, setPostVisibility] = useState('PUBLIC')

    const [isPostSending, setIsPostSending] = useState(false)
    const [currentStep, setCurrentStep] = useState('draft')

    const { data } = useSession()

    function handleSendPost() {
        setIsPostSending(true)

        axios
            .post(
                `${API_URL}/post`,
                {
                    content: postContent,
                    type: 'GENERAL',
                    visibility: postVisibility,
                },
                {
                    headers: {
                        Authorization: `Bearer ${data?.user.token}`,
                    },
                },
            )
            .then(() => {
                onClose()
            })
            .catch(() => {})
            .finally(() => {
                setIsPostSending(false)
            })
    }

    return (
        <>
            <motion.dialog
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                    isOpen
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.95 }
                }
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
                open={isOpen}
                className="z-50 top-20 mx-auto p-4 bg-white rounded-2xl max-w-2xl w-full"
            >
                <header className="flex items-center justify-between">
                    <h1 className="font-semibold text-neutral-800 tracking-tight text-2xl">
                        Novo Post
                    </h1>
                    <button
                        className="p-2 rounded-full text-neutral-700 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-lg transition"
                        onClick={onClose}
                    >
                        <XIcon weight="bold" />
                    </button>
                </header>
                {currentStep === 'draft' && (
                    <>
                        <section className="py-4">
                            <div className="flex gap-2 items-center">
                                <Image
                                    className="rounded-full aspect-square object-cover w-9 h-9 mb-1"
                                    src={
                                        data?.user.avatarUrl ||
                                        '/images/default-avatar.png'
                                    }
                                    alt={
                                        data?.user.displayName || 'User avatar'
                                    }
                                    width={36}
                                    height={36}
                                />
                                <div className="flex flex-col gap-2">
                                    <strong className="flex font-semibold leading-3 items-center gap-1">
                                        {data?.user.displayName}
                                    </strong>
                                </div>
                            </div>
                            <textarea
                                onChange={(e) => setPostContent(e.target.value)}
                                value={postContent}
                                autoFocus
                                placeholder="O que está acontecendo?"
                                className="text-xl font-medium w-full rounded-xl resize-none outline-0 pl-11 field-sizing-content"
                                rows={4}
                            />
                            {postContent.length > 300 && (
                                <p className="ml-2 mt-2 text-red-700 font-semibold text-sm flex gap-2 items-center">
                                    <WarningIcon weight="bold" size={18} />{' '}
                                    Limite de 300 caracteres excedido.
                                </p>
                            )}
                        </section>
                        <section className="mt-2 mb-4 flex gap-2">
                            <Button
                                variant="secondary"
                                iconPlacement="leading"
                                icon={ShoppingCartIcon}
                            >
                                Anunciar um item
                            </Button>
                            <Button
                                variant="secondary"
                                iconPlacement="leading"
                                icon={CalendarDotsIcon}
                            >
                                Evento
                            </Button>
                            <Button
                                variant="secondary"
                                iconPlacement="leading"
                                icon={ChartBarHorizontalIcon}
                            >
                                Enquete
                            </Button>
                            <Button
                                variant="secondary"
                                iconPlacement="leading"
                                icon={MagnifyingGlassIcon}
                            >
                                Recomendação
                            </Button>
                        </section>
                        <section className="flex justify-between">
                            <div className="flex gap-2 fle-1 items-center">
                                <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                    <MapPinIcon weight="bold" />
                                </button>
                                <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                    <ImageIcon weight="bold" />
                                </button>
                                <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                    <AtIcon weight="bold" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <CircularProgressIndicator
                                    size={26}
                                    value={(postContent.length / 300) * 100}
                                />
                                <Button
                                    disabled={
                                        postContent.length < 2 ||
                                        postContent.length > 300
                                    }
                                    onClick={() =>
                                        setCurrentStep('post-visibility')
                                    }
                                >
                                    Próximo
                                </Button>
                            </div>
                        </section>
                    </>
                )}
                {currentStep === 'post-visibility' && (
                    <div className="flex flex-col items-center justify-center pt-8">
                        <EyeIcon size={48} className="text-neutral-800" />
                        <p className="font-semibold text-xl text-neutral-800 text-center">
                            Escolha onde seu post será visível:
                        </p>
                        <div className="mt-6 flex gap-4 w-full items-center justify-center">
                            <button
                                data-selected={postVisibility === 'PUBLIC'}
                                onClick={() => setPostVisibility('PUBLIC')}
                                className="cursor-pointer text-neutral-800 px-4 py-2 border-2 border-neutral-100 rounded-full flex items-center gap-2 font-semibold hover:border-green-600 hover:text-green-600 transition data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:border-green-600"
                            >
                                <GlobeIcon size={20} weight="bold" /> Público
                            </button>
                            <button
                                onClick={() =>
                                    setPostVisibility('NEAR_NEIGHBORHOODS')
                                }
                                data-selected={
                                    postVisibility === 'NEAR_NEIGHBORHOODS'
                                }
                                className="cursor-pointer text-neutral-800 px-4 py-2 border-2 border-neutral-100 rounded-full flex items-center gap-2 font-semibold hover:border-green-600 hover:text-green-600 transition data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:border-green-600"
                            >
                                <DiamondsFourIcon size={20} weight="bold" />{' '}
                                Vizinhanças próximas
                            </button>
                            <button
                                data-selected={
                                    postVisibility === 'NEIGHBORHOOD'
                                }
                                onClick={() =>
                                    setPostVisibility('NEIGHBORHOOD')
                                }
                                className="cursor-pointer text-neutral-800 px-4 py-2 border-2 border-neutral-100 rounded-full flex items-center gap-2 font-semibold hover:border-green-600 hover:text-green-600 transition data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:border-green-600"
                            >
                                <CityIcon size={20} weight="bold" /> Vizinhança
                            </button>
                        </div>
                        <div className="mt-4 text-center text-neutral-600 font-semibold">
                            <p className="flex items-center justify-center gap-2">
                                <InfoIcon size={20} weight="bold" />
                                {postVisibility === 'PUBLIC' &&
                                    'Seu post será visível para todos os usuários do Neybor.'}
                                {postVisibility === 'NEIGHBORHOOD' &&
                                    'Seu post será visível apenas para usuários em sua vizinhança.'}
                                {postVisibility === 'NEAR_NEIGHBORHOODS' &&
                                    'Seu post será visível apenas para usuários em vizinhanças próximas.'}
                            </p>
                        </div>
                        <footer className="mt-8 flex justify-between w-full">
                            <Button
                                onClick={() => setCurrentStep('draft')}
                                iconPlacement="leading"
                                icon={ArrowLeftIcon}
                                variant="secondary"
                            >
                                Voltar
                            </Button>
                            <Button
                                activityIndicator={isPostSending}
                                onClick={handleSendPost}
                                disabled={isPostSending}
                            >
                                {isPostSending ? 'Postando...' : 'Postar'}
                            </Button>
                        </footer>
                    </div>
                )}
            </motion.dialog>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="z-40 absolute bg-black opacity-50 inset-0"
                />
            )}
        </>
    )
}
