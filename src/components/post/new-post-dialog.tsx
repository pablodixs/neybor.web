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
    EyeIcon,
    MagnifyingGlassIcon,
    HouseLineIcon,
    CaretRightIcon,
    CaretLeftIcon,
} from '@phosphor-icons/react'
import { Dispatch, SetStateAction, useState, useRef, MouseEvent } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { motion } from 'motion/react'

import { CircularProgressIndicator } from '../circular-progress-indicator'
import { Button } from '../button'
import axios from 'axios'
import { Tooltip } from '../tooltip'
import { AlertLabel } from './post-type-labels/alert-label'
import { RecomendationsLabel } from './post-type-labels/recomendations-label'

interface NewPostDialogProps {
    isOpen: boolean
    onClose: () => void
}

enum PostType {
    SAFETY_ALERT,
    MARKETPLACE,
    RECOMMENDATION,
    GENERAL,
    POOL,
    EVENT,
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function NewPostDialog({ isOpen, onClose }: NewPostDialogProps) {
    const [postContent, setPostContent] = useState('')
    const [postVisibility, setPostVisibility] = useState('PUBLIC')
    const [postType, setPostType] = useState<PostType>(PostType.GENERAL)

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
                    type: PostType[postType],
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
                            <section className="pl-11">
                                {postType === PostType.RECOMMENDATION && (
                                    <RecomendationsLabel />
                                )}
                                <textarea
                                    onChange={(e) =>
                                        setPostContent(e.target.value)
                                    }
                                    value={postContent}
                                    autoFocus
                                    placeholder="O que está acontecendo?"
                                    className="text-xl font-medium w-full resize-none outline-0 field-sizing-content"
                                    rows={4}
                                />
                                {postType === PostType.SAFETY_ALERT && (
                                    <AlertLabel />
                                )}
                            </section>
                            {postContent.length > 300 && (
                                <p className="ml-2 mt-2 text-red-700 font-semibold text-sm flex gap-2 items-center">
                                    <WarningIcon weight="bold" size={18} />{' '}
                                    Limite de 300 caracteres excedido.
                                </p>
                            )}
                        </section>
                        <PostTypeOptions
                            onTypeSelectChange={setPostType}
                            typeSelected={postType}
                        />
                        <section className="flex justify-between">
                            <div className="flex gap-2 fle-1 items-center">
                                <Tooltip content="Adicionar localização">
                                    <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                        <MapPinIcon weight="bold" />
                                    </button>
                                </Tooltip>
                                <Tooltip content="Adicionar mídia">
                                    <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                        <ImageIcon weight="bold" />
                                    </button>
                                </Tooltip>
                                <Tooltip content="Marcar pessoas">
                                    <button className="aspect-square p-3 text-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 rounded-full cursor-pointer">
                                        <AtIcon weight="bold" />
                                    </button>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-4">
                                <Tooltip
                                    content={`${postContent.length}/300 caracteres`}
                                >
                                    <CircularProgressIndicator
                                        size={26}
                                        value={(postContent.length / 300) * 100}
                                    />
                                </Tooltip>
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
                                <CityIcon size={20} weight="bold" /> Vizinhanças
                                próximas
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
                                <HouseLineIcon size={20} weight="bold" />{' '}
                                Vizinhança
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

const POST_TYPE_OPTIONS = [
    {
        type: PostType.SAFETY_ALERT,
        label: 'Alerta',
        icon: WarningIcon,
        styles: 'hover:text-orange-600 hover:outline-orange-600 data-[selected=true]:bg-orange-600 data-[selected=true]:text-white data-[selected=true]:outline-orange-600 ',
    },
    {
        type: PostType.MARKETPLACE,
        label: 'Anunciar um item',
        icon: ShoppingCartIcon,
        styles: 'hover:text-green-600 hover:outline-green-600 data-[selected=true]:bg-green-600 data-[selected=true]:text-white data-[selected=true]:outline-green-600 ',
    },
    {
        type: PostType.RECOMMENDATION,
        label: 'Recomendação',
        icon: MagnifyingGlassIcon,
        styles: 'hover:text-purple-600 hover:outline-purple-600 data-[selected=true]:bg-purple-600 data-[selected=true]:text-white data-[selected=true]:outline-purple-600 ',
    },
    {
        type: PostType.EVENT,
        label: 'Evento',
        icon: CalendarDotsIcon,
        styles: 'hover:text-rose-600 hover:outline-rose-600 data-[selected=true]:bg-rose-600 data-[selected=true]:text-white data-[selected=true]:outline-rose-600 ',
    },
    {
        type: PostType.POOL,
        label: 'Enquete',
        icon: ChartBarHorizontalIcon,
        styles: 'hover:text-pink-600 hover:outline-pink-600 data-[selected=true]:bg-pink-600 data-[selected=true]:text-white data-[selected=true]:outline-pink-600 ',
    },
]

const PostTypeOptions = ({
    typeSelected,
    onTypeSelectChange,
}: {
    typeSelected: PostType
    onTypeSelectChange: Dispatch<SetStateAction<PostType>>
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isDraggingRef = useRef(false)
    const [isMouseDown, setIsMouseDown] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollContainerRef.current) return
        isDraggingRef.current = false
        setIsMouseDown(true)
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
        setScrollLeft(scrollContainerRef.current.scrollLeft)
    }

    const handleMouseLeave = () => {
        setIsMouseDown(false)
        isDraggingRef.current = false
    }

    const handleMouseUp = () => {
        setIsMouseDown(false)
        setTimeout(() => {
            isDraggingRef.current = false
        }, 0)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isMouseDown || !scrollContainerRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollContainerRef.current.offsetLeft
        const walk = (x - startX) * 2
        if (Math.abs(x - startX) > 5) {
            isDraggingRef.current = true
        }
        scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -200 : 200,
                behavior: 'smooth',
            })
        }
    }

    return (
        <div className="relative group mt-4 mb-4 flex items-center">
            <button
                onClick={() => scroll('left')}
                className="cursor-pointer absolute left-0 z-10 p-1.5 rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white -ml-2 hidden group-hover:block transition-all hover:scale-110"
            >
                <CaretLeftIcon size={16} weight="bold" />
            </button>
            <section
                ref={scrollContainerRef}
                className={`flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full px-1 py-1 pr-8 ${isMouseDown ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {POST_TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
                    <button
                        key={type}
                        onClick={() => {
                            if (!isDraggingRef.current) {
                                if (typeSelected === type) {
                                    onTypeSelectChange(PostType.GENERAL)
                                } else {
                                    onTypeSelectChange(type)
                                }
                            }
                        }}
                        data-selected={typeSelected === type}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full outline-2 text-nowrap select-none -outline-offset-2 outline-neutral-100 font-semibold transition ${POST_TYPE_OPTIONS.find((option) => option.type === type)?.styles}`}
                    >
                        <Icon className="text-lg" weight="bold" /> {label}
                    </button>
                ))}
            </section>
            <button
                onClick={() => scroll('right')}
                className="cursor-pointer absolute right-0 z-10 p-1.5 rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-white -mr-2 hidden group-hover:block transition-all hover:scale-110"
            >
                <CaretRightIcon size={16} weight="bold" />
            </button>
        </div>
    )
}
