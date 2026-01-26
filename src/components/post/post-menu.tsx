'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
    BookmarkSimpleIcon,
    DotsThreeIcon,
    ExportIcon,
    EyeIcon,
    MegaphoneIcon,
    TrashIcon,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Portal } from '../portal'
import { Button } from '../button'
import { Spinner } from '../spinner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface PostMenuProps {
    disabled?: boolean
    postId: number
    onPostDeleted?: () => void
    onPostSaved?: () => void
    authorId: number | undefined
    buttonSize?: 'small' | 'default'
    isBookmarked?: boolean
}

export function PostMenu({
    disabled = false,
    postId,
    authorId,
    onPostDeleted,
    buttonSize = 'default',
    isBookmarked,
    onPostSaved,
}: PostMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSavingToBookmarks, setIsSavingToBookmarks] = useState(false)

    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
    const { data: session } = useSession()

    useEffect(() => {
        if (!isMenuOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false)
            }
        }

        const handleArrowKeys = (event: KeyboardEvent) => {
            const buttons = buttonRefs.current.filter(Boolean)
            if (buttons.length === 0) return

            if (event.key === 'ArrowDown') {
                event.preventDefault()
                const currentIndex = buttons.indexOf(
                    document.activeElement as HTMLButtonElement,
                )
                const nextIndex =
                    currentIndex === -1
                        ? 0
                        : (currentIndex + 1) % buttons.length
                buttons[nextIndex]?.focus()
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                const currentIndex = buttons.indexOf(
                    document.activeElement as HTMLButtonElement,
                )
                const nextIndex =
                    currentIndex === -1
                        ? buttons.length - 1
                        : currentIndex === 0
                          ? buttons.length - 1
                          : currentIndex - 1
                buttons[nextIndex]?.focus()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        document.addEventListener('keydown', handleArrowKeys)

        // Focar primeiro botão quando menu abre
        setTimeout(() => {
            buttonRefs.current[-1]?.focus()
        }, 100)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('keydown', handleArrowKeys)
        }
    }, [isMenuOpen])

    const handleSave = async () => {
        setIsSavingToBookmarks(true)
        try {
            await axios.post(`${API_URL}/post/${postId}/bookmark`, null, {
                headers: {
                    Authorization: `Bearer ${session?.user?.token}`,
                },
            })
            console.log('Post salvo com sucesso')
        } catch (error) {
            console.error('Erro ao salvar post:', error)
        } finally {
            onPostSaved?.()
            setIsSavingToBookmarks(false)
            setIsMenuOpen(false)
        }
    }

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/post/${postId}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Compartilhar post',
                    url: postUrl,
                })
            } catch {
                console.log('Compartilhamento cancelado')
            }
        } else {
            // Fallback: copiar URL para clipboard
            try {
                await navigator.clipboard.writeText(postUrl)
                // TODO: Adicionar feedback visual
                console.log('Link copiado para a área de transferência')
            } catch (error) {
                console.error('Erro ao copiar link:', error)
            }
        }
        setIsMenuOpen(false)
    }

    const handleReport = async () => {
        // TODO: Implementar modal de denúncia com motivos
        const confirmed = confirm('Deseja denunciar este post?')

        if (confirmed) {
            try {
                await axios.post(
                    `${API_URL}/post/${postId}/report`,
                    { reason: 'OTHER' }, // TODO: Coletar motivo do usuário
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user?.token}`,
                        },
                    },
                )
                // TODO: Adicionar feedback visual
                console.log('Post denunciado com sucesso')
            } catch (error) {
                console.error('Erro ao denunciar post:', error)
            }
        }
        setIsMenuOpen(false)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await axios
                .delete(`${API_URL}/post/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${session?.user?.token}`,
                    },
                })
                .then(() => {
                    onPostDeleted?.()
                })
        } catch (error) {
            console.error('Erro ao apagar post:', error)
        }

        setIsDeleteModalOpen(false)
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                aria-label="Menu do post"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(!isMenuOpen)
                }}
                className={`${buttonSize === 'small' ? 'p-1 text-base bg-transparent' : 'p-2 text-lg bg-neutral-100'} rounded-full text-neutral-700  hover:bg-neutral-200 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <DotsThreeIcon weight="bold" />
            </button>
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white shadow-xl absolute w-fit top-full right-0 border border-neutral-100 mt-1 origin-top-right p-2 rounded-4xl z-10"
                    >
                        {session?.user.profileId === authorId && (
                            <>
                                <button
                                    ref={(el) => {
                                        buttonRefs.current[0] = el
                                    }}
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="flex px-4 py-3 rounded-full font-medium text-base cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-red-50 text-red-600 w-full focus:outline-none focus-visible:bg-red-50"
                                >
                                    <TrashIcon
                                        className="text-xl"
                                        weight="bold"
                                    />{' '}
                                    Apagar post
                                </button>
                                <button
                                    ref={(el) => {
                                        buttonRefs.current[1] = el
                                    }}
                                    className="flex px-4 py-3 rounded-full font-medium text-base text-neutral-700 cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-neutral-100 w-full focus:outline-none focus-visible:bg-neutral-100"
                                >
                                    <EyeIcon
                                        className="text-xl"
                                        weight="bold"
                                    />{' '}
                                    Alterar visibilidade
                                </button>
                            </>
                        )}
                        {!isBookmarked ? (
                            <button
                                ref={(el) => {
                                    buttonRefs.current[
                                        session?.user.profileId === authorId
                                            ? 2
                                            : 0
                                    ] = el
                                }}
                                disabled={isSavingToBookmarks}
                                onClick={handleSave}
                                className="max-h-12 flex px-4 py-3 rounded-full font-medium text-base text-neutral-700 cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-neutral-100 w-full focus:outline-none focus-visible:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingToBookmarks ? (
                                    <Spinner inline color="neutral" />
                                ) : (
                                    <BookmarkSimpleIcon
                                        className="text-xl"
                                        weight="bold"
                                    />
                                )}{' '}
                                {isSavingToBookmarks
                                    ? 'Salvando...'
                                    : 'Salvar nos Itens Salvos'}
                            </button>
                        ) : (
                            <button
                                ref={(el) => {
                                    buttonRefs.current[
                                        session?.user.profileId === authorId
                                            ? 2
                                            : 0
                                    ] = el
                                }}
                                disabled={isSavingToBookmarks}
                                onClick={handleSave}
                                className="max-h-12 flex px-4 py-3 rounded-full font-medium text-base text-neutral-700 cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-neutral-100 w-full focus:outline-none focus-visible:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingToBookmarks ? (
                                    <Spinner inline color="neutral" />
                                ) : (
                                    <BookmarkSimpleIcon
                                        className="text-xl"
                                        weight="fill"
                                    />
                                )}{' '}
                                {isSavingToBookmarks
                                    ? 'Apagando...'
                                    : 'Apagar dos Itens Salvos'}
                            </button>
                        )}
                        <button
                            ref={(el) => {
                                buttonRefs.current[
                                    session?.user.profileId === authorId ? 3 : 1
                                ] = el
                            }}
                            onClick={handleShare}
                            className="flex px-4 py-3 rounded-full font-medium text-base text-neutral-700 cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-neutral-100 w-full focus:outline-none focus-visible:bg-neutral-100"
                        >
                            <ExportIcon className="text-xl" weight="bold" />{' '}
                            Compartilhar este post...
                        </button>
                        {session?.user.profileId !== authorId && (
                            <button
                                ref={(el) => {
                                    buttonRefs.current[2] = el
                                }}
                                onClick={handleReport}
                                className="flex px-4 py-3 rounded-full font-medium text-neutral-700 text-base cursor-pointer gap-2 items-center whitespace-nowrap hover:bg-neutral-100 w-full focus:outline-none focus-visible:bg-neutral-100"
                            >
                                <MegaphoneIcon
                                    className="text-xl"
                                    weight="bold"
                                />{' '}
                                Denunciar este post...
                            </button>
                        )}
                    </motion.nav>
                )}
            </AnimatePresence>
            <Portal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <h1 className="font-semibold text-2xl mb-2">
                    Apagar esse post?
                </h1>
                <p className="text-neutral-500">
                    Essa ação não pode ser desfeita, e seu post será removido do
                    seu perfil e do feed dos seus vizinhos.
                </p>
                <div className="flex gap-2 mt-4">
                    <Button
                        fullWidth
                        variant="bordered"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        activityIndicator={isDeleting}
                        fullWidth
                        onClick={handleDelete}
                        variant="danger"
                    >
                        Apagar
                    </Button>
                </div>
            </Portal>
        </div>
    )
}
